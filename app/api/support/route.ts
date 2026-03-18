// ─────────────────────────────────────────────────────────────
//  POST /api/support
//  Submits a customer support ticket:
//    1. Validates & rate-limits (3 tickets per email per 24 h)
//    2. Generates a unique ticket reference  (VLT-YYYYMM-NNNNNN)
//    3. Sends an acknowledgement email to the customer
//    4. Sends an internal alert to the support team inbox
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";
import { sendSupportAck, sendInternalSupportAlert } from "@/lib/emailService";

// ── Ticket reference generator ─────────────────────────────
function genTicketRef(): string {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const rand  = Math.floor(Math.random() * 900_000) + 100_000;
  return `VLT-${year}${month}-${rand}`;
}

// ── Supported categories & priorities ─────────────────────
const VALID_CATEGORIES = [
  "General Inquiry",
  "Account Issue",
  "Transaction Problem",
  "KYC / Identity Verification",
  "Security Concern",
  "Card Issue",
  "Technical Problem",
  "Billing & Fees",
  "Feedback & Suggestions",
] as const;

const VALID_PRIORITIES = ["Normal", "Urgent"] as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      firstName = "",
      lastName  = "",
      email     = "",
      category  = "",
      priority  = "Normal",
      subject   = "",
      message   = "",
    } = body as Record<string, string>;

    // ── Input validation ──────────────────────────────────
    const emailTrimmed   = email.trim().toLowerCase();
    const subjectTrimmed = subject.trim();
    const messageTrimmed = message.trim();

    if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }
    if (!VALID_CATEGORIES.includes(category as (typeof VALID_CATEGORIES)[number])) {
      return NextResponse.json({ error: "Please select a valid category." }, { status: 400 });
    }
    if (!VALID_PRIORITIES.includes(priority as (typeof VALID_PRIORITIES)[number])) {
      return NextResponse.json({ error: "Invalid priority value." }, { status: 400 });
    }
    if (!subjectTrimmed || subjectTrimmed.length < 5) {
      return NextResponse.json({ error: "Subject must be at least 5 characters." }, { status: 400 });
    }
    if (subjectTrimmed.length > 120) {
      return NextResponse.json({ error: "Subject must be under 120 characters." }, { status: 400 });
    }
    if (!messageTrimmed || messageTrimmed.length < 20) {
      return NextResponse.json({ error: "Please describe your issue in at least 20 characters." }, { status: 400 });
    }
    if (messageTrimmed.length > 4000) {
      return NextResponse.json({ error: "Message must be under 4,000 characters." }, { status: 400 });
    }

    // ── Rate limit: 3 tickets per email per 24 h ──────────
    const rateKey = `support:rate:${emailTrimmed}`;
    const current = await redis.incr(rateKey);
    if (current === 1) {
      // First ticket in window — set 24-hour TTL
      await redis.expire(rateKey, 86_400);
    }
    if (current > 3) {
      const ttl     = await redis.ttl(rateKey);
      const hoursLeft = Math.ceil(ttl / 3600);
      return NextResponse.json(
        { error: `Too many support requests. Please try again in ${hoursLeft} hour${hoursLeft === 1 ? "" : "s"}.` },
        { status: 429 },
      );
    }

    // ── Generate ticket reference ─────────────────────────
    const ticketRef   = genTicketRef();
    const displayName = [firstName, lastName].filter(Boolean).join(" ") || "Valued Customer";

    // ── Send customer acknowledgement ─────────────────────
    // Fire-and-forget both sends; we don't block on email success
    // so the user always gets a ticket ref even on transient email errors.
    const [ackResult, alertResult] = await Promise.allSettled([
      sendSupportAck({
        to:        emailTrimmed,
        firstName: firstName || "Valued Customer",
        ticketRef,
        subject:   subjectTrimmed,
        message:   messageTrimmed,
      }),
      sendInternalSupportAlert({
        ticketRef,
        firstName: firstName || "Unknown",
        lastName:  lastName  || "",
        email:     emailTrimmed,
        category,
        priority,
        subject:   subjectTrimmed,
        message:   messageTrimmed,
      }),
    ]);

    // Log email send outcomes (non-fatal)
    if (ackResult.status === "rejected" || (ackResult.status === "fulfilled" && !ackResult.value.success)) {
      console.warn(`[Support] Ack email failed for ${emailTrimmed}:`, ackResult);
    }
    if (alertResult.status === "rejected" || (alertResult.status === "fulfilled" && !alertResult.value.success)) {
      console.warn(`[Support] Internal alert email failed for ticket ${ticketRef}:`, alertResult);
    }

    return NextResponse.json({ success: true, ticketRef, displayName });
  } catch (err) {
    console.error("[POST /api/support]", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 },
    );
  }
}

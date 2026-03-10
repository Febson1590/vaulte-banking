"use client";
import { useEffect } from "react";

// ─────────────────────────────────────────────────────────────
// HOW TO ACTIVATE YOUR LIVE CHAT:
//
// 1. Go to https://www.tawk.to and create a FREE account
// 2. Create a new property (give it the name "Vaulte")
// 3. Copy your Property ID and Widget ID from:
//    Administration → Chat Widget → Direct Chat Link
//    It looks like: https://tawk.to/chat/PROPERTY_ID/WIDGET_ID
// 4. Replace the values below with your own IDs
// ─────────────────────────────────────────────────────────────
const TAWK_PROPERTY_ID = "YOUR_PROPERTY_ID"; // e.g. "65f3a1b2c3d4e5f6a7b8c9d0"
const TAWK_WIDGET_ID   = "YOUR_WIDGET_ID";   // e.g. "1hp1234ab"

export default function TawkToChat() {
  useEffect(() => {
    if (TAWK_PROPERTY_ID === "YOUR_PROPERTY_ID") return; // skip until configured

    const s1 = document.createElement("script");
    s1.async = true;
    s1.src = `https://embed.tawk.to/${TAWK_PROPERTY_ID}/${TAWK_WIDGET_ID}`;
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    document.head.appendChild(s1);

    return () => {
      document.head.removeChild(s1);
    };
  }, []);

  return null;
}

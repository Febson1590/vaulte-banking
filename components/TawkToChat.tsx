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
const TAWK_PROPERTY_ID = "69af8003ddd7fc1c348540ae";
const TAWK_WIDGET_ID   = "1jjaoo3d8";

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

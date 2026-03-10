"use client";
import { useEffect } from "react";

const TAWK_PROPERTY_ID = "69af8003ddd7fc1c348540ae";
const TAWK_WIDGET_ID   = "1jjaoo3d8";

export default function TawkToChat() {
  useEffect(() => {
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

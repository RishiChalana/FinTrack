"use client";

import { useEffect, useState } from "react";

export function CookieBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const accepted = localStorage.getItem("cookiesAccepted");
    if (!accepted) setShow(true);
  }, []);
  if (!show) return null;
  return (
    <div className="fixed bottom-0 inset-x-0 bg-neutral-900 text-white p-3 text-sm flex items-center justify-between gap-2">
      <span>
        We use cookies to improve your experience. See our <a className="underline" href="/privacy">Privacy Policy</a>.
      </span>
      <button
        className="bg-white text-black px-3 py-1 rounded"
        onClick={() => { localStorage.setItem("cookiesAccepted", "1"); setShow(false); }}
      >
        OK
      </button>
    </div>
  );
}



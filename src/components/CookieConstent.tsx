import React, { useState, useEffect } from "react";

export default function CookieConsent({ onAccept }: { onAccept?: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setVisible(false);
    onAccept?.();
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg flex justify-between items-center z-50">
      <p className="text-sm">
        Bu site çerezleri kullanır. “Sizin İçin Seçtiklerimiz” için iznin gerekli.
      </p>
      <button
        onClick={handleAccept}
        className="ml-4 px-4 py-2 bg-[#1ed5a9] text-black font-semibold rounded"
      >
        Kabul Et
      </button>
    </div>
  );
}

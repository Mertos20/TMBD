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
    window.location.reload(); // Refresh to show recommendations immediately
  };

  const handleReject = () => {
    localStorage.setItem("cookieConsent", "false");
    setVisible(false);
    window.location.reload(); // Refresh to ensure recommendations are hidden
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg flex flex-col md:flex-row justify-between items-center z-50 gap-4">
      <p className="text-sm text-center md:text-left">
        Bu site çerezleri kullanır. “Sizin İçin Seçtiklerimiz” için iznin gerekli.
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleReject}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded transition-colors"
        >
          Reddet
        </button>
        <button
          onClick={handleAccept}
          className="px-4 py-2 bg-[#1ed5a9] hover:bg-[#17b08a] text-black font-semibold rounded transition-colors"
        >
          Kabul Et
        </button>
      </div>
    </div>
  );
}

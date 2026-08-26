import React, { useState, useEffect } from "react";
import { ShieldCheck, Cookie, X, ExternalLink } from "lucide-react";
import { getCookieConsent, setCookieConsent } from "../utils/cookieConsent";

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = getCookieConsent();
    if (consent === null) {
      setShowBanner(true);
    }
  }, []);

  if (!showBanner) return null;

  const handleAccept = () => {
    setCookieConsent("accepted");
    setShowBanner(false);
  };

  const handleDecline = () => {
    setCookieConsent("declined");
    setShowBanner(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-[999] animate-slideUp">
      <div className="bg-[#17231f]/95 text-[#f4f1ea] p-5 rounded-3xl shadow-2xl border border-white/10 backdrop-blur-lg flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-white/10 text-emerald-300 shrink-0">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-editorial text-sm font-bold text-[#faf8f5] flex items-center gap-1.5">
              <span>Este site utiliza cookies</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                LGPD
              </span>
            </h4>
            <p className="text-xs text-[#dce7e1]/90 leading-relaxed">
              Utilizamos cookies estritamente necessários para autenticação e segurança. Cookies analíticos e de melhoria contínua só são ativados com a sua permissão expressa.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-white/10">
          <button
            onClick={handleAccept}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm active:scale-95"
          >
            ACEITAR
          </button>
          <button
            onClick={handleDecline}
            className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-[#dce7e1] text-xs font-semibold transition active:scale-95"
          >
            RECUSAR
          </button>
        </div>
      </div>
    </div>
  );
}

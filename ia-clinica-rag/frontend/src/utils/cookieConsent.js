/**
 * Gestor de Consentimento de Cookies & LGPD (MedIa v2.0)
 * Separa cookies estritamente necessários (Auth/Sessão) de cookies analíticos/não essenciais.
 */

const CONSENT_KEY = "media_cookie_consent";

export function getCookieConsent() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CONSENT_KEY); // 'accepted' | 'declined' | null
}

export function setCookieConsent(decision) {
  if (typeof window === "undefined") return;
  const status = decision === "accepted" ? "accepted" : "declined";
  localStorage.setItem(CONSENT_KEY, status);

  if (status === "accepted") {
    initAnalyticsIfAllowed();
  } else {
    disableNonEssentialTracking();
  }
}

export function isAnalyticsAllowed() {
  return getCookieConsent() === "accepted";
}

/**
 * Inicializa scripts e identificadores analíticos somente após consentimento explícito
 */
export function initAnalyticsIfAllowed() {
  if (!isAnalyticsAllowed()) return;
  
  // Se houver Google Analytics / Tag Manager configurado no futuro, inicializa aqui com consentimento:
  if (window.gtag) {
    window.gtag("consent", "update", {
      analytics_storage: "granted"
    });
  }
  console.log("[LGPD] 🟢 Consentimento de cookies aceito. Cookies analíticos autorizados.");
}

/**
 * Bloqueia e desativa tracking não essencial
 */
export function disableNonEssentialTracking() {
  if (window.gtag) {
    window.gtag("consent", "update", {
      analytics_storage: "denied"
    });
  }
  console.log("[LGPD] 🛡️ Consentimento de cookies recusado. Apenas cookies estritamente necessários (sessão/segurança) estão ativos.");
}

import { Capacitor } from '@capacitor/core';

/**
 * Gestor Central de URLs da API para Web e Aplicativo Mobile Nativo (Capacitor)
 */
const DEFAULT_PROD_API = 'https://ia-medica.vercel.app';

export const isNativeMobile = () => {
  return typeof window !== 'undefined' && Capacitor.isNativePlatform();
};

export const getApiBaseUrl = () => {
  // Se estiver rodando como App Nativo Android/iOS via Capacitor
  if (isNativeMobile()) {
    return import.meta.env.VITE_API_URL || DEFAULT_PROD_API;
  }
  // Se estiver rodando na Web (Vercel ou localhost)
  return import.meta.env.VITE_API_URL || '';
};

/**
 * Converte qualquer endpoint relativo (/api/...) para URL absoluta no Mobile Nativo
 * @param {string} endpoint - Ex: '/api/clinical/query' ou 'https://...'
 * @returns {string} URL pronta para fetch
 */
export const resolveApiUrl = (endpoint) => {
  if (typeof endpoint !== 'string') return endpoint;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  const base = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${cleanEndpoint}`;
};

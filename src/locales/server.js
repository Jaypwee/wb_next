import { cache } from 'react';
import { cookies } from 'next/headers';
import { createInstance } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next/initReactI18next';

import { defaultNS, cookieName, i18nOptions, fallbackLng } from './locales-config';

// ----------------------------------------------------------------------

/**
 * Internationalization configuration for Next.js server-side.
 *
 * Supports two approaches for language handling:
 *
 * 1. URL-based routing (Next.js default)
 *    - Languages are part of the URL path
 *    - Example: /en/about, /fr/about
 *    - @see {@link https://nextjs.org/docs/pages/building-your-application/routing/internationalization}
 *
 * 2. Cookie-based routing
 *    - Language preference stored in cookies
 *    - No URL modification required
 *    - @see {@link https://github.com/i18next/next-app-dir-i18next-example/issues/12#issuecomment-1500917570}
 *
 * Current implementation uses approach #2 (Cookie-based) with localStorage sync
 */

export async function detectLanguage() {
  const cookieStore = await cookies();

  // Check both localStorage key and cookie key for consistency
  // This ensures server-side matches client-side language detection
  const language = 
    cookieStore.get('i18nextLng')?.value || 
    cookieStore.get(cookieName)?.value || 
    fallbackLng;

  return language;
}

// ----------------------------------------------------------------------

export const getServerTranslations = cache(async (ns = defaultNS, options = {}) => {
  const language = await detectLanguage();

  const i18nextInstance = await initServerI18next(language, ns);

  return {
    t: i18nextInstance.getFixedT(language, Array.isArray(ns) ? ns[0] : ns, options.keyPrefix),
    i18n: i18nextInstance,
  };
});

// ----------------------------------------------------------------------

const initServerI18next = async (language, namespace) => {
  const i18nInstance = createInstance();
  
  await i18nInstance
    .use(initReactI18next)
    .use(resourcesToBackend((lang, ns) => import(`./langs/${lang}/${ns}.json`)))
    .init(i18nOptions(language, namespace));

  return i18nInstance;
};

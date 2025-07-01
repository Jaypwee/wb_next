'use client';

import i18next from 'i18next';
import { useMemo } from 'react';
import resourcesToBackend from 'i18next-resources-to-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next, I18nextProvider as Provider } from 'react-i18next';

import { getStoredLocale } from './utils/locale-storage';
import { i18nOptions, fallbackLng } from './locales-config';

// ----------------------------------------------------------------------

/**
 * Always use localStorage to persist locale settings
 * This ensures the app remembers the user's language preference
 */
const lng = getStoredLocale(fallbackLng);

// Always include localStorage in detection caches for locale persistence
const init = {
  ...i18nOptions(lng),
  detection: {
    caches: ['localStorage', 'cookie'], // Always include localStorage first for persistence
    lookupLocalStorage: 'i18nextLng',
    lookupCookie: 'i18next',
  },
};

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .use(resourcesToBackend((lang, ns) => import(`./langs/${lang}/${ns}.json`)))
  .init(init);

// ----------------------------------------------------------------------

export function I18nProvider({ lang, children }) {
  useMemo(() => {
    if (lang) {
      i18next.changeLanguage(lang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Provider i18n={i18next}>{children}</Provider>;
}

'use client';

import dayjs from 'dayjs';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useRouter } from 'src/routes/hooks';

import { toast } from 'src/components/snackbar';

import { allLangs } from './all-langs';
import { setStoredLocale } from './utils/locale-storage';
import { fallbackLng, changeLangMessages as messages } from './locales-config';

// ----------------------------------------------------------------------

export function useTranslate(ns) {
  const router = useRouter();

  const { t, i18n } = useTranslation(ns);

  const fallback = allLangs.filter((lang) => lang.value === fallbackLng)[0];

  const currentLang = allLangs.find((lang) => lang.value === i18n.resolvedLanguage);

  const onChangeLang = useCallback(
    async (newLang) => {
      try {
        const langChangePromise = i18n.changeLanguage(newLang);

        const currentMessages = messages[newLang] || messages.en;

        toast.promise(langChangePromise, {
          loading: currentMessages.loading,
          success: () => currentMessages.success,
          error: currentMessages.error,
        });

        // Explicitly save the language preference to localStorage
        // This ensures the preference is persisted even if automatic detection fails
        setStoredLocale(newLang);

        if (currentLang) {
          dayjs.locale(currentLang.adapterLocale);
        }

        router.refresh();
      } catch (error) {
        console.error(error);
      }
    },
    [currentLang, i18n, router]
  );

  return {
    t,
    i18n,
    onChangeLang,
    currentLang: currentLang ?? fallback,
  };
}

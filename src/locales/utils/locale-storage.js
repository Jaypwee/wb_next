// ----------------------------------------------------------------------

const LOCALE_STORAGE_KEY = 'i18nextLng';

/**
 * Get the stored locale from localStorage
 * @param {string} fallback - Fallback locale if none is stored
 * @returns {string} The stored locale or fallback
 */
export function getStoredLocale(fallback = 'en') {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    return stored || fallback;
  } catch (error) {
    console.warn('Failed to get locale from localStorage:', error);
    return fallback;
  }
}

/**
 * Store the locale in localStorage
 * @param {string} locale - The locale to store
 */
export function setStoredLocale(locale) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch (error) {
    console.warn('Failed to save locale to localStorage:', error);
  }
}

/**
 * Remove the stored locale from localStorage
 */
export function removeStoredLocale() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(LOCALE_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to remove locale from localStorage:', error);
  }
}

/**
 * Check if a locale is stored
 * @returns {boolean} True if a locale is stored
 */
export function hasStoredLocale() {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return localStorage.getItem(LOCALE_STORAGE_KEY) !== null;
  } catch (error) {
    console.warn('Failed to check stored locale:', error);
    return false;
  }
} 
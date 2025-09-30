import { formatNumberLocale } from 'src/locales';

const DEFAULT_LOCALE = { code: 'en-US', currency: 'USD' };

function processInput(inputValue) {
  if (inputValue == null || Number.isNaN(inputValue)) return null;
  return Number(inputValue);
}

// ----------------------------------------------------------------------

export function fNumber(inputValue, options) {
  const locale = formatNumberLocale() || DEFAULT_LOCALE;

  const number = processInput(inputValue);
  if (number === null) return '';

  const fm = new Intl.NumberFormat(locale.code, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(number);

  return fm;
}

// ----------------------------------------------------------------------

export function fCurrency(inputValue, options) {
  const locale = formatNumberLocale() || DEFAULT_LOCALE;

  const number = processInput(inputValue);
  if (number === null) return '';

  const fm = new Intl.NumberFormat(locale.code, {
    style: 'currency',
    currency: locale.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(number);

  return fm;
}

// ----------------------------------------------------------------------

export function fPercent(inputValue, options) {
  const locale = formatNumberLocale() || DEFAULT_LOCALE;

  const number = processInput(inputValue);
  if (number === null) return '';

  const fm = new Intl.NumberFormat(locale.code, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
    ...options,
  }).format(number / 100);

  return fm;
}

// ----------------------------------------------------------------------

export function fShortenNumber(inputValue, options) {
  const locale = formatNumberLocale() || DEFAULT_LOCALE;

  const number = processInput(inputValue);
  if (number === null) return '';

  // Custom Korean formatting
  if (locale.code?.startsWith('ko')) {
    return formatKoreanNumber(number, options);
  }

  const fm = new Intl.NumberFormat(locale.code, {
    notation: 'compact',
    maximumFractionDigits: 2,
    ...options,
  }).format(number);

  return fm.replace(/[A-Z]/g, (match) => match.toLowerCase());
}

// Custom Korean number formatting function
function formatKoreanNumber(number, options = {}) {
  const absNumber = Math.abs(number);
  const isNegative = number < 0;
  
  let result = '';
  let unit = '';
  let displayNumber = absNumber;

  if (absNumber >= 1000000000000) { // 1조 (1 trillion)
    displayNumber = absNumber / 1000000000000;
    unit = '조';
  } else if (absNumber >= 100000000) { // 1억 (100 million)
    displayNumber = absNumber / 100000000;
    unit = '억';
  } else if (absNumber >= 10000) { // 1만 (10 thousand)
    displayNumber = absNumber / 10000;
    unit = '만';

  } else if (absNumber >= 1000) { // 1천 (1 thousand)
    displayNumber = absNumber / 1000;
    unit = '천';
  } else {
    return number.toString();
  }

  // Format the display number
  const maxFractionDigits = options.maximumFractionDigits || 2;
  const formatted = parseFloat(displayNumber.toFixed(maxFractionDigits));
  
  result = `${formatted}${unit}`;
  
  return isNegative ? `-${result}` : result;
}

// ----------------------------------------------------------------------

export function fData(inputValue) {
  const number = processInput(inputValue);
  if (number === null || number === 0) return '0 bytes';

  const units = ['bytes', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb', 'Eb', 'Zb', 'Yb'];
  const decimal = 2;
  const baseValue = 1024;

  const index = Math.floor(Math.log(number) / Math.log(baseValue));
  const fm = `${parseFloat((number / baseValue ** index).toFixed(decimal))} ${units[index]}`;

  return fm;
}

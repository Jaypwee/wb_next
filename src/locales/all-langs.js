'use client';

// core (MUI)
import {
  koKR as koKRCore,
} from '@mui/material/locale';
// date pickers (MUI)
import {
  enUS as enUSDate,
  koKR as koKRDate,
} from '@mui/x-date-pickers/locales';
// data grid (MUI)
import {
  enUS as enUSDataGrid,
  koKR as koKRDataGrid,
} from '@mui/x-data-grid/locales';

// ----------------------------------------------------------------------

export const allLangs = [
  {
    value: 'en',
    label: 'English',
    countryCode: 'GB',
    adapterLocale: 'en',
    numberFormat: { code: 'en-US', currency: 'USD' },
    systemValue: {
      components: { ...enUSDate.components, ...enUSDataGrid.components },
    },
  },
  {
    value: 'ko',
    label: 'Korean',
    countryCode: 'KR',
    adapterLocale: 'ko',
    numberFormat: { code: 'ko-KR', currency: 'KRW' },
    systemValue: {
      components: { ...koKRCore.components, ...koKRDate.components, ...koKRDataGrid.components },
    },
  },
];

/**
 * Country code:
 * https://flagcdn.com/en/codes.json
 *
 * Number format code:
 * https://gist.github.com/raushankrjha/d1c7e35cf87e69aa8b4208a8171a8416
 */

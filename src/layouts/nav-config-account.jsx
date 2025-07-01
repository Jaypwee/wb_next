import { ROOTS } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export const _account = [
  {
    label: 'Home',
    href: '/',
    icon: <Iconify icon="solar:home-angle-bold-duotone" />,
  },
  {
    label: 'Account settings',
    href: `${ROOTS.DASHBOARD}/user/settings`,
    icon: <Iconify icon="solar:settings-bold-duotone" />,
  },
];

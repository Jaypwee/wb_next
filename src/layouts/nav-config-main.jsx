
import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export const navData = [
  { title: 'Home', path: '/', icon: <Iconify width={22} icon="solar:home-angle-bold-duotone" /> },
  {
    title: 'Leadership',
    path: paths.leadership,
    icon: <Iconify width={22} icon="solar:info-circle-bold-duotone" />,
  },
  {
    title: 'Dashboard',
    path: paths.dashboard.root,
    icon: <Iconify width={22} icon="solar:atom-bold-duotone" />,
  },
];

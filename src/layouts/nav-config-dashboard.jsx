import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />;

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
  parameter: icon('ic-parameter'),
  donation: <Iconify icon="solar:hand-heart-bold" width={24} />,
  kvk: <Iconify icon="game-icons:crossed-swords" width={24} />,
  home: <Iconify icon="solar:home-angle-bold-duotone" width={24} />,
};

// ----------------------------------------------------------------------

export const navData = [
  /**
   * Overview
   */
  {
    title: 'nav.dashboard.general.title',
    subheader: 'nav.dashboard.general.title',
    items: [
      {
        title: 'nav.dashboard.general.home',
        path: paths.dashboard.root,
        icon: ICONS.home
      },
      {
        title: 'nav.dashboard.general.schedule',
        path: paths.dashboard.schedule,
        icon: ICONS.calendar,
      },
      { title: 'nav.dashboard.general.admin', 
        path: paths.dashboard.admin, 
        icon: ICONS.dashboard, 
        allowedRoles: ['admin'],
       },
    ],
  },
  /**
   * Management
   */
  {
    title: 'nav.dashboard.individual.title',
    subheader: 'nav.dashboard.individual.title',
    items: [
      {
        title: 'nav.dashboard.individual.individual',
        path: paths.dashboard.metrics.merits,
        icon: ICONS.analytics,
      },
      {
        title: 'nav.dashboard.kvk.title',
        path: paths.dashboard.kvk.root,
        icon: ICONS.kvk,
        children: [
          {
            title: 'nav.dashboard.kvk.overview',
            path: paths.dashboard.kvk.overview,
          },
          {
            title: 'nav.dashboard.kvk.detailed',
            path: paths.dashboard.kvk.detailed,
          }
        ],
        tooltip: 'nav.dashboard.tooltips.kvk'
      },
    ],
  },
  /**
   * Misc
   */
  {
    title: 'nav.dashboard.misc.title',
    subheader: 'nav.dashboard.misc.title',
    items: [
      {
        title: 'nav.dashboard.misc.donations',
        path: paths.dashboard.donations,
        icon: ICONS.donation,
      },
    ],
  },
];

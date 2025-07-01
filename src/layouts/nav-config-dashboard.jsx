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
        path: paths.dashboard.metrics.root,
        icon: ICONS.analytics,
        children: [
          { title: 'nav.dashboard.individual.merits', path: paths.dashboard.metrics.merits },
          { title: 'nav.dashboard.individual.kills', path: paths.dashboard.metrics.kills },
          { title: 'nav.dashboard.individual.deaths', path: paths.dashboard.metrics.deads },
          { title: 'nav.dashboard.individual.heals', path: paths.dashboard.metrics.mana },
        ],
      },
      {
        title: 'nav.dashboard.kvk.title',
        path: paths.dashboard.kvk.root,
        icon: ICONS.kvk,
        children: [
          
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

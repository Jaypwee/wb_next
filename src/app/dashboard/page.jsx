import { CONFIG } from 'src/global-config';

import { DashboardHomeView } from 'src/sections/dashboard/dashboard-home-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <DashboardHomeView />;
}

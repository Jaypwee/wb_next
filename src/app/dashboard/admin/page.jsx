import { CONFIG } from 'src/global-config';

import { AdminView } from 'src/sections/admin/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Admin | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <AdminView />;
} 
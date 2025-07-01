import { CONFIG } from 'src/global-config';

import { DonationsView } from 'src/sections/donations/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Donations - ${CONFIG.appName}` };

export default function DonationsPage() {
  return <DonationsView />;
} 
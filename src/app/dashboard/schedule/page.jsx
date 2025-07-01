import { CONFIG } from 'src/global-config';

import { ScheduleView } from 'src/sections/schedule/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Schedule - ${CONFIG.appName}` };

export default function Page() {
  return <ScheduleView />;
} 
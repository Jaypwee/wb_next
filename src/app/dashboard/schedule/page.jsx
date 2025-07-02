import { CONFIG } from 'src/global-config';

import { ScheduleView } from 'src/sections/schedule/view';

// ----------------------------------------------------------------------

export const metadata = { title: `${CONFIG.appName} - Schedule` };

export default function Page() {
  return <ScheduleView />;
} 
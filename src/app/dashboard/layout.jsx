import { CONFIG } from 'src/global-config';
import { EventsProvider } from 'src/context/events';
import { DashboardLayout } from 'src/layouts/dashboard';

import { AuthGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

export default function Layout({ children }) {
  if (CONFIG.auth.skip) {
    return (
      <EventsProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </EventsProvider>
    );
  }

  return (
    <AuthGuard>
      <EventsProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </EventsProvider>
    </AuthGuard>
  );
}

import { MetricsView } from 'src/sections/metrics/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Kills',
};

export default function KillsPage() {
  return <MetricsView type="UNITS_KILLED" />;
} 
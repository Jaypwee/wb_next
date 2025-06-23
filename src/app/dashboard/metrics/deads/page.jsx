import { MetricsView } from 'src/sections/metrics/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Deads',
};

export default function DeadsPage() {
  return <MetricsView type="UNITS_DEAD" />;
} 
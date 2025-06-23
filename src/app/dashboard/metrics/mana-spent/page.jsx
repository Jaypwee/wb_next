import { MetricsView } from 'src/sections/metrics/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Mana Spent',
};

export default function ManaSpentPage() {
  return <MetricsView type="MANA_SPENT" />;
} 
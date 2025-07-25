'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';
import { fetchKvkOverviewData } from 'src/services/kvk';
import { useMetricsContext } from 'src/context/metrics';
import { makeAuthenticatedRequest } from 'src/lib/token-utils';

import { MetricsAreaChart } from 'src/sections/metrics/metrics-area-chart';

// ----------------------------------------------------------------------

export function KvkOverview() {
  const { t } = useTranslate();
  const { selectedSeason } = useMetricsContext();
  const [overviewData, setOverviewData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedSeason) return;

      setLoading(true);
      setError(null);

      try {
        const response = await makeAuthenticatedRequest(async () => 
          fetchKvkOverviewData({ seasonName: selectedSeason })
        );
        setOverviewData(response.data);
      } catch (err) {
        console.error('Error fetching KvK overview data:', err);
        setError(err);
        setOverviewData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSeason]);

  // Don't render if there's an error or no data
  if (error || !overviewData || loading) {
    return null;
  }

  const { merits, unitsDead, manaSpent } = overviewData;

  return (
    <Box sx={{ py: 3, px: 0 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        {t('kvk.overview.title')}
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ width: '100%' }}>
          <MetricsAreaChart
            title={t('kvk.overview.charts.merits')}
            subheader={t('kvk.overview.charts.meritsSubheader')}
            series={merits.series}
            categories={merits.categories}
          />
        </Box>
      </Box>
    </Box>
  );
}

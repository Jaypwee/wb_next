'use client';

import { useTransition } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';

import { fetchKvkData } from 'src/services/kvk';
import { useMetricsContext } from 'src/context/metrics';
import { makeAuthenticatedRequest } from 'src/lib/token-utils';

import { useSettingsContext } from 'src/components/settings';
import { MetricsDropdown } from 'src/components/metrics-dropdown';

// ----------------------------------------------------------------------

export function KvkView() {
  const settings = useSettingsContext();
  const [isPending, startTransition] = useTransition();
  const {
    selectedSeason,
    startDate,
    endDate,
    selectedKvkMetrics,
    setSelectedSeason,
    setStartDate,
    setEndDate,
    setSelectedKvkMetrics,
    setError,
  } = useMetricsContext();



  const handleApply = async () => {
    try {
      setError(null);

      startTransition(async () => {
        const kvkData = await makeAuthenticatedRequest(async () => fetchKvkData({
          seasonName: selectedSeason,
          startDate,
          endDate,
        }));

        setSelectedKvkMetrics(kvkData);
      });
    } catch (error) {
      console.error('Error fetching KvK data:', error);
      setError(error.message);
    }
  };

  const metricsDropdownProps = {
    selectedSeason,
    startDate,
    endDate,
    onSeasonChange: setSelectedSeason,
    onStartDateChange: setStartDate,
    onEndDateChange: setEndDate,
    onApply: handleApply,
    isPending,
  };
  
  console.log(selectedKvkMetrics);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Stack spacing={3}>
        {!selectedKvkMetrics ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: { xs: '50vh', md: '60vh' },
              px: { xs: 2, sm: 3 },
            }}
          >
            <Box
              sx={{
                p: { xs: 2, sm: 3, md: 4 },
                mx: { xs: 1, sm: 2 },
                width: { xs: '100%', sm: 'auto' },
                maxWidth: { xs: '100%', sm: '800px' },
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                backgroundColor: 'background.paper',
                boxShadow: 1,
              }}
            >
              <MetricsDropdown
                {...metricsDropdownProps}
              />
            </Box>
          </Box>
        ) : (
          <>
            <MetricsDropdown
              {...metricsDropdownProps}
            />

            <Box
              sx={{
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                backgroundColor: 'background.paper',
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <h2>KvK Data Loaded</h2>
                <p>Season: {selectedKvkMetrics.id}</p>
                <p>Start Date: {selectedKvkMetrics.startDate}</p>
                <p>End Date: {selectedKvkMetrics.endDate}</p>
                <p>Allies: {Object.keys(selectedKvkMetrics.data?.allies || {}).length}</p>
                <p>Enemies: {Object.keys(selectedKvkMetrics.data?.enemies || {}).length}</p>
              </Box>
            </Box>
          </>
        )}
      </Stack>
    </Container>
  );
} 
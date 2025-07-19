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
import { SingleDateKvkView } from './components/singleDateKvkView';

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

            {/* 
              For start, end date showings (allied left enemies right)
              1. Top 100, 150, 200, 300 merit counts per kingdom
              2. Top 100, 150, 200, 300 units dead per kingdom
              3. Top 100, 150, 200, 300 mana spent per kingdom
              4. Total mana spet per kingdom
              5. Total merits per kingdom
              6. Total units dead per kingdom
              7. Power lost per kingdom / power lost per kingdom (bar chart)
            */}

            {/* 
              For just preseason or start as start dates:
              1. Total Power, Kills, Deads, Total mana spent
              2. Below 100M, 100-150M, 150-200M, 200-300M, 300M+
              3. Previous season merits (only preseason)
            */}
            { !endDate && (
              <SingleDateKvkView chartData={selectedKvkMetrics} />
            )}

            {
              endDate && (
                <MultiDateKvkView chartData={selectedKvkMetrics} />
              )
            }
          </>
        )}
      </Stack>
    </Container>
  );
} 
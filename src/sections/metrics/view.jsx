'use client'

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';

import { fetchSeasonInfo, fetchSeasonDates } from 'src/services/season';

import { useSettingsContext } from 'src/components/settings';
import { LoadingScreen } from 'src/components/loading-screen';
import { CustomDropdown } from 'src/components/custom-dropdown';

import { MetricsBarChart } from './metrics-bar-chart';
import { MetricsDataGrid } from './metrics-data-grid';

// ----------------------------------------------------------------------

export function MetricsView() {
  const settings = useSettingsContext();
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('');

  // Fetch season info
  const { data: seasonInfo, isLoading: isLoadingSeasons } = useQuery({
    queryKey: ['seasonInfo'],
    queryFn: fetchSeasonInfo,
  });

  // Fetch dates for selected season
  const { data: seasonDates, isLoading: isLoadingDates } = useQuery({
    queryKey: ['seasonDates', selectedSeason],
    queryFn: () => fetchSeasonDates(selectedSeason),
    enabled: !!selectedSeason,
  });

  // Set initial season when data is loaded
  useEffect(() => {
    if (seasonInfo?.current_season && !selectedSeason) {
      setSelectedSeason(seasonInfo.current_season);
    }
  }, [seasonInfo, selectedSeason, isLoadingSeasons]);

  console.log(seasonInfo, selectedSeason, seasonDates);

  if (!selectedSeason) {
    return <LoadingScreen />;
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Stack spacing={3}>
        <Stack direction="row" spacing={2}>
          <CustomDropdown
            options={seasonInfo?.total_seasons || []}
            initialValue={selectedSeason}
            onChange={(value) => setSelectedSeason(value)}
          />
          
          {isLoadingDates ? (
            <Box sx={{ width: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <CustomDropdown 
              options={seasonDates || []}
              initialValue="Select a date"
              onChange={() => {}}
            />
          )}
        </Stack>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            minHeight: '45vh',
          }}
        >
          <Box sx={{ flex: 1 }}>
            <MetricsBarChart />
          </Box>

          <Box sx={{ flex: 1, minHeight: '45vh' }}>
            <MetricsDataGrid 
              selectedMetrics={selectedMetrics}
              onSelectionChange={setSelectedMetrics}
            />
          </Box>
        </Box>
      </Stack>
    </Container>
  );
} 
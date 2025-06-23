'use client'

import { useState, useEffect, useTransition } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';

import { useUserContext } from 'src/context/user';
import { useMetricsContext } from 'src/context/metrics';
import { makeAuthenticatedRequest } from 'src/lib/token-utils';
import { formatChartData, fetchMetricsData } from 'src/services/metrics';

import { useSettingsContext } from 'src/components/settings';
import { MetricsDropdown } from 'src/components/metrics-dropdown';

import { MetricsBarChart } from './metrics-bar-chart';
import { MetricsDataGrid } from './metrics-data-grid';
// ----------------------------------------------------------------------

export function MetricsView({ type = 'MERITS' }) {
  const settings = useSettingsContext();
  const [isPending, startTransition] = useTransition();
  const [formattedChartData, setFormattedChartData] = useState(null);
  const {
    selectedSeason,
    startDate,
    endDate,
    selectedMetrics,
    setSelectedSeason,
    setStartDate,
    setEndDate,
    setSelectedMetrics,
    setError,
  } = useMetricsContext();

  // Use user context
  const { users, loadUsers } = useUserContext();

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (selectedMetrics && startDate && endDate && type) {
      const formattedData = formatChartData({
        data: selectedMetrics.data,
        startDate,
        endDate,
        type
      });

      setFormattedChartData(formattedData);
    }
  }, [selectedMetrics, startDate, endDate, type]);

  const handleApply = async () => {
    try {
      setError(null);

      startTransition(async () => {
        const chartData = await makeAuthenticatedRequest(async () => fetchMetricsData({
          seasonName: selectedSeason,
          startDate,
          endDate,
        }));

        setSelectedMetrics(chartData);

        const formattedData = formatChartData({
          data: chartData.data,
          startDate,
          endDate,
          type
        });

        setFormattedChartData(formattedData);
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setError(error.message);
    }
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Stack spacing={3}>
        {!selectedMetrics ? (
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
                maxWidth: { xs: '100%', sm: '500px' },
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                backgroundColor: 'background.paper',
                boxShadow: 1,
              }}
            >
              <MetricsDropdown
                selectedSeason={selectedSeason}
                startDate={startDate}
                endDate={endDate}
                onSeasonChange={setSelectedSeason}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onApply={handleApply}
                isPending={isPending}
              />
            </Box>
          </Box>
        ) : (
          <>
            <MetricsDropdown
              selectedSeason={selectedSeason}
              startDate={startDate}
              endDate={endDate}
              onSeasonChange={setSelectedSeason}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onApply={handleApply}
              isPending={isPending}
            />

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                minHeight: '45vh',
              }}
            >
              <Box sx={{ flex: 1 }}>
                <MetricsBarChart {...formattedChartData} />
              </Box>

              <Box sx={{ flex: 1, minHeight: '45vh' }}>
                <MetricsDataGrid 
                  selectedMetrics={selectedMetrics}
                  type={type}
                  users={users}
                />
              </Box>
            </Box>
          </>
        )}
      </Stack>
    </Container>
  );
} 
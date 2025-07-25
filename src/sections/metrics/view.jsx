'use client'

import { useRef, useMemo, useState, useEffect, useCallback, useTransition } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';

import { useRouter, usePathname, useSearchParams } from 'src/routes/hooks';

import { useTranslate } from 'src/locales';
import { useUserContext } from 'src/context/user';
import { useMetricsContext } from 'src/context/metrics';
import { fetchMetricsData } from 'src/services/metrics';
import { makeAuthenticatedRequest } from 'src/lib/token-utils';

import { useSettingsContext } from 'src/components/settings';
import { MetricsDropdown } from 'src/components/metrics-dropdown';

import { MetricsBarChart } from './metrics-bar-chart';
import { MetricsDataGrid } from './metrics-data-grid';
// ----------------------------------------------------------------------

const TAB_OPTIONS = [
  { value: 'MERITS', label: 'metrics.series.merits' },
  { value: 'UNITS_KILLED', label: 'metrics.series.unitsKilled' },
  { value: 'UNITS_DEAD', label: 'metrics.series.unitsDead' },
  { value: 'MANA_SPENT', label: 'metrics.series.manaSpent' },
  // { value: 'T5_KILL_COUNT', label: 'metrics.series.t5KillCount' },
];

export function MetricsView({ type: initialType = 'MERITS' }) {
  const settings = useSettingsContext();
  const { t } = useTranslate();
  const [isPending, startTransition] = useTransition();
  const [formattedChartDataByType, setFormattedChartDataByType] = useState({});
  const [formattedGridDataByType, setFormattedGridDataByType] = useState({});
  const [currentType, setCurrentType] = useState(initialType);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const hasProcessedInitialParams = useRef(false);
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

  // Helper function to fetch and process metrics data
  const fetchAndProcessMetrics = useCallback(async (seasonName, startDateParam, endDateParam) => {
    const response = await makeAuthenticatedRequest(async () => fetchMetricsData({
      seasonName,
      startDate: startDateParam,
      endDate: endDateParam,
    }));

    // Set the full response including formatted data
    setSelectedMetrics(response);

    // Use the pre-formatted data from the API response
    setFormattedChartDataByType(response.formattedChartData || {});
    setFormattedGridDataByType(response.formattedGridData || {});
  }, [setSelectedMetrics]);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Initialize from query params and auto-fetch if all params exist (only once)
  useEffect(() => {
    if (hasProcessedInitialParams.current) return;

    const seasonName = searchParams.get('seasonName');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    let hasUpdatedContext = false;

    // Update context with query params if they exist
    if (seasonName) {
      setSelectedSeason(seasonName);
      hasUpdatedContext = true;
    }
    if (startDateParam) {
      setStartDate(startDateParam);
      hasUpdatedContext = true;
    }
    if (endDateParam) {
      setEndDate(endDateParam);
      hasUpdatedContext = true;
    }

    // Auto-fetch metrics if all required params exist
    if (seasonName && startDateParam) {
      const fetchMetricsFromParams = async () => {
        try {
          setError(null);
          
          startTransition(async () => {
            await fetchAndProcessMetrics(seasonName, startDateParam, endDateParam);
          });
        } catch (error) {
          console.error('Error fetching metrics from params:', error);
          setError(error.message);
        }
      };

      fetchMetricsFromParams();
    }
    hasProcessedInitialParams.current = true;
  }, [searchParams]); // Only depend on searchParams

  const handleApply = async () => {
    try {
      setError(null);

      startTransition(async () => {
        await fetchAndProcessMetrics(selectedSeason, startDate, endDate);
        
        // Update URL query parameters
        const params = new URLSearchParams();
        params.set('seasonName', selectedSeason);
        params.set('startDate', startDate);
        if (endDate) {
          params.set('endDate', endDate);
        }
        
        router.push(`${pathname}?${params.toString()}`);
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setError(error.message);
    }
  };

  const handleTabChange = useCallback((event, newValue) => {
    setCurrentType(newValue);
  }, []);

  // Memoize current formatted data to prevent unnecessary re-renders
  const currentFormattedChartData = useMemo(() => 
    formattedChartDataByType[currentType] || null,
    [formattedChartDataByType, currentType]
  );
  
  const currentFormattedGridData = useMemo(() => 
    formattedGridDataByType[currentType] || [],
    [formattedGridDataByType, currentType]
  );
  console.log(selectedMetrics);
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
                maxWidth: { xs: '100%', sm: '800px' },
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
                borderBottom: 1,
                borderColor: 'divider',
                mb: 2,
              }}
            >
              <Tabs
                value={currentType}
                onChange={handleTabChange}
                aria-label="metrics type tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                {TAB_OPTIONS.map((tab) => (
                  <Tab
                    key={tab.value}
                    label={t(tab.label)}
                    value={tab.value}
                  />
                ))}
              </Tabs>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                minHeight: '45vh',
              }}
            >
              {
                currentFormattedChartData && (
                  <Box sx={{ flex: 1 }}>
                    <MetricsBarChart {...currentFormattedChartData} />
                  </Box>
                )
              }

              {
                currentFormattedGridData && (
                  <Box sx={{ flex: 1, minHeight: '45vh' }}>
                    <MetricsDataGrid 
                      type={currentType}
                      users={users}
                      gridData={currentFormattedGridData}
                    />
                  </Box>
                )
              }
            </Box>
          </>
        )}
      </Stack>
    </Container>
  );
} 
'use client';

import { useRef, useState, useEffect, useCallback, useTransition } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';

import { useRouter, usePathname, useSearchParams } from 'src/routes/hooks';

import { fetchKvkData } from 'src/services/kvk';
import { useMetricsContext } from 'src/context/metrics';
import { makeAuthenticatedRequest } from 'src/lib/token-utils';

import { useSettingsContext } from 'src/components/settings';
import { MetricsDropdown } from 'src/components/metrics-dropdown';

import { KvkOverview } from './components/kvkOverview';
import { SingleDateKvkView } from './components/singleDateKvkView';
import { MultiDateKvkView } from './components/multipleDateKvkView';

// ----------------------------------------------------------------------

export function KvkView() {
  const settings = useSettingsContext();
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const hasProcessedInitialParams = useRef(false);
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

  const [isMultiKvkView, setIsMultiKvkView] = useState(false);

  // Helper function to fetch KVK data
  const fetchAndProcessKvkData = useCallback(async (seasonName, startDateParam, endDateParam) => {
    const kvkData = await makeAuthenticatedRequest(async () => fetchKvkData({
      seasonName,
      startDate: startDateParam,
      endDate: endDateParam,
    }));

    console.log(kvkData);

    setSelectedKvkMetrics(kvkData);
  }, [setSelectedKvkMetrics]); 

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

    // Auto-fetch KVK data if all required params exist
    if (seasonName && startDateParam) {
      const fetchKvkDataFromParams = async () => {
        try {
          setError(null);
          
          startTransition(async () => {
            await fetchAndProcessKvkData(seasonName, startDateParam, endDateParam);
          });
        } catch (error) {
          console.error('Error fetching KVK data from params:', error);
          setError(error.message);
        }
      };

      fetchKvkDataFromParams();
    }
    hasProcessedInitialParams.current = true;
  }, [searchParams, setSelectedSeason, setStartDate, setEndDate, setError, fetchAndProcessKvkData, startTransition]);

  const handleApply = async () => {
    try {
      setError(null);

      startTransition(async () => {
        await fetchAndProcessKvkData(selectedSeason, startDate, endDate);
        
        // Update URL query parameters
        const params = new URLSearchParams();
        params.set('seasonName', selectedSeason);
        params.set('startDate', startDate);
        if (endDate) {
          setIsMultiKvkView(true);
          params.set('endDate', endDate);
        }
        else {
          setIsMultiKvkView(false);
        }
        
        router.push(`${pathname}?${params.toString()}`);
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
    metricType: 'kvk',
    onSeasonChange: setSelectedSeason,
    onStartDateChange: setStartDate,
    onEndDateChange: setEndDate,
    onApply: handleApply,
    isPending,
  };

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

            <KvkOverview />

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
            { !isMultiKvkView && (
              <SingleDateKvkView chartData={selectedKvkMetrics} />
            )}

            {
              isMultiKvkView && (
                <MultiDateKvkView data={selectedKvkMetrics} startDate={startDate} endDate={endDate} />
              )
            }
          </>
        )}
      </Stack>
    </Container>
  );
} 
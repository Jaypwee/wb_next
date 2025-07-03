'use client';

import { useEffect, useTransition } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import { useTranslate } from 'src/locales';
import { useMetricsContext } from 'src/context/metrics';
import { makeAuthenticatedRequest } from 'src/lib/token-utils';
import { fetchSeasonInfo, fetchSeasonDates } from 'src/services/season';

import { CustomDropdown } from './custom-dropdown';

export function MetricsDropdown({
  selectedSeason,
  startDate,
  endDate,
  onSeasonChange,
  onStartDateChange,
  onEndDateChange,
  onApply,
  isPending = false
}) {
  const { t } = useTranslate();
  const {
    seasonInfo,
    seasonDatesCache,
    setSeasonInfo,
    setSeasonDatesCache,
  } = useMetricsContext();
  const [isLoadingSeasons, startSeasonsTransition] = useTransition();
  const [isLoadingDates, startDatesTransition] = useTransition();

  // Fetch season info on mount if not already cached
  useEffect(() => {
    if (!seasonInfo) {
      startSeasonsTransition(async () => {
        try {
          const data = await makeAuthenticatedRequest(fetchSeasonInfo);
          setSeasonInfo(data);
          
          // Set initial season if not already set
          if (data?.current_season && !selectedSeason) {
            onSeasonChange(data.current_season);
          }
        } catch (error) {
          console.error('Error loading season info:', error);
        }
      });
    } else if (seasonInfo?.current_season && !selectedSeason) {
      // If season info is already cached, set initial season
      onSeasonChange(seasonInfo.current_season);
    }
  }, [seasonInfo, selectedSeason, onSeasonChange, setSeasonInfo]);

  // Fetch dates when season changes, but only if not already cached
  useEffect(() => {
    if (!selectedSeason) return;

    // Check if dates are already cached for this season
    if (seasonDatesCache[selectedSeason]) {
      return; // Already cached, no need to fetch
    }

    startDatesTransition(async () => {
      try {
        const dates = await makeAuthenticatedRequest(() => fetchSeasonDates(selectedSeason));
        setSeasonDatesCache(selectedSeason, dates || []);
      } catch (error) {
        console.error('Error loading season dates:', error);
        setSeasonDatesCache(selectedSeason, []);
      }
    });
  }, [selectedSeason, seasonDatesCache, setSeasonDatesCache]);

  // Get current season dates from cache
  const currentSeasonDates = seasonDatesCache[selectedSeason] || [];

  // Get available end dates based on selected start date
  const getAvailableEndDates = () => {
    if (!startDate || !currentSeasonDates.length) return [];
    const startIndex = currentSeasonDates.indexOf(startDate);
    return currentSeasonDates.slice(startIndex + 1);
  };

  if (isLoadingSeasons) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <CustomDropdown
        options={seasonInfo?.total_seasons || []}
        initialValue={selectedSeason}
        onChange={onSeasonChange}
      />
      
      {isLoadingDates ? (
        <Box sx={{ width: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <>
          <CustomDropdown 
            options={currentSeasonDates}
            initialValue={startDate || t('metrics.dropdown.selectStartDate')}
            onChange={onStartDateChange}
          />
          
          {startDate && (
            <CustomDropdown 
              options={getAvailableEndDates()}
              initialValue={endDate || t('metrics.dropdown.selectEndDate')}
              onChange={onEndDateChange}
            />
          )}
          
          <Button
            variant="contained"
            onClick={onApply}
            disabled={!startDate || isPending}
            sx={{ ml: 'auto' }}
          >
            {isPending ? t('metrics.dropdown.loading') : t('metrics.dropdown.apply')}
          </Button>
        </>
      )}
    </Stack>
  );
} 
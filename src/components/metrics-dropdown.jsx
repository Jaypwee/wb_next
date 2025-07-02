'use client';

import { useState, useEffect, useTransition } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import { useTranslate } from 'src/locales';
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
  const [seasonInfo, setSeasonInfo] = useState(null);
  const [seasonDates, setSeasonDates] = useState([]);
  const [isLoadingSeasons, startSeasonsTransition] = useTransition();
  const [isLoadingDates, startDatesTransition] = useTransition();

  // Fetch season info on mount
  useEffect(() => {
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
  }, []); // Only run once on mount

  // Fetch dates when season changes
  useEffect(() => {
    if (!selectedSeason) return;

    startDatesTransition(async () => {
      try {
        const dates = await makeAuthenticatedRequest(() => fetchSeasonDates(selectedSeason));
        setSeasonDates(dates || []);
      } catch (error) {
        console.error('Error loading season dates:', error);
        setSeasonDates([]);
      }
    });
  }, [selectedSeason]);

  // Get available end dates based on selected start date
  const getAvailableEndDates = () => {
    if (!startDate || !seasonDates) return [];
    const startIndex = seasonDates.indexOf(startDate);
    return seasonDates.slice(startIndex + 1);
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
            options={seasonDates || []}
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
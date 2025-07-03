'use client';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useMemo, useEffect } from 'react';
import timezone from 'dayjs/plugin/timezone';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { useTranslate } from 'src/locales';
import { useEventsContext } from 'src/context/events';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

// Extend dayjs with timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// ----------------------------------------------------------------------

export function UpcomingEventsCard() {
  const theme = useTheme();
  const { t } = useTranslate();
  const { currentLang } = useTranslate();
  
  const {
    events,
    isLoading,
    isInitialLoading,
    loadEvents,
  } = useEventsContext();

  // Load events on component mount
  useEffect(() => {
    if (events.length === 0) {
      loadEvents();
    }
  }, [events.length, loadEvents]);

  // Filter events for the next 3 days
  const upcomingEvents = useMemo(() => {
    if (!events.length) return [];

    const now = dayjs();
    const threeDaysFromNow = now.add(3, 'day').endOf('day');

    return events
      .filter(event => {
        let eventDate;
        
        if (event.datetime) {
          // New format: UTC datetime
          eventDate = dayjs.utc(event.datetime).local();
        } else if (event.date) {
          // Legacy format: date string
          eventDate = dayjs(event.date);
        } else {
          return false;
        }

        return eventDate.isAfter(now) && eventDate.isBefore(threeDaysFromNow);
      })
      .sort((a, b) => {
        const aDate = a.datetime ? dayjs.utc(a.datetime) : dayjs(a.date);
        const bDate = b.datetime ? dayjs.utc(b.datetime) : dayjs(b.date);
        return aDate.diff(bDate);
      });
  }, [events]);

  // Group events by date
  const groupedEvents = useMemo(() => {
    const groups = {};
    
    upcomingEvents.forEach(event => {
      let eventDate;
      
      if (event.datetime) {
        eventDate = dayjs.utc(event.datetime).local();
      } else if (event.date) {
        eventDate = dayjs(event.date);
      }

      if (eventDate) {
        const dateKey = eventDate.format('YYYY-MM-DD');
        if (!groups[dateKey]) {
          groups[dateKey] = {
            date: eventDate,
            events: []
          };
        }
        groups[dateKey].events.push(event);
      }
    });

    return Object.values(groups).sort((a, b) => a.date.diff(b.date));
  }, [upcomingEvents]);

  // Get the appropriate title based on current locale
  const getEventTitle = (event) => {
    if (currentLang?.value === 'en' && event.titleEnglish) {
      return event.titleEnglish;
    }
    return event.title || '';
  };

  // Format event time
  const formatEventTime = (event) => {
    if (event.datetime) {
      const utcDateTime = dayjs.utc(event.datetime);
      const localDateTime = utcDateTime.local();
      return localDateTime.format('HH:mm');
    }
    return event.startTime || '';
  };

  // Format date for display
  const formatDateDisplay = (date) => {
    const today = dayjs();
    const tomorrow = today.add(1, 'day');
    const dayAfterTomorrow = today.add(2, 'day');

    if (date.isSame(today, 'day')) {
      return t('dashboard.upcomingEvents.today');
    } else if (date.isSame(tomorrow, 'day')) {
      return t('dashboard.upcomingEvents.tomorrow');
    } else if (date.isSame(dayAfterTomorrow, 'day')) {
      return t('dashboard.upcomingEvents.inTwoDays');
    }
    return date.format('MM-DD-YYYY');
  };

  return (
    <Card>
      <CardContent sx={{ p: 3, width: '400px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <Iconify icon="solar:calendar-bold" width={24} sx={{ mr: 1 }} />
            {t('dashboard.upcomingEvents.title')}
          </Typography>
        </Box>

        {isInitialLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : groupedEvents.length === 0 ? (
          <EmptyContent
            title={t('dashboard.upcomingEvents.noEvents')}
            description={t('dashboard.upcomingEvents.noEventsDescription')}
            imgUrl="/assets/icons/empty/ic-calendar-events.svg"
            sx={{ py: 4 }}
          />
        ) : (
          <Box sx={{ opacity: isLoading ? 0.7 : 1 }}>
            {groupedEvents.map((group, groupIndex) => (
              <Box key={group.date.format('YYYY-MM-DD')}>
                {groupIndex > 0 && <Divider sx={{ my: 2 }} />}
                
                {/* Date Header */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {formatDateDisplay(group.date)}
                  </Typography>
                </Box>

                {/* Events for this date */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {group.events.map((event) => (
                    <Box
                      key={event.id}
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        bgcolor: alpha(event.color || theme.palette.primary.main, 0.08),
                        border: `1px solid ${alpha(event.color || theme.palette.primary.main, 0.2)}`,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          bgcolor: alpha(event.color || theme.palette.primary.main, 0.12),
                          transform: 'translateY(-1px)',
                          boxShadow: `0 4px 8px ${alpha(event.color || theme.palette.primary.main, 0.2)}`,
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                          label={formatEventTime(event)}
                          size="small"
                          sx={{
                            bgcolor: event.color || theme.palette.primary.main,
                            color: 'white',
                            fontWeight: 'medium',
                            minWidth: 60,
                          }}
                        />
                        <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 'medium' }}>
                          {getEventTitle(event)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
} 
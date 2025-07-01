'use client';

import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { useTranslate } from 'src/locales';

import { CalendarEvent } from './calendar-event';

// ----------------------------------------------------------------------

const WEEKDAYS = [
  { key: 'sun', color: 'error.main' },
  { key: 'mon', color: 'primary.main' },
  { key: 'tue', color: 'primary.main' },
  { key: 'wed', color: 'primary.main' },
  { key: 'thu', color: 'primary.main' },
  { key: 'fri', color: 'primary.main' },
  { key: 'sat', color: 'primary.main' },
];

// ----------------------------------------------------------------------

export function CalendarGrid({ 
  currentDate, 
  events, 
  onAddEvent, 
  onEditEvent, 
  onEventDrop,
  readOnly = false
}) {
  const theme = useTheme();
  const { t } = useTranslate();

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    // First day of the week for the first day of the month
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDay = new Date(startDate);
    
    // Generate 42 days (6 weeks × 7 days) to fill the calendar grid
    for (let i = 0; i < 42; i++) {
      const dayString = currentDay.toISOString().split('T')[0];
      const dayEvents = events.filter(event => event.date === dayString);
      
      days.push({
        date: new Date(currentDay),
        dateString: dayString,
        day: currentDay.getDate(),
        isCurrentMonth: currentDay.getMonth() === month,
        isToday: currentDay.toDateString() === new Date().toDateString(),
        events: dayEvents,
      });
      
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  }, [currentDate, events]);

  const handleDrop = (e, targetDate) => {
    if (readOnly) return; // Prevent drops in read-only mode
    
    e.preventDefault();
    const eventId = e.dataTransfer.getData('text/plain');
    if (eventId && targetDate !== events.find(event => event.id === eventId)?.date) {
      onEventDrop(eventId, targetDate);
    }
  };

  const handleDragOver = (e) => {
    if (readOnly) return; // Prevent drag over in read-only mode
    e.preventDefault();
  };

  const handleDayClick = (dateString) => {
    if (readOnly) return; // Prevent adding events in read-only mode
    onAddEvent(dateString);
  };

  return (
    <Box>
      {/* Weekday Headers */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 1,
          mb: 1,
        }}
      >
        {WEEKDAYS.map((day) => (
          <Box
            key={day.key}
            sx={{
              p: 1,
              textAlign: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              borderRadius: 1,
            }}
          >
            <Typography variant="subtitle2" color={day.color}>
              {t(`schedule.weekdays.${day.key}`)}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Calendar Days Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 1,
          height: 600,
        }}
      >
        {calendarDays.map((day, index) => {
          const isSunday = day.date.getDay() === 0;
          
          return (
            <Paper
              key={index}
              elevation={0}
              variant="outlined"
              onDrop={readOnly ? undefined : (e) => handleDrop(e, day.dateString)}
              onDragOver={readOnly ? undefined : handleDragOver}
              onClick={readOnly ? undefined : () => handleDayClick(day.dateString)}
              sx={{
                p: 1,
                minHeight: 100,
                cursor: readOnly ? 'default' : 'pointer',
                position: 'relative',
                bgcolor: day.isCurrentMonth ? 'background.paper' : 'action.hover',
                borderColor: day.isToday ? 'primary.main' : 'divider',
                borderWidth: day.isToday ? 2 : 1,
                ...(!readOnly && {
                  '&:hover': {
                    bgcolor: day.isCurrentMonth ? 'action.hover' : 'action.selected',
                  },
                }),
                ...(day.isToday && {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                }),
                ...(readOnly && {
                  '&:hover': {
                    bgcolor: day.isCurrentMonth ? 'background.paper' : 'action.hover',
                  },
                }),
              }}
            >
              {/* Day Number */}
              <Typography
                variant="body2"
                sx={{
                  color: day.isCurrentMonth 
                    ? day.isToday 
                      ? 'primary.main' 
                      : isSunday
                        ? 'error.main'
                        : 'text.primary'
                    : 'text.disabled',
                  fontWeight: day.isToday ? 'bold' : 'normal',
                  mb: 0.5,
                }}
              >
                {day.day}
              </Typography>

              {/* Events */}
              <Box sx={{ mt: 0.5 }}>
                {day.events.slice(0, 3).map((event) => (
                  <CalendarEvent
                    key={event.id}
                    event={event}
                    onEdit={onEditEvent}
                    readOnly={readOnly}
                  />
                ))}
                {day.events.length > 3 && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      display: 'block',
                      mt: 0.5,
                      fontSize: '0.7rem',
                    }}
                  >
                    {t('schedule.events.moreEvents', { count: day.events.length - 3 })}
                  </Typography>
                )}
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
} 
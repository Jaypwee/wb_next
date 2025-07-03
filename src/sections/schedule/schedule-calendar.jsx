'use client';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

import { useTranslate } from 'src/locales';
import { useEventsContext } from 'src/context/events';

import { Iconify } from 'src/components/iconify';
import { LoadingScreen } from 'src/components/loading-screen';

import { EventDialog } from './components/event-dialog';
import { CalendarGrid } from './components/calendar-grid';

// Extend dayjs with timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// ----------------------------------------------------------------------

export function ScheduleCalendar({ readOnly = false }) {
  const theme = useTheme();
  const { t } = useTranslate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [eventDialog, setEventDialog] = useState({
    open: false,
    event: null,
    date: null,
  });
  
  // Use events context
  const {
    events,
    error,
    isLoading,
    isInitialLoading,
    loadEvents,
    createEvent,
    editEvent,
    removeEvent,
    moveEvent,
    retryLoad,
  } = useEventsContext();

  // Load events on component mount
  useEffect(() => {
    if (events.length === 0) {
      loadEvents();
    }
  }, [events.length, loadEvents]);



  const { year, monthName } = useMemo(() => {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Map month index to translation key
    const monthKeys = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    
    const currentMonthName = t(`schedule.months.${monthKeys[currentMonth]}`);
    
    return { year: currentYear, month: currentMonth, monthName: currentMonthName };
  }, [currentDate, t]);

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleAddEvent = (date) => {
    if (readOnly) return; // Prevent adding events in read-only mode
    
    setEventDialog({
      open: true,
      event: null,
      date,
    });
  };

  const handleEditEvent = (event) => {
    if (readOnly) return; // Prevent editing events in read-only mode
    
    setEventDialog({
      open: true,
      event,
      date: null,
    });
  };

  const handleSaveEvent = async (eventData) => {
    if (readOnly) return; // Prevent saving events in read-only mode
    
    try {
      if (eventDialog.event) {
        // Edit existing event
        await editEvent(eventDialog.event.id, eventData);
      } else {
        // Add new event
        await createEvent(eventData);
      }
      
      setEventDialog({ open: false, event: null, date: null });
    } catch (err) {
      // Error is already handled in context, don't close dialog so user can retry
      console.error('Failed to save event:', err);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (readOnly) return; // Prevent deleting events in read-only mode
    
    try {
      await removeEvent(eventId);
      setEventDialog({ open: false, event: null, date: null });
    } catch (err) {
      // Error is already handled in context, don't close dialog so user can retry
      console.error('Failed to delete event:', err);
    }
  };

  const handleCloseDialog = () => {
    setEventDialog({ open: false, event: null, date: null });
  };

  const handleEventDrop = async (eventId, newDate) => {
    if (readOnly) return; // Prevent drag-and-drop in read-only mode
    
    try {
      await moveEvent(eventId, newDate);
    } catch (err) {
      console.error('Failed to move event:', err);
      // Optionally show a toast notification here
    }
  };

  const handleRetry = () => {
    retryLoad();
  };

  // Get current timezone for display
  const getCurrentTimezone = () => {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: userTimezone,
        timeZoneName: 'short',
      });
      
      const parts = formatter.formatToParts(now);
      const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value;
      
      return `${userTimezone.replace('_', ' ')} (${timeZoneName})`;
    } catch (formatError) {
      return userTimezone;
    }
  };

  // Show loading state for initial load
  if (isInitialLoading) {
    return (
      <LoadingScreen />
    );
  }

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        height: '100%',
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        // Add slight opacity when loading
        opacity: isLoading ? 0.7 : 1,
        transition: 'opacity 0.2s ease-in-out',
      }}
    >
      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleRetry}>
              {t('schedule.retry', { default: 'Retry' })}
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} />
            {t('schedule.updating', { default: 'Updating events...' })}
          </Box>
        </Alert>
      )}

      {/* Calendar Header */}
      <Box
        className="calendar-navigation"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
          pb: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4">
            {monthName} {year}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={goToToday}
            sx={{ ml: 2 }}
          >
            {t('schedule.today')}
          </Button>
          <Chip
            icon={<Iconify icon="mdi:clock-outline" />}
            label={getCurrentTimezone()}
            size="small"
            variant="outlined"
            sx={{ ml: 1 }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => navigateMonth(-1)}>
            <Iconify icon="eva:arrow-left-fill" />
          </IconButton>
          <IconButton onClick={() => navigateMonth(1)}>
            <Iconify icon="eva:arrow-right-fill" />
          </IconButton>
        </Box>
      </Box>

      {/* Calendar Grid */}
      <CalendarGrid
        currentDate={currentDate}
        events={events}
        onAddEvent={handleAddEvent}
        onEditEvent={handleEditEvent}
        onEventDrop={handleEventDrop}
        readOnly={readOnly}
      />

      {/* Event Dialog */}
      <EventDialog
        open={eventDialog.open}
        event={eventDialog.event}
        date={eventDialog.date}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        onClose={handleCloseDialog}
        readOnly={readOnly}
      />
    </Paper>
  );
} 
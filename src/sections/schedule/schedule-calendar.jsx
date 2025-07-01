'use client';

import { useMemo, useState, useEffect, useTransition } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

import axios from 'src/lib/axios';
import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { LoadingScreen } from 'src/components/loading-screen';

import { EventDialog } from './components/event-dialog';
import { CalendarGrid } from './components/calendar-grid';
import { getUserTimezone, getTimezoneDisplayName } from './utils/timezone';

// ----------------------------------------------------------------------

export function ScheduleCalendar({ readOnly = false }) {
  const theme = useTheme();
  const { t } = useTranslate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [eventDialog, setEventDialog] = useState({
    open: false,
    event: null,
    date: null,
  });
  
  // Use useTransition for async operations
  const [isPending, startTransition] = useTransition();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      setError(null);
      const response = await axios.get('/api/season/schedule');
      setEvents(response.data.events || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.response?.data?.error || 'Failed to load events');
      setEvents([]); // Set empty array on error
    } finally {
      setIsInitialLoading(false);
    }
  };

  // Save events to API
  const saveEventsToAPI = async (updatedEvents) => {
    if (readOnly) return; // Don't save in read-only mode
    
    try {
      setError(null);
      await axios.post('/api/season/schedule', { events: updatedEvents });
    } catch (err) {
      console.error('Error saving events:', err);
      setError(err.response?.data?.error || 'Failed to save events');
      throw err; // Re-throw to handle in calling function
    }
  };

  // Load events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

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

  const handleSaveEvent = (eventData) => {
    if (readOnly) return; // Prevent saving events in read-only mode
    
    startTransition(async () => {
      try {
        let updatedEvents;
        
        if (eventDialog.event) {
          // Edit existing event
          updatedEvents = events.map(event => 
            event.id === eventDialog.event.id ? { ...eventData, id: event.id } : event
          );
        } else {
          // Add new event
          const newEvent = {
            ...eventData,
            id: Date.now().toString(),
            timezone: eventData.timezone || getUserTimezone(),
          };
          updatedEvents = [...events, newEvent];
        }

        // Save to API first
        await saveEventsToAPI(updatedEvents);
        
        // Update local state
        setEvents(updatedEvents);
        setEventDialog({ open: false, event: null, date: null });
      } catch (err) {
        // Error is already set in saveEventsToAPI, don't close dialog so user can retry
        console.error('Failed to save event:', err);
      }
    });
  };

  const handleDeleteEvent = (eventId) => {
    if (readOnly) return; // Prevent deleting events in read-only mode
    
    startTransition(async () => {
      try {
        const updatedEvents = events.filter(event => event.id !== eventId);
        
        // Save to API first
        await saveEventsToAPI(updatedEvents);
        
        // Update local state
        setEvents(updatedEvents);
        setEventDialog({ open: false, event: null, date: null });
      } catch (err) {
        // Error is already set in saveEventsToAPI, don't close dialog so user can retry
        console.error('Failed to delete event:', err);
      }
    });
  };

  const handleCloseDialog = () => {
    setEventDialog({ open: false, event: null, date: null });
  };

  const handleEventDrop = (eventId, newDate) => {
    if (readOnly) return; // Prevent drag-and-drop in read-only mode
    
    startTransition(async () => {
      try {
        const updatedEvents = events.map(event => 
          event.id === eventId ? { ...event, date: newDate } : event
        );
        
        // Save to API first
        await saveEventsToAPI(updatedEvents);
        
        // Update local state
        setEvents(updatedEvents);
      } catch (err) {
        console.error('Failed to move event:', err);
        // Optionally show a toast notification here
      }
    });
  };

  const handleRetry = () => {
    setIsInitialLoading(true);
    fetchEvents();
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
        // Add slight opacity when transition is pending
        opacity: isPending ? 0.7 : 1,
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

      {/* Transition Pending Indicator */}
      {isPending && (
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
            label={getTimezoneDisplayName()}
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
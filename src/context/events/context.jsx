'use client';

import dayjs from 'dayjs';
import { useContext, useReducer, useCallback, createContext } from 'react';

import { saveEvents, fetchEvents } from 'src/services/events';
import { makeAuthenticatedRequest } from 'src/lib/token-utils';

import { reducer } from './reducer';
import {
  addEvent,
  setError,
  setEvents,
  setLoading,
  updateEvent,
  deleteEvent,
  clearEvents,
  setInitialLoading,
} from './actions';

// ----------------------------------------------------------------------

const initialState = {
  events: [],
  isLoading: false,
  error: null,
  isInitialLoading: true,
};

// ----------------------------------------------------------------------

const EventsContext = createContext(null);

// ----------------------------------------------------------------------

export function EventsProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadEvents = useCallback(async () => {
    try {
      dispatch(setInitialLoading(true));
      dispatch(setError(null));
      
      const eventsData = await makeAuthenticatedRequest(fetchEvents);
      dispatch(setEvents(eventsData));
    } catch (error) {
      console.error('Error fetching events:', error);
      dispatch(setError(error.message));
      dispatch(setEvents([])); // Set empty array on error
    } finally {
      dispatch(setInitialLoading(false));
    }
  }, []);

  const saveEventsToAPI = useCallback(async (events) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      await makeAuthenticatedRequest(() => saveEvents(events));
    } catch (error) {
      console.error('Error saving events:', error);
      dispatch(setError(error.message));
      throw error; // Re-throw to handle in calling function
    } finally {
      dispatch(setLoading(false));
    }
  }, []);

  const createEvent = useCallback(async (eventData) => {
    const newEvent = {
      ...eventData,
      id: Date.now().toString(),
    };
    
    const updatedEvents = [...state.events, newEvent];
    
    await saveEventsToAPI(updatedEvents);
    dispatch(addEvent(newEvent));
    return newEvent;
  }, [state.events, saveEventsToAPI]);

  const editEvent = useCallback(async (eventId, eventData) => {
    const updatedEvents = state.events.map(event => 
      event.id === eventId ? { ...eventData, id: eventId } : event
    );
    
    await saveEventsToAPI(updatedEvents);
    dispatch(updateEvent(eventId, eventData));
  }, [state.events, saveEventsToAPI]);

  const removeEvent = useCallback(async (eventId) => {
    const updatedEvents = state.events.filter(event => event.id !== eventId);
    
    await saveEventsToAPI(updatedEvents);
    dispatch(deleteEvent(eventId));
  }, [state.events, saveEventsToAPI]);

  const moveEvent = useCallback(async (eventId, newDate) => {
    const updatedEvents = state.events.map(event => {
      if (event.id === eventId) {
        if (event.datetime) {
          // New format: Update the datetime while preserving time
          const utcDateTime = dayjs.utc(event.datetime);
          const localDateTime = utcDateTime.local();
          const newDateTime = dayjs(newDate)
            .hour(localDateTime.hour())
            .minute(localDateTime.minute())
            .second(0)
            .millisecond(0);
          
          return {
            ...event,
            datetime: newDateTime.utc().toISOString(),
            date: newDate, // Keep legacy field for compatibility
          };
        } else {
          // Legacy format: Just update the date
          return { ...event, date: newDate };
        }
      }
      return event;
    });
    
    await saveEventsToAPI(updatedEvents);
    dispatch(setEvents(updatedEvents));
  }, [state.events, saveEventsToAPI]);

  const retryLoad = useCallback(() => {
    loadEvents();
  }, [loadEvents]);

  const actions = {
    setEvents: (events) => dispatch(setEvents(events)),
    setLoading: (isLoading) => dispatch(setLoading(isLoading)),
    setError: (error) => dispatch(setError(error)),
    clearEvents: () => dispatch(clearEvents()),
    loadEvents,
    createEvent,
    editEvent,
    removeEvent,
    moveEvent,
    retryLoad,
  };

  return (
    <EventsContext.Provider
      value={{
        ...state,
        ...actions,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
}

// ----------------------------------------------------------------------

export const useEventsContext = () => {
  const context = useContext(EventsContext);

  if (!context) {
    throw new Error('useEventsContext must be used within an EventsProvider');
  }

  return context;
}; 
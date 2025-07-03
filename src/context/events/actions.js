import { ActionTypes } from './reducer';

// ----------------------------------------------------------------------

export const setEvents = (events) => ({
  type: ActionTypes.SET_EVENTS,
  payload: events,
});

export const addEvent = (event) => ({
  type: ActionTypes.ADD_EVENT,
  payload: event,
});

export const updateEvent = (eventId, eventData) => ({
  type: ActionTypes.UPDATE_EVENT,
  payload: { eventId, eventData },
});

export const deleteEvent = (eventId) => ({
  type: ActionTypes.DELETE_EVENT,
  payload: eventId,
});

export const setLoading = (isLoading) => ({
  type: ActionTypes.SET_LOADING,
  payload: isLoading,
});

export const setError = (error) => ({
  type: ActionTypes.SET_ERROR,
  payload: error,
});

export const clearEvents = () => ({
  type: ActionTypes.CLEAR_EVENTS,
});

export const setInitialLoading = (isInitialLoading) => ({
  type: ActionTypes.SET_INITIAL_LOADING,
  payload: isInitialLoading,
}); 
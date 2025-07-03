// ----------------------------------------------------------------------

export const ActionTypes = {
  SET_EVENTS: 'SET_EVENTS',
  ADD_EVENT: 'ADD_EVENT',
  UPDATE_EVENT: 'UPDATE_EVENT',
  DELETE_EVENT: 'DELETE_EVENT',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_EVENTS: 'CLEAR_EVENTS',
  SET_INITIAL_LOADING: 'SET_INITIAL_LOADING',
};

// ----------------------------------------------------------------------

export function reducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_EVENTS:
      return {
        ...state,
        events: action.payload,
        error: null,
      };

    case ActionTypes.ADD_EVENT:
      return {
        ...state,
        events: [...state.events, action.payload],
        error: null,
      };

    case ActionTypes.UPDATE_EVENT:
      return {
        ...state,
        events: state.events.map(event => 
          event.id === action.payload.eventId 
            ? { ...action.payload.eventData, id: event.id }
            : event
        ),
        error: null,
      };

    case ActionTypes.DELETE_EVENT:
      return {
        ...state,
        events: state.events.filter(event => event.id !== action.payload),
        error: null,
      };

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case ActionTypes.CLEAR_EVENTS:
      return {
        ...state,
        events: [],
        error: null,
      };

    case ActionTypes.SET_INITIAL_LOADING:
      return {
        ...state,
        isInitialLoading: action.payload,
      };

    default:
      return state;
  }
} 
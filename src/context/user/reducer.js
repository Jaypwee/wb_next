// ----------------------------------------------------------------------

export const ActionTypes = {
  SET_USERS: 'SET_USERS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_USERS: 'CLEAR_USERS',
};

// ----------------------------------------------------------------------

export function reducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_USERS:
      return {
        ...state,
        users: action.payload,
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

    case ActionTypes.CLEAR_USERS:
      return {
        ...state,
        users: null,
        error: null,
      };

    default:
      return state;
  }
} 
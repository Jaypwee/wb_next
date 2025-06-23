import { ActionTypes } from './reducer';

// ----------------------------------------------------------------------

export const setUsers = (users) => ({
  type: ActionTypes.SET_USERS,
  payload: users,
});

export const setLoading = (isLoading) => ({
  type: ActionTypes.SET_LOADING,
  payload: isLoading,
});

export const setError = (error) => ({
  type: ActionTypes.SET_ERROR,
  payload: error,
});

export const clearUsers = () => ({
  type: ActionTypes.CLEAR_USERS,
}); 
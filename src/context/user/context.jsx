'use client';

import { useContext, useReducer, useCallback, createContext } from 'react';

import { fetchAllUsers } from 'src/services/user';
import { makeAuthenticatedRequest } from 'src/lib/token-utils';

import { reducer } from './reducer';
import {
  setUsers,
  setError,
  setLoading,
  clearUsers,
} from './actions';
// ----------------------------------------------------------------------

const initialState = {
  users: null,
  isLoading: false,
  error: null,
};

// ----------------------------------------------------------------------

const UserContext = createContext(null);

// ----------------------------------------------------------------------

export function UserProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadUsers = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      
      const userData = await makeAuthenticatedRequest(fetchAllUsers);
      dispatch(setUsers(userData));
    } catch (error) {
      console.error('Error fetching users:', error);
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  }, []);

  const actions = {
    setUsers: (users) => dispatch(setUsers(users)),
    setLoading: (isLoading) => dispatch(setLoading(isLoading)),
    setError: (error) => dispatch(setError(error)),
    clearUsers: () => dispatch(clearUsers()),
    loadUsers,
  };

  return (
    <UserContext.Provider
      value={{
        ...state,
        ...actions,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// ----------------------------------------------------------------------

export const useUserContext = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }

  return context;
}; 
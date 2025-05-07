'use client';

import { createContext } from 'react';

// ----------------------------------------------------------------------

export const AuthContext = createContext({
  user: null,
  loading: true,
  authenticated: false,
  unauthenticated: true,
  checkUserSession: () => {},
});

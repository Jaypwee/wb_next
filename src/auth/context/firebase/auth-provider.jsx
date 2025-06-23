'use client';

import { onAuthStateChanged } from 'firebase/auth';
import { useSetState } from 'minimal-shared/hooks';
import { useMemo, useEffect, useCallback } from 'react';
import {  query, where, getDocs, collection } from 'firebase/firestore';

import axios from 'src/lib/axios';
import { AUTH, FIRESTORE } from 'src/lib/firebase';

import { AuthContext } from '../auth-context';

// ----------------------------------------------------------------------

export function AuthProvider({ children }) {
  const { state, setState } = useSetState({ user: null, loading: true });

  const checkUserSession = useCallback(async () => {
    try {
      onAuthStateChanged(AUTH, async (user) => {
        if (user) {
          // Query users collection by uid field instead of using uid as document ID
          const usersRef = collection(FIRESTORE, 'users');
          const userQuery = query(usersRef, where('uid', '==', user.uid));
          const querySnapshot = await getDocs(userQuery);

          let profileData = null;
          if (!querySnapshot.empty) {
            // User found by uid field
            const userDoc = querySnapshot.docs[0];
            profileData = userDoc.data();
          }

          // Get the ID token for API authentication (not access token)
          const idToken = await user.getIdToken();

          setState({ user: { ...user, ...profileData, idToken }, loading: false });
          
          // Set the ID token in axios default headers for API calls
          axios.defaults.headers.common.Authorization = `Bearer ${idToken}`;
        } else {
          setState({ user: null, loading: false });
          delete axios.defaults.headers.common.Authorization;
        }
      });
    } catch (error) {
      console.error(error);
      setState({ user: null, loading: false });
    }
  }, [setState]);

  useEffect(() => {
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user
        ? {
            ...state.user,
            id: state.user?.uid,
            idToken: state.user?.idToken,
            displayName: state.user?.displayName,
            photoURL: state.user?.photoURL,
            role: state.user?.role || null,
          }
        : null,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [checkUserSession, state.user, status]
  );

  return <AuthContext value={memoizedValue}>{children}</AuthContext>;
}

'use client';

import {
  signOut as _signOut,
  sendPasswordResetEmail as _sendPasswordResetEmail,
  signInWithEmailAndPassword as _signInWithEmailAndPassword,
} from 'firebase/auth';

import axios from 'src/lib/axios';
import { AUTH } from 'src/lib/firebase';

/** **************************************
 * Sign in
 *************************************** */

// ----------------------------------------------------------------------

export const signInWithPassword = async ({ email, password }) => {
  try {
    await _signInWithEmailAndPassword(AUTH, email, password);
  } catch (error) {
    console.error('Error during sign in with password:', error);
    throw error;
  }
};

/** **************************************
 * Sign up
 *************************************** */

// ----------------------------------------------------------------------

export const signUp = async ({ email, password, nickname, gameuid, nationality, mainTroops }) => {
  try {
    const response = await axios.post('/api/auth/signup', {
      email,
      password,
      gameuid,
      nationality,
      mainTroops,
    });

    // Sign in the user after successful signup
    await _signInWithEmailAndPassword(AUTH, email, password);
  } catch (error) {
    console.error('Error during sign up:', error);
    const errorMessage = error.response?.data?.error || 'Failed to sign up';
    throw new Error(errorMessage);
  }
};

/** **************************************
 * Sign out
 *************************************** */

// ----------------------------------------------------------------------

export const signOut = async () => {
  await _signOut(AUTH);
};

/** **************************************
 * Reset password
 *************************************** */

// ----------------------------------------------------------------------

export const sendPasswordResetEmail = async ({ email }) => {
  await _sendPasswordResetEmail(AUTH, email);
};

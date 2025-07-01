'use client';

import {
  EmailAuthProvider,
  signOut as _signOut,
  reauthenticateWithCredential,
  updatePassword as _updatePassword,
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

/** **************************************`
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
    const errorMessage = error?.error || 'Failed to sign up';
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

/** **************************************
 * Update password
 *************************************** */

// ----------------------------------------------------------------------

export const updatePassword = async ({ currentPassword, newPassword }) => {
  try {
    const user = AUTH.currentUser;
    
    if (!user) {
      throw new Error('No authenticated user found');
    }

    // Re-authenticate the user with their current password
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update the password
    await _updatePassword(user, newPassword);
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

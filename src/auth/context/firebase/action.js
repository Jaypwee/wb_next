'use client';

import { doc, setDoc, collection } from 'firebase/firestore';
import {
  signOut as _signOut,
  signInWithPopup as _signInWithPopup,
  GoogleAuthProvider as _GoogleAuthProvider,
  GithubAuthProvider as _GithubAuthProvider,
  TwitterAuthProvider as _TwitterAuthProvider,
  sendEmailVerification as _sendEmailVerification,
  sendPasswordResetEmail as _sendPasswordResetEmail,
  signInWithEmailAndPassword as _signInWithEmailAndPassword,
  createUserWithEmailAndPassword as _createUserWithEmailAndPassword,
} from 'firebase/auth';

import { AUTH, FIRESTORE } from 'src/lib/firebase';

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

// ----------------------------------------------------------------------

export const signInWithGoogle = async () => {
  const provider = new _GoogleAuthProvider();
  await _signInWithPopup(AUTH, provider);
};

// ----------------------------------------------------------------------

export const signInWithGithub = async () => {
  const provider = new _GithubAuthProvider();
  await _signInWithPopup(AUTH, provider);
};

// ----------------------------------------------------------------------

export const signInWithTwitter = async () => {
  const provider = new _TwitterAuthProvider();
  await _signInWithPopup(AUTH, provider);
};

/** **************************************
 * Sign up
 *************************************** */

// ----------------------------------------------------------------------

export const signUp = async ({ email, password, nickname, gameuid, nationality, mainTroops }) => {
  try {
    const newUser = await _createUserWithEmailAndPassword(AUTH, email, password);

    const userProfile = doc(collection(FIRESTORE, 'users'), newUser.user?.uid);

    await setDoc(userProfile, {
      uid: newUser.user?.uid,
      email,
      nickname,
      gameuid,
      nationality,
      mainTroops,
    });
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
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

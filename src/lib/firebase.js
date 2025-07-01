import { getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const isFirebase = CONFIG.auth.method === 'firebase';

// Debug Firebase configuration
if (isFirebase) {
  // Verify all required fields are present
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missingFields = requiredFields.filter(field => !CONFIG.firebase[field]);
  if (missingFields.length > 0) {
    console.error('Missing required Firebase configuration fields:', missingFields);
  }
}

// ----------------------------------------------------------------------

export const firebaseApp = isFirebase ? initializeApp(CONFIG.firebase) : {};

// ----------------------------------------------------------------------

export const AUTH = isFirebase ? getAuth(firebaseApp) : {};

// ----------------------------------------------------------------------

export const FIRESTORE = isFirebase ? getFirestore(firebaseApp) : {};

// ----------------------------------------------------------------------

export const STORAGE = isFirebase ? getStorage(firebaseApp) : {};

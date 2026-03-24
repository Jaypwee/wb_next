import { NextResponse } from 'next/server';

import { adminDb, adminAuth } from 'src/lib/firebase-admin';
import { isSignupAllowed } from 'src/lib/signup-eligibility';

export async function POST(request) {
  try {
    const { email, password, gameuid, nationality, mainTroops } = await request.json();

    // Check if gameuid already exists
    const usersRef = adminDb.collection('users');

    // Check if user exists in users collection
    const userDoc = await usersRef.doc(gameuid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'This user is not permitted to sign up' },
        { status: 403 }
      );
    }

    const userData = userDoc.data();

    if (userData.uid) {
      return NextResponse.json(
        { error: 'User has already signed up' },
        { status: 409 }
      );
    }

    if (!isSignupAllowed(userData)) {
      return NextResponse.json(
        { error: 'This user is not permitted to sign up' },
        { status: 403 }
      );
    }

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
    });

    const timestamp = new Date().toISOString();

    // Create user profile in Firestore
    await adminDb.collection('users').doc(gameuid).update({
      uid: userRecord.uid,
      email,
      nationality,
      mainTroops,
      createdAt: userData.createdAt || timestamp,
      signedUpAt: timestamp,
      updatedAt: timestamp,
    });

    return NextResponse.json({
      message: 'User created successfully',
      uid: userRecord.uid
    });

  } catch (error) {
    console.error('Error in signup:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 

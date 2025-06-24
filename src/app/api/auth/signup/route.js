import { NextResponse } from 'next/server';

import { adminDb, adminAuth } from 'src/lib/firebase-admin';
import { createLoggedFirestore } from 'src/lib/firestore-logger';

export async function POST(request) {
  try {
    const { email, password, nickname, gameuid, nationality, mainTroops } = await request.json();

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

    if (userDoc.data().uid) {
      return NextResponse.json(
        { error: 'User has already signed up' },
        { status: 409 }
      );
    }

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
    });

    // Create logged Firestore instance for signup operation
    const loggedDb = createLoggedFirestore({
      uid: userRecord.uid,
      email,
      role: 'user'
    });

    // Create user profile in Firestore using logged operation
    await loggedDb.collection('users').doc(gameuid).update({
      uid: userRecord.uid,
      email,
      nationality,
      mainTroops,
      createdAt: new Date().toISOString(),
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
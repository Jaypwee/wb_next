import { NextResponse } from 'next/server';

import { adminDb, adminAuth } from 'src/lib/firebase-admin';

export async function POST(request) {
  try {
    const { email, password, nickname, gameuid, nationality, mainTroops } = await request.json();

    // Check if gameuid already exists
    const usersRef = adminDb.collection('users');
    const querySnapshot = await usersRef.where('gameuid', '==', gameuid).get();
    
    if (!querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Game UID already exists' },
        { status: 400 }
      );
    }

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
    });

    // Create user profile in Firestore
    await usersRef.doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      nickname,
      gameuid,
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
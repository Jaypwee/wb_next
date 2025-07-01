import { NextResponse } from 'next/server';

import { withAuthAndRole } from 'src/lib/auth-middleware';
import { createLoggedFirestore } from 'src/lib/firestore-logger';

async function getLeadershipHandler(request) {
  try {
    // Create logged Firestore instance with user context
    const loggedDb = createLoggedFirestore(request.user);

    // Get the leadership field from the 'home' collection's 'info' document
    const docRef = loggedDb.collection('home').doc('info');
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Leadership data not found' },
        { status: 404 }
      );
    }

    const data = doc.data();
    const leadership = data?.leadership;

    return NextResponse.json(
      { 
        leadership: leadership || null
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching leadership:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updateLeadershipHandler(request) {
  try {
    // Get the leadership object from the request body
    const body = await request.json();
    const { leadership } = body;

    // Validate that leadership is provided
    if (!leadership) {
      return NextResponse.json(
        { error: 'Leadership object is required' },
        { status: 400 }
      );
    }

    // Create logged Firestore instance with user context
    const loggedDb = createLoggedFirestore(request.user);

    // Update the leadership field in the 'home' collection's 'info' document
    const docRef = loggedDb.collection('home').doc('info');
    await docRef.update({
      leadership
    });
    
    return NextResponse.json(
      { 
        message: 'Leadership updated successfully',
        leadership
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating leadership:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handlers with authentication middleware
export const GET = getLeadershipHandler;
export const PUT = withAuthAndRole(updateLeadershipHandler, 'admin');

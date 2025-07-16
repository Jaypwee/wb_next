import { NextResponse } from 'next/server';

import { adminDb } from 'src/lib/firebase-admin';
import { withAuthAndRole } from 'src/lib/auth-middleware';

async function getScheduleHandler(request) {
  try {
    // Get the schedule document from the home collection
    const scheduleDocRef = adminDb.collection('home').doc('schedule');
    const scheduleDoc = await scheduleDocRef.get();
    
    if (!scheduleDoc.exists) {
      return NextResponse.json(
        { 
          message: 'No schedule found',
          events: []
        },
        { status: 200 }
      );
    }

    const scheduleData = scheduleDoc.data();
    
    return NextResponse.json(
      { 
        events: scheduleData.events || [],
        updatedAt: scheduleData.updatedAt || null,
        updatedBy: scheduleData.updatedBy || null
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updateScheduleHandler(request) {
  try {
    // Get the events from the request body
    const body = await request.json();
    const { events } = body;

    // Validate that events is provided and is an array
    if (!events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Events array is required' },
        { status: 400 }
      );
    }

    // // Validate each event has required fields
    // for (let i = 0; i < events.length; i++) {
    //   const event = events[i];
    //   if (!event.title || !event.date || !event.startTime || !event.endTime) {
    //     return NextResponse.json(
    //       { 
    //         error: `Event at index ${i} is missing required fields (title, date, startTime, endTime)` 
    //       },
    //       { status: 400 }
    //     );
    //   }
    // }

    // Update the schedule document in the home collection
    const scheduleDocRef = adminDb.collection('home').doc('schedule');
    
    // Check if the schedule document exists
    const scheduleDoc = await scheduleDocRef.get();
    
    if (!scheduleDoc.exists) {
      // Create the document if it doesn't exist
      await adminDb.collection('home').doc('schedule').set({
        events,
        updatedAt: new Date().toISOString(),
        updatedBy: request.user.uid
      });
    } else {
      // Update the existing document
      await adminDb.collection('home').doc('schedule').update({
        events,
        updatedAt: new Date().toISOString(),
        updatedBy: request.user.uid
      });
    }

    console.log(`Schedule updated by ${request.user.email} (${request.user.uid}) with ${events.length} events`);

    return NextResponse.json(
      { 
        message: 'Schedule updated successfully',
        eventsCount: events.length,
        updatedAt: new Date().toISOString()
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the protected handlers
export const GET = getScheduleHandler;
export const POST = withAuthAndRole(updateScheduleHandler, 'admin');

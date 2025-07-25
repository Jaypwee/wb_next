import { NextResponse } from 'next/server';

import { adminDB } from 'src/lib/firebase-admin';
import { withAuthAndRole } from 'src/lib/auth-middleware';

async function getLeadershipHandler(request) {
  try {
    // Get the leadership field from the 'home' collection's 'info' document
    const docRef = adminDB.collection('home').doc('info');
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Leadership data not found' },
        { status: 404 }
      );
    }

    const data = doc.data();
    let leadership = data?.leadership;

    // Process leadership data to add missing avatar URLs
    if (leadership && typeof leadership === 'object') {
      // Recursive function to collect UIDs that need avatar URLs
      const collectUidsToFetch = (node) => {
        let uids = [];
        
        // Check if current node needs an avatar URL
        if (node.uid) {
          uids.push(node.uid);
        }
        
        // Recursively check children
        if (Array.isArray(node.children)) {
          node.children.forEach(child => {
            uids = uids.concat(collectUidsToFetch(child));
          });
        }
        
        return uids;
      };

      // Recursive function to update nodes with avatar URLs
      const updateNodeWithAvatars = (node, avatarMap) => {
        const updatedNode = { ...node };
        
        // Update current node if it needs an avatar URL
        if (node.uid && avatarMap[node.uid]) {
          updatedNode.avatarUrl = avatarMap[node.uid];
        }
        
        // Recursively update children
        if (Array.isArray(node.children)) {
          updatedNode.children = node.children.map(child => 
            updateNodeWithAvatars(child, avatarMap)
          );
        }
        
        return updatedNode;
      };

      // Collect all UIDs that need avatar URLs
      const uidsToFetch = collectUidsToFetch(leadership);
      if (uidsToFetch.length > 0) {
        try {
          // Fetch all users at once using querySnapshot
          const usersSnapshot = await adminDB.collection('users')
            .where('__name__', 'in', uidsToFetch)
            .get();

          // Create a map of uid -> avatarURL for quick lookup
          const avatarMap = {};
          usersSnapshot.forEach(userDoc => {
            const userData = userDoc.data();
            if (userData?.avatarUrl) {
              avatarMap[userDoc.id] = userData.avatarUrl;
            }
          });
          // Update leadership data with avatar URLs
          leadership = updateNodeWithAvatars(leadership, avatarMap);
        } catch (userError) {
          console.warn('Failed to fetch user avatars:', userError);
          // Continue with original leadership data if avatar fetch fails
        }
      }
    }

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

    // Update the leadership field in the 'home' collection's 'info' document
    const docRef = adminDB.collection('home').doc('info');
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

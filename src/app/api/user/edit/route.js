import { NextResponse } from 'next/server';

import { adminDb, adminStorage } from 'src/lib/firebase-admin';
import { createLoggedFirestore } from 'src/lib/firestore-logger';
import { withAuth, withAuthAndRole } from 'src/lib/auth-middleware';

async function createUserHandler(request) {
  try {
    // Get the uids from the request body
    const body = await request.json();
    const { uids } = body;

    // Validate that uids is provided and is an array
    if (!uids || !Array.isArray(uids) || uids.length === 0) {
      return NextResponse.json(
        { error: 'UIDs array is required and must not be empty' },
        { status: 400 }
      );
    }
    
    // Create logged Firestore instance with user context
    const loggedDb = createLoggedFirestore(request.user);
    
    const results = [];
    const errors = [];

    // Process each UID
    for (const uid of uids) {
      try {
        // Check if user document already exists
        const userDocRef = adminDb.collection('users').doc(uid);
        const existingDoc = await userDocRef.get();
        
        if (existingDoc.exists) {
          errors.push({
            uid,
            error: 'User already exists'
          });
          continue;
        }

        // Create the user document with uid as document ID and gameuid field
        const userData = {
          gameuid: uid,
          createdAt: new Date().toISOString(),
          ...body // Include any additional fields from the request body (excluding uids)
        };

        // Remove uids from userData to avoid storing it in each user document
        delete userData.uids;

        // Use logged Firestore operation
        await loggedDb.collection('users').doc(uid).set(userData);

        results.push({
          uid,
          success: true,
          data: userData
        });

      } catch (error) {
        console.error(`Error creating user ${uid}:`, error);
        errors.push({
          uid,
          error: 'Failed to create user'
        });
      }
    }

    // Determine response status based on results
    let status = 201;
    if (results.length === 0) {
      status = 400; // No users were created
    } else if (errors.length > 0) {
      status = 207; // Partial success (multi-status)
    }

    return NextResponse.json(
      { 
        message: `Processed ${uids.length} user(s): ${results.length} created, ${errors.length} failed`,
        successful: results,
        failed: errors,
        summary: {
          total: uids.length,
          successful: results.length,
          failed: errors.length
        }
      },
      { status }
    );

  } catch (error) {
    console.error('Error in bulk create operation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function deleteUserHandler(request) {
  try {
    // Get the uids from the request body
    const body = await request.json();
    const { uids } = body;

    // Validate that uids is provided and is an array
    if (!uids || !Array.isArray(uids) || uids.length === 0) {
      return NextResponse.json(
        { error: 'UIDs array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Get authenticated user (role is now fetched from DB, so it's trusted)
    const authenticatedUser = request.user;
    
    // Create logged Firestore instance with user context
    const loggedDb = createLoggedFirestore(authenticatedUser);
    
    const results = [];
    const errors = [];

    // Process each UID
    for (const uid of uids) {
      try {
        // Authorization logic: Users can delete their own account OR admins can delete any account
        const canDelete = authenticatedUser.uid === uid || authenticatedUser.role === 'admin';
        
        if (!canDelete) {
          errors.push({
            uid,
            error: 'Unauthorized: You can only delete your own account or must be an admin'
          });
          continue;
        }

        // Find the user document in the users collection
        // Since users can be stored with uid as document ID or as a field, check both
        let userDocRef = null;
        let userDoc = null;

        // First, try to find by uid field
        const usersRef = adminDb.collection('users');
        const userQuery = await usersRef.where('uid', '==', uid).get();
        
        if (!userQuery.empty) {
          // User found by uid field
          userDocRef = userQuery.docs[0].ref;
          userDoc = userQuery.docs[0];
        } else {
          // Fallback: try to find by document ID
          userDocRef = adminDb.collection('users').doc(uid);
          userDoc = await userDocRef.get();
        }
        
        if (!userDoc.exists) {
          errors.push({
            uid,
            error: 'User not found'
          });
          continue;
        }

        // Delete the document using logged operation
        await loggedDb.collection('users').doc(userDocRef.id).delete();

        const isAdminDelete = authenticatedUser.uid !== uid;
        console.log(`User ${uid} deleted by ${authenticatedUser.email} (${authenticatedUser.uid})${isAdminDelete ? ' [ADMIN DELETE]' : ' [SELF DELETE]'}`);

        results.push({
          uid,
          success: true,
          deletedBy: authenticatedUser.uid,
          deleteType: isAdminDelete ? 'admin' : 'self'
        });

      } catch (error) {
        console.error(`Error deleting user ${uid}:`, error);
        errors.push({
          uid,
          error: 'Failed to delete user'
        });
      }
    }

    // Determine response status based on results
    let status = 200;
    if (results.length === 0) {
      status = 400; // No users were deleted
    } else if (errors.length > 0) {
      status = 207; // Partial success (multi-status)
    }

    return NextResponse.json(
      { 
        message: `Processed ${uids.length} user(s): ${results.length} deleted, ${errors.length} failed`,
        successful: results,
        failed: errors,
        summary: {
          total: uids.length,
          successful: results.length,
          failed: errors.length
        }
      },
      { status }
    );

  } catch (error) {
    console.error('Error in bulk delete operation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updateUserHandler(request) {
  try {
    let uid, nationality, mainTroops, isInfantryGroup, labels, fileToUpload;
    
    // Get authenticated user first
    const authenticatedUser = request.user;
    
    // Check if request is multipart/form-data (file upload)
    const contentType = request.headers.get('content-type');
    const isFileUpload = contentType?.includes('multipart/form-data');
    
    if (isFileUpload) {
      // Handle file upload - use authenticated user's uid
      const formData = await request.formData();
      fileToUpload = formData.get('file');
      uid = authenticatedUser.uid; // Always use authenticated user's uid for file uploads
      
      // Validate file
      if (!fileToUpload || !fileToUpload.name) {
        return NextResponse.json(
          { error: 'No file provided for upload' },
          { status: 400 }
        );
      }
      
      // Validate file type (allow common image formats)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(fileToUpload.type)) {
        return NextResponse.json(
          { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.' },
          { status: 400 }
        );
      }
      
      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (fileToUpload.size > maxSize) {
        return NextResponse.json(
          { error: 'File size too large. Maximum size is 5MB.' },
          { status: 400 }
        );
      }
    } else {
      // Handle regular JSON data
      const body = await request.json();
      ({ uid, nationality, mainTroops, isInfantryGroup, labels } = body);
      
      // Validate required uid field for non-file uploads
      if (!uid) {
        return NextResponse.json(
          { error: 'UID is required in request body' },
          { status: 400 }
        );
      }
    }

    // Validate labels if provided
    if (labels !== undefined && labels !== null && !Array.isArray(labels)) {
      return NextResponse.json(
        { error: 'labels must be an array' },
        { status: 400 }
      );
    }
    
    // Create logged Firestore instance with user context
    const loggedDb = createLoggedFirestore(authenticatedUser);
    
    // Find the user document first to get the actual document structure
    let userDocRef = null;
    let userDoc = null;
    let actualUid = null;

    // First, try to find by uid field
    const usersRef = adminDb.collection('users');
    const userQuery = await usersRef.where('uid', '==', uid).get();
    
    if (!userQuery.empty) {
      // User found by uid field
      userDocRef = userQuery.docs[0].ref;
      userDoc = userQuery.docs[0];
      actualUid = userDoc.data().uid;
    } else {
      // Fallback: try to find by document ID
      userDocRef = adminDb.collection('users').doc(uid);
      userDoc = await userDocRef.get();
      if (userDoc.exists) {
        actualUid = userDoc.id; // Use document ID as the uid
      }
    }
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Authorization logic: 
    // - For file uploads: uid is always the authenticated user's uid (no additional check needed)
    // - For other updates: Users can update their own profile OR admins can update any profile
    const canUpdate = isFileUpload || authenticatedUser.uid === actualUid || authenticatedUser.role === 'admin';
    
    if (!canUpdate) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only update your own profile or must be an admin' },
        { status: 403 }
      );
    }

    // Handle file upload if present
    let avatarUrl;
    if (fileToUpload) {
      try {
        // Generate unique filename
        const fileExtension = fileToUpload.name.split('.').pop() || 'jpg';
        const fileName = `avatar-${uid}-${Date.now()}.${fileExtension}`;
        const storagePath = `avatars/${fileName}`;
        
        // Convert file to buffer
        const fileBuffer = Buffer.from(await fileToUpload.arrayBuffer());
        
        // Get storage bucket
        const bucket = adminStorage.bucket();
        const file = bucket.file(storagePath);
        
        // Upload file to Firebase Storage
        await file.save(fileBuffer, {
          metadata: {
            contentType: fileToUpload.type,
          },
        });
        
        // Make the file publicly accessible
        await file.makePublic();
        
        // Get the public URL
        avatarUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
        
      } catch (uploadError) {
        console.error('Error uploading file:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload file to storage' },
          { status: 500 }
        );
      }
    }

    // Validate mainTroops values if provided
    const validMainTroops = ['infantry', 'archer', 'cavalry', 'mage'];
    if (mainTroops !== undefined && mainTroops !== null && !validMainTroops.includes(mainTroops)) {
      return NextResponse.json(
        { 
          error: `Invalid mainTroops value. Must be one of: ${validMainTroops.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData = {};
    
    if (nationality !== undefined && nationality !== null) {
      updateData.nationality = nationality;
    }
    
    if (mainTroops !== undefined && mainTroops !== null) {
      updateData.mainTroops = mainTroops;
    }
    
    if (isInfantryGroup !== undefined && isInfantryGroup !== null) {
      // No need for string conversion since it comes from JSON body
      if (typeof isInfantryGroup !== 'boolean') {
        return NextResponse.json(
          { error: 'isInfantryGroup must be a boolean value' },
          { status: 400 }
        );
      }
      updateData.isInfantryGroup = isInfantryGroup;
    }

    if (labels !== undefined && labels !== null) {
      updateData.labels = labels;
    }

    // Handle avatar URL update from file upload only
    if (avatarUrl !== undefined && avatarUrl !== null) {
      updateData.avatarUrl = avatarUrl;
    }

    // Check if any valid fields were provided
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided for update. Allowed fields: nationality, mainTroops, isInfantryGroup, labels, or file upload' },
        { status: 400 }
      );
    }

    // Add updatedAt timestamp
    updateData.updatedAt = new Date().toISOString();

    // Update the document using logged operation
    await loggedDb.collection('users').doc(userDocRef.id).update(updateData);

    const isAdminUpdate = authenticatedUser.uid !== actualUid;
    console.log(`User ${uid} updated by ${authenticatedUser.email} (${authenticatedUser.uid})${isAdminUpdate ? ' [ADMIN UPDATE]' : ' [SELF UPDATE]'}`);

    // Get the updated document to return
    const updatedDoc = await userDocRef.get();
    const updatedData = updatedDoc.data();

    return NextResponse.json(
      { 
        message: fileToUpload ? 'Avatar uploaded and user updated successfully' : 'User updated successfully',
        uid,
        updatedFields: Object.keys(updateData).filter(key => key !== 'updatedAt'),
        updatedBy: authenticatedUser.uid,
        updateType: isAdminUpdate ? 'admin' : 'self',
        data: updatedData
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the protected POST handler
export const POST = withAuthAndRole(createUserHandler, 'admin');

// Export the protected DELETE handler
// Using withAuth instead of withAuthAndRole because we have mixed authorization logic
export const DELETE = withAuth(deleteUserHandler);

// Export the protected PUT handler
export const PUT = withAuth(updateUserHandler);

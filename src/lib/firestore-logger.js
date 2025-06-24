import { adminDb } from './firebase-admin';
import { 
  LOGGING_CONFIG, 
  shouldLogOperation, 
  shouldLogCollection, 
  sanitizeDataForLogging 
} from './logging-config';

// Enhanced logging function for Firestore operations
async function logFirestoreOperation(operation, details, user = null) {
  // Check if we should log this operation
  if (!shouldLogOperation(operation)) {
    return null;
  }

  // Check if we should log this collection
  if (details.collection && !shouldLogCollection(details.collection)) {
    return null;
  }

  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    operation,
    collection: details.collection,
    documentId: details.documentId,
    user: user ? {
      uid: user.uid,
      email: user.email,
      role: user.role
    } : null,
    // Sanitize data based on configuration
    data: details.data ? sanitizeDataForLogging(details.data) : undefined,
    updates: details.updates ? sanitizeDataForLogging(details.updates) : undefined,
    previousData: details.previousData ? sanitizeDataForLogging(details.previousData) : undefined,
    deletedData: details.deletedData ? sanitizeDataForLogging(details.deletedData) : undefined,
    // Include other non-sensitive details
    options: details.options,
    operations: details.operations,
    operationCount: details.operationCount,
    error: details.error
  };

  // Console logging
  if (LOGGING_CONFIG.enableConsoleLogging) {
    console.log('🔥 FIRESTORE WRITE:', JSON.stringify(logEntry, null, 2));
  }
  
  // Firestore audit logging (async to not block operations)
  if (LOGGING_CONFIG.enableFirestoreAuditLog) {
    if (LOGGING_CONFIG.logAsyncOperations) {
      // Log asynchronously without blocking
      setImmediate(async () => {
        try {
          await adminDb.collection(LOGGING_CONFIG.auditCollectionName).add(logEntry);
        } catch (error) {
          console.error('Failed to write audit log:', error);
        }
      });
    } else {
      // Log synchronously (will block the operation)
      try {
        await adminDb.collection(LOGGING_CONFIG.auditCollectionName).add(logEntry);
      } catch (error) {
        console.error('Failed to write audit log:', error);
      }
    }
  }
  
  return logEntry;
}

// Wrapper class for logged Firestore operations
export class LoggedFirestore {
  constructor(user = null) {
    this.user = user;
    this.db = adminDb;
  }

  // Set user context for operations
  setUser(user) {
    this.user = user;
    return this;
  }

  // Logged collection reference
  collection(collectionName) {
    return new LoggedCollectionReference(collectionName, this.user);
  }

  // Logged batch operations
  batch() {
    return new LoggedBatch(this.user);
  }
}

class LoggedCollectionReference {
  constructor(collectionName, user = null) {
    this.collectionName = collectionName;
    this.user = user;
    this.ref = adminDb.collection(collectionName);
  }

  // Logged document reference
  doc(docId) {
    return new LoggedDocumentReference(this.collectionName, docId, this.user);
  }

  // Logged add operation
  async add(data) {
    await logFirestoreOperation('ADD_START', {
      collection: this.collectionName,
      data
    }, this.user);

    try {
      const result = await this.ref.add(data);
      
      await logFirestoreOperation('ADD_SUCCESS', {
        collection: this.collectionName,
        documentId: result.id,
        data
      }, this.user);

      return result;
    } catch (error) {
      await logFirestoreOperation('ADD_ERROR', {
        collection: this.collectionName,
        data,
        error: error.message
      }, this.user);
      throw error;
    }
  }

  // Pass through read operations without logging
  where(field, operator, value) {
    return this.ref.where(field, operator, value);
  }

  async get() {
    return this.ref.get();
  }
}

class LoggedDocumentReference {
  constructor(collectionName, docId, user = null) {
    this.collectionName = collectionName;
    this.docId = docId;
    this.user = user;
    this.ref = adminDb.collection(collectionName).doc(docId);
  }

  // Logged set operation
  async set(data, options = {}) {
    await logFirestoreOperation('SET_START', {
      collection: this.collectionName,
      documentId: this.docId,
      data,
      options
    }, this.user);

    try {
      const result = await this.ref.set(data, options);
      
      await logFirestoreOperation('SET_SUCCESS', {
        collection: this.collectionName,
        documentId: this.docId,
        data,
        options
      }, this.user);

      return result;
    } catch (error) {
      await logFirestoreOperation('SET_ERROR', {
        collection: this.collectionName,
        documentId: this.docId,
        data,
        options,
        error: error.message
      }, this.user);
      throw error;
    }
  }

  // Logged update operation
  async update(data) {
    // Get current document for change tracking
    let currentData = null;
    try {
      const currentDoc = await this.ref.get();
      currentData = currentDoc.exists ? currentDoc.data() : null;
    } catch (error) {
      // Continue without current data if we can't fetch it
    }

    await logFirestoreOperation('UPDATE_START', {
      collection: this.collectionName,
      documentId: this.docId,
      updates: data,
      currentData
    }, this.user);

    try {
      const result = await this.ref.update(data);
      
      await logFirestoreOperation('UPDATE_SUCCESS', {
        collection: this.collectionName,
        documentId: this.docId,
        updates: data,
        previousData: currentData
      }, this.user);

      return result;
    } catch (error) {
      await logFirestoreOperation('UPDATE_ERROR', {
        collection: this.collectionName,
        documentId: this.docId,
        updates: data,
        error: error.message
      }, this.user);
      throw error;
    }
  }

  // Logged delete operation
  async delete() {
    // Get current document for audit trail
    let currentData = null;
    try {
      const currentDoc = await this.ref.get();
      currentData = currentDoc.exists ? currentDoc.data() : null;
    } catch (error) {
      // Continue without current data if we can't fetch it
    }

    await logFirestoreOperation('DELETE_START', {
      collection: this.collectionName,
      documentId: this.docId,
      dataBeingDeleted: currentData
    }, this.user);

    try {
      const result = await this.ref.delete();
      
      await logFirestoreOperation('DELETE_SUCCESS', {
        collection: this.collectionName,
        documentId: this.docId,
        deletedData: currentData
      }, this.user);

      return result;
    } catch (error) {
      await logFirestoreOperation('DELETE_ERROR', {
        collection: this.collectionName,
        documentId: this.docId,
        error: error.message
      }, this.user);
      throw error;
    }
  }

  // Pass through read operations without logging
  async get() {
    return this.ref.get();
  }
}

class LoggedBatch {
  constructor(user = null) {
    this.user = user;
    this.batch = adminDb.batch();
    this.operations = [];
  }

  set(ref, data, options = {}) {
    this.operations.push({
      type: 'SET',
      collection: ref.parent.id,
      documentId: ref.id,
      data: sanitizeDataForLogging(data),
      options
    });
    this.batch.set(ref, data, options);
    return this;
  }

  update(ref, data) {
    this.operations.push({
      type: 'UPDATE',
      collection: ref.parent.id,
      documentId: ref.id,
      updates: sanitizeDataForLogging(data)
    });
    this.batch.update(ref, data);
    return this;
  }

  delete(ref) {
    this.operations.push({
      type: 'DELETE',
      collection: ref.parent.id,
      documentId: ref.id
    });
    this.batch.delete(ref);
    return this;
  }

  async commit() {
    await logFirestoreOperation('BATCH_START', {
      operations: this.operations,
      operationCount: this.operations.length
    }, this.user);

    try {
      const result = await this.batch.commit();
      
      await logFirestoreOperation('BATCH_SUCCESS', {
        operations: this.operations,
        operationCount: this.operations.length
      }, this.user);

      return result;
    } catch (error) {
      await logFirestoreOperation('BATCH_ERROR', {
        operations: this.operations,
        operationCount: this.operations.length,
        error: error.message
      }, this.user);
      throw error;
    }
  }
}

// Export convenience function to create logged instance
export function createLoggedFirestore(user = null) {
  return new LoggedFirestore(user);
}

// Export individual wrapper functions for existing code
export async function loggedSet(docRef, data, options = {}, user = null) {
  const loggedDoc = new LoggedDocumentReference(
    docRef.parent.id, 
    docRef.id, 
    user
  );
  return loggedDoc.set(data, options);
}

export async function loggedUpdate(docRef, data, user = null) {
  const loggedDoc = new LoggedDocumentReference(
    docRef.parent.id, 
    docRef.id, 
    user
  );
  return loggedDoc.update(data);
}

export async function loggedDelete(docRef, user = null) {
  const loggedDoc = new LoggedDocumentReference(
    docRef.parent.id, 
    docRef.id, 
    user
  );
  return loggedDoc.delete();
} 
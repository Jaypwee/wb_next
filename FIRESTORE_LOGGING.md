# Firestore Logging Implementation

This document explains how to use the comprehensive Firestore logging system implemented in your Next.js application.

## Overview

The logging system wraps all Firestore write operations (set, update, delete, batch) to provide:
- Comprehensive audit trails
- User context tracking
- Data change monitoring
- Error logging
- Configurable logging levels
- Multiple logging outputs (console, Firestore collection, file)

## Quick Start

### Basic Usage

```javascript
import { createLoggedFirestore } from 'src/lib/firestore-logger';

// Create a logged Firestore instance with user context
const loggedDb = createLoggedFirestore({
  uid: 'user123',
  email: 'user@example.com',
  role: 'admin'
});

// Use it exactly like regular Firestore
await loggedDb.collection('users').doc('user123').set({
  name: 'John Doe',
  email: 'john@example.com'
});

// All operations are automatically logged
await loggedDb.collection('users').doc('user123').update({
  lastLogin: new Date().toISOString()
});

await loggedDb.collection('users').doc('user123').delete();
```

### Batch Operations

```javascript
const loggedDb = createLoggedFirestore(user);
const batch = loggedDb.batch();

// Add operations to batch
batch.set(adminDb.collection('users').doc('user1'), { name: 'User 1' });
batch.update(adminDb.collection('users').doc('user2'), { status: 'active' });
batch.delete(adminDb.collection('users').doc('user3'));

// Commit with logging
await batch.commit();
```

## Configuration

### Basic Configuration

Edit `src/lib/logging-config.js`:

```javascript
export const LOGGING_CONFIG = {
  // Enable/disable console logging
  enableConsoleLogging: true,
  
  // Enable audit log storage in Firestore
  enableFirestoreAuditLog: true,
  
  // Log only specific collections
  collectionsToLog: ['users', 'orders'], // Empty array = log all
  
  // Control which operations to log
  operationsToLog: {
    create: true,
    update: true,
    delete: true,
    batch: true
  }
};
```

### Data Privacy Settings

```javascript
export const LOGGING_CONFIG = {
  // Exclude sensitive data from logs
  excludeDataFromLogs: false,
  
  // Always redact these fields
  excludeSensitiveFields: ['password', 'token', 'creditCard'],
  
  // Disable logging in production
  disableInProduction: false,
};
```

## Log Output Examples

### Console Log Example

```json
{
  "timestamp": "2024-01-20T10:30:00.000Z",
  "operation": "SET_SUCCESS",
  "collection": "users",
  "documentId": "user123",
  "user": {
    "uid": "admin456",
    "email": "admin@example.com",
    "role": "admin"
  },
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-20T10:30:00.000Z"
  }
}
```

### Update Log with Change Tracking

```json
{
  "timestamp": "2024-01-20T10:35:00.000Z",
  "operation": "UPDATE_SUCCESS",
  "collection": "users",
  "documentId": "user123",
  "user": {
    "uid": "user123",
    "email": "john@example.com",
    "role": "user"
  },
  "updates": {
    "lastLogin": "2024-01-20T10:35:00.000Z",
    "loginCount": 5
  },
  "previousData": {
    "name": "John Doe",
    "email": "john@example.com",
    "loginCount": 4,
    "createdAt": "2024-01-20T10:30:00.000Z"
  }
}
```

### Batch Operation Log

```json
{
  "timestamp": "2024-01-20T10:40:00.000Z",
  "operation": "BATCH_SUCCESS",
  "operationCount": 3,
  "operations": [
    {
      "type": "SET",
      "collection": "users",
      "documentId": "user1",
      "data": { "name": "User 1" }
    },
    {
      "type": "UPDATE",
      "collection": "users",
      "documentId": "user2",
      "updates": { "status": "active" }
    },
    {
      "type": "DELETE",
      "collection": "users",
      "documentId": "user3"
    }
  ]
}
```

## API Routes Integration

### Example: User Edit Route

```javascript
import { createLoggedFirestore } from 'src/lib/firestore-logger';

export async function PUT(request) {
  const authenticatedUser = request.user;
  const loggedDb = createLoggedFirestore(authenticatedUser);
  
  // All operations are now logged with user context
  await loggedDb.collection('users').doc(uid).update(updateData);
}
```

## Querying Audit Logs

If you enable Firestore audit logging, you can query the logs:

```javascript
import { adminDb } from 'src/lib/firebase-admin';

// Get all logs for a specific user
const userLogs = await adminDb
  .collection('audit_logs')
  .where('user.uid', '==', 'user123')
  .orderBy('timestamp', 'desc')
  .limit(100)
  .get();

// Get all delete operations
const deleteLogs = await adminDb
  .collection('audit_logs')
  .where('operation', '==', 'DELETE_SUCCESS')
  .orderBy('timestamp', 'desc')
  .get();

// Get logs for a specific collection
const userCollectionLogs = await adminDb
  .collection('audit_logs')
  .where('collection', '==', 'users')
  .orderBy('timestamp', 'desc')
  .get();
```

## Performance Considerations

### Async Logging
By default, audit logs are written asynchronously to avoid blocking operations:

```javascript
export const LOGGING_CONFIG = {
  logAsyncOperations: true, // Don't block operations for logging
  maxLogRetries: 3
};
```

### Collection Filtering
Only log specific collections to reduce noise:

```javascript
export const LOGGING_CONFIG = {
  collectionsToLog: ['users', 'orders'], // Only log these collections
};
```

## Security Best Practices

1. **Redact Sensitive Data**: Always configure `excludeSensitiveFields`
2. **Limit Audit Log Access**: Secure the `audit_logs` collection with proper Firestore rules
3. **Regular Cleanup**: Implement log retention policies
4. **Monitor Log Volume**: Firestore audit logs count against your quotas

## Firestore Security Rules for Audit Logs

Add these rules to protect your audit logs:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Audit logs - only admins can read, system can write
    match /audit_logs/{logId} {
      allow read: if request.auth != null && 
                     exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow write: if false; // Only system can write through admin SDK
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Logs not appearing**: Check `LOGGING_CONFIG.enableConsoleLogging`
2. **Performance issues**: Enable `logAsyncOperations: true`
3. **Missing user context**: Ensure you pass user object to `createLoggedFirestore()`
4. **Sensitive data in logs**: Configure `excludeSensitiveFields`

### Debug Mode

Enable debug logging:

```javascript
export const LOGGING_CONFIG = {
  logLevel: 'debug',
  enableConsoleLogging: true
};
```

## Migration from Direct Firestore Usage

### Before
```javascript
import { adminDb } from 'src/lib/firebase-admin';

await adminDb.collection('users').doc('user123').set(userData);
```

### After
```javascript
import { createLoggedFirestore } from 'src/lib/firestore-logger';

const loggedDb = createLoggedFirestore(request.user);
await loggedDb.collection('users').doc('user123').set(userData);
```

That's it! All your database writes are now logged with full context and audit trails. 
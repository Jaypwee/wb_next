// Logging configuration for Firestore operations
export const LOGGING_CONFIG = {
  // Enable/disable different types of logging
  enableConsoleLogging: true,
  enableFirestoreAuditLog: false, // Set to true to store logs in Firestore
  enableFileLogging: false, // Set to true for file-based logging
  
  // Collections to log (empty array means log all collections)
  collectionsToLog: [], // e.g., ['users', 'sheets'] to only log specific collections
  
  // Operations to log
  operationsToLog: {
    create: true,
    update: true,
    delete: true,
    batch: true
  },
  
  // Audit log collection name (if enableFirestoreAuditLog is true)
  auditCollectionName: 'audit_logs',
  
  // Log level settings
  logLevel: 'info', // 'debug', 'info', 'warn', 'error'
  
  // Data privacy settings
  excludeDataFromLogs: false, // Set to true to exclude actual data from logs
  excludeSensitiveFields: ['password', 'token', 'privateKey'], // Fields to always exclude
  
  // Performance settings
  logAsyncOperations: true, // Whether to log async without blocking operations
  maxLogRetries: 3, // Retries for audit log writes
  
  // Environment-specific settings
  disableInProduction: false, // Set to true to disable all logging in production
};

// Check if logging should be disabled based on environment
export function isLoggingEnabled() {
  if (LOGGING_CONFIG.disableInProduction && process.env.NODE_ENV === 'production') {
    return false;
  }
  return true;
}

// Check if a specific collection should be logged
export function shouldLogCollection(collectionName) {
  if (!isLoggingEnabled()) return false;
  
  // If no specific collections are configured, log all
  if (LOGGING_CONFIG.collectionsToLog.length === 0) return true;
  
  return LOGGING_CONFIG.collectionsToLog.includes(collectionName);
}

// Check if a specific operation should be logged
export function shouldLogOperation(operation) {
  if (!isLoggingEnabled()) return false;
  
  const operationKey = operation.toLowerCase().replace('_start', '').replace('_success', '').replace('_error', '');
  
  switch (operationKey) {
    case 'set':
    case 'add':
      return LOGGING_CONFIG.operationsToLog.create;
    case 'update':
      return LOGGING_CONFIG.operationsToLog.update;
    case 'delete':
      return LOGGING_CONFIG.operationsToLog.delete;
    case 'batch':
      return LOGGING_CONFIG.operationsToLog.batch;
    default:
      return true;
  }
}

// Sanitize data for logging (remove sensitive fields)
export function sanitizeDataForLogging(data) {
  if (!data || typeof data !== 'object') return data;
  
  if (LOGGING_CONFIG.excludeDataFromLogs) {
    return '[DATA_EXCLUDED]';
  }
  
  const sanitized = { ...data };
  
  LOGGING_CONFIG.excludeSensitiveFields.forEach(field => {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
} 
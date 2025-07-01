// ----------------------------------------------------------------------
// Timezone Utilities
// ----------------------------------------------------------------------

/**
 * Get the user's current timezone
 */
export function getUserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Get timezone display name
 */
export function getTimezoneDisplayName(timezone = getUserTimezone()) {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    });
    
    const parts = formatter.formatToParts(now);
    const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value;
    
    return `${timezone.replace('_', ' ')} (${timeZoneName})`;
  } catch (error) {
    return timezone;
  }
}

/**
 * Convert time string to user's local timezone
 */
export function convertTimeToTimezone(dateString, timeString, fromTimezone, toTimezone = getUserTimezone()) {
  try {
    // Create a date object with the original timezone
    const dateTime = new Date(`${dateString}T${timeString}:00`);
    
    // If timezones are the same, return as is
    if (fromTimezone === toTimezone) {
      return timeString;
    }
    
    // Convert using Intl.DateTimeFormat
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: toTimezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return formatter.format(dateTime);
  } catch (error) {
    console.warn('Timezone conversion failed:', error);
    return timeString;
  }
}

/**
 * Create a datetime object with timezone information
 */
export function createTimezoneDateTime(dateString, timeString, timezone = getUserTimezone()) {
  try {
    return new Date(`${dateString}T${timeString}:00`);
  } catch (error) {
    console.warn('Failed to create timezone datetime:', error);
    return new Date();
  }
}

/**
 * Format time for display with timezone
 */
export function formatTimeWithTimezone(dateString, timeString, timezone = getUserTimezone(), showTimezone = false) {
  try {
    const dateTime = createTimezoneDateTime(dateString, timeString, timezone);
    
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    
    const formattedTime = formatter.format(dateTime);
    
    if (showTimezone) {
      const tzFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'short',
      });
      const parts = tzFormatter.formatToParts(dateTime);
      const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value;
      return `${formattedTime} ${timeZoneName}`;
    }
    
    return formattedTime;
  } catch (error) {
    console.warn('Time formatting failed:', error);
    return timeString;
  }
}

/**
 * Get all available timezones (commonly used ones)
 */
export function getCommonTimezones() {
  return [
    'America/New_York',
    'America/Chicago', 
    'America/Denver',
    'America/Los_Angeles',
    'America/Toronto',
    'America/Vancouver',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Rome',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Seoul',
    'Asia/Kolkata',
    'Australia/Sydney',
    'Australia/Melbourne',
    'Pacific/Auckland',
    'UTC'
  ];
} 
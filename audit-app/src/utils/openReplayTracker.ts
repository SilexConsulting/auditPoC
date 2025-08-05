import Tracker from '@openreplay/tracker';

let tracker: Tracker | null = null;

export const initTracker = (userId: string) => {
  tracker = new Tracker({
    projectKey: import.meta.env.VITE_OPENREPLAY_PROJECT_KEY || 'YOUR_PROJECT_KEY',
    __DISABLE_SECURE_MODE: import.meta.env.DEV, // Enable secure mode in production
  });

  // Start the tracker with user identification
  tracker.start();
  tracker.setUserID(userId);

  return tracker;
};

// Function to record correlation IDs from API responses
export const recordCorrelationId = (correlationId: string, metadata: Record<string, any> = {}) => {
  if (tracker) {
    tracker.event('api_request', { 
      correlationId,
      timestamp: Date.now(),
      ...metadata
    });
  }
};

export const getTracker = () => tracker;

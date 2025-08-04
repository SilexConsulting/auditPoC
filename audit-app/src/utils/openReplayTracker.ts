import Tracker from '@openreplay/tracker';

let tracker: Tracker | null = null;

export const initTracker = (userId: string) => {
  tracker = new Tracker({
    projectKey: 'YOUR_PROJECT_KEY', // Replace with your OpenReplay project key
    __DISABLE_SECURE_MODE: true, // For development only
  });
  
  // Start the tracker with user identification
  tracker.start();
  tracker.setUserID(userId);
  
  return tracker;
};

// Function to record correlation IDs from API responses
export const recordCorrelationId = (correlationId: string) => {
  if (tracker) {
    tracker.event('api_request', { correlationId });
  }
};

export const getTracker = () => tracker;
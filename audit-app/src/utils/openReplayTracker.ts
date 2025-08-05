import Tracker from '@openreplay/tracker';
import trackerAssist from '@openreplay/tracker-assist';

let tracker: Tracker | null = null;

export const initTracker = (userId: string) => {
  // If tracker is already initialized, just update the user ID
  if (tracker) {
    tracker.setUserID(userId);
    return tracker;
  }

  // Create a new tracker instance
  tracker = new Tracker({
    projectKey: import.meta.env.VITE_OPENREPLAY_PROJECT_KEY || 'YOUR_PROJECT_KEY',
    __DISABLE_SECURE_MODE: import.meta.env.DEV, // Enable secure mode in production
  });

  // Add Assist plugin
  tracker.use(trackerAssist({
    // Callback when an agent connects to the session
    onAgentConnect: () => {
      console.log("OpenReplay Assist: Agent connected to session");
      return () => console.log("OpenReplay Assist: Agent disconnected from session");
    },
    // Callback when a call starts
    onCallStart: () => {
      console.log("OpenReplay Assist: Call started");
      return () => console.log("OpenReplay Assist: Call ended");
    },
    // Callback when remote control starts
    onRemoteControlStart: () => {
      console.log("OpenReplay Assist: Remote control started");
      return () => console.log("OpenReplay Assist: Remote control ended");
    }
  }));

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

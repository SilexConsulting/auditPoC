import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { getTracker } from '../utils/openReplayTracker';

interface AuditContextType {
  captureAuditEvent: (eventType: string, details: Record<string, any>) => void;
  setAuditReason: (reason: string) => void;
  getAuditContext: () => Record<string, any>;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export const AuditProvider = ({ children }: { children: ReactNode }) => {
  const [auditReason, setAuditReason] = useState<string>('');

  // Capture audit event in OpenReplay
  const captureAuditEvent = (eventType: string, details: Record<string, any>) => {
    const tracker = getTracker();
    if (tracker) {
      tracker.event(`audit_${eventType}`, {
        ...details,
        reason: auditReason || details.reason || 'Not specified',
        timestamp: Date.now()
      });
    }
  };

  // Get current audit context for API calls
  const getAuditContext = () => ({
    reason: auditReason,
    timestamp: new Date().toISOString(),
    user: JSON.parse(sessionStorage.getItem('user') || '{}').username
  });

  const value = {
    captureAuditEvent,
    setAuditReason,
    getAuditContext
  };

  return (
    <AuditContext.Provider value={value}>
      {children}
    </AuditContext.Provider>
  );
};

// Custom hook to use audit context
export const useAudit = () => {
  const context = useContext(AuditContext);
  if (context === undefined) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return context;
};

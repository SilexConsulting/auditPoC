# OpenReplay Audit Implementation Guide

This guide provides detailed implementation steps for setting up OpenReplay with audit logging capabilities in a React application, with a focus on tracking correlation IDs between frontend and backend systems.

## Table of Contents

1. [Installation](#installation)
2. [Basic Setup](#basic-setup)
3. [Correlation ID Tracking](#correlation-id-tracking)
4. [Audit Context Capture](#audit-context-capture)
5. [Backend Integration](#backend-integration)
6. [Reporting and Analysis](#reporting-and-analysis)
7. [Security Considerations](#security-considerations)

## Installation

First, install the OpenReplay tracker package:

```bash
npm install @openreplay/tracker
# Optional plugins for framework-specific integration
npm install @openreplay/tracker-react
```

## Basic Setup

### 1. Initialize the Tracker

Create a utility file to set up the OpenReplay tracker:

```typescript
// src/utils/openReplayTracker.ts
import Tracker from '@openreplay/tracker';
import { trackerFetch } from '@openreplay/tracker/lib/modules/fetch';

let tracker: Tracker | null = null;

export const initTracker = (userId: string) => {
  if (tracker) {
    return tracker;
  }
  
  tracker = new Tracker({
    projectKey: 'YOUR_PROJECT_KEY', // Replace with your OpenReplay project key
    ingestPoint: 'https://openreplay.your-domain.com/ingest', // Optional custom endpoint
    __DISABLE_SECURE_MODE: process.env.NODE_ENV === 'development', // Enable in production
  });
  
  // Add network recording plugin
  tracker.use(trackerFetch({
    // Capture request and response bodies for audit purposes
    capturePayload: true,
    // Sanitize sensitive data
    sanitizer: (data) => {
      // Remove sensitive fields like passwords, tokens, etc.
      if (data && typeof data === 'object') {
        const sanitized = { ...data };
        const sensitiveFields = ['password', 'token', 'ssn', 'creditCard'];
        
        sensitiveFields.forEach(field => {
          if (field in sanitized) {
            sanitized[field] = '***REDACTED***';
          }
        });
        
        return sanitized;
      }
      return data;
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
    tracker.event('api_correlation', { 
      correlationId,
      timestamp: Date.now(),
      ...metadata
    });
  }
};

// Get the tracker instance
export const getTracker = () => tracker;
```

### 2. Integrate with React Application

```typescript
// src/App.tsx
import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { initTracker } from './utils/openReplayTracker';
import Routes from './Routes';
import AuthProvider from './context/AuthContext';

function App() {
  useEffect(() => {
    // Initialize tracker when user logs in
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (user.username) {
      initTracker(user.username);
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes />
      </Router>
    </AuthProvider>
  );
}

export default App;
```

## Correlation ID Tracking

### 1. Create API Service with Correlation ID Support

```typescript
// src/services/api.ts
import { recordCorrelationId } from '../utils/openReplayTracker';

// Base API service
class ApiService {
  private baseUrl: string;
  
  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }
  
  // Generic request method with correlation ID tracking
  async request<T>(
    endpoint: string, 
    method: string = 'GET', 
    data?: any, 
    auditContext?: Record<string, any>
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Include audit context in request if provided
    const requestData = auditContext 
      ? { ...data, _audit: auditContext } 
      : data;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: method !== 'GET' ? JSON.stringify(requestData) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const responseData = await response.json();
    
    // Record correlation ID if present in response
    if (responseData.correlation_id) {
      recordCorrelationId(responseData.correlation_id, {
        endpoint,
        method,
        status: response.status,
        ...auditContext
      });
    }
    
    return responseData;
  }
  
  // Convenience methods
  async get<T>(endpoint: string, auditContext?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, 'GET', undefined, auditContext);
  }
  
  async post<T>(endpoint: string, data: any, auditContext?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, 'POST', data, auditContext);
  }
  
  async put<T>(endpoint: string, data: any, auditContext?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, 'PUT', data, auditContext);
  }
  
  async delete<T>(endpoint: string, auditContext?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, 'DELETE', undefined, auditContext);
  }
}

export default new ApiService();
```

### 2. Using the API Service with Audit Context

```typescript
// src/pages/Search.tsx
import { useState } from 'react';
import api from '../services/api';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchReason, setSearchReason] = useState('');
  const [searchingFor, setSearchingFor] = useState('other');
  const [results, setResults] = useState([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create audit context for this search
    const auditContext = {
      reason: searchReason,
      searchingForSelf: searchingFor === 'self',
      timestamp: new Date().toISOString()
    };
    
    try {
      // API call with audit context
      const data = await api.post('/search', { term: searchTerm }, auditContext);
      setResults(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  // Component JSX...
};

export default Search;
```

## Audit Context Capture

### 1. Create an Audit Context Provider

```typescript
// src/context/AuditContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';
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
```

### 2. Integrate Audit Context in Components

```typescript
// src/pages/RecordView.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAudit } from '../context/AuditContext';
import api from '../services/api';

const RecordView = () => {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<any>(null);
  const { captureAuditEvent, getAuditContext } = useAudit();
  
  useEffect(() => {
    const fetchRecord = async () => {
      try {
        // Get audit context for API call
        const auditContext = getAuditContext();
        
        // API call with audit context
        const data = await api.get(`/records/${id}`, auditContext);
        setRecord(data);
        
        // Capture record view event
        captureAuditEvent('record_view', {
          recordId: id,
          recordType: data.recordType
        });
      } catch (error) {
        console.error('Failed to fetch record:', error);
      }
    };
    
    fetchRecord();
  }, [id, captureAuditEvent, getAuditContext]);
  
  // Component JSX...
};

export default RecordView;
```

## Backend Integration

### 1. Backend API Correlation ID Generation

```javascript
// Example Node.js/Express middleware for correlation IDs
const { v4: uuidv4 } = require('uuid');

const correlationIdMiddleware = (req, res, next) => {
  // Generate a unique correlation ID for this request
  const correlationId = uuidv4();
  
  // Add to request object for use in route handlers
  req.correlationId = correlationId;
  
  // Add to response headers for debugging
  res.setHeader('X-Correlation-ID', correlationId);
  
  next();
};

// Audit logging middleware
const auditLogMiddleware = (req, res, next) => {
  // Capture original end function
  const originalEnd = res.end;
  
  // Override end function to log audit information
  res.end = function(...args) {
    // Extract audit context from request
    const auditContext = req.body?._audit || {};
    
    // Log audit information
    const auditLog = {
      correlationId: req.correlationId,
      timestamp: new Date().toISOString(),
      user: req.user?.username || 'anonymous',
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      reason: auditContext.reason || 'Not specified',
      searchingForSelf: auditContext.searchingForSelf || false,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    };
    
    // Store in audit database
    storeAuditLog(auditLog);
    
    // Call original end function
    return originalEnd.apply(this, args);
  };
  
  next();
};

// Apply middleware to Express app
app.use(correlationIdMiddleware);
app.use(auditLogMiddleware);

// Example route handler
app.post('/api/search', (req, res) => {
  // Process search
  const results = performSearch(req.body.term);
  
  // Return results with correlation ID
  res.json({
    results,
    correlation_id: req.correlationId
  });
});
```

## Reporting and Analysis

### 1. OpenReplay Custom Dashboards

Create custom dashboards in OpenReplay to track audit events:

1. Log in to your OpenReplay instance
2. Navigate to Dashboards > Create New Dashboard
3. Add widgets for:
   - Count of audit events by type
   - List of correlation IDs with timestamps
   - User activity heatmap

### 2. Correlation Service Implementation

```typescript
// Example correlation service (backend)
const getAuditTrail = async (correlationId) => {
  // Get OpenReplay session data
  const sessionEvents = await openReplayClient.getEventsByCorrelationId(correlationId);
  
  // Get backend audit logs
  const auditLogs = await auditDatabase.findByCorrelationId(correlationId);
  
  // Combine and sort by timestamp
  const auditTrail = [
    ...sessionEvents.map(formatOpenReplayEvent),
    ...auditLogs.map(formatAuditLog)
  ].sort((a, b) => a.timestamp - b.timestamp);
  
  return auditTrail;
};
```

## Security Considerations

### 1. Data Sanitization

Ensure sensitive data is not captured in session recordings:

```typescript
// src/utils/openReplayTracker.ts
tracker.start({
  sanitizer: {
    // Mask elements with these attributes
    maskTextSelector: '[data-sensitive], .sensitive-data, input[type="password"]',
    
    // Mask elements with these CSS classes
    maskAllInputs: false,
    
    // Custom sanitizer for text nodes
    maskTextFn: (text, element) => {
      if (element.hasAttribute('data-pii')) {
        return '***';
      }
      return text;
    }
  }
});
```

### 2. Compliance with Regulations

Ensure your implementation complies with relevant regulations:

- Set appropriate data retention periods
- Implement data subject access request handling
- Ensure proper consent mechanisms are in place
- Document all audit logging processes

```typescript
// Example configuration for compliance
const trackerConfig = {
  projectKey: 'YOUR_PROJECT_KEY',
  // Set session recording expiry
  sessionRetentionPeriod: 90, // days
  
  // Disable tracking for users who haven't consented
  respectDoNotTrack: true,
  
  // Disable tracking for specific user groups
  blockClass: 'do-not-track'
};
```

## Conclusion

This implementation guide provides a comprehensive approach to implementing audit logging with OpenReplay in a React application. By following these steps, you can create a robust audit trail that links frontend user actions with backend system logs, providing a complete picture of user activity for compliance and security purposes.

Remember to adapt this implementation to your specific requirements and infrastructure, and always prioritize security and privacy in your audit logging implementation.
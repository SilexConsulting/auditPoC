# OpenReplay Audit Architecture Diagram

## Overview

This document provides an architecture diagram and explanation for implementing audit logging with OpenReplay in a government records management system. The architecture ensures comprehensive tracking of user actions while maintaining the ability to correlate frontend user sessions with backend audit logs.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                           Client Application                                │
│                                                                             │
│  ┌───────────────┐     ┌───────────────┐      ┌───────────────────────┐     │
│  │               │     │               │      │                       │     │
│  │  React UI     │────▶│  OpenReplay   │      │  Application Logic    │     │
│  │  Components   │     │  Tracker      │◀────▶│  (Search, Records)    │     │
│  │               │     │               │      │                       │     │
│  └───────────────┘     └───────┬───────┘      └───────────┬───────────┘     │
│                                │                          │                 │
│                                │                          │                 │
└────────────────────────────────┼──────────────────────────┼─────────────────┘
                                 │                          │
                                 ▼                          ▼
┌────────────────────────────────────────┐      ┌───────────────────────────────┐
│                                        │      │                               │
│  OpenReplay Server                     │      │  Backend API Services         │
│                                        │      │                               │
│  ┌────────────────┐  ┌──────────────┐  │      │  ┌─────────────────────────┐  │
│  │                │  │              │  │      │  │                         │  │
│  │ Session        │  │ Custom Event │  │      │  │ API Endpoints           │  │
│  │ Recording      │◀─┤ Processor    │  │      │  │ (Search, Records, etc.) │  │
│  │                │  │              │  │      │  │                         │  │
│  └────────┬───────┘  └──────┬───────┘  │      │  └─────────────┬───────────┘  │
│           │                 │          │      │                │              │
│           │                 │          │      │                │              │
│  ┌────────▼─────────────────▼───────┐  │      │  ┌─────────────▼───────────┐  │
│  │                                  │  │      │  │                         │  │
│  │ Session & Event Storage          │  │      │  │ Backend Audit Logger    │  │
│  │                                  │  │      │  │                         │  │
│  └──────────────────┬───────────────┘  │      │  └─────────────┬───────────┘  │
│                     │                  │      │                │              │
└─────────────────────┼──────────────────┘      └────────────────┼──────────────┘
                      │                                          │
                      │                                          │
                      ▼                                          ▼
             ┌────────────────────┐                   ┌────────────────────────┐
             │                    │                   │                        │
             │ OpenReplay         │                   │ Backend Audit          │
             │ Database Cluster   │                   │ Database               │
             │ (ClickHouse, etc.) │                   │                        │
             │                    │                   │                        │
             └────────────────────┘                   └────────────────────────┘
                      │                                          │
                      │                                          │
                      └─────────────────┬────────────────────────┘
                                        │
                                        ▼
                              ┌────────────────────┐
                              │                    │
                              │ Audit Correlation  │
                              │ Service            │
                              │                    │
                              └────────────────────┘
                                        │
                                        ▼
                              ┌────────────────────┐
                              │                    │
                              │ Audit Reporting &  │
                              │ Compliance Tools   │
                              │                    │
                              └────────────────────┘
```

## Component Descriptions

### Client Application

1. **React UI Components**
   - User interface elements for login, search, and record viewing
   - Forms for capturing audit justifications (e.g., reason for search)

2. **OpenReplay Tracker**
   - Captures user interactions, page views, and DOM changes
   - Records custom events with correlation IDs
   - Sends session data to OpenReplay server

3. **Application Logic**
   - Handles business logic for search and records management
   - Generates correlation IDs for API requests
   - Ensures audit information is captured before sensitive operations

### OpenReplay Server

1. **Session Recording**
   - Captures full user sessions including UI interactions
   - Records network requests and responses
   - Stores session replay data

2. **Custom Event Processor**
   - Processes custom events sent from the tracker
   - Handles correlation ID events for linking with backend logs
   - Provides event filtering and categorization

3. **Session & Event Storage**
   - Stores session recordings and events
   - Indexes data for efficient retrieval
   - Manages data retention policies

### Backend API Services

1. **API Endpoints**
   - Provides data access and manipulation capabilities
   - Validates user permissions and input
   - Generates correlation IDs for each request

2. **Backend Audit Logger**
   - Records detailed information about API requests
   - Captures user identity, action performed, and justification
   - Stores correlation IDs to link with frontend sessions

### Databases

1. **OpenReplay Database Cluster**
   - Stores session recordings and events
   - Typically uses ClickHouse for efficient storage and querying
   - Handles large volumes of session data

2. **Backend Audit Database**
   - Stores detailed audit logs from backend operations
   - Optimized for compliance and reporting needs
   - Secures sensitive audit information

### Integration Components

1. **Audit Correlation Service**
   - Links frontend session data with backend audit logs
   - Uses correlation IDs to create complete audit trails
   - Provides unified view of user actions across systems

2. **Audit Reporting & Compliance Tools**
   - Generates reports for compliance requirements
   - Provides search and filtering of audit data
   - Supports investigation of security incidents

## Data Flow for Audit Logging

1. User logs into the application
   - OpenReplay tracker is initialized with user ID
   - Session recording begins

2. User performs a sensitive action (e.g., searching for records)
   - User completes justification form
   - Application captures justification data

3. Application makes API request
   - Frontend generates or receives correlation ID
   - OpenReplay tracker records correlation ID as custom event
   - API request includes correlation ID in headers

4. Backend processes request
   - Validates user permissions
   - Logs detailed audit information with correlation ID
   - Returns data with correlation ID in response

5. Audit correlation
   - Correlation service links frontend sessions with backend logs
   - Complete audit trail is available for reporting and compliance

## Implementation Considerations

1. **Security**
   - Ensure sensitive data is properly sanitized in session recordings
   - Implement proper access controls for audit data
   - Use encryption for data in transit and at rest

2. **Performance**
   - Optimize OpenReplay tracker configuration to minimize performance impact
   - Consider sampling strategies for high-volume applications
   - Implement efficient storage and retrieval mechanisms for audit logs

3. **Compliance**
   - Ensure audit data retention meets regulatory requirements
   - Implement data protection measures aligned with relevant regulations
   - Provide mechanisms for data subject access requests

4. **Scalability**
   - Design for horizontal scaling of OpenReplay components
   - Implement efficient indexing for audit data
   - Consider partitioning strategies for large audit datasets

## Conclusion

This architecture provides a comprehensive approach to audit logging using OpenReplay, ensuring that user actions are fully tracked and correlated with backend systems. The integration of correlation IDs between frontend and backend systems creates a complete audit trail that supports compliance requirements and security investigations.
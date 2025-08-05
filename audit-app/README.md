# Audit Proof of Concept

This is a React application that demonstrates OpenReplay functionality for a government records management system. The application includes audit logging capabilities with correlation ID tracking between frontend and backend systems.

## Features

- User authentication with session tracking
- Audit trail for searches with reason documentation
- Correlation ID tracking with OpenReplay
- GDS Design System for government application standards
- Protected routes with React Router 7

## Prerequisites

- Node.js (v16 or later)
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd audit-app
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file based on `.env.example`:

```bash
cp .env.example .env.local
```

4. Update the `.env.local` file with your OpenReplay project key:

```
VITE_OPENREPLAY_PROJECT_KEY=your_actual_project_key
```

## Development

To start the development server:

```bash
npm run dev
```

This will start the application at http://localhost:5173.

## Building for Production

To build the application for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

### Deploying to Vercel

1. Install the Vercel CLI:

```bash
npm install -g vercel
```

2. Deploy to Vercel:

```bash
vercel
```

3. When prompted, set up your environment variables:
   - Name: `VITE_OPENREPLAY_PROJECT_KEY`
   - Value: Your actual OpenReplay project key

Alternatively, you can deploy through the Vercel dashboard by connecting your Git repository.

## Project Structure

- `src/assets/`: Static assets and documentation
- `src/components/`: Reusable UI components
- `src/context/`: React context providers
- `src/hooks/`: Custom React hooks
- `src/pages/`: Application pages
- `src/services/`: API services
- `src/utils/`: Utility functions

## Key Components

### OpenReplay Integration

The application uses OpenReplay for session recording and audit logging. The integration is set up in `src/utils/openReplayTracker.ts`.

### Audit Context

The audit context provider in `src/context/AuditContext.tsx` provides functionality for capturing audit events and managing audit context.

### API Service

The API service in `src/services/api.ts` provides a centralized way to make API calls with correlation ID tracking.

## Security Considerations

- The application uses environment variables to store sensitive information like the OpenReplay project key
- Secure mode is enabled in production to ensure secure communication with the OpenReplay server
- The application includes functionality for sanitizing sensitive data in session recordings

## License

[MIT](LICENSE)

import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { AuditProvider } from './context/AuditContext';
import { initTracker } from './utils/openReplayTracker';
import './App.css';

// Lazy load page components
const Login = lazy(() => import('./pages/Login'));
const Search = lazy(() => import('./pages/Search'));
const RecordView = lazy(() => import('./pages/RecordView'));

// Auth guard component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = sessionStorage.getItem('user');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Loading component for Suspense fallback
const Loading = () => (
  <div className="govuk-width-container">
    <main className="govuk-main-wrapper">
      <h1 className="govuk-heading-xl">Loading...</h1>
    </main>
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<Loading />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: '/search',
    element: (
      <Suspense fallback={<Loading />}>
        <ProtectedRoute>
          <Search />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: '/record/:id',
    element: (
      <Suspense fallback={<Loading />}>
        <ProtectedRoute>
          <RecordView />
        </ProtectedRoute>
      </Suspense>
    ),
  },
]);

function App() {
  useEffect(() => {
    // Initialize tracker when user logs in
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (user.username) {
      // Initialize tracker - it will automatically wait for styles to be loaded
      initTracker(user.username);
    }
  }, []);

  return (
    <AuditProvider>
      <RouterProvider router={router} />
    </AuditProvider>
  );
}

export default App;

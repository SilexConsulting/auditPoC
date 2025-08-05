import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './pages/Login';
import Search from './pages/Search';
import RecordView from './pages/RecordView';
import { AuditProvider } from './context/AuditContext';
import { initTracker } from './utils/openReplayTracker';
import './App.css';

// Auth guard component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = sessionStorage.getItem('user');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/search',
    element: (
      <ProtectedRoute>
        <Search />
      </ProtectedRoute>
    ),
  },
  {
    path: '/record/:id',
    element: (
      <ProtectedRoute>
        <RecordView />
      </ProtectedRoute>
    ),
  },
]);

function App() {
  useEffect(() => {
    // Initialize tracker when user logs in
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (user.username) {
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

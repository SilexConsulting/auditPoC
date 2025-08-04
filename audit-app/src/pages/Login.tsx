import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initTracker } from '../utils/openReplayTracker';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock authentication
    if (username && password) {
      // Initialize OpenReplay tracker with user ID
      initTracker(username);
      
      // Store user info in session storage
      sessionStorage.setItem('user', JSON.stringify({ username }));
      
      // Navigate to search page
      navigate('/search');
    }
  };

  return (
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper">
        <h1 className="govuk-heading-xl">Records System</h1>
        
        <div className="govuk-panel govuk-panel--confirmation">
          <h2 className="govuk-panel__title">Login</h2>
        </div>
        
        <form onSubmit={handleLogin} className="govuk-form-group">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="username">Username</label>
            <input
              className="govuk-input"
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="password">Password</label>
            <input
              className="govuk-input"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="govuk-button">Sign in</button>
        </form>
      </main>
    </div>
  );
};

export default Login;
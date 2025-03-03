// src/App.tsx
import React, { useEffect } from 'react';
import LoginButton from './components/LoginButton.tsx';
import LogoutButton from './components/LogoutButton.tsx';
import UserDetails from './components/UserDetails.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
const ONE_DAY = 24 * 60 * 60 * 1000; // 1 day in milliseconds
const App: React.FC = () => {
  const { user, login, logout, setUser } = useAuth();

  useEffect(() => {
    chrome.storage.local.get('accessToken', result => {
      if (result.accessToken) {
        // If we have a saved token, log in automatically
        const accessToken = result.accessToken;
        login(accessToken);
      }
    });
  }, []);

  const checkAutoLogout = () => {
    chrome.storage.local.get(['loginTimestamp', 'userProfile'], result => {
      const loginTime = result.loginTimestamp;
      const currentTime = Date.now();

      if (!loginTime || currentTime - loginTime > ONE_DAY) {
        handleLogout();
      } else {
        setUser(result.userProfile);
      }
    });
  };

  // Function to handle logout
  const handleLogout = () => {
    chrome.storage.local.remove(
      ['loginTimestamp', 'authToken', 'userProfile'],
      () => {
        setUser(null);
        console.log('User automatically logged out due to inactivity.');
      }
    );
  };

  useEffect(() => {
    checkAutoLogout(); // Check logout on app load
  }, []);

  return (
    <div>
      <h1>Focus Assistant</h1>
      {user ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <UserDetails />
          <LogoutButton onLogout={handleLogout} />
        </div>
      ) : (
        <LoginButton onLogin={checkAutoLogout} />
      )}
    </div>
  );
};

const WrappedApp: React.FC = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default WrappedApp;

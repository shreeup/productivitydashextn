// src/App.tsx
import React, { useEffect } from 'react';
import LoginButton from './components/LoginButton.tsx';
import LogoutButton from './components/LogoutButton.tsx';
import UserDetails from './components/UserDetails.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { TaskProvider } from './context/TaskContext.tsx';
import TaskList from './components/TaskManager/TaskList.tsx';
import { FormContainer } from './components/StyledComponent.tsx';
import { Box, Typography } from '@mui/material';
import Container from '@mui/material/Container';
import PomodoroTimer from './components/Pomodoro/PomodoroTimer.tsx';
import WebsiteBlocker from './components/WebsiteBlocker.tsx';
const ONE_DAY = 1 * 60 * 60 * 1000; // 1 hr in milliseconds
const App: React.FC = () => {
  const { user, login, logout, setUser } = useAuth();

  useEffect(() => {
    async function prepare() {
      await checkAutoLogout(); // Check logout on app load
      await chrome.storage.local.get('accessToken', async result => {
        if (result.accessToken) {
          // If we have a saved token, log in automatically
          const accessToken = result.accessToken;
          await checkAutoLogout();
          login(accessToken);
        }
      });
    }
    prepare();
  }, []);

  const checkAutoLogout = async () => {
    await chrome.storage.local.get(
      ['loginTimestamp', 'userProfile'],
      async result => {
        const loginTime = result.loginTimestamp;
        const currentTime = Date.now();
        if (!loginTime || currentTime - loginTime > ONE_DAY) {
          await logout();
        } else {
          setUser(result.userProfile);
        }
      }
    );
  };

  return (
    <Container
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        minWidth: '640px',
        minHeight: '400px',
      }}
    >
      <Typography>Welcome to Focus Assistant</Typography>
      {user ? (
        <Container>
          <p>Welcome, {user.name}!</p>
          <UserDetails />
          <h2>Task Manager</h2>
          <TaskList />
          <hr />
          <h2>Pomodoro Timer</h2>
          {/* Pomodoro Timer */}

          <PomodoroTimer />
          <hr />
          <h2>Website Blocker</h2>
          {/* Website Blocker */}
          <WebsiteBlocker />
        </Container>
      ) : (
        <LoginButton />
      )}
    </Container>
  );
};

const WrappedApp: React.FC = () => (
  <AuthProvider>
    <TaskProvider>
      <App />
    </TaskProvider>
  </AuthProvider>
);

export default WrappedApp;

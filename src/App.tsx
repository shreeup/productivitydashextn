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
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        minWidth: '500px',
        minHeight: '500px',
      }}
    >
      <Typography>Welcome to Focus Assistant</Typography>
      {user ? (
        <Container>
          <p>Welcome, {user.name}!</p>
          <UserDetails />
          <Container>
            <h3>Task Manager</h3>
            <TaskList />
          </Container>
        </Container>
      ) : (
        <LoginButton />
      )}
    </Box>
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

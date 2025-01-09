import React, { useEffect, useState } from 'react';
import { useTaskContext } from './context/TaskContext';
import TaskManager from './components/TaskManager/TaskManager';
import WebsiteBlocker from './components/WebsiteBlocker';

import { Box, Button, Stack, Typography } from '@mui/material';
import PomodoroTimer from './components/Pomodoro/PomodoroTimer';
import { auth } from './firebaseConfig';
import {
  // signInWithPopup,
  // GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';

import {
  // getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth/web-extension';
import { FormContainer, Input } from './StyledComponents';

const App: React.FC = () => {
  // return (
  //   <TaskProvider>
  //
  //     <WebsiteBlocker />
  //   </TaskProvider>
  // );
  const { dispatch } = useTaskContext();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [useremail, setuseremail] = useState('');
  const [userpassword, setuserpassword] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  // const handleLogin = async () => {
  //   const provider = new GoogleAuthProvider();
  //   try {
  //     const result = await signInWithPopup(auth, provider);
  //     const token = await result.user.getIdToken();
  //     chrome.storage.local.set({ firebaseToken: token });
  //     console.log('Login successful:', result.user.email);
  //   } catch (error) {
  //     console.error('Login failed:', error);
  //   }
  // };

  const handleformLogin = async () => {
    try {
      debugger;
      let userCredential = await signInWithEmailAndPassword(
        auth,
        useremail,
        userpassword
      );
      const token = await userCredential.user.getIdToken();
      chrome.storage.local.set({ firebaseToken: token });
      console.log('Login successful:', userCredential.user.email);
      dispatch({ type: 'SET_TOKEN', payload: token });
    } catch (error: any) {
      console.error('Login failed:', error);
      alert(`Login failed. Signup if you haven't already. ${error.message}`);
      dispatch({ type: 'SET_TOKEN', payload: null });
    }
  };

  const handleformSignUp = async () => {
    try {
      let userCredential = await createUserWithEmailAndPassword(
        auth,
        useremail,
        userpassword
      );
      const token = await userCredential.user.getIdToken();
      chrome.storage.local.set({ firebaseToken: token });
      dispatch({ type: 'SET_TOKEN', payload: token });
      console.log('Signup successful:', userCredential.user.email);
    } catch (error: any) {
      console.error('signup failed:', error);
      alert(
        `Signup failed. Login if you have already signedup ${error.message}`
      );
      dispatch({ type: 'SET_TOKEN', payload: null });
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    chrome.storage.local.remove('firebaseToken');
    setIsAuthenticated(false);
    dispatch({ type: 'SET_TOKEN', payload: null });
    console.log('Logged out');
  };

  if (!isAuthenticated) {
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
        <Typography variant="h5">Welcome to Producitvity Improver</Typography>
        {/* <Button variant="contained" onClick={handleLogin}>
          Login with Google
        </Button> */}
        <FormContainer>
          <Input
            type="text"
            placeholder="Email"
            value={useremail}
            onChange={e => setuseremail(e.target.value)}
            required
            name="useremail"
            id="useremail"
          />
          <br />
          <Input
            type="password"
            placeholder="Password"
            value={userpassword}
            onChange={e => setuserpassword(e.target.value)}
            required
            name="userpassword"
            id="userpassword"
          />

          <Button type="button" onClick={handleformLogin}>
            Login
          </Button>
          <Button type="button" onClick={handleformSignUp}>
            SignUp
          </Button>
        </FormContainer>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 2,
        minWidth: '500px',
      }}
    >
      {/* Stack is a flex container with spacing and alignment */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={4}
        justifyContent="center"
        alignItems="center"
        sx={{ width: '100%' }}
      >
        <Typography variant="h5">Welcome to Producitvity Improver</Typography>

        <Button variant="contained" color="secondary" onClick={handleLogout}>
          Logout
        </Button>

        {/* Task Manager */}
        <Box sx={{ width: { xs: '100%', md: '50%' } }}>
          <TaskManager />
        </Box>

        {/* Pomodoro Timer */}
        <Box sx={{ width: { xs: '100%', md: '50%' } }}>
          <PomodoroTimer />
        </Box>

        {/* Website Blocker */}
        <Box sx={{ width: { xs: '100%', md: '50%' } }}>
          <WebsiteBlocker />
        </Box>
      </Stack>
    </Box>
  );
};

export default App;

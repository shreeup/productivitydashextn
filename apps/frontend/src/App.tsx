import React from 'react';
import { TaskProvider } from './context/TaskContext';
import TaskManager from './components/TaskManager/TaskManager';
import WebsiteBlocker from './components/WebsiteBlocker';

import { Box, Stack } from '@mui/material';
import PomodoroTimer from './components/Pomodoro/PomodoroTimer';

const App: React.FC = () => {
  // return (
  //   <TaskProvider>
  //
  //     <WebsiteBlocker />
  //   </TaskProvider>
  // );
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
        {/* Task Manager */}
        <Box sx={{ width: { xs: '100%', md: '50%' } }}>
          <TaskProvider>
            <TaskManager />
          </TaskProvider>
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

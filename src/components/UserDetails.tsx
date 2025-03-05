// src/components/UserDetails.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Box } from '@mui/material';
import LogoutButton from './LogoutButton.tsx';

const UserDetails: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Box
      id="userinfo"
      sx={{ display: 'flex', width: '100%' }}
      justifyContent={'space-between'}
    >
      <img src={user.picture} alt={user.name} width="50" height="50" />
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <LogoutButton />
    </Box>
  );
};

export default UserDetails;

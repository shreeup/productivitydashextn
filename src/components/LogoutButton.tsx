// src/components/LogoutButton.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';

const LogoutButton: React.FC = () => {
  const { logout } = useAuth();

  return <button onClick={logout}>Logout</button>;
};

export default LogoutButton;

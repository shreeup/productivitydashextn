// src/components/UserDetails.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';

const UserDetails: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div id="userInfo">
      <img src={user.picture} alt={user.name} width="50" height="50" />
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
};

export default UserDetails;

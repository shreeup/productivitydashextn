import React, { createContext, useState, useContext, ReactNode } from 'react';

interface User {
  name: string;
  email: string;
  picture: string;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // Exposed setUser
  login: (accessToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (accessToken: string) => {
    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then(response => response.json())
      .then(data => {
        setUser(data);
        chrome.storage.local.set({
          accessToken,
          userProfile: data,
          loginTimestamp: Date.now(),
        });
      })
      .catch(error => {
        console.error('Error fetching user info:', error);
      });
  };

  const logout = () => {
    setUser(null);
    chrome.storage.local.remove([
      'accessToken',
      'userProfile',
      'loginTimestamp',
    ]);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

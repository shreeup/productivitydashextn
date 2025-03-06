import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';

interface User {
  name: string;
  email: string;
  picture: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (accessToken: string) => void;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Load stored credentials on mount
  useEffect(() => {
    chrome.storage.local.get(['accessToken', 'userProfile'], result => {
      if (result.accessToken && result.userProfile) {
        setAccessToken(result.accessToken);
        setUser(result.userProfile);
      }
    });
  }, []);

  // Function to get the stored token
  const getAccessToken = async (): Promise<string | null> => {
    return new Promise(resolve => {
      if (accessToken) {
        resolve(accessToken);
      } else {
        chrome.storage.local.get('accessToken', result => {
          resolve(result.accessToken || null);
        });
      }
    });
  };

  // Login function
  const login = (accessToken: string) => {
    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(response => {
        return response.json();
      })
      .then(async data => {
        if (data && data.error) {
          logout();
          return;
        }
        setUser(data);
        setAccessToken(accessToken);
        await chrome.storage.local.set({
          accessToken,
          userProfile: data,
          loginTimestamp: Date.now(),
        });
      })
      .catch(async error => {
        console.error('Error fetching user info:', error);
        await logout();
      });
  };

  // Logout function
  const logout = async () => {
    setUser(null);
    setAccessToken(null);
    await chrome.storage.local.remove([
      'accessToken',
      'userProfile',
      'loginTimestamp',
    ]);
    console.log('removed from local');
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, setUser, login, logout, getAccessToken }}
    >
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

// src/components/LoginButton.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';

const LoginButton: React.FC = () => {
  const { login } = useAuth();
  debugger;
  const handleLogin = () => {
    debugger;
    const clientId =
      '113543912380-5rlo3jr2852ajh8fron68r6nqco22igr.apps.googleusercontent.com';
    const redirectUri = chrome.identity.getRedirectURL();
    console.log();
    const scope = 'openid profile email';

    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scope}`;

    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl,
        interactive: true,
      },
      responseUrl => {
        if (chrome.runtime.lastError || !responseUrl) {
          console.error('OAuth authentication failed.');
          return;
        }

        const urlParams = new URLSearchParams(
          new URL(responseUrl).hash.substring(1)
        );
        const accessToken = urlParams.get('access_token');

        if (accessToken) {
          login(accessToken);
        } else {
          console.error('Failed to get access token.');
        }
      }
    );
  };

  return <button onClick={handleLogin}>Login with Google</button>;
};

export default LoginButton;

// src/components/LoginButton.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { GOOGLE_CLIENT_ID } from '../config.ts';

const LoginButton: React.FC = () => {
  const { login } = useAuth();

  const handleLogin = () => {
    const clientId = GOOGLE_CLIENT_ID;
    const redirectUri = chrome.identity.getRedirectURL();
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

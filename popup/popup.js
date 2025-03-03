document.getElementById('loginBtn').addEventListener('click', function () {
  const clientId =
    '113543912380-5rlo3jr2852ajh8fron68r6nqco22igr.apps.googleusercontent.com'; // Replace with your actual Google Client ID
  const redirectUri = chrome.identity.getRedirectURL(); // Chrome handles this automatically
  debugger;
  const scope = 'openid profile email'; // Scopes you need

  const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scope}`;

  // Launch the OAuth flow
  chrome.identity.launchWebAuthFlow(
    {
      url: authUrl,
      interactive: true,
    },
    function (responseUrl) {
      if (chrome.runtime.lastError || !responseUrl) {
        console.error('OAuth authentication failed.');
        return;
      }

      // Parse the response URL to extract the access token
      const urlParams = new URLSearchParams(
        new URL(responseUrl).hash.substring(1)
      );
      const accessToken = urlParams.get('access_token');

      if (accessToken) {
        // Save the token and show user info
        chrome.storage.local.set({ accessToken: accessToken }, function () {
          getUserInfo(accessToken);
        });
      } else {
        console.error('Failed to get access token.');
      }
    }
  );
});

// Fetch user information using the access token
function getUserInfo(accessToken) {
  const userInfoUrl = 'https://www.googleapis.com/oauth2/v3/userinfo';
  fetch(userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then(response => response.json())
    .then(data => {
      document.getElementById('userInfo').style.display = 'block';
      document.getElementById('userName').textContent = data.name;
      document.getElementById('userEmail').textContent = data.email;
      document.getElementById('userImage').src = data.picture;

      // Show the logout button
      document.getElementById('logoutBtn').style.display = 'block';
      document.getElementById('loginBtn').style.display = 'none';
    })
    .catch(error => {
      console.error('Error fetching user info:', error);
    });
}

document.getElementById('logoutBtn').addEventListener('click', function () {
  // Remove the access token
  chrome.storage.local.remove('accessToken', function () {
    // Hide user info and logout button, show login button
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('loginBtn').style.display = 'block';
  });
});

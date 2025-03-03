interface PomodoroTimerState {
  isRunning: boolean;
  isWorkSession: boolean;
  timeLeft: number; // in seconds
  workDuration: number; // in seconds
  breakDuration: number; // in seconds
}

interface BlockedWebsite {
  id: number;
  url: string;
  blockUntil: number;
}

let timerState: PomodoroTimerState = {
  isRunning: false,
  isWorkSession: true,
  timeLeft: 25 * 60,
  workDuration: 25 * 60,
  breakDuration: 5 * 60,
};

// 🔔 Helper: Show Notification
function showNotification(title: string, message: string) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon16.png',
    title,
    message,
  });
}

// 🔥 Handle Firebase Auth
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.type === 'popupOpened') {
    chrome.identity.getAuthToken({ interactive: true }, token => {
      sendResponse({ token: token || null });
    });
    return true;
  }
});

// 🔥 Pomodoro Timer Logic Using `chrome.alarms`
chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'pomodoroTick') {
    if (!timerState.isRunning) return;

    timerState.timeLeft -= 1;
    if (timerState.timeLeft <= 0) {
      timerState.isWorkSession = !timerState.isWorkSession;
      timerState.timeLeft = timerState.isWorkSession
        ? timerState.workDuration
        : timerState.breakDuration;

      const sessionType = timerState.isWorkSession ? 'Work' : 'Break';
      showNotification('Pomodoro Timer', `Time for a ${sessionType} session!`);
    }

    chrome.storage.local.set({ timerState });
  }
});

// ✅ Start, Stop, Reset Timer
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.type === 'START_TIMER') {
    timerState.isRunning = true;
    chrome.storage.local.set({ timerState });
    chrome.alarms.create('pomodoroTick', { periodInMinutes: 1 / 60 });
    sendResponse({ success: true });
  } else if (message.type === 'STOP_TIMER') {
    timerState.isRunning = false;
    chrome.alarms.clear('pomodoroTick');
    chrome.storage.local.set({ timerState });
    sendResponse({ success: true });
  } else if (message.type === 'RESET_TIMER') {
    timerState.isRunning = false;
    timerState.timeLeft = timerState.isWorkSession
      ? timerState.workDuration
      : timerState.breakDuration;
    chrome.storage.local.set({ timerState });
    sendResponse({ success: true });
  }
});

// 🚫 Website Blocker
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.type === 'BLOCK_WEBSITE') {
    chrome.storage.sync.get('blockedWebsites', data => {
      const blockedWebsites: BlockedWebsite[] = data.blockedWebsites || [];
      blockedWebsites.push({
        id: Date.now(),
        url: message.url,
        blockUntil: message.blockUntil,
      });

      chrome.storage.sync.set({ blockedWebsites }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }
});

function loginWithGoogle() {
  const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=113543912380-5rlo3jr2852ajh8fron68r6nqco22igr.apps.googleusercontent.com&response_type=token&redirect_uri=https://localhost/oauth2callback.html&scope=openid%20email%20profile`;

  chrome.identity.launchWebAuthFlow(
    {
      url: authUrl,
      interactive: true,
    },
    redirectUrl => {
      if (chrome.runtime.lastError) {
        console.error('Authentication failed:', chrome.runtime.lastError);
        return;
      }

      const token = new URL(redirectUrl || '/').hash
        .split('&')[0]
        .split('=')[1];
      console.log('Access Token:', token);

      // Store token in chrome.storage for later use
      chrome.storage.local.set({ authToken: token });

      // Fetch user info
      fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(userInfo => {
          console.log('User Info:', userInfo);
          chrome.storage.local.set({ user: userInfo });
        })
        .catch(err => console.error('Error fetching user info:', err));
    }
  );
}

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.type === 'LOGIN') {
    loginWithGoogle();
    sendResponse({ success: true });
  }
});

interface BlockedWebsite {
  id: number;
  url: string;
  blockUntil: number;
}

interface PomodoroTimerState {
  isRunning: boolean;
  isWorkSession: boolean;
  timeLeft: number; // in seconds
  workDuration: number; // in seconds
  breakDuration: number; // in seconds
}

let timerState: PomodoroTimerState = {
  isRunning: false,
  isWorkSession: true,
  timeLeft: 25 * 60, // Default 25 minutes for work session
  workDuration: 25 * 60,
  breakDuration: 5 * 60,
};

// Helper function to show notifications
function showNotification(title: string, message: string) {
  chrome.notifications.create(
    {
      type: 'basic',
      iconUrl: 'icons/icon16.png',
      title: title,
      message: message,
    },
    notificationId => {
      if (chrome.runtime.lastError) {
        console.error('Notification Error:', chrome.runtime.lastError);
      } else {
        console.log('Notification shown with ID:', notificationId);
      }
    }
  );
}
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.type === 'popupOpened') {
    chrome.storage.local.get(['firebaseToken'], result => {
      if (result.firebaseToken) {
        sendResponse({ token: result.firebaseToken });
      } else {
        sendResponse({ token: null });
      }
    });
    return true; // Keep the message channel open for async response
  }
});
// Website Blocker Logic
chrome.runtime.onInstalled.addListener(() => {
  showNotification('Website Blocker', 'Extension successfully installed!');
  chrome.storage.sync.get('blockedWebsites', result => {
    const blockedWebsites: BlockedWebsite[] = result.blockedWebsites || [];
    updateBlockingRules(blockedWebsites);
  });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.blockedWebsites) {
    const blockedWebsites: BlockedWebsite[] = changes.blockedWebsites.newValue;
    updateBlockingRules(blockedWebsites);
  }
});

function updateBlockingRules(blockedWebsites: BlockedWebsite[]): void {
  const currentTime = Date.now();

  const validRules = blockedWebsites
    .filter(website => !website.blockUntil || website.blockUntil > currentTime)
    .map((website, index) => {
      const normalizedUrl = website.url.replace(/^(https?:\/\/)/, '');
      return {
        id: index + 1,
        action: { type: 'block' } as chrome.declarativeNetRequest.RuleAction,
        condition: {
          urlFilter: `*://${normalizedUrl}/*`,
          resourceTypes: ['main_frame', 'sub_frame'],
        },
      };
    });

  chrome.declarativeNetRequest.getDynamicRules(existingRules => {
    const existingRuleIds = existingRules.map(rule => rule.id);
    chrome.declarativeNetRequest.updateDynamicRules(
      {
        removeRuleIds: existingRuleIds,
        addRules: validRules as chrome.declarativeNetRequest.Rule[],
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error('Error updating rules:', chrome.runtime.lastError);
        } else {
          console.log('Dynamic rules updated successfully.');
        }
      }
    );
  });
}

chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(info => {
  if (info.rule.ruleId) {
    notifyBlockedAccess(info.request.url);
  }
});

function notifyBlockedAccess(url: string): void {
  showNotification('Website Blocked', `Access to ${url} is blocked.`);
}

// Pomodoro Timer Logic
function startPomodoroTimer() {
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

  // Schedule the next tick
  if (timerState.isRunning) {
    setTimeout(startPomodoroTimer, 1000); // 1-second interval
  }
}

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.type === 'START_TIMER') {
    timerState.isRunning = true;
    chrome.storage.local.set({ timerState });
    startPomodoroTimer();
    sendResponse({ success: true });
  } else if (message.type === 'STOP_TIMER') {
    timerState.isRunning = false;
    chrome.storage.local.set({ timerState });
    sendResponse({ success: true });
  } else if (message.type === 'RESET_TIMER') {
    timerState.isRunning = false;
    timerState.timeLeft = timerState.isWorkSession
      ? timerState.workDuration
      : timerState.breakDuration;
    chrome.storage.local.set({ timerState });
    sendResponse({ success: true });
  } else if (message.type === 'UPDATE_SETTINGS') {
    timerState.workDuration = message.workDuration;
    timerState.breakDuration = message.breakDuration;
    timerState.timeLeft = timerState.isWorkSession
      ? timerState.workDuration
      : timerState.breakDuration;
    chrome.storage.local.set({ timerState });
    sendResponse({ success: true });
  }
});

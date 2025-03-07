interface BlockedWebsite {
  id: number;
  url: string;
  blockUntil: number; // timestamp when the website will be unblocked
}
// Helper function to show notifications
function showNotification(title: string, message: string): void {
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

// Background Script (background.ts)
chrome.runtime.onInstalled.addListener(() => {
  showNotification('Focus Assistant', 'Extension successfully installed!');

  updateTimerState(); // Ensure state is set on extension installation
  // Initialize or update blocked websites during installation
  chrome.storage.sync.get('blockedWebsites', result => {
    const blockedWebsites: BlockedWebsite[] = result.blockedWebsites || [];
    updateBlockedWebsites(blockedWebsites); // This will also update blocking rules
  });
  // Periodically clean up expired websites
  setInterval(cleanupExpiredWebsites, 60 * 1000); // Check every minute
});

function updateBlockedWebsites(blockedWebsites: BlockedWebsite[]): void {
  const currentTime = Date.now();
  // Remove expired blocked websites and update storage
  const updatedBlockedWebsites = blockedWebsites.filter(
    website => !website.blockUntil || website.blockUntil > currentTime
  );
  chrome.storage.sync.set({ blockedWebsites: updatedBlockedWebsites }, () => {
    updateBlockingRules(updatedBlockedWebsites); // Update blocking rules accordingly
  });
}

function cleanupExpiredWebsites(): void {
  // Check and cleanup expired websites every minute
  chrome.storage.sync.get('blockedWebsites', result => {
    const blockedWebsites: BlockedWebsite[] = result.blockedWebsites || [];
    updateBlockedWebsites(blockedWebsites);
  });
}

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
      // Extract domain name to apply wildcard blocking
      let domain = website.url.replace(/^https?:\/\//, '').split('/')[0]; // Extract base domain
      if (!domain.startsWith('*')) {
        domain = `*.${domain}`; // Ensure all subdomains are blocked
      }

      return {
        id: index + 1,
        action: { type: 'block' } as chrome.declarativeNetRequest.RuleAction,
        condition: {
          urlFilter: `*://${domain}/*`, // Block all subdomains with HTTP & HTTPS
          resourceTypes: ['main_frame'],
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
          console.log('Blocking rules updated successfully.');
        }
      }
    );
  });
}

function notifyBlockedAccess(url: string): void {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon16.png',
    title: 'Website Blocked',
    message: `Access to ${url} is blocked.`,
  });
}

// Pomodoro Timer Logic

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
  timeLeft: 25 * 60, // Default work duration in seconds
  workDuration: 25 * 60,
  breakDuration: 5 * 60,
};

const updateTimerState = (): void => {
  chrome.storage.local.set({ timerState });
};

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

// Timer State interface
interface TimerState {
  isRunning: boolean;
  isWorkSession: boolean;
  timeLeft: number;
  workDuration: number;
  breakDuration: number;
}
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
  showNotification('Website Blocker', 'Extension successfully installed!');

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

function notifyBlockedAccess(url: string): void {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon16.png',
    title: 'Website Blocked',
    message: `Access to ${url} is blocked.`,
  });
}

// Pomodoro Timer Logic
let timerState: TimerState = {
  isRunning: false,
  isWorkSession: true,
  timeLeft: 25 * 60, // Default work duration in seconds
  workDuration: 25 * 60,
  breakDuration: 5 * 60,
};

const updateTimerState = (): void => {
  chrome.storage.local.set({ timerState });
};

const startTimer = (): void => {
  timerState.isRunning = true;
  updateTimerState();
  runTimer();
};

const stopTimer = (): void => {
  timerState.isRunning = false;
  updateTimerState();
};

const resetTimer = (): void => {
  timerState.timeLeft = timerState.isWorkSession
    ? timerState.workDuration
    : timerState.breakDuration;
  timerState.isRunning = false;
  updateTimerState();
};

const runTimer = (): void => {
  if (!timerState.isRunning) return;

  // Decrease time by 1 second
  timerState.timeLeft -= 1;

  // If the timer runs out, switch to the next session
  if (timerState.timeLeft <= 0) {
    timerState.isWorkSession = !timerState.isWorkSession;
    timerState.timeLeft = timerState.isWorkSession
      ? timerState.workDuration
      : timerState.breakDuration;

    const sessionType = timerState.isWorkSession ? 'Work' : 'Break';
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon16.png',
      title: `${sessionType} Session`,
      message: `Time for a ${sessionType} session!`,
    });
  }

  updateTimerState();

  if (timerState.isRunning) {
    setTimeout(runTimer, 1000); // Run every second
  }
};

chrome.runtime.onMessage.addListener(message => {
  if (message.type === 'START_TIMER') {
    // Update the durations from the message
    timerState.workDuration = message.workDuration;
    timerState.breakDuration = message.breakDuration;
    timerState.timeLeft = timerState.isWorkSession
      ? timerState.workDuration
      : timerState.breakDuration;
    startTimer();
  } else if (message.type === 'STOP_TIMER') {
    stopTimer();
  } else if (message.type === 'RESET_TIMER') {
    resetTimer();
  }
});

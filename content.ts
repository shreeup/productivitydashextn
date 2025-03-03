let startTime = Date.now();
let currentUrl = window.location.hostname;

function trackTimeSpent() {
  let endTime = Date.now();
  let timeSpent = Math.round((endTime - startTime) / 1000); // in seconds

  chrome.storage.local.get(['timeLogs'], data => {
    let timeLogs = data.timeLogs || {};
    timeLogs[currentUrl] = (timeLogs[currentUrl] || 0) + timeSpent;

    chrome.storage.local.set({ timeLogs }, () => {
      console.log(`Tracked ${timeSpent} seconds on ${currentUrl}`);
    });
  });

  startTime = Date.now();
}

// Save time log when user navigates away
window.addEventListener('beforeunload', trackTimeSpent);

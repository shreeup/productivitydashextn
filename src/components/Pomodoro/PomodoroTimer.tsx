import React, { useState, useEffect, useRef } from 'react';

interface TimerState {
  isRunning: boolean;
  isWorkSession: boolean;
  timeLeft: number; // in seconds
  workDuration: number; // in seconds
  breakDuration: number; // in seconds
}

const PomodoroTimer = () => {
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    isWorkSession: true,
    timeLeft: 25 * 60,
    workDuration: 25 * 60,
    breakDuration: 5 * 60,
  });

  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [workDuration, setWorkDuration] = useState(25); // in minutes
  const [breakDuration, setBreakDuration] = useState(5); // in minutes

  // Format timeLeft into mm:ss format
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // Fetch the timer state from chrome.storage.local
  const fetchTimerState = () => {
    chrome.storage.local.get('timerState', result => {
      if (result.timerState) {
        setTimerState(result.timerState);
      }
    });
  };

  // Start the Pomodoro Timer
  const startTimer = () => {
    chrome.runtime.sendMessage(
      {
        type: 'START_TIMER',
      },
      response => {
        if (response.success) {
          fetchTimerState();
        }
      }
    );
  };

  // Stop the Pomodoro Timer
  const stopTimer = () => {
    chrome.runtime.sendMessage({ type: 'STOP_TIMER' }, response => {
      if (response.success) {
        fetchTimerState();
      }
    });
  };

  // Reset the Pomodoro Timer
  const resetTimer = () => {
    chrome.runtime.sendMessage({ type: 'RESET_TIMER' }, response => {
      if (response.success) {
        fetchTimerState();
      }
    });
  };

  // Update Pomodoro Timer settings
  const updateSettings = () => {
    const updatedWorkDuration = workDuration * 60; // Convert minutes to seconds
    const updatedBreakDuration = breakDuration * 60; // Convert minutes to seconds

    chrome.runtime.sendMessage(
      {
        type: 'UPDATE_SETTINGS',
        workDuration: updatedWorkDuration,
        breakDuration: updatedBreakDuration,
      },
      response => {
        if (response.success) {
          fetchTimerState();
          setIsSettingsVisible(false);
        }
      }
    );
  };

  // Sync the timer state when the component mounts
  useEffect(() => {
    fetchTimerState();

    // Listen for changes in the timer state in chrome.storage
    const interval = setInterval(fetchTimerState, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div className="pomodoro-timer">
      <h3> {timerState.isWorkSession ? 'Work Session' : 'Break Session'}</h3>
      <h1>{formatTime(timerState.timeLeft)}</h1>
      <button onClick={startTimer} disabled={timerState.isRunning}>
        Start
      </button>
      <button onClick={stopTimer} disabled={!timerState.isRunning}>
        Stop
      </button>
      <button onClick={resetTimer}>Reset</button>
      <button onClick={() => setIsSettingsVisible(true)}>Settings</button>

      {isSettingsVisible && (
        <div className="settings-modal">
          {' '}
          <h3>Settings</h3>
          <div
            className="modal-content"
            style={{ display: 'grid', gridTemplateColumns: 'auto auto ' }}
          >
            <div>
              Work Duration (min):
              <input
                type="number"
                value={workDuration}
                onChange={e => setWorkDuration(Number(e.target.value))}
                min="1"
              />
            </div>
            <div>
              Break Duration (min):
              <input
                type="number"
                value={breakDuration}
                onChange={e => setBreakDuration(Number(e.target.value))}
                min="1"
              />
            </div>
            <div>&nbsp;</div> <div>&nbsp;</div>
            <div>
              <button
                onClick={() => {
                  updateSettings();
                  setIsSettingsVisible(false);
                }}
              >
                Save
              </button>

              <button onClick={() => setIsSettingsVisible(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PomodoroTimer;

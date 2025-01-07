import React, { useEffect, useState } from 'react';

interface TimerState {
  isRunning: boolean;
  isWorkSession: boolean;
  timeLeft: number; // in seconds
  workDuration: number; // in seconds
  breakDuration: number; // in seconds
}

const PomodoroTimer: React.FC = () => {
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
    chrome.runtime.sendMessage({ type: 'START_TIMER' }, response => {
      if (response.success) {
        fetchTimerState();
      }
    });
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
    <div style={styles.container}>
      <h3>Pomodoro Timer</h3>
      <div style={styles.timerDisplay}>
        <p style={styles.sessionType}>
          {timerState.isWorkSession ? 'Work Session' : 'Break Session'}
        </p>
        <p style={styles.time}>{formatTime(timerState.timeLeft)}</p>
      </div>
      <div style={styles.controls}>
        {timerState.isRunning ? (
          <button style={styles.button} onClick={stopTimer}>
            Stop
          </button>
        ) : (
          <button style={styles.button} onClick={startTimer}>
            Start
          </button>
        )}
        <button style={styles.button} onClick={resetTimer}>
          Reset
        </button>
        <button
          style={styles.button}
          onClick={() => setIsSettingsVisible(!isSettingsVisible)}
        >
          Settings
        </button>
      </div>

      {isSettingsVisible && (
        <div style={styles.settings}>
          <h3>Settings</h3>
          <label style={styles.label}>
            Work Duration (min):
            <input
              type="number"
              value={workDuration}
              onChange={e => setWorkDuration(Number(e.target.value))}
              style={styles.input}
            />
          </label>
          <label style={styles.label}>
            Break Duration (min):
            <input
              type="number"
              value={breakDuration}
              onChange={e => setBreakDuration(Number(e.target.value))}
              style={styles.input}
            />
          </label>
          <button style={styles.button} onClick={updateSettings}>
            Save
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
  },
  timerDisplay: {
    margin: '10px 0',
  },
  sessionType: {
    fontSize: '18px',
    color: '#555',
  },
  time: {
    fontSize: '48px',
    fontWeight: 'bold' as const,
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '20px',
  },
  button: {
    padding: '10px',
    fontSize: '1em',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
  },
  settings: {
    marginTop: '20px',
    textAlign: 'left' as const,
  },
  label: {
    display: 'block',
    marginBottom: '10px',
  },
  input: {
    padding: '5px',
  },
};

export default PomodoroTimer;

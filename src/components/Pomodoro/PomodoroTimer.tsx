import React, { useState, useEffect, useRef } from 'react';

const PomodoroTimer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Default 25 minutes
  const [workDuration, setWorkDuration] = useState(25 * 60);
  const [breakDuration, setBreakDuration] = useState(5 * 60);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempWorkDuration, setTempWorkDuration] = useState(workDuration / 60);
  const [tempBreakDuration, setTempBreakDuration] = useState(
    breakDuration / 60
  );

  // Create refs for the latest values of workDuration and breakDuration
  const workDurationRef = useRef(workDuration);
  const breakDurationRef = useRef(breakDuration);

  // Update the refs whenever workDuration or breakDuration change
  useEffect(() => {
    workDurationRef.current = workDuration;
    breakDurationRef.current = breakDuration;
  }, [workDuration, breakDuration]);

  // Get the latest state of the timer when the component mounts
  useEffect(() => {
    chrome.storage.local.get(['timerState'], result => {
      if (result.timerState) {
        setIsRunning(result.timerState.isRunning);
        setIsWorkSession(result.timerState.isWorkSession);
        setTimeLeft(result.timerState.timeLeft);
      }
    });

    chrome.storage.onChanged.addListener(changes => {
      if (changes.timerState) {
        setIsRunning(changes.timerState.newValue.isRunning);
        setIsWorkSession(changes.timerState.newValue.isWorkSession);
        setTimeLeft(changes.timerState.newValue.timeLeft);
      }
    });

    return () => {
      chrome.storage.onChanged.removeListener(() => {});
    };
  }, []);

  const startTimer = () => {
    setIsRunning(true);
    chrome.runtime.sendMessage({
      type: 'START_TIMER',
      workDuration: workDurationRef.current,
      breakDuration: breakDurationRef.current,
    });
  };

  const stopTimer = () => {
    setIsRunning(false);
    chrome.runtime.sendMessage({ type: 'STOP_TIMER' });
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(isWorkSession ? workDuration : breakDuration);
    chrome.runtime.sendMessage({
      type: 'RESET_TIMER',
      workDuration,
      breakDuration,
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="pomodoro-timer">
      <h2>{isWorkSession ? 'Work Session' : 'Break Session'}</h2>
      <h1>{formatTime(timeLeft)}</h1>
      <button onClick={startTimer} disabled={isRunning}>
        Start
      </button>
      <button onClick={stopTimer} disabled={!isRunning}>
        Stop
      </button>
      <button onClick={resetTimer}>Reset</button>
      <button onClick={() => setIsSettingsOpen(true)}>Settings</button>

      {isSettingsOpen && (
        <div className="settings-modal">
          <div className="modal-content">
            <h3>Settings</h3>
            <label>
              Work Duration (minutes):
              <input
                type="number"
                value={tempWorkDuration}
                onChange={e => setTempWorkDuration(Number(e.target.value))}
                min="1"
              />
            </label>
            <br />
            <label>
              Break Duration (minutes):
              <input
                type="number"
                value={tempBreakDuration}
                onChange={e => setTempBreakDuration(Number(e.target.value))}
                min="1"
              />
            </label>
            <br />
            <button
              onClick={() => {
                setWorkDuration(tempWorkDuration * 60);
                setBreakDuration(tempBreakDuration * 60);
                setIsSettingsOpen(false);
              }}
            >
              Save
            </button>
            <button onClick={() => setIsSettingsOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PomodoroTimer;

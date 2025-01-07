import React from 'react';
// import TaskForm from './TaskForm';
import TaskList from './TaskList';

const TaskManager: React.FC = () => {
  return (
    <div>
      <h3>Task Manager</h3>
      <TaskList />
    </div>
  );
};

export default TaskManager;

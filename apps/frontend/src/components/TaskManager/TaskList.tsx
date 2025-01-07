import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import axios from 'axios';
import TaskForm from './TaskForm'; // Import TaskForm component
import { Task } from '../../types/Task';

const apiUrl = import.meta.env.VITE_API_URL;

const TaskList: React.FC = () => {
  const { state, dispatch } = useTaskContext();
  const [taskToEdit, setTaskToEdit] = useState<null | Task>(null);
  const [taskToAdd, setTaskToAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(state.tasks);

  // Delete task
  const deleteTask = async (id: string) => {
    try {
      await axios.delete(`${apiUrl}/tasks/${id}`);
      dispatch({ type: 'DELETE_TASK', payload: id });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Handle editing a task
  const handleEdit = (task: Task) => {
    setTaskToEdit(task);
  };

  const handleAdd = () => {
    setTaskToAdd(true);
  };

  // Filter tasks based on the search query
  useEffect(() => {
    const filtered = state.tasks.filter(
      task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTasks(filtered);
  }, [searchQuery, state.tasks]);

  // Handle search query change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div>
      {/* Search input */}
      <input
        type="text"
        placeholder="Search tasks..."
        value={searchQuery}
        onChange={handleSearchChange}
        style={{
          padding: '10px',
          fontSize: '16px',
          borderRadius: '5px',
          border: '1px solid #ccc',
          marginBottom: '20px',
        }}
      />

      {/* If there's a task to edit, show the form with that task */}
      {taskToEdit && (
        <TaskForm
          taskToEdit={taskToEdit}
          onClose={() => {
            setTaskToEdit(null);
          }}
        />
      )}

      {/* If there's a task to edit, show the form with that task */}
      {taskToAdd && (
        <TaskForm
          onClose={() => {
            setTaskToAdd(false);
          }}
        />
      )}

      {/* Loading and error states */}
      {state.loading && <p>Loading tasks...</p>}
      {state.error && <p>{state.error}</p>}

      {/* Display filtered tasks */}
      <ul>
        <button onClick={() => handleAdd()} title="Add">
          &#10010;
        </button>
        <br />
        {filteredTasks.map(task => (
          <li key={task.id}>
            <strong>{task.title}</strong> - {task.description}
            <button onClick={() => deleteTask(task.id)} title="Delete">
              &#9986;
            </button>
            <button onClick={() => handleEdit(task)} title="Edit">
              &#9998;
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;

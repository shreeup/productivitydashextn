import React, {
  createContext,
  useReducer,
  useContext,
  useEffect,
  ReactNode,
} from 'react';
import axios from 'axios';
import { Task } from '../types/Task';

const apiUrl = import.meta.env.VITE_API_URL;

interface TaskProviderProps {
  children: ReactNode;
}

type TaskState = {
  tasks: Task[];
  loading: boolean;
  error: string | null;
};

type TaskAction =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
};

const TaskContext = createContext<{
  state: TaskState;
  dispatch: React.Dispatch<TaskAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

// Task reducer to handle the actions
const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, loading: false, error: null };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };
    case 'UPDATE_TASK': {
      debugger;
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? transformBackendTask(action.payload)
            : task
        ),
      };
    }
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

const transformBackendTask = (backendTask: any): Task => {
  return {
    id: backendTask.id, // You can implement a function to generate a unique ID
    title: backendTask.title,
    description: backendTask.description,
    category: backendTask.category,
    duedate: backendTask.due_date,
    priority: backendTask.priority as 'low' | 'medium' | 'high',
  };
};

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Fetch tasks from the API on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        // Debugging log to ensure the URL is correct
        console.log('Fetching tasks from URL:', `${apiUrl}/tasks`);

        const response = await axios.get(`${apiUrl}/tasks`);

        // If the response is successful, dispatch the tasks to the state
        dispatch({ type: 'SET_TASKS', payload: response.data });
      } catch (error) {
        // Handle error fetching tasks
        console.error('Error fetching tasks:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch tasks' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    fetchTasks();
  }, []); // Empty dependency array ensures this runs once when component mounts

  return (
    <TaskContext.Provider value={{ state, dispatch }}>
      {children}
    </TaskContext.Provider>
  );
};

// Custom hook to use TaskContext
export const useTaskContext = () => useContext(TaskContext);

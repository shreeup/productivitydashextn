import React, {
  createContext,
  useReducer,
  useContext,
  useEffect,
  ReactNode,
} from 'react';
import axios from 'axios';
import { Task } from '../types/Task';
import { API_URL } from '../config.ts';
import { useAuth } from '../context/AuthContext.tsx'; // Import AuthContext

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
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const { getAccessToken, accessToken } = useAuth();
  // Fetch tasks when token is available

  useEffect(() => {
    const fetchTasks = async () => {
      const token = await getAccessToken();
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      debugger;
      console.log('token recieved from authtcontext' + token);
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        const response = await axios.get(`${API_URL}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        debugger;
        dispatch({ type: 'SET_TASKS', payload: response.data });
      } catch (error) {
        console.error('Error fetching tasks:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch tasks' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    if (accessToken) fetchTasks();
    console.log(accessToken + ' accto');
  }, [accessToken]); // Re-run when token changes

  return (
    <TaskContext.Provider value={{ state, dispatch }}>
      {children}
    </TaskContext.Provider>
  );
};

// Custom hook to use TaskContext
export const useTaskContext = () => useContext(TaskContext);

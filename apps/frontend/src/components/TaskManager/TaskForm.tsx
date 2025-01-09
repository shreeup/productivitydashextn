import React, { useState, useEffect } from 'react';

import { useTaskContext } from '../../context/TaskContext';
import axios from 'axios';
import { Task } from '../../types/Task';

const apiUrl = import.meta.env.VITE_API_URL;
import {
  Input,
  Form,
  Select,
  FormContainer,
  TextArea,
  Button,
} from '../../StyledComponents';

const TaskForm: React.FC<{ taskToEdit?: Task; onClose: () => void }> = ({
  taskToEdit,
  onClose,
}) => {
  const { dispatch } = useTaskContext();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [error, setError] = useState('');

  // Populate form if taskToEdit is passed (editing mode)
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setCategory(taskToEdit.category);
      setDueDate(new Date(taskToEdit.duedate).toISOString().slice(0, 10));
      setPriority(taskToEdit.priority);
    }
  }, [taskToEdit]);

  const validateForm = (): boolean => {
    if (!title.trim() || !description.trim() || !dueDate) {
      setError('All fields are required.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const updatedTask = {
      id: taskToEdit?.id,
      title,
      description,
      category,
      dueDate,
      priority,
    };

    try {
      if (taskToEdit) {
        // Update the existing task
        const response = await axios.put(
          `${apiUrl}/tasks/${taskToEdit.id}`,
          updatedTask
        );
        dispatch({ type: 'UPDATE_TASK', payload: response.data });
      } else {
        // Add new task
        const newTask = { title, description, category, dueDate, priority };
        const response = await axios.post(`${apiUrl}/tasks`, newTask);
        dispatch({ type: 'ADD_TASK', payload: response.data });
      }

      // Reset form fields
      setTitle('');
      setDescription('');
      setCategory('');
      setDueDate('');
      setPriority('medium');
    } catch (error) {
      console.error('Error saving task:', error);
      setError('Failed to save task. Please try again.');
    }
  };

  return (
    <FormContainer>
      <h2>{taskToEdit ? 'Edit Task' : 'Add a New Task'}</h2>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <TextArea
          placeholder="Task Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
          required
        />
        <Input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          required
        />
        <Input
          type="text"
          placeholder="Task Category"
          value={category}
          onChange={e => setCategory(e.target.value)}
          required
        />
        <Select
          value={priority}
          onChange={e => setPriority(e.target.value)}
          required
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </Select>
        {error && <p>{error}</p>}
        <Button type="submit">{taskToEdit ? 'Update Task' : 'Add Task'}</Button>
        <Button type="button" onClick={onClose}>
          Close
        </Button>
      </Form>
    </FormContainer>
  );
};

export default TaskForm;

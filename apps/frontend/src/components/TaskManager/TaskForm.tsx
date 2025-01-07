import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTaskContext } from '../../context/TaskContext';
import axios from 'axios';
import { Task } from '../../types/Task';

const apiUrl = import.meta.env.VITE_API_URL;

const FormContainer = styled.div`
  max-width: 500px;
  margin: 20px auto;
  padding: 20px;
  border-radius: 10px;
  background-color: grey;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const TextArea = styled.textarea`
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  resize: none;
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Select = styled.select`
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Button = styled.button`
  padding: 12px;
  font-size: 16px;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

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

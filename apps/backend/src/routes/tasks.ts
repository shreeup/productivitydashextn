import { Router } from 'express';
import pool from '../config/db';

const router = Router();

// Get all tasks
router.get('/', async (req, res) => {
  const { search } = req.query; // Get the search query parameter
  let query =
    'SELECT id,title,description,category,due_date as duedate,priority FROM tasks';
  let values: any = [];

  if (search) {
    // If search query is provided, add a WHERE clause to filter tasks by title or description
    query += ' WHERE title ILIKE $1 OR description ILIKE $1';
    values = [`%${search}%`]; // Use ILIKE for case-insensitive matching
  }

  try {
    const result = await pool.query(query, values);
    res.status(200).json(result.rows); // Return filtered tasks
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Add a new task
router.post('/', async (req, res) => {
  const { title, description, category, dueDate, priority } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO tasks (title, description, category, due_date, priority) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, category, dueDate, priority]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({ error: 'Failed to add task' });
  }
});

// Delete a task
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Task not found' });
    } else {
      res.status(200).json({ message: 'Task deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Edit a task
// Update an existing task

router.put('/:id', async (req, res) => {
  const { id } = req.params; // Get the task ID from the request params
  const { title, description, category, dueDate, priority } = req.body; // Get the updated task details from the request body

  try {
    // Query to update the task in the database
    const result = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, category = $3, due_date = $4, priority = $5 WHERE id = $6 RETURNING *',
      [title, description, category, dueDate, priority, id] // Update values and task id
    );

    // Check if the task was found and updated
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Task not found' });
    }
    // Respond with the updated task
    else res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

export default router;

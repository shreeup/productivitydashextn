import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import taskRoutes from './routes/tasks';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/tasks', taskRoutes);

// Start Server
app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});

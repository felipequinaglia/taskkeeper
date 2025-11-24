import 'dotenv/config'; // Load environment variables from .env file

import express from 'express';
import cors from 'cors'; // Import cors

import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import chatRoutes from './routes/chatRoutes.js'; // Import chat routes
import processInputRoutes from './routes/processInputRoutes.js';
import { protect } from './middleware/authMiddleware.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
const configuredOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : [];
const allowedOrigins = [
  'http://localhost:5173',
  'https://taskkeeper-one.vercel.app',
  ...configuredOrigins,
].filter(Boolean); // Filter out any empty strings
app.use(cors({ origin: allowedOrigins }));
app.options('*', cors()); // Handle preflight requests

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/chat', chatRoutes); // Integrate chat routes
app.use('/api/process-input', processInputRoutes);


// Basic Route
app.get('/', (req, res) => {
  res.send('Task Keeper API is running...');
});

// Example of a protected route
app.get('/api/protected', protect, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'You have accessed a protected route!',
    user: req.user,
  });
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;

import 'dotenv/config';

// Global error handling for debugging Cloud Run startup
process.on('uncaughtException', (err) => {
  console.error('>>> FATAL: UNCAUGHT EXCEPTION');
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('>>> FATAL: UNHANDLED REJECTION at:', promise, 'reason:', reason);
  process.exit(1);
});

console.log(">>> Checking Environment Variables...");
const requiredVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'GEMINI_API_KEY', 'GROQ_API_KEY'];
requiredVars.forEach(v => {
  console.log(`>>> ${v}: ${process.env[v] ? 'LOADED' : 'MISSING'}`);
});

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
  'http://localhost',
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


app.listen(port, '0.0.0.0', () => {
  console.log(`>>> Task Keeper API is live!`);
  console.log(`>>> Listening on port: ${port}`);
  console.log(`>>> Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;

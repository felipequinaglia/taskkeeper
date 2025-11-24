import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import './index.css';
import App from './App.tsx';
import { TaskProvider } from './contexts/TaskContext.tsx';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TaskProvider>
        <App />
      </TaskProvider>
    </BrowserRouter>
  </StrictMode>
);

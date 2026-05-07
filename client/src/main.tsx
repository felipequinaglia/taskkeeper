import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import axios from 'axios';
import './index.css';
import App from './App.tsx';
import { TaskProvider } from './contexts/TaskContext.tsx';

// 1. Setup Axios (From Current)
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// 2. Setup QueryClient (From Lovable)
const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Outer Layer: Data Fetching & UI Utilities */}
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        
        {/* Toast Notifications (Must sit high in the tree) */}
        <Toaster />
        <Sonner />

        {/* Navigation Layer */}
        <BrowserRouter>
          
          {/* State Management Layer */}
          <TaskProvider>
            <App />
          </TaskProvider>
          
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </StrictMode>
);
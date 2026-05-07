/**
 * TaskKeeper v1.1.0
 * Architecture: Supabase + Groq + Cloud Run
 */
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation } from "react-router-dom";
import { TaskProvider } from "@/contexts/TaskContext";

// Page Imports
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import Tasks from "./pages/Tasks";
import NotFound from "./pages/NotFound";
import Header from "@/components/Header"; // Using Lovable's alias for the new components

// Keep your existing CSS import
import "./App.css";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  
  // Combined logic: Show header on Chat, Tasks, OR Index
  const showHeader = ['/chat', '/tasks', '/index'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-background">
      {showHeader && <Header />}
      <Routes>
        {/* Working File Priority: Start at Login */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* App Pages */}
        <Route path="/index" element={<Index />} />
        <Route path="/chat" element={<Chat />} />
        
        {/* New Lovable Pages */}
        <Route path="/tasks" element={<Tasks />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App = () => {
  // We wrap everything in Providers, but we DO NOT include <BrowserRouter> 
  // because your working file (File 2) implies the Router is already in main.tsx
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <TaskProvider>
          <AppContent />
        </TaskProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
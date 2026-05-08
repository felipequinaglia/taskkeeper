/**
 * TaskKeeper v2.0
 * Architecture: Supabase + Groq + Cloud Run
 * UI: webtui (terminal-style CSS)
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Routes, Route, useLocation } from 'react-router-dom';
import { TaskProvider } from '@/contexts/TaskContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

import Index    from './pages/Index';
import Login    from './pages/Login';
import Register from './pages/Register';
import Chat     from './pages/Chat';
import Tasks    from './pages/Tasks';
import NotFound from './pages/NotFound';
import Header   from '@/components/Header';

import './App.css';

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const showHeader = ['/chat', '/tasks', '/index'].includes(location.pathname);

  return (
    <div className="tk-app">
      {showHeader && <Header />}
      <main className="tk-main">
        <Routes>
          <Route path="/"         element={<Login />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/index"    element={<Index />} />
          <Route path="/chat"     element={<Chat />} />
          <Route path="/tasks"    element={<Tasks />} />
          <Route path="*"         element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TaskProvider>
        <AppContent />
      </TaskProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

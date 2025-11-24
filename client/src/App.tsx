import { Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Index from './pages/Index';
import Chat from './pages/Chat';
import Header from './components/Header';
import './App.css';

function App() {
  const location = useLocation();
  const showHeader = location.pathname === '/chat' || location.pathname === '/index';

  return (
    <>
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/index" element={<Index />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </>
  );
}

export default App;

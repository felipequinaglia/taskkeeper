import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';

const Header = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="tk-header">
      <pre className="tk-accent" style={{ fontSize: '0.7rem', lineHeight: 1.2 }}>
{`╔═══════════════╗
║  TASK KEEPER  ║
╚═══════════════╝`}
      </pre>

      <nav className="tk-nav">
        <NavLink to="/chat"  className={({ isActive }) => `tk-nav-link${isActive ? ' active' : ''}`}>
          &gt; CHAT
        </NavLink>
        <NavLink to="/tasks" className={({ isActive }) => `tk-nav-link${isActive ? ' active' : ''}`}>
          &gt; TASKS
        </NavLink>

        <button
          size-="small"
          variant-="background2"
          onClick={toggleTheme}
          title="Toggle theme"
        >
          {theme === 'dark' ? '[LIGHT]' : '[DARK]'}
        </button>

        <button
          size-="small"
          variant-="danger"
          onClick={handleLogout}
        >
          [LOGOUT]
        </button>
      </nav>
    </header>
  );
};

export default Header;

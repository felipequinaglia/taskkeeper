import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="border-b-2 border-white bg-black">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <pre className="text-primary text-xs leading-none">
{`╔═══════════════╗
║ TASK KEEPER   ║
╚═══════════════╝`}
            </pre>
          </div>
          <nav className="flex items-center gap-4">
            <NavLink
              to="/chat"
              className="px-4 py-2 border border-white text-white hover:bg-white hover:text-black transition-colors"
              activeClassName="bg-primary text-black border-primary"
            >
              &gt; CHAT
            </NavLink>
            <NavLink
              to="/tasks"
              className="px-4 py-2 border border-white text-white hover:bg-white hover:text-black transition-colors"
              activeClassName="bg-primary text-black border-primary"
            >
              &gt; TASKS
            </NavLink>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="border border-destructive text-destructive hover:bg-destructive hover:text-white rounded-none"
            >
              [ LOGOUT ]
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404: route not found:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="tk-auth-page">
      <div box-="square" style={{ width: '52ch', padding: '2lh 2ch', textAlign: 'center' }}>
        <pre className="tk-danger" style={{ fontSize: '0.85rem', lineHeight: 1.2 }}>
{`╔════════════════════════════════════╗
║         ERROR 404 NOT FOUND        ║
╚════════════════════════════════════╝`}
        </pre>
        <p style={{ marginTop: '1lh' }}>&gt; ROUTE NOT FOUND: <span className="tk-dim">{location.pathname}</span></p>
        <p className="tk-dim" style={{ marginTop: '0.5lh', marginBottom: '1lh' }}>
          THE REQUESTED PATH DOES NOT EXIST IN THIS SYSTEM.
        </p>
        <Link to="/">
          <button size-="small" variant-="accent">[ RETURN TO HOME ]</button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/lib/api';

const Login = () => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/api/users/login', { email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/chat');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tk-auth-page">
      <div box-="square" style={{ width: '52ch', padding: '2lh 2ch' }}>

        <pre className="tk-accent" style={{ fontSize: '0.75rem', lineHeight: 1.2, marginBottom: '1lh' }}>
{`╔════════════════════════════════════╗
║        TASK KEEPER  v2.0           ║
╚════════════════════════════════════╝`}
        </pre>

        <p style={{ marginBottom: '2lh' }}>&gt; LOGIN PROTOCOL INITIATED</p>

        <form onSubmit={handleSubmit} className="tk-form-stack">

          {error && (
            <div className="tk-banner error">
              [ERROR] {error}
            </div>
          )}

          <div className="tk-form-group">
            <label className="tk-form-label" htmlFor="email">&gt; EMAIL:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="user@domain.com"
              required
              disabled={loading}
              className="tk-full"
            />
          </div>

          <div className="tk-form-group">
            <label className="tk-form-label" htmlFor="password">&gt; PASSWORD:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              className="tk-full"
            />
          </div>

          <button
            type="submit"
            variant-="accent"
            disabled={loading}
            className="tk-full"
          >
            {loading
              ? <><span is-="spinner" /> &nbsp;[AUTHENTICATING...]</>
              : '[ ENTER SYSTEM ]'}
          </button>

          <p className="tk-dim" style={{ textAlign: 'center' }}>
            &gt; NEW USER?&nbsp;
            <Link to="/register" className="tk-accent">[REGISTER]</Link>
          </p>

        </form>

        <div is-="separator" className="tk-full" style={{ marginTop: '1lh' }} />
        <p className="tk-dim" style={{ marginTop: '0.5lh', fontSize: '0.85rem' }}>
          SYSTEM STATUS: ONLINE &nbsp;|&nbsp; VERSION: 2.0
        </p>

      </div>
    </div>
  );
};

export default Login;

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/users/register', {
        name,
        email,
        password,
      });
      localStorage.setItem('token', response.data.token);
      navigate('/chat');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-md border-2 border-white p-8">
        <div className="mb-8">
          <pre className="text-primary text-sm mb-4">
{`╔════════════════════════════════╗
║       TASK KEEPER v1.0         ║
╚════════════════════════════════╝`}
          </pre>
          <p className="text-white text-center text-sm">&gt; NEW USER REGISTRATION</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="border border-destructive p-3">
              <p className="text-destructive text-sm">[ERROR] {error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-white text-sm">&gt; USERNAME:</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="bg-black text-white border-white focus:border-primary rounded-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white text-sm">&gt; EMAIL:</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="bg-black text-white border-white focus:border-primary rounded-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white text-sm">&gt; PASSWORD:</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="bg-black text-white border-white focus:border-primary rounded-none"
            />
          </div>

          <div className="space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-primary text-black hover:bg-primary/80 border-2 border-primary rounded-none font-bold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  [CREATING ACCOUNT...]
                </>
              ) : (
                '[ CREATE ACCOUNT ]'
              )}
            </Button>

            <div className="text-center">
              <p className="text-muted-foreground text-sm">
                &gt; EXISTING USER? <Link to="/login" className="text-primary hover:underline">[LOGIN]</Link>
              </p>
            </div>
          </div>
        </form>

        <div className="mt-8 pt-4 border-t border-white">
          <p className="text-muted-foreground text-xs text-center">
            SYSTEM STATUS: ONLINE | VERSION: 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

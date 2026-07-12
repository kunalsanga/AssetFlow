import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { cn } from '../../lib/utils';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 font-sans">
      <Card className="w-full max-w-md bg-surface border-border shadow-xl">
        <CardHeader className="space-y-2 flex flex-col items-center pt-8 pb-4">
          <div className="h-16 w-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-2 shadow-sm">
             <span className="text-primary font-bold text-2xl">AF</span>
          </div>
          <CardTitle className="text-2xl font-bold text-text">Welcome back</CardTitle>
          <p className="text-sm text-muted">Log in to your AssetFlow account</p>
        </CardHeader>
        <CardContent className="pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background"
            />
            
            <div className="space-y-1 relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-[34px] text-muted hover:text-text transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border bg-background text-primary focus:ring-primary/50 w-4 h-4 cursor-pointer"
                />
                <span className="text-sm text-muted group-hover:text-text transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">Forgot password?</a>
            </div>
            
            {error && <div className="text-sm text-error bg-error/10 p-3 rounded-md border border-error/20 text-center">{error}</div>}

            <Button type="submit" className="w-full mt-2 bg-primary hover:bg-primary/90 text-background font-semibold py-2.5">
              Sign In
            </Button>
          </form>
          
          <div className="mt-8 text-center text-sm">
            <span className="text-muted">Don't have an account? </span>
            <Link to="/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">Create one</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

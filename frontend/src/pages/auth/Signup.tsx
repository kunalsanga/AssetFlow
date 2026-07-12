import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import api from '../../services/api';

export const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      // Mock frontend behavior
      setTimeout(() => {
        navigate('/login');
      }, 800);
      
      // Real API call (commented out for now as requested)
      // await api.post('/auth/signup', {
      //   email,
      //   password,
      //   full_name: fullName,
      // });
      // navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Signup failed');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 font-sans">
      <Card className="w-full max-w-md bg-surface border-border shadow-xl">
        <CardHeader className="space-y-2 flex flex-col items-center pt-8 pb-4">
          <div className="h-16 w-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-2 shadow-sm">
             <span className="text-primary font-bold text-2xl">AF</span>
          </div>
          <CardTitle className="text-2xl font-bold text-text">Create Account</CardTitle>
          <p className="text-sm text-muted text-center">Join AssetFlow to access shared resources</p>
        </CardHeader>
        <CardContent className="pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="bg-background"
            />
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
            
            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-background"
            />
            
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
              <p className="text-xs text-muted leading-relaxed">
                By default, you will be registered as an <span className="font-semibold text-text">Employee</span>. 
                Additional roles (like Admin or Manager) must be assigned by your organization administrator after registration.
              </p>
            </div>
            
            {error && <div className="text-sm text-error bg-error/10 p-3 rounded-md border border-error/20 text-center">{error}</div>}

            <Button 
              type="submit" 
              className="w-full mt-2 bg-primary hover:bg-primary/90 text-background font-semibold py-2.5"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          
          <div className="mt-8 text-center text-sm">
            <span className="text-muted">Already have an account? </span>
            <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">Log in</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

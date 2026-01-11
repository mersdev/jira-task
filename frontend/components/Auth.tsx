import React, { useState } from 'react';
import { Button, Input } from './UI';
import { DEMO_USER } from '../mockData';
import { api } from '../services/api';

interface AuthProps {
  onLogin: (user: any) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        let user;
        if (isLogin) {
            user = await api.auth.login(email, password);
        } else {
            user = await api.auth.register(name, email, password);
        }
        onLogin(user);
    } catch (err: any) {
        console.error(err);
        setError(err.message || "Authentication failed");
    } finally {
        setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
        const user = await api.auth.login(DEMO_USER.email, DEMO_USER.password);
        onLogin(user);
    } catch (err: any) {
        setError("Demo login failed. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
            <h1 className="text-4xl font-black mb-2 tracking-tighter">MONOTASK</h1>
            <p className="text-gray-500 font-mono text-sm">Project management in black & white.</p>
        </div>

        <div className="border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
          <h2 className="text-2xl font-bold mb-6 font-mono border-b-2 border-black pb-2">
            {isLogin ? 'Log In' : 'Register'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-500 text-red-600 text-sm font-bold">
                ! {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Full Name</label>
                <Input 
                    placeholder="John Doe" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Email</label>
              <Input 
                type="email" 
                placeholder="name@company.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Password</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full mt-6" isLoading={loading}>
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
            
            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={handleDemoLogin}
                isLoading={loading}
            >
                Login with Demo Account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button 
              onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
              }}
              className="font-bold underline hover:no-underline"
            >
              {isLogin ? 'Register' : 'Log In'}
            </button>
          </div>
        </div>
        
        <div className="mt-8 text-center text-xs text-gray-400 font-mono">
           &copy; {new Date().getFullYear()} MonoTask Inc.
        </div>
      </div>
    </div>
  );
};
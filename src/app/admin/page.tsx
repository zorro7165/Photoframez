'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Lock, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingSession, setIsVerifyingSession] = useState(true);

  // Check if session cookie is already active on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/admin/auth');
        const data = await res.json();
        if (data.authenticated) {
          router.push('/admin/dashboard');
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        setIsVerifyingSession(false);
      }
    }
    checkSession();
  }, [router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Invalid administrator credentials.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifyingSession) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        
        {/* Header Icon */}
        <div className="mx-auto h-12 w-12 rounded-full bg-amber-600/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shadow-lg shadow-amber-500/5">
          <Settings size={22} className="animate-spin" style={{ animationDuration: '6s' }} />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black font-outfit text-white">Admin Console</h1>
          <p className="text-xs text-neutral-500">Manage orders, update frames inventory, and view analytics.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-left p-3.5 bg-red-950/20 border border-red-900/30 rounded-xl text-red-400 text-xs animate-fade-in">
            <Lock size={14} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Username</label>
            <input
              required
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              className="w-full px-3.5 py-2.5 text-xs bg-neutral-950 border border-neutral-800 rounded-lg focus:border-amber-600 outline-hidden text-white font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 text-xs bg-neutral-950 border border-neutral-800 rounded-lg focus:border-amber-600 outline-hidden text-white"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-neutral-800 disabled:text-neutral-500 text-white text-xs font-bold rounded-lg shadow-md shadow-amber-600/10 transition"
          >
            {isLoading ? 'Verifying...' : 'Access Dashboard'}
          </button>
        </form>

        {/* Testing Helpers Tag */}
        <div className="bg-neutral-950 p-4 rounded-xl text-left border border-neutral-850">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">Local Testing Credentials</span>
          <p className="text-[11px] text-neutral-500 mt-1">
            Username: <strong className="text-neutral-350 font-mono">admin</strong><br />
            Password: <strong className="text-neutral-350 font-mono">adminpassword123</strong>
          </p>
        </div>

      </div>
    </div>
  );
}

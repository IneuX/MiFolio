'use client';

/**
 * 仅用于开发环境调试认证状态。生产构建下会渲染 "Not Available"。
 * 请勿在生产环境依赖或暴露此页。
 */
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const IS_DEV = process.env.NODE_ENV === 'development';

export default function DebugPage() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<string>('Checking...');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [debugEmail, setDebugEmail] = useState('');
  const [debugPassword, setDebugPassword] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session: sessionData }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        setAuthStatus(`Session Error: ${sessionError.message}`);
        setSession(null);
        setUser(null);
        setIsAdmin(null);
        return;
      }
      if (sessionData) {
        setSession(sessionData);
        const { data: { user: userData }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          setAuthStatus(`User Error: ${userError.message}`);
          setUser(null);
          setIsAdmin(null);
          return;
        }
        setUser(userData);
        setAuthStatus(`Authenticated as ${userData?.email ?? 'unknown'}`);
        try {
          const res = await fetch('/api/auth/status');
          const json = await res.json();
          setIsAdmin(json.success && json.isAdmin === true);
        } catch {
          setIsAdmin(null);
        }
      } else {
        setAuthStatus('No session found');
        setSession(null);
        setUser(null);
        setIsAdmin(null);
      }
    } catch (error) {
      console.error('[debug] Auth check error:', error);
      setAuthStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setSession(null);
      setUser(null);
      setIsAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    const email = debugEmail.trim();
    const password = debugPassword;
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      alert('Sign up successful! Check your email for confirmation if required.');
      await checkAuth();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Sign up failed';
      console.error('[debug] Sign up error:', msg);
      alert(`Sign up error: ${msg}`);
    }
  };

  const handleSignIn = async () => {
    const email = debugEmail.trim();
    const password = debugPassword;
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      alert('Sign in successful!');
      await checkAuth();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Sign in failed';
      console.error('[debug] Sign in error:', msg);
      alert(`Sign in error: ${msg}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setIsAdmin(null);
      setAuthStatus('Signed out');
    } catch (error) {
      console.error('[debug] Sign out error:', error);
    }
  };

  if (!IS_DEV) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
        <div className="text-center text-white/60">
          <h1 className="text-xl font-bold mb-2">Not Available</h1>
          <p>This page is only available in development.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Authentication Debug (Dev Only)</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white/60">Auth Status:</span>
              <span className={authStatus.includes('Authenticated') ? 'text-green-400' : 'text-yellow-400'}>
                {authStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Loading:</span>
              <span>{loading ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Has Session:</span>
              <span>{session ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Has User:</span>
              <span>{user ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Is Admin:</span>
              <span>{isAdmin === null ? '—' : isAdmin ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">Actions</h2>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={debugEmail}
              onChange={(e) => setDebugEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40"
            />
            <input
              type="password"
              placeholder="Password"
              value={debugPassword}
              onChange={(e) => setDebugPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40"
            />
            <button
              onClick={handleSignUp}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
            >
              Sign Up
            </button>
            <button
              onClick={handleSignIn}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium"
            >
              Sign In
            </button>
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium"
            >
              Sign Out
            </button>
            <button
              onClick={checkAuth}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium"
            >
              Refresh Auth Status
            </button>
            <a
              href="/admin"
              className="block w-full px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-lg font-medium text-center"
            >
              Try Access Admin Page
            </a>
            <a
              href="/api/auth/status"
              target="_blank"
              className="block w-full px-4 py-2 bg-gray-700 hover:bg-gray-800 rounded-lg font-medium text-center"
            >
              Check API Auth Status
            </a>
          </div>
        </div>
      </div>
      
      {session && (
        <div className="mt-8 bg-white/5 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">Session Details</h2>
          <pre className="text-sm bg-black/50 p-4 rounded-lg overflow-auto max-h-64">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      )}
      
      {user && (
        <div className="mt-8 bg-white/5 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">User Details</h2>
          <pre className="text-sm bg-black/50 p-4 rounded-lg overflow-auto max-h-64">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-8 text-sm text-white/60">
        <p>Development mode. Check browser console for detailed logs.</p>
      </div>
    </div>
  );
}
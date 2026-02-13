'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugPage() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<string>('Checking...');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session: sessionData }, error: sessionError } = await supabase.auth.getSession();
      console.log('Session check:', { sessionData, sessionError });
      
      if (sessionError) {
        setAuthStatus(`Session Error: ${sessionError.message}`);
      } else if (sessionData) {
        setSession(sessionData);
        const { data: { user: userData }, error: userError } = await supabase.auth.getUser();
        console.log('User check:', { userData, userError });
        if (userError) {
          setAuthStatus(`User Error: ${userError.message}`);
        } else {
          setUser(userData);
          setAuthStatus(`Authenticated as ${userData?.email}`);
        }
      } else {
        setAuthStatus('No session found');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    const email = 'ineux@outlook.com';
    const password = 'testpassword123';
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      alert(`Sign up successful! Check ${email} for confirmation.`);
      await checkAuth();
    } catch (error: any) {
      alert(`Sign up error: ${error.message}`);
    }
  };

  const handleSignIn = async () => {
    const email = 'ineux@outlook.com';
    const password = 'testpassword123';
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      alert(`Sign in successful!`);
      await checkAuth();
    } catch (error: any) {
      alert(`Sign in error: ${error.message}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setAuthStatus('Signed out');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Authentication Debug</h1>
      
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
              <span className="text-white/60">Admin Email:</span>
              <span>ineux@outlook.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Matches Admin:</span>
              <span>{user?.email === 'ineux@outlook.com' ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white/5 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">Actions</h2>
          <div className="space-y-3">
            <button
              onClick={handleSignUp}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
            >
              Sign Up (ineux@outlook.com)
            </button>
            <button
              onClick={handleSignIn}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium"
            >
              Sign In (ineux@outlook.com)
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
        <p>Environment: {process.env.NODE_ENV}</p>
        <p>Supabase URL configured: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Yes' : 'No'}</p>
        <p>Note: Check browser console for detailed logs.</p>
      </div>
    </div>
  );
}
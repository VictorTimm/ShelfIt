'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('AuthProvider mounted effect running');
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      console.log('Skipping auth check - not mounted yet');
      return;
    }

    console.log('Starting auth check, pathname:', pathname);

    const checkSession = async () => {
      try {
        console.log('Checking Supabase session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        console.log('Session result:', session ? 'Session exists' : 'No session');
        setUser(session?.user ?? null);
        
        if (!session?.user && pathname !== '/login') {
          console.log('No session, redirecting to /login');
          router.push('/login');
        } else if (session?.user) {
          console.log('Session exists, user:', session.user.email);
        }
      } catch (err) {
        console.error('Error in checkSession:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event, session ? 'Session exists' : 'No session');
      setUser(session?.user ?? null);
      
      if (mounted) {
        if (!session?.user && pathname !== '/login') {
          console.log('Auth changed: No session, redirecting to /login');
          router.push('/login');
        } else if (session?.user && pathname === '/login') {
          console.log('Auth changed: Session exists, redirecting to home');
          router.push('/');
        }
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [mounted, pathname, router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Don't render children until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
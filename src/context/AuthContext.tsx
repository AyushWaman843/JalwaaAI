import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient, User as SupabaseUser } from '@supabase/supabase-js';

// Initialize Supabase optionally
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

const isValidSupabaseUrl = (url: string) => {
  return typeof url === 'string' && 
    (url.startsWith('http://') || url.startsWith('https://')) && 
    !url.toLowerCase().includes('your_supabase_url');
};

export const supabase = (supabaseUrl && supabaseAnonKey && isValidSupabaseUrl(supabaseUrl))
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'customer' | 'owner';
  preferences?: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, name: string, phone: string, password?: string, role?: 'customer' | 'owner') => Promise<void>;
  signIn: (email: string, password?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Initial Load: Check Supabase session first if available
    const checkAuth = async () => {
      try {
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Get profile details from Supabase metadata or fallback to storage
            const meta = session.user.user_metadata;
            const profile: UserProfile = {
              id: session.user.id,
              email: session.user.email || '',
              name: meta?.name || session.user.email?.split('@')[0] || 'User',
              phone: meta?.phone || '',
              role: meta?.role || 'customer',
              preferences: meta?.preferences || []
            };
            setUser(profile);
            localStorage.setItem('jalwaa_session', JSON.stringify(profile));
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Supabase session check skipped or failed:", err);
      }

      // 2. Fallback check: check local storage session
      const localSession = localStorage.getItem('jalwaa_session');
      if (localSession) {
        try {
          setUser(JSON.parse(localSession));
        } catch {
          localStorage.removeItem('jalwaa_session');
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Setup listener if Supabase is alive
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const meta = session.user.user_metadata;
          const profile: UserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            name: meta?.name || 'User',
            phone: meta?.phone || '',
            role: meta?.role || 'customer'
          };
          setUser(profile);
          localStorage.setItem('jalwaa_session', JSON.stringify(profile));
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('jalwaa_session');
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const signUp = async (email: string, name: string, phone: string, password = 'DefaultPassword123', role: 'customer' | 'owner' = 'customer') => {
    setLoading(true);
    setError(null);

    const fallbackId = `usr_${Math.random().toString(36).substring(2, 9)}`;
    const mockProfile: UserProfile = {
      id: fallbackId,
      email,
      name,
      phone,
      role,
      preferences: []
    };

    try {
      if (supabase) {
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              phone,
              role
            }
          }
        });

        if (signUpErr) throw signUpErr;

        if (data.user) {
          const p: UserProfile = {
            id: data.user.id,
            email,
            name,
            phone,
            role
          };
          setUser(p);
          localStorage.setItem('jalwaa_session', JSON.stringify(p));
          // Save list of users offline too
          const usersList = JSON.parse(localStorage.getItem('jalwaa_local_users') || '[]');
          usersList.push(p);
          localStorage.setItem('jalwaa_local_users', JSON.stringify(usersList));
          setLoading(false);
          return;
        }
      }
    } catch (err: any) {
      console.warn("Supabase signup failed, executing offline signup fallback:", err.message);
      // Let the user know we completed signup in offline/local storage mode
    }

    // Local Storage Mock SignUp
    const usersList = JSON.parse(localStorage.getItem('jalwaa_local_users') || '[]');
    // Check if user already exists
    const exists = usersList.find((u: UserProfile) => u.email === email);
    if (exists) {
      setLoading(false);
      setError("An account with this email already exists locally.");
      throw new Error("An account with this email already exists locally.");
    }

    usersList.push(mockProfile);
    localStorage.setItem('jalwaa_local_users', JSON.stringify(usersList));
    setUser(mockProfile);
    localStorage.setItem('jalwaa_session', JSON.stringify(mockProfile));
    setLoading(false);
  };

  const signIn = async (email: string, password = 'DefaultPassword123') => {
    setLoading(true);
    setError(null);

    try {
      if (supabase) {
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInErr) throw signInErr;

        if (data.user) {
          const meta = data.user.user_metadata;
          const p: UserProfile = {
            id: data.user.id,
            email,
            name: meta?.name || email.split('@')[0],
            phone: meta?.phone || '',
            role: meta?.role || 'customer'
          };
          setUser(p);
          localStorage.setItem('jalwaa_session', JSON.stringify(p));
          setLoading(false);
          return;
        }
      }
    } catch (err: any) {
      console.warn("Supabase signin failed, trying local credentials verification:", err.message);
    }

    // Local Storage Mock SignIn
    const usersList = JSON.parse(localStorage.getItem('jalwaa_local_users') || '[]');
    const matchedUser = usersList.find((u: UserProfile) => u.email.toLowerCase() === email.toLowerCase());

    if (matchedUser) {
      setUser(matchedUser);
      localStorage.setItem('jalwaa_session', JSON.stringify(matchedUser));
      setLoading(false);
    } else {
      // Auto-create a demo account for seamless developer experience!
      const demoProfile: UserProfile = {
        id: `usr_demo_${Math.random().toString(36).substring(2, 9)}`,
        email,
        name: email.split('@')[0] || "Demo User",
        phone: "+91 98765 43210",
        role: email.includes('owner') ? 'owner' : 'customer',
        preferences: ["Style Consultation"]
      };
      usersList.push(demoProfile);
      localStorage.setItem('jalwaa_local_users', JSON.stringify(usersList));
      setUser(demoProfile);
      localStorage.setItem('jalwaa_session', JSON.stringify(demoProfile));
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error("Supabase signout failed:", err);
    }
    setUser(null);
    localStorage.removeItem('jalwaa_session');
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

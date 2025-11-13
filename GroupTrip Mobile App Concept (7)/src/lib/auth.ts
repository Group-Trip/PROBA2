import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabase = createClient(supabaseUrl, publicAnonKey);

// Helper function to safely use localStorage (iOS Safari private mode fix)
const safeLocalStorage = {
  setItem: (key: string, value: string) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn('localStorage.setItem failed:', e);
    }
  },
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
    } catch (e) {
      console.warn('localStorage.getItem failed:', e);
    }
    return null;
  },
  removeItem: (key: string) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('localStorage.removeItem failed:', e);
    }
  }
};

export const auth = {
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.session?.access_token) {
      safeLocalStorage.setItem('access_token', data.session.access_token);
      safeLocalStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    safeLocalStorage.removeItem('access_token');
    safeLocalStorage.removeItem('user');
  },

  getSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.warn('getSession error:', error);
        return null;
      }

      if (data.session?.access_token) {
        safeLocalStorage.setItem('access_token', data.session.access_token);
        safeLocalStorage.setItem('user', JSON.stringify(data.session.user));
      }

      return data.session;
    } catch (e) {
      console.error('getSession exception:', e);
      return null;
    }
  },

  getCurrentUser: () => {
    const userStr = safeLocalStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!safeLocalStorage.getItem('access_token');
  },

  isStaff: () => {
    const userStr = safeLocalStorage.getItem('user');
    if (!userStr) return false;
    try {
      const user = JSON.parse(userStr);
      // Check if user has staff role in metadata
      return user?.user_metadata?.role === 'staff';
    } catch (e) {
      console.warn('Failed to parse user data:', e);
      return false;
    }
  }
};

import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  nickname: string;
  role: 'user' | 'vip' | 'moderator' | 'admin';
  is_banned: boolean;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
}

// Simple hash function for passwords
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
};

// Set user context for RLS via RPC
export const setUserContext = async (userId: string | null) => {
  try {
    console.log('Attempting to set RLS user context for userId:', userId);
    const { error } = await supabase.rpc('set_app_user', { user_id: userId });
    if (error) {
      console.error('Failed to set user context RPC error:', error);
      throw new Error('Failed to set user context for RLS.');
    }
    console.log('RLS user context set successfully for userId:', userId);
  } catch (e) {
    console.error('Error calling set_app_user RPC:', e);
    throw e;
  }
};

// Register user
export const registerUser = async (nickname: string, password: string) => {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('nickname', nickname)
      .single();

    if (existingUser) {
      throw new Error('Користувач з таким нікнеймом вже існує');
    }

    const passwordHash = simpleHash(password);
    
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          nickname,
          password_hash: passwordHash,
          role: 'user'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    
    // Set user context and session
    await setUserContext(data.id);
    localStorage.setItem('skoropad_user', JSON.stringify(data));
    return { user: data, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

// Login user
export const loginUser = async (nickname: string, password: string) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('nickname', nickname)
      .single();

    if (error) throw new Error('Користувача не знайдено');
    
    if (user.is_banned) {
      throw new Error('Ваш акаунт заблоковано');
    }

    const isValidPassword = simpleHash(password) === user.password_hash;
    if (!isValidPassword) {
      throw new Error('Невірний пароль');
    }

    // Set user context and session
    await setUserContext(user.id);
    localStorage.setItem('skoropad_user', JSON.stringify(user));
    return { user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

// Logout user
export const logoutUser = () => {
  localStorage.removeItem('skoropad_user');
};

// Get current user
export const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('skoropad_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

// Check if user has permission
export const hasPermission = (user: User | null, requiredRoles: string[]): boolean => {
  if (!user || user.is_banned) return false;
  return requiredRoles.includes(user.role);
};

// Initialize user context on app start or user change
export const initializeUserContext = async () => {
  const user = getCurrentUser();
  if (user) {
    await setUserContext(user.id);
  } else {
    await setUserContext(null); // Clear context if no user
  }
};
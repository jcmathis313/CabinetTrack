import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { AuthUser, LoginCredentials, SignupCredentials, PasswordResetRequest, PasswordReset } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  signup: (credentials: SignupCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  requestPasswordReset: (request: PasswordResetRequest) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (reset: PasswordReset) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    // If Supabase isn't configured, set a mock user for development
    if (!isSupabaseConfigured) {
      setUser({
        id: 'mock-user-id',
        email: 'demo@example.com',
        firstName: 'Demo',
        lastName: 'User',
        organizationId: 'mock-org-id',
        role: 'admin',
        permissions: {
          canManageUsers: true,
          canManageBilling: true,
          canViewReports: true,
          canManageSettings: true
        }
      });
      setLoading(false);
      return;
    }

    // Check for existing user in localStorage (custom auth)
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      // Check for user in localStorage (custom auth)
      const storedUser = localStorage.getItem('authUser');
      console.log('checkUser: storedUser exists?', !!storedUser);
      
      if (storedUser) {
        const authUser: AuthUser = JSON.parse(storedUser);
        console.log('checkUser: setting user', authUser);
        setUser(authUser);
        
        // Refresh user data to get fresh organization info
        await refreshUser();
      } else {
        console.log('checkUser: no stored user, setting null');
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      // First, get the organization ID from the slug
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', credentials.organizationSlug)
        .eq('is_active', true)
        .single();

      if (orgError || !org) {
        return { success: false, error: 'Organization not found' };
      }

      // Get user by email and organization
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', credentials.email)
        .eq('organization_id', org.id)
        .eq('is_active', true)
        .single();

      if (userError || !userData) {
        return { success: false, error: 'Invalid credentials' };
      }

      // For now, we'll use a simple password check
      // In production, you should use proper password hashing
      if (userData.password_hash !== credentials.password) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Store user in localStorage for now (in production, use proper JWT)
      const authUser: AuthUser = {
        id: userData.id,
        organizationId: userData.organization_id,
        email: userData.email,
        username: userData.username,
        firstName: userData.first_name,
        lastName: userData.last_name,
        role: userData.role,
        permissions: {
          canManageUsers: true,
          canManageBilling: true,
          canViewReports: true,
          canManageSettings: true
        },
        organization: {
          id: org.id,
          name: '', // Will be populated in refreshUser
          slug: credentials.organizationSlug,
          plan: 'free',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      localStorage.setItem('authUser', JSON.stringify(authUser));
      console.log('login: setting user in state', authUser);
      setUser(authUser);

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userData.id);

      // Refresh user data to get complete organization info
      await refreshUser();

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signup = async (credentials: SignupCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check if organization slug is available
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', credentials.organizationSlug)
        .single();

      if (existingOrg) {
        return { success: false, error: 'Organization slug already exists' };
      }

      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: credentials.organizationName,
          slug: credentials.organizationSlug,
          plan: 'free',
          is_active: true
        })
        .select()
        .single();

      if (orgError || !org) {
        console.error('Organization creation error:', orgError);
        return { success: false, error: `Failed to create organization: ${orgError?.message || 'Unknown error'}` };
      }

      // Create user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          organization_id: org.id,
          email: credentials.email,
          username: credentials.username,
          password_hash: credentials.password, // In production, hash this
          first_name: credentials.firstName,
          last_name: credentials.lastName,
          role: 'admin', // First user is admin
          is_active: true,
          email_verified: true // For demo purposes
        })
        .select()
        .single();

      if (userError || !userData) {
        console.error('User creation error:', userError);
        return { success: false, error: `Failed to create user: ${userError?.message || 'Unknown error'}` };
      }

      // Create organizational settings
      const { error: settingsError } = await supabase
        .from('organizational_settings')
        .insert({
          organization_id: org.id,
          company_name: credentials.organizationName,
          company_address: '',
          company_phone: ''
        });

      if (settingsError) {
        console.error('Organizational settings creation error:', settingsError);
        // Don't fail the signup for this, but log the error
      }

      // Auto-login the user
      const authUser: AuthUser = {
        id: userData.id,
        organizationId: userData.organization_id,
        email: userData.email,
        username: userData.username,
        firstName: userData.first_name,
        lastName: userData.last_name,
        role: userData.role,
        permissions: {
          canManageUsers: true,
          canManageBilling: true,
          canViewReports: true,
          canManageSettings: true
        },
        organization: {
          id: org.id,
          name: credentials.organizationName,
          slug: credentials.organizationSlug,
          plan: 'free',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      localStorage.setItem('authUser', JSON.stringify(authUser));
      setUser(authUser);

      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async (): Promise<void> => {
    localStorage.removeItem('authUser');
    setUser(null);
  };

  const requestPasswordReset = async (request: PasswordResetRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get organization ID
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', request.organizationSlug)
        .single();

      if (!org) {
        return { success: false, error: 'Organization not found' };
      }

      // Get user
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', request.email)
        .eq('organization_id', org.id)
        .single();

      if (!userData) {
        return { success: false, error: 'User not found' };
      }

      // Generate token and store in database
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await supabase
        .from('password_reset_tokens')
        .insert({
          user_id: userData.id,
          token,
          expires_at: expiresAt.toISOString()
        });

      // In production, send email with reset link
      console.log('Password reset token:', token);
      console.log('In production, send email with reset link');

      return { success: true };
    } catch (error) {
      console.error('Password reset request error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const resetPassword = async (reset: PasswordReset): Promise<{ success: boolean; error?: string }> => {
    try {
      // Find valid token
      const { data: tokenData } = await supabase
        .from('password_reset_tokens')
        .select('user_id, expires_at')
        .eq('token', reset.token)
        .eq('used', false)
        .single();

      if (!tokenData) {
        return { success: false, error: 'Invalid or expired token' };
      }

      if (new Date(tokenData.expires_at) < new Date()) {
        return { success: false, error: 'Token has expired' };
      }

      // Update password
      await supabase
        .from('users')
        .update({ password_hash: reset.password })
        .eq('id', tokenData.user_id);

      // Mark token as used
      await supabase
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('token', reset.token);

      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const storedUser = localStorage.getItem('authUser');
      if (!storedUser) {
        setUser(null);
        return;
      }

      const authUser: AuthUser = JSON.parse(storedUser);
      
      // Get fresh organization data
      const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', authUser.organizationId)
        .single();

      if (org) {
        const updatedUser: AuthUser = {
          ...authUser,
          organization: {
            id: org.id,
            name: org.name,
            slug: org.slug,
            plan: org.plan,
            isActive: org.is_active,
            createdAt: new Date(org.created_at),
            updatedAt: new Date(org.updated_at)
          }
        };

        localStorage.setItem('authUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    requestPasswordReset,
    resetPassword,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

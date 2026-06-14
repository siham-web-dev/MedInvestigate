import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, RegisterPayload, LoginPayload, ForgotPasswordPayload, VerifyResetCodePayload, ResetPasswordPayload } from '../services/authService';

// User type
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organization: string;
}

// Auth context type
export interface AuthContextType {
  // State
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Methods
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  verifyResetCode: (email: string, code: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  clearError: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedToken = localStorage.getItem('auth_token');
        if (savedToken) {
          setToken(savedToken);
          // Try to verify the token is still valid
          const isValid = await authService.verifyToken();
          if (!isValid) {
            // Token is invalid, clear it
            setToken(null);
            setUser(null);
          }
          // Note: In a real app, you'd also fetch the current user here
          // For now, we assume the token is valid and will fetch user data
        }
      } catch (err) {
        console.error('Failed to load user:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);

    try {
      const response = await authService.login({ email, password });

      if (response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setError(null);
    setLoading(true);

    try {
      const response = await authService.register(payload);

      if (response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    setError(null);
  };

  const forgotPassword = async (email: string) => {
    setError(null);
    setLoading(true);

    try {
      const response = await authService.forgotPassword({ email });
      if (!response.success) {
        throw new Error(response.message || 'Failed to send reset code');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset code';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyResetCode = async (email: string, code: string) => {
    setError(null);
    setLoading(true);

    try {
      const response = await authService.verifyResetCode({ email, code });
      if (!response.success) {
        throw new Error(response.message || 'Invalid reset code');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid reset code';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    setError(null);
    setLoading(true);

    try {
      const response = await authService.resetPassword({ email, code, newPassword });
      if (!response.success) {
        throw new Error(response.message || 'Failed to reset password');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

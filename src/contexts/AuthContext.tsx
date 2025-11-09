'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { User, ApiError } from '@/types/api';
import { API } from '@/lib/api-client';

// Auth state interface
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string; refreshToken: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'REFRESH_TOKEN'; payload: { token: string; refreshToken: string } };

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Reducer function
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    
    case 'REFRESH_TOKEN':
      return {
        ...state,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
      };
    
    default:
      return state;
  }
}

// Role-based permission helpers
export interface RolePermissions {
  isSuperadmin: boolean;
  isAdmin: boolean;
  isUser: boolean;
  canAccessAllQuizzes: boolean;
  canManageAssignments: boolean;
  canCreateQuizzes: boolean;
  canManageUsers: boolean;
  canAccessAdminPanel: boolean;
}

// Context interface
export interface AuthContextType extends AuthState, RolePermissions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  updateProfile: (user: User) => void;
  hasRole: (roles: string[]) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load tokens from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        if (typeof window !== 'undefined') {
          const savedToken = localStorage.getItem('admin_token');
          const savedRefreshToken = localStorage.getItem('admin_refresh_token');
          
          if (savedToken && savedRefreshToken) {
            // Validate session with backend
            try {
              const response = await API.auth.getProfile();
              dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                  user: response.data!,
                  token: savedToken,
                  refreshToken: savedRefreshToken,
                },
              });
            } catch (error) {
              // Invalid session, clear storage
              localStorage.removeItem('admin_token');
              localStorage.removeItem('admin_refresh_token');
              dispatch({ type: 'LOGOUT' });
            }
          } else {
            dispatch({ type: 'LOGOUT' });
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clear invalid tokens
        if (typeof window !== 'undefined') {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_refresh_token');
        }
        dispatch({ type: 'LOGOUT' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Save tokens to localStorage and cookies when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (state.token) {
        localStorage.setItem('admin_token', state.token);
        // Also set as cookie for middleware access
        document.cookie = `admin_token=${state.token}; path=/; max-age=${24 * 60 * 60}`; // 24 hours
      } else {
        localStorage.removeItem('admin_token');
        // Clear cookie
        document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }

      if (state.refreshToken) {
        localStorage.setItem('admin_refresh_token', state.refreshToken);
      } else {
        localStorage.removeItem('admin_refresh_token');
      }
    }
  }, [state.token, state.refreshToken]);

  // Auto-refresh token when it's about to expire
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (state.isAuthenticated && state.refreshToken) {
      // Refresh token every 20 minutes (assuming 24h token expiry)
      intervalId = setInterval(async () => {
        try {
          await refreshTokens();
        } catch (error) {
          console.error('Auto-refresh failed:', error);
          // If refresh fails, logout user
          await logout();
        }
      }, 20 * 60 * 1000); // 20 minutes
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [state.isAuthenticated, state.refreshToken]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      console.log('Attempting login with:', email);
      const response = await API.auth.login(email, password);
      console.log('Login response (structured):', response);

      // Extract auth data from standardized response
      const authData = response.data!;
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: authData.user,
          token: authData.access_token,
          refreshToken: authData.refresh_token || '',
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Call logout API
      await API.auth.logout();
    } catch (error) {
      console.error('Logout API failed:', error);
      // Still logout locally even if API fails
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const refreshTokens = useCallback(async () => {
    if (!state.refreshToken) return;

    try {
      const response = await API.auth.refreshToken(state.refreshToken);
      
      dispatch({
        type: 'REFRESH_TOKEN',
        payload: {
          token: response.data!.access_token,
          refreshToken: response.data!.refresh_token,
        },
      });
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }, [state.refreshToken]);

  const updateProfile = useCallback((user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  }, []);

  // Role-based permission helpers
  const hasRole = useCallback((roles: string[]): boolean => {
    return state.user ? roles.includes(state.user.role) : false;
  }, [state.user]);

  const hasAnyRole = useCallback((roles: string[]): boolean => {
    return state.user ? roles.some(role => state.user!.role === role) : false;
  }, [state.user]);

  // Computed role permissions
  const isSuperadmin = state.user?.role === 'superadmin';
  const isAdmin = state.user?.role === 'admin';
  const isUser = state.user?.role === 'user';
  const canAccessAllQuizzes = isSuperadmin;
  const canManageAssignments = isSuperadmin;
  const canCreateQuizzes = isSuperadmin || isAdmin;
  const canManageUsers = isSuperadmin;
  const canAccessAdminPanel = isSuperadmin || isAdmin;

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    refreshTokens,
    updateProfile,
    hasRole,
    hasAnyRole,
    isSuperadmin,
    isAdmin,
    isUser,
    canAccessAllQuizzes,
    canManageAssignments,
    canCreateQuizzes,
    canManageUsers,
    canAccessAdminPanel,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
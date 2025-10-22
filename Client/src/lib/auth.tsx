import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from './api';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Set up global logout callback
  useEffect(() => {
    api.setLogoutCallback(() => {
      api.helpers.clearToken();
      setIsAuthenticated(false);
      if (location.pathname !== '/signin' && location.pathname !== '/signup' && location.pathname !== '/') {
        navigate('/signin', { replace: true });
      }
    });
  }, [navigate, location]);

  // Check token on mount and periodically
  useEffect(() => {
    function checkToken() {
      const token = api.helpers.getToken();
      if (token) {
        setIsAuthenticated(true);
      } else if (location.pathname !== '/signin' && location.pathname !== '/signup' && location.pathname !== '/') {
        // Redirect to login if accessing protected route without token
        navigate('/signin', { replace: true });
      }
    }

    // Check immediately
    checkToken();

    // Check every minute for token expiry
    const interval = setInterval(checkToken, 60000);
    return () => clearInterval(interval);
  }, [navigate, location]);

  const login = (token: string) => {
    try {
      api.helpers.setToken(token);
      setIsAuthenticated(true);
    } catch (e) {
      console.error('Invalid token:', e);
      logout();
    }
  };

  const logout = () => {
    api.helpers.clearToken();
    setIsAuthenticated(false);
    navigate('/signin');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/signin' && location.pathname !== '/signup') {
      navigate('/signin', { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  return isAuthenticated ? <>{children}</> : null;
}
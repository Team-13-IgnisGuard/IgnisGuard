import { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

// Safely extract role from JWT token string (handles string or array value)
const getRoleFromToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const raw = payload['role'] ?? payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    return Array.isArray(raw) ? raw[0] : raw ?? '';
  } catch {
    return '';
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize: verify token and load user profile
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('lpg_token');
      if (token) {
        try {
          // Validate token with backend /api/auth/me
          const currentUser = await authService.getCurrentUser();
          // Normalize PascalCase response from C# backend to camelCase
          const role = currentUser.role ?? currentUser.Role ?? getRoleFromToken(token);
          setUser({
            userId: currentUser.userId ?? currentUser.UserId,
            email:  currentUser.email  ?? currentUser.Email,
            role,
          });
        } catch (error) {
          console.error('Token verification failed, logging out...', error);
          localStorage.removeItem('lpg_token');
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen for session expiry event
    const handleAuthExpired = () => {
      setUser(null);
      localStorage.removeItem('lpg_token');
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      if (data.isSuccess && data.token) {
        localStorage.setItem('lpg_token', data.token);
        // Fallback: extract role from JWT if data.role is missing/empty
        const role = data.role || getRoleFromToken(data.token);
        const loggedInUser = {
          userId: data.userId,
          email: data.email,
          role,
        };
        setUser(loggedInUser);
        return { success: true, role };
      }
      return { success: false, error: 'Authentication failed.' };
    } catch (err) {
      const errors = err.response?.data?.errors || ['Invalid email or password.'];
      return { success: false, error: errors.join(', ') };
    } finally {
      setLoading(false);
    }
  };

  const register = async (firstName, lastName, email, password, confirmPassword, role) => {
    setLoading(true);
    try {
      const data = await authService.register(firstName, lastName, email, password, confirmPassword, role);
      if (data.isSuccess && data.token) {
        localStorage.setItem('lpg_token', data.token);
        // Fallback: extract role from JWT if data.role is missing/empty
        const resolvedRole = data.role || getRoleFromToken(data.token);
        const registeredUser = {
          userId: data.userId,
          email: data.email,
          role: resolvedRole,
        };
        setUser(registeredUser);
        return { success: true, role: resolvedRole };
      }
      return { success: false, error: 'Registration failed.' };
    } catch (err) {
      const errors = err.response?.data?.errors || ['Registration failed. Verify inputs.'];
      return { success: false, error: errors.join(', ') };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lpg_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

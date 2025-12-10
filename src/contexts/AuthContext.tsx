import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authApi, ApiError } from '../services/api';
import type { User } from '../services/api';

// Tipos
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

// Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Chaves do localStorage
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Decodificar payload do JWT (sem verificar assinatura - isso é feito no backend)
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Verificar se o token expirou
function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') {
    return true;
  }
  // Adiciona 60 segundos de margem
  return Date.now() >= payload.exp * 1000 - 60000;
}

// Provider
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
          // Verificar se o token não expirou
          if (!isTokenExpired(storedToken)) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            
            // Decodificar token para verificar se é admin
            const payload = decodeJwtPayload(storedToken);
            
            const hasAdminRole = 
              payload?.is_admin === true || 
              parsedUser.role === 'admin' ||
              payload?.role === 'admin' ||
              (payload?.roles as string[])?.includes('admin');

            setIsAdmin(!!hasAdminRole);
          } else {
            // Token expirado, limpar dados
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar autenticação:', err);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login(email, password);
      
      // Salvar token
      localStorage.setItem(TOKEN_KEY, response.token);
      
      // Decodificar payload para obter informações do usuário
      const payload = decodeJwtPayload(response.token);
      
      const userData: User = response.user || {
        id: payload?.sub as string || '',
        email: payload?.email as string || email,
        role: (payload?.is_admin === true || response.is_admin === true) ? 'admin' : 'user',
      };

      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      setUser(userData);
      
      // Verificação robusta de admin
      const hasAdminRole = 
        payload?.is_admin === true || 
        response.is_admin === true || 
        userData.role === 'admin' ||
        payload?.role === 'admin' ||
        (payload?.roles as string[])?.includes('admin');

      setIsAdmin(!!hasAdminRole);
      
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError('Email ou senha incorretos');
        } else {
          setError(err.message || 'Erro ao fazer login');
        }
      } else {
        setError('Erro de conexão. Verifique sua internet.');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await authApi.register(email, password);
      
      // Após registro bem-sucedido, fazer login automaticamente
      await login(email, password);
      
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 400) {
          setError('Email já cadastrado ou inválido');
        } else {
          setError(err.message || 'Erro ao criar conta');
        }
      } else {
        setError('Erro de conexão. Verifique sua internet.');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setIsAdmin(false);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin,
    isLoading,
    login,
    register,
    logout,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook customizado para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

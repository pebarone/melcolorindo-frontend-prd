import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authApi, ApiError, setForceLogoutCallback, setTokenRefreshedCallback, clearTokens } from '../services/api';
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

// Chaves do localStorage (devem corresponder às do api.ts)
const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_KEY = 'auth_user';

/**
 * Decodifica payload do JWT de forma segura
 * NOTA: Apenas decodifica, não valida a assinatura (backend é responsável)
 * @param token - Token JWT
 * @returns Payload decodificado ou null se inválido
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    // Validação básica do formato JWT (3 partes separadas por ponto)
    if (!token || typeof token !== 'string') {
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('[Auth] Token JWT mal formado: número de partes inválido');
      return null;
    }

    const base64Url = parts[1];
    if (!base64Url || base64Url.length === 0) {
      console.warn('[Auth] Token JWT mal formado: payload vazio');
      return null;
    }

    // Substituir caracteres URL-safe
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Adicionar padding se necessário
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    
    // Validação básica do payload
    if (typeof payload !== 'object' || payload === null) {
      console.warn('[Auth] Token JWT mal formado: payload não é um objeto');
      return null;
    }

    return payload;
  } catch (error) {
    console.warn('[Auth] Erro ao decodificar token JWT:', error);
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

  // Função de logout interna (usada pelo callback de forceLogout)
  const performLogout = useCallback(() => {
    clearTokens();
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setIsAdmin(false);
    setError(null);
  }, []);

  // Registrar callback de logout forçado na API
  useEffect(() => {
    setForceLogoutCallback(() => {
      console.log('[Auth] Logout forçado - refresh token expirado');
      performLogout();
    });
  }, [performLogout]);

  // NOVO: Registrar callback para atualizar isAdmin quando token for renovado
  // Isso é importante porque quando o token expira, isAdmin é false por segurança
  // Quando o token é renovado automaticamente, precisamos atualizar isAdmin corretamente
  useEffect(() => {
    setTokenRefreshedCallback((newAccessToken: string) => {
      console.log('[Auth] Token renovado - atualizando status de admin');
      
      const payload = decodeJwtPayload(newAccessToken);
      if (payload) {
        const hasAdminRole = 
          payload?.is_admin === true || 
          payload?.role === 'admin' ||
          (payload?.roles as string[])?.includes('admin');
        
        setIsAdmin(!!hasAdminRole);
        console.log('[Auth] isAdmin atualizado para:', !!hasAdminRole);
      }
    });
  }, []);

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const storedAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedAccessToken && storedRefreshToken && storedUser) {
          // Verificar se o access token não expirou
          if (!isTokenExpired(storedAccessToken)) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            
            // SEGURANÇA: Sempre verificar admin APENAS através do JWT, nunca confiar no localStorage
            // Isso previne que um usuário mal-intencionado altere o role no localStorage
            const payload = decodeJwtPayload(storedAccessToken);
            
            // Verificar se o token é válido e tem as claims esperadas
            if (payload) {
              const hasAdminRole = 
                payload?.is_admin === true || 
                payload?.role === 'admin' ||
                (payload?.roles as string[])?.includes('admin');

              setIsAdmin(!!hasAdminRole);
            } else {
              // Token inválido, não dar acesso admin
              setIsAdmin(false);
            }
          } else if (storedRefreshToken) {
            // Access token expirado, mas temos refresh token
            // O token será renovado automaticamente na próxima requisição
            // SEGURANÇA: NÃO dar acesso admin até o token ser renovado e verificado
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            
            // IMPORTANTE: isAdmin fica FALSE até o token ser renovado
            // Isso previne ataques de manipulação do localStorage
            setIsAdmin(false);
            
            console.log('[Auth] Access token expirado, isAdmin desabilitado até renovação do token');
          } else {
            // Sem refresh token, limpar dados
            clearTokens();
            localStorage.removeItem(USER_KEY);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar autenticação:', err);
        clearTokens();
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
      
      // Os tokens já são salvos automaticamente pelo authApi.login
      // Agora só precisamos salvar o usuário e atualizar o estado
      
      const userData: User = response.user;

      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      setUser(userData);
      
      // Verificação robusta de admin
      const payload = decodeJwtPayload(response.accessToken);
      const hasAdminRole = 
        payload?.is_admin === true || 
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
    performLogout();
  }, [performLogout]);

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

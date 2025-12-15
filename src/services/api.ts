// API Service - Comunicação com o backend
import { cacheService } from './cache';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Tipos baseados no swagger.yaml v2.0.0
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  subcategory?: string | null; // NOVO: Sistema de subcategorias
  image_url: string;
  is_featured?: boolean; // NOVO: Sistema de destaques
  description?: string;
  created_at?: string;
}

export interface ProductList {
  products: Product[];
  total: number;
  page: number;
  maxResults: number;
}

export interface User {
  id: string;
  email: string;
  role?: 'user' | 'admin'; // Atualizado: role ao invés de is_admin
  created_at?: string;
}

export interface UserList {
  users: User[];
  total: number;
  page: number;
  maxResults: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
  expiresIn: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

// Chaves de armazenamento de tokens
const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

// Helper para obter o access token do localStorage de forma segura
const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
};

// Helper para obter o refresh token
const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
};

// Helper para salvar tokens
const saveTokens = (accessToken: string, refreshToken: string): void => {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error('[Auth] Erro ao salvar tokens:', error);
  }
};

// Helper para atualizar apenas o access token
const updateAccessToken = (accessToken: string): void => {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  } catch (error) {
    console.error('[Auth] Erro ao atualizar access token:', error);
  }
};

// Helper para limpar tokens
export const clearTokens = (): void => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('[Auth] Erro ao limpar tokens:', error);
  }
};

// Helper para criar headers com autenticação
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Classe de erro customizada para tratar respostas da API
export class ApiError extends Error {
  status: number;
  code?: string; // NOVO: código de erro (ex: FEATURED_LIMIT_REACHED)
  
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'ApiError';
  }
}

// Flag para evitar múltiplas tentativas de refresh simultâneas
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// Callback para notificar sobre logout forçado (será setado pelo AuthContext)
let onForceLogout: (() => void) | null = null;

// Callback para notificar sobre renovação do token (será setado pelo AuthContext)
let onTokenRefreshed: ((newAccessToken: string) => void) | null = null;

export const setForceLogoutCallback = (callback: () => void): void => {
  onForceLogout = callback;
};

// NOVO: Permite ao AuthContext receber notificação quando o token é renovado
export const setTokenRefreshedCallback = (callback: (newAccessToken: string) => void): void => {
  onTokenRefreshed = callback;
};

/**
 * Tenta renovar o access token usando o refresh token
 * @returns Novo access token ou null se falhar
 */
async function tryRefreshToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    console.warn('[Auth] Sem refresh token disponível');
    return null;
  }

  console.log('[Auth] Tentando renovar token com refresh token...');
  
  try {
    const requestBody = { refreshToken };
    console.log('[Auth] Request body:', JSON.stringify(requestBody));
    
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('[Auth] Refresh response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('[Auth] Refresh token expirado ou inválido:', errorData);
      return null;
    }

    const data: RefreshResponse = await response.json();
    console.log('[Auth] Refresh response data:', { hasAccessToken: !!data.accessToken, expiresIn: data.expiresIn });
    
    if (!data.accessToken) {
      console.error('[Auth] Resposta do refresh não contém accessToken');
      return null;
    }
    
    updateAccessToken(data.accessToken);
    
    // NOVO: Notificar AuthContext sobre renovação para atualizar isAdmin
    if (onTokenRefreshed) {
      onTokenRefreshed(data.accessToken);
    }
    
    console.log('[Auth] Token renovado com sucesso');
    return data.accessToken;
  } catch (error) {
    console.error('[Auth] Erro ao renovar token:', error);
    return null;
  }
}

// Função genérica para fazer requisições com cache e renovação automática de token
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
  useCache = false,
  retryOnUnauthorized = true
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Tentar cache se habilitado e for GET
  if (useCache && (!options.method || options.method === 'GET')) {
    const cached = cacheService.get<T>(endpoint);
    if (cached !== null) {
      return cached;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  // Tratar erro 401/403 (token inválido/expirado) com renovação automática
  // Tenta refresh em QUALQUER 401/403 se temos refresh token e retry está habilitado
  if ((response.status === 401 || response.status === 403) && retryOnUnauthorized) {
    const hasRefreshToken = !!getRefreshToken();
    
    // Se temos refresh token, tentar renovar antes de desistir
    if (hasRefreshToken) {
      console.log('[Auth] Recebido', response.status, '- tentando renovar token...');
      
      // Evitar múltiplas renovações simultâneas
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = tryRefreshToken();
      }
      
      const newToken = await refreshPromise;
      isRefreshing = false;
      refreshPromise = null;
      
      if (newToken) {
        // Refazer a requisição com o novo token (sem retry para evitar loop)
        return fetchApi<T>(endpoint, options, useCache, false);
      } else {
        // Refresh falhou, forçar logout
        clearTokens();
        if (onForceLogout) {
          onForceLogout();
        }
        throw new ApiError('Sessão expirada. Faça login novamente.', response.status, 'SESSION_EXPIRED');
      }
    }
    
    // Sem refresh token, retornar erro normalmente
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || errorData.error || `HTTP error! status: ${response.status}`,
      response.status,
      errorData.code
    );
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || errorData.error || `HTTP error! status: ${response.status}`,
      response.status,
      errorData.code // Incluir código de erro se disponível
    );
  }

  // Se for 204 No Content, retorna undefined
  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();

  // Salvar no cache se habilitado e for GET
  if (useCache && (!options.method || options.method === 'GET')) {
    cacheService.set(endpoint, data);
  }

  return data;
}

// Helper para normalizar o objeto produto
const normalizeProduct = (p: any): Product => {
  return {
    ...p,
    id: p.id || p.uuid || p._id,
  };
};

// ============ Auth API ============

// Validação de email
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const authApi = {
  /**
   * Realiza login e salva tokens
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    // Validar email antes de enviar
    if (!isValidEmail(email)) {
      throw new ApiError('Email inválido. Por favor, forneça um endereço de email válido.', 400);
    }
    
    const response = await fetchApi<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false, false); // Sem cache, sem retry (é a autenticação inicial)
    
    // Salvar tokens automaticamente
    saveTokens(response.accessToken, response.refreshToken);
    
    return response;
  },

  /**
   * Renova o access token usando o refresh token
   */
  refresh: async (): Promise<RefreshResponse | null> => {
    const newToken = await tryRefreshToken();
    if (newToken) {
      return { accessToken: newToken, expiresIn: '15m' };
    }
    return null;
  },

  /**
   * Realiza logout limpando tokens
   */
  logout: (): void => {
    clearTokens();
  },

  register: async (email: string, password: string): Promise<{ message: string; user: User }> => {
    // Validar email antes de enviar
    if (!isValidEmail(email)) {
      throw new ApiError('Email inválido. Por favor, forneça um endereço de email válido.', 400);
    }
    
    return fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
};

// ============ Products API ============

export interface ProductsQueryParams {
  maxResults?: number;
  page?: number;
  category?: string;
  subcategory?: string | string[];
}

export interface CategoryInfo {
  category: string;
  subcategories: string[];
  productCount: number;
}

export const productsApi = {
  /**
   * Lista produtos com paginação e filtros
   * @param params - Parâmetros de query (maxResults, page, category, subcategory)
   * @param useCache - Se deve usar cache (padrão: true)
   */
  getAll: async (params?: ProductsQueryParams, useCache = true): Promise<ProductList> => {
    // Caso especial: Múltiplas subcategorias (Lógica OR no frontend)
    if (params?.subcategory && Array.isArray(params.subcategory) && params.subcategory.length > 0) {
      if (params.subcategory.length === 1) {
        // Se for apenas uma, trata como string simples (comportamento padrão)
        return productsApi.getAll({ ...params, subcategory: params.subcategory[0] }, useCache);
      }

      // Para múltiplas, buscamos TODAS para fazer o merge e paginação manual
      // Limitamos a 100 itens por subcategoria para não sobrecarregar (MVP)
      const promises = params.subcategory.map(sub => {
        const singleParams = { ...params, subcategory: sub, maxResults: 100, page: 1 };
        return productsApi.getAll(singleParams, useCache);
      });

      try {
        const results = await Promise.all(promises);
        
        // Combinar produtos (evitando duplicatas se houver, embora a regra seja 1:1)
        const allProducts = new Map<string, Product>();
        results.forEach(res => {
          res.products.forEach(p => allProducts.set(p.id, p));
        });
        
        const combinedProducts = Array.from(allProducts.values());
        
        // Paginação manual
        const page = params.page || 1;
        const maxResults = params.maxResults || 20;
        const total = combinedProducts.length;
        
        const start = (page - 1) * maxResults;
        const end = start + maxResults;
        const paginatedProducts = combinedProducts.slice(start, end);
        
        return {
          products: paginatedProducts,
          total: total,
          page: page,
          maxResults: maxResults
        };
      } catch (error) {
        console.error('Erro ao buscar múltiplas subcategorias:', error);
        throw error;
      }
    }

    // Comportamento padrão (Single subcategory ou nenhuma)
    let endpoint = '/products';
    
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.maxResults) queryParams.append('maxResults', params.maxResults.toString());
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.category) queryParams.append('category', params.category);
      // Se chegou aqui como string
      if (params.subcategory && typeof params.subcategory === 'string') {
        queryParams.append('subcategory', params.subcategory);
      }
      
      const queryString = queryParams.toString();
      if (queryString) endpoint += `?${queryString}`;
    }

    const data = await fetchApi<ProductList>(endpoint, {}, useCache);
    
    // Normalizar produtos
    data.products = data.products.map(normalizeProduct);
    return data;
  },

  /**
   * Busca produto por ID
   */
  getById: async (id: string, useCache = true): Promise<Product> => {
    const data = await fetchApi<Product>(`/products/${id}`, {}, useCache);
    return normalizeProduct(data);
  },

  /**
   * Busca produtos em destaque (máximo 6)
   */
  getFeatured: async (useCache = true): Promise<Product[]> => {
    const data = await fetchApi<Product[]>('/products/featured', {}, useCache);
    return data.map(normalizeProduct);
  },

  /**
   * Lista categorias com subcategorias e contagem de produtos
   * @param useCache - Se deve usar cache (padrão: true, TTL: 5 min)
   */
  getCategories: async (useCache = true): Promise<CategoryInfo[]> => {
    return fetchApi<CategoryInfo[]>('/products/categories', {}, useCache);
  },

  /**
   * Cria novo produto (Admin)
   */
  create: async (formData: FormData): Promise<Product> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || errorData.error || `HTTP error! status: ${response.status}`,
        response.status,
        errorData.code
      );
    }

    const data = await response.json();
    
    // Invalidar cache de produtos
    cacheService.invalidateProducts();
    
    return normalizeProduct(data);
  },

  /**
   * Atualiza produto existente (Admin)
   */
  update: async (id: string, formData: FormData): Promise<Product> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || errorData.error || `HTTP error! status: ${response.status}`,
        response.status,
        errorData.code
      );
    }

    const data = await response.json();
    
    // Invalidar cache do produto específico e listas
    cacheService.invalidateProduct(id);
    
    return normalizeProduct(data);
  },

  /**
   * Deleta produto (Admin)
   * IMPORTANTE: Também remove a imagem do storage automaticamente
   */
  delete: async (id: string): Promise<void> => {
    await fetchApi(`/products/${id}`, {
      method: 'DELETE',
    });
    
    // Invalidar cache do produto e listas
    cacheService.invalidateProduct(id);
  },

  /**
   * Marca/desmarca produto como destaque (Admin)
   * Máximo de 6 produtos em destaque
   */
  toggleFeatured: async (id: string, isFeatured: boolean): Promise<Product> => {
    const data = await fetchApi<Product>(`/products/${id}/featured`, {
      method: 'PATCH',
      body: JSON.stringify({ isFeatured }),
    });
    
    // Invalidar cache de produtos e destaques
    cacheService.invalidateProducts();
    
    return normalizeProduct(data);
  },

  /**
   * Cria múltiplos produtos em massa (Admin)
   */
  createBulk: async (formData: FormData): Promise<{ message: string; createdCount: number; products: Product[] }> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/products/bulk`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || errorData.error || `HTTP error! status: ${response.status}`,
        response.status,
        errorData.code
      );
    }

    const data = await response.json();
    
    // Invalidar cache de produtos
    cacheService.invalidateProducts();
    
    // Normalizar produtos retornados
    if (data.products && Array.isArray(data.products)) {
      data.products = data.products.map(normalizeProduct);
    }
    
    return data;
  },

  /**
   * Deleta múltiplos produtos (Admin)
   */
  deleteBulk: async (ids: string[]): Promise<{ message: string; deletedCount: number; deletedIds: string[] }> => {
    const result = await fetchApi<{ message: string; deletedCount: number; deletedIds: string[] }>('/products/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    });
    
    // Invalidar cache de produtos
    cacheService.invalidateProducts();
    
    return result;
  },
};

// ============ Favorites API ============

export const favoritesApi = {
  /**
   * Lista todos os favoritos do usuário
   */
  getAll: async (useCache = true): Promise<Product[]> => {
    const data = await fetchApi<Product[]>('/favorites', {}, useCache);
    return data.map(normalizeProduct);
  },

  /**
   * Adiciona produto aos favoritos
   */
  add: async (productId: string): Promise<{ message: string; favorite: Favorite }> => {
    const result = await fetchApi<{ message: string; favorite: Favorite }>('/favorites', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
    
    // Invalidar cache de favoritos
    cacheService.invalidateFavorites();
    
    return result;
  },

  /**
   * Remove produto dos favoritos
   */
  remove: async (productId: string): Promise<{ message: string }> => {
    const result = await fetchApi<{ message: string }>(`/favorites/${productId}`, {
      method: 'DELETE',
    });
    
    // Invalidar cache de favoritos
    cacheService.invalidateFavorites();
    
    return result;
  },

  /**
   * Verifica se produto está nos favoritos
   */
  check: async (productId: string, useCache = true): Promise<{ isFavorite: boolean }> => {
    return fetchApi<{ isFavorite: boolean }>(`/favorites/check/${productId}`, {}, useCache);
  },

  /**
   * Conta total de favoritos do usuário
   */
  count: async (useCache = true): Promise<{ count: number }> => {
    return fetchApi<{ count: number }>('/favorites/count', {}, useCache);
  },

  /**
   * Remove todos os favoritos do usuário
   */
  clearAll: async (): Promise<{ message: string }> => {
    const result = await fetchApi<{ message: string }>('/favorites', {
      method: 'DELETE',
    });
    
    // Invalidar cache de favoritos
    cacheService.invalidateFavorites();
    
    return result;
  },
};

// ============ Users API (Admin) ============

export interface UsersQueryParams {
  maxResults?: number;
  page?: number;
}

export const usersApi = {
  /**
   * Lista usuários com paginação (Admin)
   */
  getAll: async (params?: UsersQueryParams, useCache = true): Promise<UserList> => {
    let endpoint = '/users';
    
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.maxResults) queryParams.append('maxResults', params.maxResults.toString());
      if (params.page) queryParams.append('page', params.page.toString());
      
      const queryString = queryParams.toString();
      if (queryString) endpoint += `?${queryString}`;
    }

    return fetchApi<UserList>(endpoint, {}, useCache);
  },

  /**
   * Busca usuário por ID (Admin)
   */
  getById: async (id: string, useCache = true): Promise<User> => {
    return fetchApi<User>(`/users/${id}`, {}, useCache);
  },
};

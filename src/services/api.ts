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
  token: string;
  user?: User;
  is_admin?: boolean; // Mantido para compatibilidade
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

// Helper para obter o token do localStorage de forma segura
const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem('auth_token');
  } catch {
    return null;
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

// Função genérica para fazer requisições com cache
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
  useCache = false
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
  login: async (email: string, password: string): Promise<LoginResponse> => {
    // Validar email antes de enviar
    if (!isValidEmail(email)) {
      throw new ApiError('Email inválido. Por favor, forneça um endereço de email válido.', 400);
    }
    
    const response = await fetchApi<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response;
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
  subcategory?: string;
}

export const productsApi = {
  /**
   * Lista produtos com paginação e filtros
   * @param params - Parâmetros de query (maxResults, page, category, subcategory)
   * @param useCache - Se deve usar cache (padrão: true)
   */
  getAll: async (params?: ProductsQueryParams, useCache = true): Promise<ProductList> => {
    let endpoint = '/products';
    
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.maxResults) queryParams.append('maxResults', params.maxResults.toString());
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.category) queryParams.append('category', params.category);
      if (params.subcategory) queryParams.append('subcategory', params.subcategory);
      
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

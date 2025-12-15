// Sistema de Cache Inteligente com TTL e Invalidação
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live em milissegundos
}

interface CacheConfig {
  products: number;
  productList: number;
  featuredProducts: number;
  categories: number;
  favorites: number;
  favoritesCount: number;
  usersList: number;
}

// Configurações de TTL (em minutos)
// OTIMIZADO: TTLs maiores para reduzir chamadas API
const DEFAULT_TTL: CacheConfig = {
  products: 30,         // 30 minutos para produto individual (produtos raramente mudam)
  productList: 30,      // 30 minutos para lista de produtos
  featuredProducts: 30, // 30 minutos para destaques (configuração estável)
  categories: 5,        // 5 minutos para categorias (conforme cache do backend)
  favorites: 5,         // 5 minutos para favoritos (contexto global gerencia)
  favoritesCount: 5,    // 5 minutos para contagem
  usersList: 10,        // 10 minutos para lista de usuários (admin only)
};

class CacheService {
  private cache: Map<string, CacheEntry<any>>;
  private ttlConfig: CacheConfig;

  constructor(ttlConfig: Partial<CacheConfig> = {}) {
    this.cache = new Map();
    this.ttlConfig = { ...DEFAULT_TTL, ...ttlConfig };
  }

  /**
   * Gera chave de cache a partir de endpoint e parâmetros
   */
  private generateKey(endpoint: string, params?: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) {
      return endpoint;
    }
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${endpoint}?${sortedParams}`;
  }

  /**
   * Determina o TTL baseado no tipo de cache
   */
  private getTTL(key: string): number {
    if (key.includes('/products/featured')) {
      return this.ttlConfig.featuredProducts * 60 * 1000;
    }
    if (key.includes('/products/categories')) {
      return this.ttlConfig.categories * 60 * 1000;
    }
    if (key.includes('/products/') && !key.includes('?')) {
      return this.ttlConfig.products * 60 * 1000;
    }
    if (key.includes('/products')) {
      return this.ttlConfig.productList * 60 * 1000;
    }
    if (key.includes('/favorites/count')) {
      return this.ttlConfig.favoritesCount * 60 * 1000;
    }
    if (key.includes('/favorites')) {
      return this.ttlConfig.favorites * 60 * 1000;
    }
    if (key.includes('/users')) {
      return this.ttlConfig.usersList * 60 * 1000;
    }
    return 5 * 60 * 1000; // 5 minutos padrão
  }

  /**
   * Obtém item do cache se válido
   */
  get<T>(endpoint: string, params?: Record<string, any>): T | null {
    const key = this.generateKey(endpoint, params);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    console.log(`[Cache HIT] ${key}`);
    return entry.data;
  }

  /**
   * Armazena item no cache
   */
  set<T>(endpoint: string, data: T, params?: Record<string, any>): void {
    const key = this.generateKey(endpoint, params);
    const ttl = this.getTTL(key);
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    console.log(`[Cache SET] ${key} (TTL: ${ttl / 1000}s)`);
  }

  /**
   * Invalida cache por padrão de chave
   */
  invalidate(pattern: string): void {
    const keysToDelete: string[] = [];
    
    this.cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      console.log(`[Cache INVALIDATE] ${key}`);
    });
  }

  /**
   * Invalida todos os caches relacionados a produtos
   */
  invalidateProducts(): void {
    this.invalidate('/products');
  }

  /**
   * Invalida todos os caches relacionados a favoritos
   */
  invalidateFavorites(): void {
    this.invalidate('/favorites');
  }

  /**
   * Invalida cache de usuários
   */
  invalidateUsers(): void {
    this.invalidate('/users');
  }

  /**
   * Invalida produto específico
   */
  invalidateProduct(productId: string): void {
    this.invalidate(`/products/${productId}`);
    // Também invalida listas que podem conter este produto
    this.invalidateProducts();
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
    console.log('[Cache CLEAR] Todo cache removido');
  }

  /**
   * Retorna estatísticas do cache
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Exporta instância singleton
export const cacheService = new CacheService();

// Exporta classe para testes ou customização
export default CacheService;

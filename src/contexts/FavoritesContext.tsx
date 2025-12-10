import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { favoritesApi, type Product } from '../services/api';
import { useAuth } from './AuthContext';

// Tipos
interface FavoritesContextType {
  favorites: Product[];
  favoriteIds: Set<string>;
  isLoading: boolean;
  error: string | null;
  isFavorite: (productId: string) => boolean;
  addFavorite: (productId: string) => Promise<void>;
  removeFavorite: (productId: string) => Promise<void>;
  toggleFavorite: (productId: string) => Promise<void>;
  refreshFavorites: () => Promise<void>;
  clearAllFavorites: () => Promise<void>;
  favoritesCount: number;
}

// Contexto
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Provider
interface FavoritesProviderProps {
  children: ReactNode;
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Conjunto de IDs para verificação rápida O(1)
  const favoriteIds = useMemo(() => {
    return new Set(favorites.map(f => f.id));
  }, [favorites]);

  // Ref para evitar chamadas simultâneas (método mais seguro que depender de isLoading)
  const isLoadingRef = useRef(false);

  // Carregar favoritos do servidor
  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      setHasLoaded(false);
      return;
    }

    // Evitar múltiplas chamadas simultâneas usando ref
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    try {
      setIsLoading(true);
      setError(null);
      const data = await favoritesApi.getAll(false); // Sem cache, queremos dados frescos na primeira vez
      setFavorites(data);
      setHasLoaded(true);
    } catch (err) {
      console.error('Erro ao carregar favoritos:', err);
      setError('Erro ao carregar favoritos');
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [isAuthenticated]); // Removido isLoading das dependências para evitar loop

  // Carregar favoritos quando autenticar
  useEffect(() => {
    if (isAuthenticated && !hasLoaded) {
      loadFavorites();
    } else if (!isAuthenticated) {
      setFavorites([]);
      setHasLoaded(false);
    }
  }, [isAuthenticated, hasLoaded, loadFavorites]);

  // Verificar se produto está nos favoritos
  const isFavorite = useCallback((productId: string): boolean => {
    return favoriteIds.has(productId);
  }, [favoriteIds]);

  // Adicionar aos favoritos (atualização otimista)
  const addFavorite = useCallback(async (productId: string) => {
    if (!isAuthenticated) return;

    try {
      await favoritesApi.add(productId);
      // Recarregar para obter dados completos do produto
      const data = await favoritesApi.getAll(false);
      setFavorites(data);
    } catch (err) {
      console.error('Erro ao adicionar favorito:', err);
      throw err;
    }
  }, [isAuthenticated]);

  // Remover dos favoritos (atualização otimista)
  const removeFavorite = useCallback(async (productId: string) => {
    if (!isAuthenticated) return;

    // Otimista: remove localmente primeiro
    setFavorites(prev => prev.filter(f => f.id !== productId));

    try {
      await favoritesApi.remove(productId);
    } catch (err) {
      console.error('Erro ao remover favorito:', err);
      // Rollback: recarregar em caso de erro
      loadFavorites();
      throw err;
    }
  }, [isAuthenticated, loadFavorites]);

  // Toggle favorito
  const toggleFavorite = useCallback(async (productId: string) => {
    if (isFavorite(productId)) {
      await removeFavorite(productId);
    } else {
      await addFavorite(productId);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  // Limpar todos os favoritos
  const clearAllFavorites = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      await favoritesApi.clearAll();
      setFavorites([]);
    } catch (err) {
      console.error('Erro ao limpar favoritos:', err);
      throw err;
    }
  }, [isAuthenticated]);

  // Contagem de favoritos
  const favoritesCount = favorites.length;

  const value = useMemo(() => ({
    favorites,
    favoriteIds,
    isLoading,
    error,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    refreshFavorites: loadFavorites,
    clearAllFavorites,
    favoritesCount,
  }), [
    favorites,
    favoriteIds,
    isLoading,
    error,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    loadFavorites,
    clearAllFavorites,
    favoritesCount,
  ]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

// Hook customizado
export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites deve ser usado dentro de um FavoritesProvider');
  }
  return context;
}

export default FavoritesContext;

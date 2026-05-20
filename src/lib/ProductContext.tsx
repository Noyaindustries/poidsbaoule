import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Product } from '@/types';
import { apiJson, ApiError } from './api';
import { sanitizeImageList } from '@/lib/productImages';

interface ProductContextType {
  products: Product[];
  isLoadingProducts: boolean;
  productsError: string | null;
  updateProduct: (updatedProduct: Product) => Promise<Product>;
  deleteProduct: (productId: string) => Promise<void>;
  decrementStock: (productId: string, quantity: number) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);
const PRODUCTS_CACHE_KEY = 'pb_products_cache_v3';

function normalizeProducts(data: unknown): Product[] {
  if (!Array.isArray(data)) return [];
  return data.map((row) => {
    const p = row as Product;
    return { ...p, images: sanitizeImageList(p.images) };
  });
}

const getCachedProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(PRODUCTS_CACHE_KEY);
    if (!raw) return [];
    return normalizeProducts(JSON.parse(raw) as unknown);
  } catch {
    return [];
  }
};

const setCachedProducts = (products: Product[]) => {
  try {
    localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(products));
  } catch {
    // Cache best-effort.
  }
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => getCachedProducts());
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(products.length === 0);
  const [productsError, setProductsError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    setProductsError(null);
    try {
      const data = await apiJson<Product[]>('/api/products');
      const normalized = normalizeProducts(data);
      setProducts(normalized);
      setCachedProducts(normalized);
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.message
          : 'Impossible de charger le catalogue. Vérifiez que l’API tourne (npm run dev).';
      setProductsError(message);
      console.error('Failed to fetch products:', e);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const updateProduct = async (updatedProduct: Product): Promise<Product> => {
    const payload = { ...updatedProduct, images: sanitizeImageList(updatedProduct.images) };
    const data = await apiJson<Product>(`/api/products/${encodeURIComponent(payload.id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    const saved = normalizeProducts([data])[0] ?? payload;

    setProducts((prev) => {
      const existingIndex = prev.findIndex((p) => p.id === saved.id);
      if (existingIndex === -1) {
        return [saved, ...prev];
      }
      return prev.map((p) => (p.id === saved.id ? saved : p));
    });

    return saved;
  };

  const decrementStock = async (productId: string, quantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const newStock = Math.max(0, product.stock - quantity);

    try {
      await apiJson(`/api/products/${encodeURIComponent(productId)}/stock`, {
        method: 'PATCH',
        body: JSON.stringify({ stock: newStock }),
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
      );
    } catch (e) {
      console.error('Failed to update stock in DB:', e);
    }
  };

  const deleteProduct = async (productId: string) => {
    await apiJson(`/api/products/${encodeURIComponent(productId)}`, {
      method: 'DELETE',
    });
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const getProduct = (id: string) => {
    return products.find((p) => p.id === id);
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        isLoadingProducts,
        productsError,
        updateProduct,
        deleteProduct,
        decrementStock,
        getProduct,
        refreshProducts: fetchProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

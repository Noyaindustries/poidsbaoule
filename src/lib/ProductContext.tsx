import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types';
import { apiJson } from './api';

interface ProductContextType {
  products: Product[];
  isLoadingProducts: boolean;
  updateProduct: (updatedProduct: Product) => Promise<Product>;
  deleteProduct: (productId: string) => Promise<void>;
  decrementStock: (productId: string, quantity: number) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);
const PRODUCTS_CACHE_KEY = 'pb_products_cache_v1';

const getCachedProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(PRODUCTS_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Product[]) : [];
  } catch {
    return [];
  }
};

const setCachedProducts = (products: Product[]) => {
  try {
    localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(products));
  } catch {
    // Cache best-effort: ignorer les erreurs de quota/accès localStorage.
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

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const data = await apiJson<Product[]>('/api/products');
      const normalized = Array.isArray(data) ? data : [];
      setProducts(normalized);
      setCachedProducts(normalized);
    } catch (e) {
      console.error('Failed to fetch products:', e);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const updateProduct = async (updatedProduct: Product): Promise<Product> => {
    const data = await apiJson<Product>(`/api/products/${encodeURIComponent(updatedProduct.id)}`, {
      method: 'PUT',
      body: JSON.stringify(updatedProduct),
    });

    setProducts((prev) => {
      const existingIndex = prev.findIndex((p) => p.id === data.id);
      if (existingIndex === -1) {
        return [data, ...prev];
      }
      return prev.map((p) => (p.id === data.id ? data : p));
    });

    return data;
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

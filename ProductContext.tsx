import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types';
import { PRODUCTS as INITIAL_PRODUCTS } from '@/constants';
import { supabase } from './supabase';

interface ProductContextType {
  products: Product[];
  updateProduct: (updatedProduct: Product) => Promise<void>;
  decrementStock: (productId: string, quantity: number) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setProducts(data);
      }
    } catch (e) {
      console.error("Failed to fetch products:", e);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const updateProduct = async (updatedProduct: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .upsert(updatedProduct);
      
      if (error) throw error;
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    } catch (e) {
      console.error("Failed to update product in DB:", e);
    }
  };

  const decrementStock = async (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newStock = Math.max(0, product.stock - quantity);
    
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId);
      
      if (error) throw error;
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, stock: newStock } : p
      ));
    } catch (e) {
      console.error("Failed to update stock in DB:", e);
    }
  };

  const getProduct = (id: string) => {
    return products.find(p => p.id === id);
  };

  return (
    <ProductContext.Provider value={{ 
      products, 
      updateProduct, 
      decrementStock, 
      getProduct,
      refreshProducts: fetchProducts 
    }}>
      {children}
    </ProductContext.Provider>
  );
};

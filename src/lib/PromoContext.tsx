import React, { createContext, useContext, useState, useEffect } from 'react';
import { PromoCode } from '../types';
import { apiJson } from './api';

interface PromoContextType {
  promoCodes: PromoCode[];
  addPromo: (promo: Omit<PromoCode, 'id' | 'usageCount' | 'createdAt'>) => Promise<void>;
  togglePromo: (id: string) => Promise<void>;
  deletePromo: (id: string) => Promise<void>;
  validatePromo: (code: string) => Promise<PromoCode | null>;
  refreshPromos: () => Promise<void>;
}

const PromoContext = createContext<PromoContextType | undefined>(undefined);

export function PromoProvider({ children }: { children: React.ReactNode }) {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);

  const fetchPromos = async () => {
    try {
      const data = await apiJson<PromoCode[]>('/api/promo-codes');
      setPromoCodes(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch promos:', e);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const addPromo = async (promoData: Omit<PromoCode, 'id' | 'usageCount' | 'createdAt'>) => {
    const id = `PROMO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const createdAt = new Date().toISOString();

    try {
      await apiJson('/api/promo-codes', {
        method: 'POST',
        body: JSON.stringify({
          id,
          code: promoData.code.toUpperCase(),
          discountType: promoData.discountType,
          discountValue: promoData.discountValue,
          expiryDate: promoData.expiryDate,
          isActive: true,
          usageCount: 0,
          announcementText: promoData.announcementText,
          createdAt,
        }),
      });
      await fetchPromos();
    } catch (e) {
      console.error('Failed to add promo to DB:', e);
    }
  };

  const togglePromo = async (id: string) => {
    const promo = promoCodes.find((p) => p.id === id);
    if (!promo) return;

    try {
      await apiJson(`/api/promo-codes/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !promo.isActive }),
      });
      await fetchPromos();
    } catch (e) {
      console.error('Failed to toggle promo in DB:', e);
    }
  };

  const deletePromo = async (id: string) => {
    try {
      await apiJson(`/api/promo-codes/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      setPromoCodes((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error('Failed to delete promo from DB:', e);
    }
  };

  const validatePromo = async (code: string) => {
    try {
      return await apiJson<PromoCode>(
        `/api/promo-codes/validate?code=${encodeURIComponent(code)}`
      );
    } catch {
      return null;
    }
  };

  return (
    <PromoContext.Provider
      value={{
        promoCodes,
        addPromo,
        togglePromo,
        deletePromo,
        validatePromo,
        refreshPromos: fetchPromos,
      }}
    >
      {children}
    </PromoContext.Provider>
  );
}

export function usePromos() {
  const context = useContext(PromoContext);
  if (context === undefined) {
    throw new Error('usePromos must be used within a PromoProvider');
  }
  return context;
}

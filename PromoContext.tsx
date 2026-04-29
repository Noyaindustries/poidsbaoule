import React, { createContext, useContext, useState, useEffect } from 'react';
import { PromoCode } from '../types';
import { supabase } from './supabase';

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
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setPromoCodes(data.map((p: any) => ({
          id: p.id,
          code: p.code,
          discountType: p.discount_type,
          discountValue: p.discount_value,
          expiryDate: p.expiry_date,
          isActive: p.is_active,
          usageCount: p.usage_count,
          announcementText: p.announcement_text,
          createdAt: p.created_at
        })));
      }
    } catch (e) {
      console.error("Failed to fetch promos:", e);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const addPromo = async (promoData: Omit<PromoCode, 'id' | 'usageCount' | 'createdAt'>) => {
    const id = `PROMO-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const createdAt = new Date().toISOString();

    try {
      const { error } = await supabase.from('promo_codes').insert({
        id,
        code: promoData.code.toUpperCase(),
        discount_type: promoData.discountType,
        discount_value: promoData.discountValue,
        expiry_date: promoData.expiryDate,
        is_active: true,
        usage_count: 0,
        announcement_text: promoData.announcementText,
        created_at: createdAt
      });
      if (error) throw error;
      await fetchPromos();
    } catch (e) {
      console.error("Failed to add promo to DB:", e);
    }
  };

  const togglePromo = async (id: string) => {
    const promo = promoCodes.find(p => p.id === id);
    if (!promo) return;

    try {
      const { error } = await supabase
        .from('promo_codes')
        .update({ is_active: !promo.isActive })
        .eq('id', id);
      if (error) throw error;
      await fetchPromos();
    } catch (e) {
      console.error("Failed to toggle promo in DB:", e);
    }
  };

  const deletePromo = async (id: string) => {
    try {
      const { error } = await supabase.from('promo_codes').delete().eq('id', id);
      if (error) throw error;
      setPromoCodes(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      console.error("Failed to delete promo from DB:", e);
    }
  };

  const validatePromo = async (code: string) => {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();
      
      if (error || !data) return null;

      // Check expiry
      if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
        return null;
      }
      
      return {
        id: data.id,
        code: data.code,
        discountType: data.discount_type,
        discountValue: data.discount_value,
        expiryDate: data.expiry_date,
        isActive: data.is_active,
        usageCount: data.usage_count,
        announcementText: data.announcement_text,
        createdAt: data.created_at
      };
    } catch (e) {
      return null;
    }
  };

  return (
    <PromoContext.Provider value={{ 
      promoCodes, 
      addPromo, 
      togglePromo, 
      deletePromo, 
      validatePromo,
      refreshPromos: fetchPromos
    }}>
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

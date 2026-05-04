import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { CustomerTestimonial } from '@/types';
import { apiJson } from '@/lib/api';

type TestimonialContextType = {
  testimonials: CustomerTestimonial[];
  loading: boolean;
  refreshTestimonials: () => Promise<void>;
  saveTestimonial: (row: CustomerTestimonial) => Promise<void>;
  createTestimonial: (row: Omit<CustomerTestimonial, 'id' | 'createdAt'>) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
};

const TestimonialContext = createContext<TestimonialContextType | undefined>(undefined);

export function TestimonialProvider({ children }: { children: React.ReactNode }) {
  const [testimonials, setTestimonials] = useState<CustomerTestimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiJson<CustomerTestimonial[]>('/api/testimonials');
      setTestimonials(data);
    } catch (e) {
      console.error('Failed to fetch testimonials:', e);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshTestimonials();
  }, [refreshTestimonials]);

  const saveTestimonial = async (row: CustomerTestimonial) => {
    await apiJson(`/api/testimonials/${encodeURIComponent(row.id)}`, {
      method: 'PUT',
      body: JSON.stringify(row),
    });
    await refreshTestimonials();
  };

  const createTestimonial = async (row: Omit<CustomerTestimonial, 'id' | 'createdAt'>) => {
    const id = crypto.randomUUID();
    await apiJson('/api/testimonials', {
      method: 'POST',
      body: JSON.stringify({
        ...row,
        id,
        createdAt: new Date().toISOString(),
      }),
    });
    await refreshTestimonials();
  };

  const deleteTestimonial = async (id: string) => {
    await apiJson(`/api/testimonials/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    await refreshTestimonials();
  };

  return (
    <TestimonialContext.Provider
      value={{
        testimonials,
        loading,
        refreshTestimonials,
        saveTestimonial,
        createTestimonial,
        deleteTestimonial,
      }}
    >
      {children}
    </TestimonialContext.Provider>
  );
}

export function useTestimonials() {
  const ctx = useContext(TestimonialContext);
  if (ctx === undefined) {
    throw new Error('useTestimonials must be used within a TestimonialProvider');
  }
  return ctx;
}

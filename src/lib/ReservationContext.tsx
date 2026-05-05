import React, { createContext, useContext, useState, useEffect } from 'react';
import { Reservation, CustomOrder } from '../types';
import { apiJson } from './api';

interface ReservationContextType {
  reservations: Reservation[];
  customOrders: CustomOrder[];
  addReservation: (res: Omit<Reservation, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  addCustomOrder: (order: Omit<CustomOrder, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  updateReservationStatus: (id: string, status: Reservation['status']) => Promise<void>;
  updateCustomOrderStatus: (id: string, status: CustomOrder['status']) => Promise<void>;
  refreshAll: () => Promise<void>;
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export function ReservationProvider({ children }: { children: React.ReactNode }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);

  const fetchData = async () => {
    try {
      const [resData, customData] = await Promise.all([
        apiJson<Reservation[]>('/api/reservations'),
        apiJson<CustomOrder[]>('/api/custom-orders'),
      ]);
      setReservations(Array.isArray(resData) ? resData : []);
      setCustomOrders(Array.isArray(customData) ? customData : []);
    } catch (e) {
      console.error('Failed to fetch reservations:', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addReservation = async (resData: Omit<Reservation, 'id' | 'status' | 'createdAt'>) => {
    const id = `RES-${Date.now().toString().slice(-4)}`;
    const status = 'Nouveau';
    const createdAt = new Date().toISOString();

    const doc: Reservation = {
      ...resData,
      id,
      status,
      createdAt,
    };

    try {
      await apiJson('/api/reservations', {
        method: 'POST',
        body: JSON.stringify(doc),
      });
      setReservations((prev) => [doc, ...prev]);
    } catch (e) {
      console.error('Failed to add reservation to DB:', e);
      throw e;
    }
  };

  const addCustomOrder = async (orderData: Omit<CustomOrder, 'id' | 'status' | 'createdAt'>) => {
    const id = `CUST-${Date.now().toString().slice(-4)}`;
    const status = 'Nouveau';
    const createdAt = new Date().toISOString();

    const doc: CustomOrder = {
      ...orderData,
      id,
      status,
      createdAt,
    };

    try {
      await apiJson('/api/custom-orders', {
        method: 'POST',
        body: JSON.stringify(doc),
      });
      setCustomOrders((prev) => [doc, ...prev]);
    } catch (e) {
      console.error('Failed to add custom order to DB:', e);
      throw e;
    }
  };

  const updateReservationStatus = async (id: string, status: Reservation['status']) => {
    try {
      await apiJson(`/api/reservations/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setReservations((prev) => prev.map((res) => (res.id === id ? { ...res, status } : res)));
    } catch (e) {
      console.error('Failed to update reservation status in DB:', e);
      throw e;
    }
  };

  const updateCustomOrderStatus = async (id: string, status: CustomOrder['status']) => {
    try {
      await apiJson(`/api/custom-orders/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setCustomOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status } : order)));
    } catch (e) {
      console.error('Failed to update custom order status in DB:', e);
      throw e;
    }
  };

  return (
    <ReservationContext.Provider
      value={{
        reservations,
        customOrders,
        addReservation,
        addCustomOrder,
        updateReservationStatus,
        updateCustomOrderStatus,
        refreshAll: fetchData,
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservations() {
  const context = useContext(ReservationContext);
  if (context === undefined) {
    throw new Error('useReservations must be used within a ReservationProvider');
  }
  return context;
}

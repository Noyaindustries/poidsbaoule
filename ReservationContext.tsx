import React, { createContext, useContext, useState, useEffect } from 'react';
import { Reservation, CustomOrder } from '../types';
import { supabase } from './supabase';

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
      const { data: resData } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });
      
      const { data: customData } = await supabase
        .from('custom_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (resData) {
        setReservations(resData.map((r: any) => ({
          id: r.id,
          customerName: r.customer_name,
          email: r.email,
          phone: r.phone,
          type: r.type,
          description: r.description,
          surface: r.surface,
          neighborhood: r.neighborhood,
          preferredDates: r.preferred_dates,
          budget: r.budget,
          photos: r.photos,
          status: r.status,
          createdAt: r.created_at
        })));
      }

      if (customData) {
        setCustomOrders(customData.map((c: any) => ({
          id: c.id,
          customerName: c.customer_name,
          email: c.email,
          description: c.description,
          dimensions: c.dimensions,
          finish: c.finish,
          color: c.color,
          type: c.type,
          moodboard: c.moodboard,
          preferredDeadline: c.preferred_deadline,
          status: c.status,
          createdAt: c.created_at
        })));
      }
    } catch (e) {
      console.error("Failed to fetch reservations:", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addReservation = async (resData: Omit<Reservation, 'id' | 'status' | 'createdAt'>) => {
    const id = `RES-${Date.now().toString().slice(-4)}`;
    const status = 'Demande reçue';
    const createdAt = new Date().toISOString();

    try {
      const { error } = await supabase.from('reservations').insert({
        id,
        customer_name: resData.customerName,
        email: resData.email,
        phone: resData.phone,
        type: resData.type,
        description: resData.description,
        surface: resData.surface,
        neighborhood: resData.neighborhood,
        preferred_dates: resData.preferredDates,
        budget: resData.budget,
        photos: resData.photos,
        status,
        created_at: createdAt
      });
      if (error) throw error;
      setReservations(prev => [{ ...resData, id, status, createdAt }, ...prev]);
    } catch (e) {
      console.error("Failed to add reservation to DB:", e);
    }
  };

  const addCustomOrder = async (orderData: Omit<CustomOrder, 'id' | 'status' | 'createdAt'>) => {
    const id = `CUST-${Date.now().toString().slice(-4)}`;
    const status = 'Étude';
    const createdAt = new Date().toISOString();

    try {
      const { error } = await supabase.from('custom_orders').insert({
        id,
        customer_name: orderData.customerName,
        email: orderData.email,
        description: orderData.description,
        dimensions: orderData.dimensions,
        finish: orderData.finish,
        color: orderData.color,
        type: orderData.type,
        moodboard: orderData.moodboard,
        preferred_deadline: orderData.preferredDeadline,
        status,
        created_at: createdAt
      });
      if (error) throw error;
      setCustomOrders(prev => [{ ...orderData, id, status, createdAt }, ...prev]);
    } catch (e) {
      console.error("Failed to add custom order to DB:", e);
    }
  };

  const updateReservationStatus = async (id: string, status: Reservation['status']) => {
    try {
      const { error } = await supabase.from('reservations').update({ status }).eq('id', id);
      if (error) throw error;
      setReservations(prev => prev.map(res => res.id === id ? { ...res, status } : res));
    } catch (e) {
      console.error("Failed to update reservation status in DB:", e);
    }
  };

  const updateCustomOrderStatus = async (id: string, status: CustomOrder['status']) => {
    try {
      const { error } = await supabase.from('custom_orders').update({ status }).eq('id', id);
      if (error) throw error;
      setCustomOrders(prev => prev.map(order => order.id === id ? { ...order, status } : order));
    } catch (e) {
      console.error("Failed to update custom order status in DB:", e);
    }
  };

  return (
    <ReservationContext.Provider value={{ 
      reservations, 
      customOrders, 
      addReservation, 
      addCustomOrder, 
      updateReservationStatus, 
      updateCustomOrderStatus,
      refreshAll: fetchData
    }}>
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

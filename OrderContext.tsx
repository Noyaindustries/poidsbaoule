import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order } from '@/types';
import { supabase } from './supabase';

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  confirmFinalPayment: (orderId: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        // Map snake_case from DB to camelCase for TS
        const mapped: Order[] = data.map((o: any) => ({
          id: o.id,
          userId: o.user_id,
          customerName: o.customer_name,
          customerEmail: o.customer_email,
          customerPhone: o.customer_phone,
          items: o.items,
          total: o.total,
          status: o.status,
          paymentMethod: o.payment_method,
          paymentStrategy: o.payment_strategy,
          amountPaid: o.amount_paid,
          balanceDue: o.balance_due,
          shippingAddress: o.shipping_address,
          createdAt: o.created_at
        }));
        setOrders(mapped);
      }
    } catch (e) {
      console.error("Failed to fetch orders:", e);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const addOrder = async (order: Order) => {
    try {
      const { error } = await supabase
        .from('orders')
        .insert({
          id: order.id,
          user_id: order.userId,
          customer_name: order.customerName,
          customer_email: order.customerEmail,
          customer_phone: order.customerPhone,
          items: order.items,
          total: order.total,
          status: order.status,
          payment_method: order.paymentMethod,
          payment_strategy: order.paymentStrategy,
          amount_paid: order.amountPaid,
          balance_due: order.balanceDue,
          shipping_address: order.shippingAddress,
          created_at: order.createdAt
        });
      
      if (error) throw error;
      setOrders(prev => [order, ...prev]);
    } catch (e) {
      console.error("Failed to add order to DB:", e);
      setOrders(prev => [order, ...prev]);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      
      if (error) throw error;
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (e) {
      console.error("Failed to update status in DB:", e);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    }
  };

  const confirmFinalPayment = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const updates = { 
      amount_paid: order.total, 
      balance_due: 0, 
      status: 'Paiement reçu' as const 
    };

    try {
      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId);
      
      if (error) throw error;
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, amountPaid: o.total, balanceDue: 0, status: 'Paiement reçu' } : o
      ));
    } catch (e) {
      console.error("Failed to confirm payment in DB:", e);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);
      
      if (error) throw error;
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (e) {
      console.error("Failed to delete order from DB:", e);
    }
  };

  return (
    <OrderContext.Provider value={{ 
      orders, 
      addOrder, 
      updateOrderStatus, 
      confirmFinalPayment, 
      deleteOrder,
      refreshOrders: fetchOrders
    }}>
      {children}
    </OrderContext.Provider>
  );
};

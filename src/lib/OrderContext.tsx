import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order } from '@/types';
import { apiJson } from './api';

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  validateHalfDeposit: (orderId: string) => Promise<void>;
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
      const data = await apiJson<Order[]>('/api/orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch orders:', e);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const addOrder = async (order: Order) => {
    try {
      await apiJson('/api/orders', {
        method: 'POST',
        body: JSON.stringify(order),
      });
      setOrders((prev) => [order, ...prev]);
    } catch (e) {
      console.error('Failed to add order to DB:', e);
      throw e;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await apiJson(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    } catch (e) {
      console.error('Failed to update status in DB:', e);
      throw e;
    }
  };

  const confirmFinalPayment = async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    try {
      await apiJson(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          amountPaid: order.total,
          balanceDue: 0,
          status: 'Paiement reçu',
        }),
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, amountPaid: o.total, balanceDue: 0, status: 'Paiement reçu' } : o
        )
      );
    } catch (e) {
      console.error('Failed to confirm payment in DB:', e);
    }
  };

  const validateHalfDeposit = async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const halfPaid = Math.round(order.total / 2);
    const balance = Math.max(order.total - halfPaid, 0);
    try {
      await apiJson(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          amountPaid: halfPaid,
          balanceDue: balance,
          status: 'En attente de paiement',
        }),
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, amountPaid: halfPaid, balanceDue: balance, status: 'En attente de paiement' } : o
        )
      );
    } catch (e) {
      console.error('Failed to validate half deposit in DB:', e);
      throw e;
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await apiJson(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'DELETE',
      });
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (e) {
      console.error('Failed to delete order from DB:', e);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        updateOrderStatus,
        validateHalfDeposit,
        confirmFinalPayment,
        deleteOrder,
        refreshOrders: fetchOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

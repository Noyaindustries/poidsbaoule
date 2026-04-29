export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Sculptures & Masques' | 'Mobilier Niche' | 'Miroirs d\'Art' | 'Vases & Objets Déco' | 'Sur Mesure';
  images: string[];
  dimensions: string;
  stock: number;
  badge?: 'Pièce unique' | 'Fait main' | 'Nouveau' | 'Best-seller' | 'Sur commande';
  finishes?: string[];
  colors?: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Reservation {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  type: 'Consultation déco' | 'Aménagement complet' | 'Conseil couleurs' | 'Mise en scène';
  description: string;
  surface: number;
  neighborhood: string;
  preferredDates: Date[];
  budget: string;
  photos: string[];
  status: 'Demande reçue' | 'Confirmée' | 'En cours' | 'Terminée' | 'Annulée';
  createdAt: string;
}

export interface CustomOrder {
  id: string;
  customerName: string;
  email: string;
  description: string;
  dimensions: string;
  finish: string;
  color: string;
  type: string;
  moodboard: string[];
  preferredDeadline: string;
  status: 'Étude' | 'Fabrication' | 'Finition' | 'Prêt à livrer';
  createdAt: string;
}

export interface Discount {
  id: string;
  amount: number;
  expiryDate: string;
  isUsed: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'admin' | 'customer';
  segment: 'Nouveau' | 'Régulier' | 'VIP';
  wallet: Discount[];
  wishlist: string[];
  addresses: Address[];
  city?: string;
}

export interface Address {
  id: string;
  street: string;
  city: string;
  country: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: CartItem[];
  total: number;
  status: 'En attente de paiement' | 'Paiement reçu' | 'En préparation' | 'Expédiée' | 'Livrée' | 'Annulée';
  paymentMethod: 'Wave' | 'Orange Money' | 'Virement' | 'Cash';
  paymentStrategy: 'FULL' | '50-50' | 'CASH';
  amountPaid: number;
  balanceDue: number;
  shippingAddress: Address;
  createdAt: string;
}
export interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiryDate?: string;
  isActive: boolean;
  usageCount: number;
  announcementText: string;
  createdAt: string;
}

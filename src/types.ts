/** Catégorie boutique (nom + visuel pour filtres et admin). */
export type ShopCategoryRecord = {
  name: string;
  imageUrl: string;
};

/** Commentaire client sur une fiche produit (API `/api/products/:id/comments`). */
export interface ProductComment {
  id: string;
  productId: string;
  authorName: string;
  authorEmail?: string;
  body: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  userId?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  /** Libellé aligné sur les catégories gérées dans l’admin (liste dynamique). */
  category: string;
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
  serviceDetails?: {
    projectType: 'Résidentiel' | 'Commercial' | 'Hôtellerie' | 'Bureau' | 'Autre';
    interventionType: 'À domicile' | 'À distance' | 'Hybride';
    preferredDate: string;
    preferredTimeSlot: 'Matin (09h-12h)' | 'Après-midi (14h-18h)' | 'Soirée (18h-20h)';
    estimatedDurationHours: number;
    roomsInScope: string[];
    options: {
      shoppingList: boolean;
      3dPlan: boolean;
      installationStyling: boolean;
      followUpVisit: boolean;
    };
    location: {
      city: string;
      neighborhood: string;
      addressNote?: string;
    };
    estimatedCost: number;
    notes?: string;
  };
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
  customization?: {
    pieceCategory: 'Masque' | 'Miroir' | 'Meuble Niche' | 'Vase / Objet Déco' | 'Luminaire' | 'Autre';
    quantity: number;
    dimensionsCm: {
      width: number;
      height: number;
      depth?: number;
    };
    palette: string[];
    finishOptions: string[];
    usageContext: 'Intérieur' | 'Extérieur' | 'Mixte';
    budgetRange:
      | 'Moins de 100 000 FCFA'
      | '100 000 - 300 000 FCFA'
      | '300 000 - 600 000 FCFA'
      | 'Plus de 600 000 FCFA';
    constraints: string[];
    optionalServices: {
      homeDelivery: boolean;
      onSiteInstallation: boolean;
      expeditedProduction: boolean;
    };
    estimatedPrice: number;
    notes?: string;
  };
  status:
    | 'Nouveau'
    | 'Étude & devis'
    | 'Validation client'
    | 'En fabrication'
    | 'Finition'
    | 'Prêt à livrer'
    | 'Livré'
    | 'Annulé'
    // Compatibilité données existantes
    | 'Étude'
    | 'Fabrication';
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
  paymentMethod: 'Wave' | 'Orange Money';
  paymentStrategy: 'FULL' | '50-50' | 'CASH';
  amountPaid: number;
  balanceDue: number;
  /** Référence / ID de transaction mobile money (optionnel, saisi par le client). */
  paymentReference?: string;
  /** Identifiant de confirmation serveur (preuve d'encaissement). */
  paymentConfirmationId?: string;
  /** Identifiant de transaction confirmé par le backend. */
  paymentTransactionId?: string;
  /** Horodatage de confirmation serveur du prélèvement. */
  paymentConfirmedAt?: string;
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

/** Témoignage affiché sur la vitrine (stocké en base, géré depuis l’admin). */
export type CustomerTestimonial = {
  id: string;
  author: string;
  role: string;
  location?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  quote: string;
  /** Carte large mise en avant (un seul à la fois côté API). */
  featured?: boolean;
  /** Libellé court type « Masque • salon » */
  context?: string;
  date?: string;
  verifiedPurchase?: boolean;
  /** Ordre d’affichage (plus petit = plus haut). */
  sortOrder?: number;
  createdAt?: string;
};

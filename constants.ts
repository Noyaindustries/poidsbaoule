import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Masque Songe Rêvé',
    description: 'Une œuvre originale sculptée à la main en ciment blanc et plâtre, célébrant l\'esthétique Wabi-Sabi.',
    price: 100000,
    category: 'Sculptures & Masques',
    images: [
      '/PHOTO-2026-04-15-18-25-34.jpg',
      '/PHOTO-2026-04-15-18-25-34_1.jpg',
      '/PHOTO-2026-04-15-18-25-33_3.jpg'
    ],
    dimensions: '1m20 × 80 cm',
    stock: 1,
    badge: 'Pièce unique'
  },
  {
    id: '2',
    name: 'Masque Présence',
    description: 'Masque sculptural imposant, idéal pour une pièce maîtresse de salon.',
    price: 150000,
    category: 'Sculptures & Masques',
    images: [
      '/PHOTO-2026-04-15-18-25-33_4.jpg',
      '/PHOTO-2026-04-15-18-25-33_1.jpg',
      '/PHOTO-2026-04-15-18-25-32_4.jpg'
    ],
    dimensions: '1m20 × 70 cm',
    stock: 1,
    badge: 'Pièce unique'
  },
  {
    id: '3',
    name: 'Arcadia 6 Colonnes',
    description: 'Meuble niche architectural inspiré des colonnades classiques avec une touche moderne africaine.',
    price: 150000,
    category: 'Mobilier Niche',
    images: [
      '/PHOTO-2026-04-15-18-25-34_2.jpg',
      '/PHOTO-2026-04-15-18-25-32_2.jpg',
      '/PHOTO-2026-04-15-18-25-35.jpg'
    ],
    dimensions: 'L 1m65 × H 81 cm × P 35 cm',
    stock: 2,
    badge: 'Fait main'
  },
  {
    id: '4',
    name: 'Miroir Reflet Rustique',
    description: 'Miroir d\'art avec cadre texturé en plâtre et ciment, finition naturelle.',
    price: 95000,
    category: 'Miroirs d\'Art',
    images: [
      '/PHOTO-2026-04-15-18-25-33_2.jpg',
      '/PHOTO-2026-04-15-18-25-33.jpg',
      '/PHOTO-2026-04-15-18-25-32_1.jpg'
    ],
    dimensions: '1m × 83 cm',
    stock: 3,
    badge: 'Nouveau'
  },
  {
    id: '5',
    name: 'Meuble Niche Arcadia',
    description: 'Petit meuble niche polyvalent pour objets de décoration.',
    price: 75000,
    category: 'Mobilier Niche',
    images: [
      '/PHOTO-2026-04-15-18-25-33.jpg',
      '/PHOTO-2026-04-15-18-25-32.jpg',
      '/PHOTO-2026-04-15-18-25-32_3.jpg'
    ],
    dimensions: 'L 83 cm × H 77 cm',
    stock: 5,
    badge: 'Best-seller'
  }
];

export const CATEGORIES = [
  'Sculptures & Masques',
  'Mobilier Niche',
  'Miroirs d\'Art',
  'Vases & Objets Déco',
  'Sur Mesure'
];

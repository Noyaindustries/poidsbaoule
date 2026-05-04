import type { Product, ShopCategoryRecord } from './types';

/** Image de secours si une catégorie n’a pas encore de visuel défini. */
export const FALLBACK_CATEGORY_IMAGE = '/PHOTO-2026-04-15-18-25-32.jpg';

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

export const DEFAULT_SHOP_CATEGORIES: ShopCategoryRecord[] = [
  { name: 'Sculptures & Masques', imageUrl: '/PHOTO-2026-04-15-18-25-34.jpg' },
  { name: 'Mobilier Niche', imageUrl: '/PHOTO-2026-04-15-18-25-34_2.jpg' },
  { name: 'Miroirs d\'Art', imageUrl: '/PHOTO-2026-04-15-18-25-33_2.jpg' },
  { name: 'Vases & Objets Déco', imageUrl: '/PHOTO-2026-04-15-18-25-32_1.jpg' },
  { name: 'Sur Mesure', imageUrl: '/PHOTO-2026-04-15-18-25-35.jpg' },
];

/** Noms seuls (rétrocompatibilité, seed, etc.). */
export const CATEGORIES = DEFAULT_SHOP_CATEGORIES.map((c) => c.name);

/** Lien court WhatsApp Business (click-to-chat). */
export const WHATSAPP_STORE_CHAT_URL = 'https://wa.me/message/AEEE7AR4EJBHL1';

/** WhatsApp boutique — affichage (national CI, 01 + 52593536). */
export const WHATSAPP_STORE_DISPLAY = '01 52 59 35 36';

/**
 * Numéro pour `wa.me` / `tel:` sans + ni espaces (225 + indicatif national avec 0 : 01 52 59 35 36).
 * Les liens avec texte prérempli utilisent ce format ; le lien court {@link WHATSAPP_STORE_CHAT_URL} reste pour ouverture simple.
 * @see https://faq.whatsapp.com/general/contacts/how-to-use-click-to-chat
 */
export const WHATSAPP_STORE_PHONE_E164 = '2250152593536';

/**
 * Ouvre le chat boutique via le lien court Business (sans texte prérempli).
 * Les URLs `wa.me/message/…?text=` ne préremplissent pas le message de façon fiable ; pour un texte prérempli, utiliser le numéro (`wa.me/{phone}?text=`).
 */
export function buildWhatsAppStoreUrl(body?: string): string {
  const base = WHATSAPP_STORE_CHAT_URL;
  if (!body?.trim()) return base;
  const joiner = base.includes('?') ? '&' : '?';
  return `${base}${joiner}text=${encodeURIComponent(body)}`;
}

/** Click-to-chat avec texte prérempli (numéro international sans + ni espaces). */
export function buildWhatsAppPhonePrefillUrl(phoneE164Digits: string, body: string): string {
  const digits = phoneE164Digits.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(body)}`;
}

const WHATSAPP_PRODUCT_DESC_MAX = 440;

function absoluteProductImageUrl(origin: string, imageSrc: string): string {
  const base = origin.replace(/\/$/, '');
  if (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) return imageSrc;
  const path = imageSrc.startsWith('/') ? imageSrc : `/${imageSrc}`;
  return `${base}${path}`;
}

function truncateForWhatsApp(text: string, max: number): string {
  const t = text.trim().replace(/\s+/g, ' ');
  if (t.length <= max) return t;
  return `${t.slice(0, Math.max(0, max - 1))}…`;
}

/**
 * Lien WhatsApp avec message prérempli décrivant la pièce (fiche produit).
 * @param productPageUrl URL absolue de la fiche (ex. `https://…/product/1`) — passée depuis le client.
 */
export function buildWhatsAppProductUrl(
  product: Product,
  quantity = 1,
  productPageUrl?: string
): string {
  const priceLabel = `${product.price.toLocaleString('fr-FR')} FCFA`;
  const desc = truncateForWhatsApp(product.description, WHATSAPP_PRODUCT_DESC_MAX);

  let photoUrl: string | undefined;
  if (productPageUrl && product.images[0]) {
    try {
      const origin = new URL(productPageUrl).origin;
      photoUrl = absoluteProductImageUrl(origin, product.images[0]);
    } catch {
      /* URL de fiche invalide : pas de lien photo absolu */
    }
  }

  const lines = [
    'Bonjour Poids Baoulé,',
    '',
    'Je vous contacte au sujet de cette pièce :',
    '',
    `• Nom : ${product.name}`,
    `• Référence : ${product.id}`,
    ...(photoUrl ? ['', `Photo (aperçu) : ${photoUrl}`, ''] : []),
    `• Catégorie : ${product.category}`,
    ...(product.badge ? [`• Badge : ${product.badge}`] : []),
    `• Dimensions : ${product.dimensions}`,
    ...(product.finishes?.length ? [`• Finitions : ${product.finishes.join(', ')}`] : []),
    ...(product.colors?.length ? [`• Couleurs : ${product.colors.join(', ')}`] : []),
    `• Stock : ${product.stock}`,
    `• Prix affiché : ${priceLabel}`,
    `• Quantité souhaitée : ${quantity}`,
    '',
    'Description :',
    desc,
    '',
    ...(productPageUrl ? [`Lien fiche produit : ${productPageUrl}`, ''] : []),
    'Merci pour votre retour.',
  ];
  return buildWhatsAppPhonePrefillUrl(WHATSAPP_STORE_PHONE_E164, lines.join('\n'));
}

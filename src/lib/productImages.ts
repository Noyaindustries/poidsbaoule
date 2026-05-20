import type { Product } from '@/types';
import { FALLBACK_CATEGORY_IMAGE } from '@/constants';

export function sanitizeImageList(images: unknown): string[] {
  if (!Array.isArray(images)) return [FALLBACK_CATEGORY_IMAGE];
  const clean = images.filter(
    (x): x is string => typeof x === 'string' && x.trim().length > 0 && !isEmbeddedImage(x)
  );
  return clean.length > 0 ? clean : [FALLBACK_CATEGORY_IMAGE];
}

export function isEmbeddedImage(src: string): boolean {
  return src.startsWith('data:');
}

export function primaryProductImage(product: Product): string {
  const first = product.images?.find((src) => src && !isEmbeddedImage(src));
  return first ?? product.images?.[0] ?? FALLBACK_CATEGORY_IMAGE;
}

const FEATURED_BADGE_ORDER: Record<string, number> = {
  'Pièce unique': 0,
  'Best-seller': 1,
  Nouveau: 2,
  'Fait main': 3,
  'Sur commande': 4,
};

/** Sélection accueil : pièces en stock, badges prioritaires, max 4. */
export function pickFeaturedProducts(products: Product[], limit = 4): Product[] {
  const inStock = products.filter((p) => p.stock > 0);
  const pool = inStock.length > 0 ? inStock : products;
  return [...pool]
    .sort((a, b) => {
      const ba = a.badge ? (FEATURED_BADGE_ORDER[a.badge] ?? 5) : 6;
      const bb = b.badge ? (FEATURED_BADGE_ORDER[b.badge] ?? 5) : 6;
      if (ba !== bb) return ba - bb;
      return b.id.localeCompare(a.id);
    })
    .slice(0, limit);
}

export function sortProductsFeatured(products: Product[]): Product[] {
  return pickFeaturedProducts([...products], products.length);
}

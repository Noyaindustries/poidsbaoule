import { rewriteLegacyUploadUrl } from './product-media';

/** Image par défaut si le catalogue ne contient que des data URLs (legacy). */
export const PRODUCT_IMAGE_FALLBACK = '/PHOTO-2026-04-15-18-25-32.jpg';

export function isEmbeddedImage(src: string): boolean {
  return src.startsWith('data:');
}

function normalizeImageUrl(src: string): string {
  return rewriteLegacyUploadUrl(src.trim());
}

/** Retire les images base64 du payload API (perf + cache navigateur). */
export function sanitizeImageList(images: unknown): string[] {
  if (!Array.isArray(images)) return [PRODUCT_IMAGE_FALLBACK];
  const clean = images
    .filter(
      (x): x is string => typeof x === 'string' && x.trim().length > 0 && !isEmbeddedImage(x)
    )
    .map(normalizeImageUrl);
  return clean.length > 0 ? clean : [PRODUCT_IMAGE_FALLBACK];
}

export function sanitizeProductDoc<T extends Record<string, unknown>>(doc: T): T & { images: string[] } {
  return { ...doc, images: sanitizeImageList(doc.images) };
}

const MAX_LIST_DESCRIPTION = 320;

/** Payload léger pour GET /api/products (évite Function.ResponseSizeTooLarge sur Netlify). */
export function toCatalogListItem(doc: Record<string, unknown>): Record<string, unknown> {
  const full = sanitizeProductDoc(doc);
  const description =
    typeof full.description === 'string'
      ? full.description.length > MAX_LIST_DESCRIPTION
        ? `${full.description.slice(0, MAX_LIST_DESCRIPTION)}…`
        : full.description
      : '';
  return {
    id: full.id,
    name: full.name,
    description,
    price: full.price,
    category: full.category,
    images: full.images.slice(0, 1),
    dimensions: full.dimensions,
    stock: full.stock,
    badge: full.badge,
    ...(Array.isArray(full.finishes) && full.finishes.length ? { finishes: full.finishes } : {}),
    ...(Array.isArray(full.colors) && full.colors.length ? { colors: full.colors } : {}),
  };
}

export function docHasEmbeddedImages(doc: Record<string, unknown>): boolean {
  if (!Array.isArray(doc.images)) return false;
  return doc.images.some((x) => typeof x === 'string' && isEmbeddedImage(x));
}

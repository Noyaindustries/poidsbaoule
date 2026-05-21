import fs from 'fs';
import path from 'path';
import type { Db } from 'mongodb';
import { Binary } from 'mongodb';

const COLLECTION = 'product_media';

export function productMediaKey(filename: string): string {
  return `products/${filename}`;
}

export function productMediaPublicUrl(filename: string): string {
  return `/api/media/products/${filename}`;
}

/** Réécrit les anciennes URLs disque vers l’API (Netlify + proxy Vite). */
export function rewriteLegacyUploadUrl(url: string): string {
  if (url.startsWith('/uploads/products/')) {
    const name = url.slice('/uploads/products/'.length);
    return productMediaPublicUrl(name);
  }
  return url;
}

export async function saveProductMedia(
  db: Db,
  filename: string,
  contentType: string,
  buffer: Buffer
): Promise<string> {
  const key = productMediaKey(filename);
  await db.collection(COLLECTION).replaceOne(
    { key },
    {
      key,
      contentType,
      data: new Binary(buffer),
      updatedAt: new Date().toISOString(),
    },
    { upsert: true }
  );
  return productMediaPublicUrl(filename);
}

function binaryToBuffer(data: unknown): Buffer | null {
  if (!data) return null;
  if (Buffer.isBuffer(data)) return data;
  if (data instanceof Binary) {
    return Buffer.from(data.buffer);
  }
  return null;
}

export async function loadProductMedia(
  db: Db,
  filename: string,
  diskFallbackDir?: string
): Promise<{ contentType: string; buffer: Buffer } | null> {
  const key = productMediaKey(filename);
  const doc = await db.collection(COLLECTION).findOne({ key });
  const buffer = doc ? binaryToBuffer(doc.data) : null;
  if (buffer && buffer.length > 0) {
    return {
      contentType: String(doc.contentType || 'image/jpeg'),
      buffer,
    };
  }

  if (diskFallbackDir) {
    const filePath = path.join(diskFallbackDir, filename);
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      const ext = path.extname(filename).toLowerCase();
      const contentType =
        ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
      await saveProductMedia(db, filename, contentType, buffer);
      return { contentType, buffer };
    }
  }

  return null;
}

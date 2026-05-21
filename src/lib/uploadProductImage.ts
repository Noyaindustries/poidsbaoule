import { apiFormData, apiJson } from '@/lib/api';
import { compressImageFile } from '@/lib/compressImageFile';

type UploadResponse = {
  url: string;
  originalName: string;
  size: number;
  mimeType: string;
};

type UploadDataResponse = {
  file: UploadResponse;
};

async function uploadViaMultipart(blob: Blob, filename: string): Promise<string> {
  const body = new FormData();
  body.append('file', blob, filename);
  const data = await apiFormData<UploadDataResponse>('/api/products/upload', body);
  return data.file.url;
}

async function uploadViaBase64(blob: Blob, filename: string): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  const base64 = btoa(binary);
  const data = await apiJson<UploadDataResponse>('/api/products/upload-data', {
    method: 'POST',
    body: JSON.stringify({
      filename,
      contentType: 'image/jpeg',
      base64,
    }),
  });
  return data.file.url;
}

export type UploadImageResult = { url: string; warning?: string };

export async function uploadProductImage(file: File): Promise<UploadImageResult> {
  const { blob, sizeWarning } = await compressImageFile(file);
  const filename = `product-${Date.now()}.jpg`;

  let url: string;
  try {
    url = await uploadViaMultipart(blob, filename);
  } catch {
    url = await uploadViaBase64(blob, filename);
  }
  return { url, warning: sizeWarning };
}

export function formatImageRequirements(): string {
  return `JPG, PNG ou WebP · max 5 Mo · idéal ${1200}×${1200} px (petites images acceptées)`;
}

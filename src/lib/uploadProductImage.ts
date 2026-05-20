import { apiFormData } from '@/lib/api';

type UploadResponse = {
  url: string;
  originalName: string;
  size: number;
  mimeType: string;
};

export async function uploadProductImage(file: File): Promise<string> {
  const body = new FormData();
  body.append('file', file);
  const data = await apiFormData<{ file: UploadResponse }>('/api/products/upload', body);
  return data.file.url;
}

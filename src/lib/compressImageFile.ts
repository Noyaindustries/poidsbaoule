/** Seuil en dessous duquel on avertit (upload toujours autorisé). */
export const IMAGE_WARN_MIN_WIDTH = 400;
export const IMAGE_WARN_MIN_HEIGHT = 400;
export const IMAGE_RECOMMENDED = 1200;
export const IMAGE_MAX_FILE_BYTES = 5 * 1024 * 1024;

export type CompressedImage = {
  blob: Blob;
  width: number;
  height: number;
  mimeType: string;
  sizeWarning?: string;
};

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Fichier image illisible.'));
    };
    img.src = url;
  });
}

/**
 * Redimensionne (max 1600 px) et compresse en JPEG pour l’upload MongoDB.
 */
export async function compressImageFile(file: File): Promise<CompressedImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Choisissez une image JPG, PNG ou WebP.');
  }
  if (file.size > IMAGE_MAX_FILE_BYTES) {
    throw new Error('Fichier trop lourd (maximum 5 Mo).');
  }

  const img = await loadImageFromFile(file);
  let sizeWarning: string | undefined;
  if (img.width < IMAGE_WARN_MIN_WIDTH || img.height < IMAGE_WARN_MIN_HEIGHT) {
    sizeWarning = `Image petite (${img.width}×${img.height} px). Pour un rendu net en boutique, visez au moins ${IMAGE_RECOMMENDED}×${IMAGE_RECOMMENDED} px.`;
  }

  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Compression impossible dans ce navigateur.');
  ctx.drawImage(img, 0, 0, w, h);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Compression impossible.'))),
      'image/jpeg',
      0.88
    );
  });

  return { blob, width: w, height: h, mimeType: 'image/jpeg', sizeWarning };
}

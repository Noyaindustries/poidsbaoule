/** Taille max. recommandée (base64 grossit ~33 % dans le stockage navigateur). */
const DEFAULT_MAX_BYTES = 2_500_000;

/**
 * Lit un fichier image et renvoie une data URL (base64), utilisable dans `src` d’une balise img
 * ou enregistrée dans localStorage. Pas d’upload serveur.
 */
export function readImageFileAsDataUrl(
  file: File,
  options?: { maxBytes?: number }
): Promise<string> {
  const maxBytes = options?.maxBytes ?? DEFAULT_MAX_BYTES;
  if (!file.type.startsWith('image/')) {
    throw new Error('Choisissez un fichier image (JPEG, PNG, WebP, GIF, etc.).');
  }
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / 1024 / 1024);
    throw new Error(`Fichier trop volumineux (maximum environ ${mb} Mo pour un stockage local).`);
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') resolve(result);
      else reject(new Error('Lecture du fichier impossible.'));
    };
    reader.onerror = () => reject(new Error('Lecture du fichier impossible.'));
    reader.readAsDataURL(file);
  });
}

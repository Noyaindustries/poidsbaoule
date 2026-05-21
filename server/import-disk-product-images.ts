/**
 * Importe les fichiers déjà présents dans uploads/products/ vers MongoDB.
 * Utile après un upload local avant déploiement Netlify.
 * Usage : npm run import:disk-product-images
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { closeDb, getDb } from './db';
import { saveProductMedia } from './product-media';

async function main() {
  const dir = path.join(process.cwd(), 'uploads', 'products');
  if (!fs.existsSync(dir)) {
    console.log('Aucun dossier uploads/products — rien à importer.');
    await closeDb();
    return;
  }
  const db = await getDb();
  const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  for (const filename of files) {
    const buffer = fs.readFileSync(path.join(dir, filename));
    const ext = path.extname(filename).toLowerCase();
    const contentType =
      ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    const url = await saveProductMedia(db, filename, contentType, buffer);
    console.log(`  ✓ ${filename} → ${url}`);
  }
  console.log(`\n${files.length} fichier(s) importé(s) dans MongoDB.`);
  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

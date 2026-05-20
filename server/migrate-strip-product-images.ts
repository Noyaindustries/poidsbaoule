/**
 * Retire les images base64 des produits MongoDB (une fois).
 * Usage : npm run migrate:strip-product-images
 */
import 'dotenv/config';
import { closeDb, getDb } from './db';
import { docHasEmbeddedImages, sanitizeImageList } from './product-images';

async function main() {
  const db = await getDb();
  const col = db.collection('products');
  const rows = await col.find({}).toArray();
  let updated = 0;
  for (const row of rows) {
    const { _id, ...p } = row;
    const doc = p as Record<string, unknown>;
    if (!docHasEmbeddedImages(doc)) continue;
    await col.updateOne({ id: doc.id }, { $set: { images: sanitizeImageList(doc.images) } });
    updated += 1;
    console.log(`  ✓ ${String(doc.id)} — images nettoyées`);
  }
  await db.collection('app_meta').updateOne(
    { key: 'stripped_product_images_v1' },
    {
      $set: {
        key: 'stripped_product_images_v1',
        updatedAt: new Date().toISOString(),
        productsUpdated: updated,
      },
    },
    { upsert: true }
  );
  console.log(`\nTerminé : ${updated} produit(s) mis à jour sur ${rows.length}.`);
  await closeDb();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

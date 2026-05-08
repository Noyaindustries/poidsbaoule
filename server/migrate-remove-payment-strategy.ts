import 'dotenv/config';
import { closeDb, getDb } from './db';

async function main() {
  const db = await getDb();
  const orders = db.collection('orders');

  const withField = await orders.countDocuments({ paymentStrategy: { $exists: true } });
  if (withField === 0) {
    console.log('[migrate] Aucun document a nettoyer: paymentStrategy absent.');
    return;
  }

  const result = await orders.updateMany(
    { paymentStrategy: { $exists: true } },
    { $unset: { paymentStrategy: '' } }
  );

  const remaining = await orders.countDocuments({ paymentStrategy: { $exists: true } });

  console.log(`[migrate] Commandes ciblees: ${withField}`);
  console.log(`[migrate] Documents modifies: ${result.modifiedCount}`);
  console.log(`[migrate] Restants avec paymentStrategy: ${remaining}`);
}

main()
  .then(() => closeDb())
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('[migrate] Echec migration remove paymentStrategy:', error);
    closeDb().finally(() => process.exit(1));
  });

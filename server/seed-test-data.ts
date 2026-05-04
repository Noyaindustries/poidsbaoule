/**
 * Données de démonstration (MongoDB).
 * Mot de passe pour tous les comptes seed : demo123
 *
 *   npx tsx server/seed-test-data.ts
 *   npm run seed:test
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { getDb, closeDb } from './db';
import { PRODUCTS } from '../src/constants';

const DEMO_PASSWORD = 'demo123';

const testUsers = [
  {
    id: 'seed-user-admin',
    email: 'admin@demo.poidsbaoule.local',
    name: 'Admin Démo',
    phone: '+225 07 00 00 01',
    role: 'admin' as const,
    segment: 'VIP' as const,
    wallet: [] as const,
    wishlist: ['1', '2'] as string[],
    addresses: [
      {
        id: 'seed-addr-admin',
        street: 'Boulevard Latrille, II Plateaux',
        city: 'Abidjan',
        country: "Côte d'Ivoire",
        isDefault: true,
      },
    ],
    city: 'Abidjan',
  },
  {
    id: 'seed-user-client',
    email: 'client@demo.poidsbaoule.local',
    name: 'Aminata Koné',
    phone: '+225 07 11 22 33',
    role: 'customer' as const,
    segment: 'Régulier' as const,
    wallet: [
      {
        id: 'seed-disc-1',
        amount: 5000,
        expiryDate: new Date(Date.now() + 30 * 864e5).toISOString(),
        isUsed: false,
        createdAt: new Date().toISOString(),
      },
    ],
    wishlist: ['3'],
    addresses: [
      {
        id: 'seed-addr-1',
        street: 'Rue du Commerce, Marcory',
        city: 'Abidjan',
        country: "Côte d'Ivoire",
        isDefault: true,
      },
    ],
    city: 'Abidjan',
  },
  {
    id: 'seed-user-nouveau',
    email: 'nouveau@demo.poidsbaoule.local',
    name: 'Kouassi Yao',
    phone: '+225 05 44 55 66',
    role: 'customer' as const,
    segment: 'Nouveau' as const,
    wallet: [],
    wishlist: [],
    addresses: [],
    city: 'Bouaké',
  },
];

function cartFromProduct(index: number, quantity: number) {
  const p = PRODUCTS[index];
  if (!p) throw new Error(`Produit seed index ${index} introuvable`);
  return { ...p, quantity };
}

async function main() {
  const db = await getDb();
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const u of testUsers) {
    await db.collection('users').replaceOne(
      { id: u.id },
      { ...u, passwordHash: hash },
      { upsert: true }
    );
  }
  console.log(`[seed] ${testUsers.length} utilisateurs (mot de passe : ${DEMO_PASSWORD})`);

  const addr = testUsers[1].addresses[0];
  const p0 = PRODUCTS[0];
  const p1 = PRODUCTS[1];

  const orders = [
    {
      id: 'seed-order-1',
      userId: 'seed-user-client',
      customerName: 'Aminata Koné',
      customerEmail: 'client@demo.poidsbaoule.local',
      customerPhone: '+225 07 11 22 33',
      items: [cartFromProduct(0, 1)],
      total: p0.price,
      status: 'En préparation' as const,
      paymentMethod: 'Orange Money' as const,
      paymentStrategy: 'FULL' as const,
      amountPaid: p0.price,
      balanceDue: 0,
      shippingAddress: addr,
      createdAt: new Date(Date.now() - 5 * 864e5).toISOString(),
    },
    {
      id: 'seed-order-2',
      userId: 'seed-user-client',
      customerName: 'Aminata Koné',
      customerEmail: 'client@demo.poidsbaoule.local',
      customerPhone: '+225 07 11 22 33',
      items: [cartFromProduct(1, 1), cartFromProduct(4, 2)],
      total: p1.price + PRODUCTS[4].price * 2,
      status: 'En attente de paiement' as const,
      paymentMethod: 'Wave' as const,
      paymentStrategy: '50-50' as const,
      amountPaid: Math.round((p1.price + PRODUCTS[4].price * 2) / 2),
      balanceDue: Math.round((p1.price + PRODUCTS[4].price * 2) / 2),
      shippingAddress: addr,
      createdAt: new Date(Date.now() - 2 * 864e5).toISOString(),
    },
    {
      id: 'seed-order-3',
      userId: 'seed-user-nouveau',
      customerName: 'Kouassi Yao',
      customerEmail: 'nouveau@demo.poidsbaoule.local',
      customerPhone: '+225 05 44 55 66',
      items: [cartFromProduct(3, 1)],
      total: PRODUCTS[3].price,
      status: 'Livrée' as const,
      paymentMethod: 'Virement' as const,
      paymentStrategy: 'FULL' as const,
      amountPaid: PRODUCTS[3].price,
      balanceDue: 0,
      shippingAddress: {
        id: 'seed-addr-2',
        street: 'Quartier Commerce',
        city: 'Bouaké',
        country: "Côte d'Ivoire",
        isDefault: true,
      },
      createdAt: new Date(Date.now() - 20 * 864e5).toISOString(),
    },
  ];

  for (const o of orders) {
    await db.collection('orders').replaceOne({ id: o.id }, o, { upsert: true });
  }
  console.log(`[seed] ${orders.length} commandes`);

  const reservations = [
    {
      id: 'seed-res-1',
      customerName: 'Fatou Diallo',
      email: 'fatou.d@example.test',
      phone: '+225 07 99 88 77',
      type: 'Consultation déco' as const,
      description: 'Salon 35 m², style contemporain africain, tons terre.',
      surface: 35,
      neighborhood: 'Riviera',
      preferredDates: [new Date(Date.now() + 7 * 864e5).toISOString()],
      budget: '500 000 – 1 000 000 FCFA',
      photos: [] as string[],
      status: 'Confirmée' as const,
      createdAt: new Date(Date.now() - 3 * 864e5).toISOString(),
    },
    {
      id: 'seed-res-2',
      customerName: 'Yves Martin',
      email: 'yves.m@example.test',
      phone: '+33 6 12 34 56 78',
      type: 'Aménagement complet' as const,
      description: 'Appartement neuf 90 m², besoin clé en main.',
      surface: 90,
      neighborhood: 'Plateau',
      preferredDates: [
        new Date(Date.now() + 14 * 864e5).toISOString(),
        new Date(Date.now() + 21 * 864e5).toISOString(),
      ],
      budget: 'Sur devis',
      photos: ['/PHOTO-2026-04-15-18-25-32.jpg'],
      status: 'Demande reçue' as const,
      createdAt: new Date().toISOString(),
    },
  ];

  for (const r of reservations) {
    await db.collection('reservations').replaceOne({ id: r.id }, r, { upsert: true });
  }
  console.log(`[seed] ${reservations.length} réservations déco`);

  const customOrders = [
    {
      id: 'seed-cust-1',
      customerName: 'Aminata Koné',
      email: 'client@demo.poidsbaoule.local',
      description: 'Console murale avec niches asymétriques, finition brute.',
      dimensions: 'L 180 × H 90 × P 40 cm',
      finish: 'Brut patiné',
      color: 'Terre cuite',
      type: 'Mobilier niche',
      moodboard: ['/PHOTO-2026-04-15-18-25-34.jpg', '/PHOTO-2026-04-15-18-25-33.jpg'],
      preferredDeadline: new Date(Date.now() + 45 * 864e5).toISOString().slice(0, 10),
      status: 'Fabrication' as const,
      createdAt: new Date(Date.now() - 10 * 864e5).toISOString(),
    },
    {
      id: 'seed-cust-2',
      customerName: 'Ibrahim Ouattara',
      email: 'ibrahim.o@example.test',
      description: 'Paire de vases XL pour entrée immeuble.',
      dimensions: 'H 120 cm chacun',
      finish: 'Lisse',
      color: 'Blanc cassé',
      type: 'Vases',
      moodboard: [] as string[],
      preferredDeadline: new Date(Date.now() + 60 * 864e5).toISOString().slice(0, 10),
      status: 'Étude' as const,
      createdAt: new Date(Date.now() - 1 * 864e5).toISOString(),
    },
  ];

  for (const c of customOrders) {
    await db.collection('custom_orders').replaceOne({ id: c.id }, c, { upsert: true });
  }
  console.log(`[seed] ${customOrders.length} commandes sur mesure`);

  const promos = [
    {
      id: 'seed-promo-1',
      code: 'TESTDECO',
      discountType: 'percentage' as const,
      discountValue: 15,
      expiryDate: new Date(Date.now() + 90 * 864e5).toISOString(),
      isActive: true,
      usageCount: 2,
      announcementText: '–15 % sur une sélection déco (compte démo).',
      createdAt: new Date(Date.now() - 30 * 864e5).toISOString(),
    },
    {
      id: 'seed-promo-2',
      code: 'BIENVENUE5000',
      discountType: 'fixed' as const,
      discountValue: 5000,
      isActive: true,
      usageCount: 0,
      announcementText: '5000 FCFA de réduction sur votre première commande.',
      createdAt: new Date().toISOString(),
    },
  ];

  for (const p of promos) {
    await db.collection('promo_codes').replaceOne({ id: p.id }, p, { upsert: true });
  }
  console.log(`[seed] ${promos.length} codes promo`);

  console.log('\nComptes démo (connexion compte) :');
  console.log('  admin@demo.poidsbaoule.local / demo123');
  console.log('  client@demo.poidsbaoule.local / demo123');
  console.log('  nouveau@demo.poidsbaoule.local / demo123');
  console.log('Codes promo : TESTDECO, BIENVENUE5000\n');
}

main()
  .then(() => closeDb())
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    closeDb().finally(() => process.exit(1));
  });

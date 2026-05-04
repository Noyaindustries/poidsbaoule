import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { getDb } from './db';
import { PRODUCTS } from '../src/constants';
import type { CustomerTestimonial, ProductComment } from '../src/types';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

function toPublicUser(doc: Record<string, unknown>) {
  const { _id, passwordHash, ...rest } = doc;
  return rest;
}

async function seedProductsIfEmpty(): Promise<void> {
  const db = await getDb();
  const col = db.collection('products');
  const n = await col.countDocuments();
  if (n === 0 && PRODUCTS.length > 0) {
    await col.insertMany(
      PRODUCTS.map((p) => ({
        ...p,
        createdAt: new Date().toISOString(),
      }))
    );
    console.log(`[mongo] Catalogue initial : ${PRODUCTS.length} produits insérés.`);
  }
}

async function ensureIndexes(): Promise<void> {
  const db = await getDb();
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('products').createIndex({ id: 1 }, { unique: true });
  await db.collection('orders').createIndex({ id: 1 }, { unique: true });
  await db.collection('promo_codes').createIndex({ id: 1 }, { unique: true });
  await db.collection('promo_codes').createIndex({ code: 1 });
  await db.collection('testimonials').createIndex({ id: 1 }, { unique: true });
  await db.collection('product_comments').createIndex({ id: 1 }, { unique: true });
  await db.collection('product_comments').createIndex({ productId: 1, createdAt: -1 });
}

const SEED_TESTIMONIALS: CustomerTestimonial[] = [
  {
    id: 'pb-t-1',
    author: 'Sarah K.',
    role: 'Architecte d’intérieur',
    location: 'Abidjan',
    rating: 5,
    context: 'Projets résidentiels & showrooms',
    quote:
      'Les pièces Poids Baoulé apportent une âme rare à mes chantiers : la matière du ciment blanc, les volumes sculptés, la lumière qui vit sur les surfaces. Mes clients posent la même question — « où avez-vous trouvé ça ? »',
    featured: true,
    date: 'Déc. 2025',
    verifiedPurchase: true,
    sortOrder: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pb-t-2',
    author: 'Jean-Marc A.',
    role: 'Collectionneur',
    location: 'Paris',
    rating: 5,
    context: 'Masque — pièce unique',
    quote:
      'Un travail artisanal d’une finesse rare. Le masque est devenu le point focal de mon salon ; chaque invité s’arrête devant lui.',
    date: 'Nov. 2025',
    verifiedPurchase: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pb-t-3',
    author: 'Leila B.',
    role: 'Cliente',
    location: 'Marcory',
    rating: 5,
    context: 'Consultation déco',
    quote:
      'La consultation m’a aidée à structurer mon appartement autour d’une vraie direction Wabi-Sabi : matières, couleurs, et une sélection d’objets qui me ressemblent.',
    date: 'Janv. 2026',
    verifiedPurchase: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pb-t-4',
    author: 'Hervé D.',
    role: 'Directeur d’hôtel boutique',
    location: 'Grand-Bassam',
    rating: 5,
    context: 'Commande pro — luminaires',
    quote:
      'Délais tenus, finitions impeccables, communication claire. On a habillé nos suites avec des pièces qui racontent une histoire.',
    date: 'Oct. 2025',
    verifiedPurchase: true,
    sortOrder: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pb-t-5',
    author: 'Aminata S.',
    role: 'Styliste & créatrice',
    location: 'Cocody',
    rating: 5,
    context: 'Vases & miroirs',
    quote:
      'J’aime composer avec leurs silhouettes imparfaites : ça photographie magnifiquement et ça donne du caractère à mes mises en scène.',
    date: 'Sept. 2025',
    verifiedPurchase: false,
    sortOrder: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pb-t-6',
    author: 'Thomas L.',
    role: 'Entrepreneur',
    location: 'Lyon',
    rating: 5,
    context: 'Livraison internationale',
    quote:
      'Emballage soigné, pièce conforme aux photos. Le suivi a été rassurant du premier message à la réception.',
    date: 'Août 2025',
    verifiedPurchase: true,
    sortOrder: 5,
    createdAt: new Date().toISOString(),
  },
];

async function seedTestimonialsIfEmpty(): Promise<void> {
  const db = await getDb();
  const col = db.collection('testimonials');
  const n = await col.countDocuments();
  if (n === 0) {
    await col.insertMany(SEED_TESTIMONIALS);
    console.log(`[mongo] Témoignages initiaux : ${SEED_TESTIMONIALS.length} entrées.`);
  }
}

function clampRating(n: unknown): 1 | 2 | 3 | 4 | 5 {
  const v = Math.round(Number(n));
  if (Number.isNaN(v)) return 5;
  return Math.min(5, Math.max(1, v)) as 1 | 2 | 3 | 4 | 5;
}

// --- Products ---
app.get('/api/products', async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const rows = await db
      .collection('products')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    const mapped = rows.map(({ _id, ...p }) => p);
    res.json(mapped);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur lecture produits' });
  }
});

app.put('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const body = req.body as Record<string, unknown>;
    const id = req.params.id;
    const doc = { ...body, id };
    await db
      .collection('products')
      .replaceOne({ id }, doc, { upsert: true });
    res.json(doc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur enregistrement produit' });
  }
});

app.patch('/api/products/:id/stock', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const stock = Number((req.body as { stock?: number }).stock);
    if (Number.isNaN(stock) || stock < 0) {
      res.status(400).json({ error: 'stock invalide' });
      return;
    }
    await db.collection('products').updateOne({ id: req.params.id }, { $set: { stock } });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur mise à jour stock' });
  }
});

function stripProductCommentBody(raw: unknown): string {
  const s = String(raw ?? '').trim().replace(/\s+/g, ' ');
  return s.length > 2000 ? s.slice(0, 2000) : s;
}

// --- Commentaires produits (vitrine) ---
app.get('/api/products/:productId/comments', async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;
    const db = await getDb();
    const product = await db.collection('products').findOne({ id: productId });
    if (!product) {
      res.status(404).json({ error: 'produit introuvable' });
      return;
    }
    const rows = await db
      .collection('product_comments')
      .find({ productId })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(
      rows.map(({ _id, ...c }) => ({
        ...c,
        rating:
          c.rating !== undefined && c.rating !== null
            ? clampRating(c.rating)
            : undefined,
      }))
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur lecture commentaires' });
  }
});

app.post('/api/products/:productId/comments', async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId;
    const body = req.body as Record<string, unknown>;
    const authorName = String(body.authorName ?? '')
      .trim()
      .slice(0, 120);
    const authorEmailRaw = String(body.authorEmail ?? '').trim().toLowerCase().slice(0, 200);
    const authorEmail = authorEmailRaw.length > 0 ? authorEmailRaw : undefined;
    const text = stripProductCommentBody(body.body);
    const userId =
      typeof body.userId === 'string' && String(body.userId).trim()
        ? String(body.userId).trim().slice(0, 80)
        : undefined;
    let rating: ProductComment['rating'] | undefined;
    if (body.rating !== undefined && body.rating !== null && body.rating !== '') {
      rating = clampRating(body.rating);
    }
    if (authorName.length < 2) {
      res.status(400).json({ error: 'Indiquez un nom (au moins 2 caractères).' });
      return;
    }
    if (text.length < 4) {
      res.status(400).json({ error: 'Votre message est trop court.' });
      return;
    }
    const db = await getDb();
    const product = await db.collection('products').findOne({ id: productId });
    if (!product) {
      res.status(404).json({ error: 'produit introuvable' });
      return;
    }
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const doc: ProductComment = {
      id,
      productId,
      authorName,
      authorEmail,
      body: text,
      rating,
      userId,
      createdAt,
    };
    await db.collection('product_comments').insertOne(doc);
    res.status(201).json(doc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur publication du commentaire' });
  }
});

// --- Orders ---
app.get('/api/orders', async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const rows = await db
      .collection('orders')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    res.json(rows.map(({ _id, ...o }) => o));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur lecture commandes' });
  }
});

app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const order = req.body as Record<string, unknown>;
    await db.collection('orders').insertOne(order);
    res.status(201).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur création commande' });
  }
});

app.patch('/api/orders/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const patch = req.body as Record<string, unknown>;
    await db.collection('orders').updateOne({ id: req.params.id }, { $set: patch });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur mise à jour commande' });
  }
});

app.delete('/api/orders/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    await db.collection('orders').deleteOne({ id: req.params.id });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur suppression commande' });
  }
});

// --- Reservations ---
app.get('/api/reservations', async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const rows = await db
      .collection('reservations')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    res.json(rows.map(({ _id, ...r }) => r));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur lecture réservations' });
  }
});

app.post('/api/reservations', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    await db.collection('reservations').insertOne(req.body);
    res.status(201).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur création réservation' });
  }
});

app.patch('/api/reservations/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    await db
      .collection('reservations')
      .updateOne({ id: req.params.id }, { $set: req.body as object });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur mise à jour réservation' });
  }
});

// --- Custom orders ---
app.get('/api/custom-orders', async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const rows = await db
      .collection('custom_orders')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    res.json(rows.map(({ _id, ...c }) => c));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur lecture commandes sur mesure' });
  }
});

app.post('/api/custom-orders', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    await db.collection('custom_orders').insertOne(req.body);
    res.status(201).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur création commande sur mesure' });
  }
});

app.patch('/api/custom-orders/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    await db
      .collection('custom_orders')
      .updateOne({ id: req.params.id }, { $set: req.body as object });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur mise à jour commande sur mesure' });
  }
});

// --- Promo codes (documents alignés sur le front : camelCase) ---
app.get('/api/promo-codes', async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const rows = await db
      .collection('promo_codes')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    res.json(rows.map(({ _id, ...p }) => p));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur lecture codes promo' });
  }
});

app.get('/api/promo-codes/validate', async (req: Request, res: Response) => {
  try {
    const code = String(req.query.code || '')
      .trim()
      .toUpperCase();
    if (!code) {
      res.status(400).json({ error: 'code manquant' });
      return;
    }
    const db = await getDb();
    const doc = await db.collection('promo_codes').findOne({ code, isActive: true });
    if (!doc) {
      res.status(404).json({ error: 'introuvable' });
      return;
    }
    const { _id, ...p } = doc;
    if (p.expiryDate && new Date(String(p.expiryDate)) < new Date()) {
      res.status(404).json({ error: 'expiré' });
      return;
    }
    res.json(p);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur validation code' });
  }
});

app.post('/api/promo-codes', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    await db.collection('promo_codes').insertOne(req.body);
    res.status(201).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur création code promo' });
  }
});

app.patch('/api/promo-codes/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    await db
      .collection('promo_codes')
      .updateOne({ id: req.params.id }, { $set: req.body as object });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur mise à jour code promo' });
  }
});

app.delete('/api/promo-codes/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    await db.collection('promo_codes').deleteOne({ id: req.params.id });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur suppression code promo' });
  }
});

// --- Testimonials (vitrine + admin) ---
app.get('/api/testimonials', async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const rows = await db
      .collection('testimonials')
      .find({})
      .sort({ sortOrder: 1, createdAt: -1 })
      .toArray();
    res.json(
      rows.map(({ _id, ...t }) => ({
        ...t,
        rating: clampRating((t as Record<string, unknown>).rating),
      }))
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur lecture témoignages' });
  }
});

app.post('/api/testimonials', async (req: Request, res: Response) => {
  try {
    const body = req.body as Record<string, unknown>;
    if (!String(body.author || '').trim() || !String(body.quote || '').trim()) {
      res.status(400).json({ error: 'Auteur et citation sont requis.' });
      return;
    }
    const db = await getDb();
    const id =
      typeof body.id === 'string' && String(body.id).trim()
        ? String(body.id).trim()
        : randomUUID();
    const doc = {
      id,
      author: String(body.author).trim(),
      role: String(body.role || '').trim() || 'Cliente',
      quote: String(body.quote).trim(),
      location: body.location ? String(body.location).trim() : undefined,
      context: body.context ? String(body.context).trim() : undefined,
      date: body.date ? String(body.date).trim() : undefined,
      rating: clampRating(body.rating),
      featured: Boolean(body.featured),
      verifiedPurchase: Boolean(body.verifiedPurchase),
      sortOrder:
        body.sortOrder !== undefined && body.sortOrder !== null && body.sortOrder !== ''
          ? Number(body.sortOrder)
          : 0,
      createdAt:
        typeof body.createdAt === 'string' && body.createdAt
          ? String(body.createdAt)
          : new Date().toISOString(),
    };
    if (doc.featured === true) {
      await db.collection('testimonials').updateMany({ id: { $ne: id } }, { $set: { featured: false } });
    }
    await db.collection('testimonials').insertOne(doc);
    res.status(201).json(doc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur création témoignage' });
  }
});

app.put('/api/testimonials/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const body = req.body as Record<string, unknown>;
    if (!String(body.author || '').trim() || !String(body.quote || '').trim()) {
      res.status(400).json({ error: 'Auteur et citation sont requis.' });
      return;
    }
    const db = await getDb();
    const existing = await db.collection('testimonials').findOne({ id });
    const doc = {
      id,
      author: String(body.author).trim(),
      role: String(body.role || '').trim() || 'Cliente',
      quote: String(body.quote).trim(),
      location: body.location ? String(body.location).trim() : undefined,
      context: body.context ? String(body.context).trim() : undefined,
      date: body.date ? String(body.date).trim() : undefined,
      rating: clampRating(body.rating),
      featured: Boolean(body.featured),
      verifiedPurchase: Boolean(body.verifiedPurchase),
      sortOrder:
        body.sortOrder !== undefined && body.sortOrder !== null && body.sortOrder !== ''
          ? Number(body.sortOrder)
          : 0,
      createdAt:
        (existing && (existing as { createdAt?: string }).createdAt) ||
        (typeof body.createdAt === 'string' && body.createdAt
          ? String(body.createdAt)
          : new Date().toISOString()),
    };
    if (doc.featured === true) {
      await db.collection('testimonials').updateMany({ id: { $ne: id } }, { $set: { featured: false } });
    }
    await db.collection('testimonials').replaceOne({ id }, doc, { upsert: true });
    const saved = await db.collection('testimonials').findOne({ id });
    if (!saved) {
      res.status(500).json({ error: 'Échec enregistrement' });
      return;
    }
    const { _id, ...out } = saved as Record<string, unknown>;
    res.json({ ...out, rating: clampRating(out.rating) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur enregistrement témoignage' });
  }
});

app.delete('/api/testimonials/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    await db.collection('testimonials').deleteOne({ id: req.params.id });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur suppression témoignage' });
  }
});

// --- Users / auth ---
app.get('/api/users', async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    const rows = await db.collection('users').find({}).toArray();
    res.json(rows.map((u) => toPublicUser(u as Record<string, unknown>)));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur lecture utilisateurs' });
  }
});

app.patch('/api/users/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const patch = { ...(req.body as object) };
    delete (patch as { passwordHash?: unknown }).passwordHash;
    await db.collection('users').updateOne({ id: req.params.id }, { $set: patch });
    const updated = await db.collection('users').findOne({ id: req.params.id });
    if (!updated) {
      res.status(404).json({ error: 'utilisateur introuvable' });
      return;
    }
    res.json(toPublicUser(updated as Record<string, unknown>));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur mise à jour utilisateur' });
  }
});

app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password } = req.body as {
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
    };
    if (!email || !password) {
      res.status(400).json({ error: "L'email et le mot de passe sont requis." });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' });
      return;
    }
    const db = await getDb();
    const existing = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ error: 'Un compte avec cet email existe déjà.' });
      return;
    }
    const id = randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);
    const userDoc = {
      id,
      email: email.toLowerCase(),
      name: name || '',
      phone: phone || '',
      role: 'customer' as const,
      segment: 'Nouveau' as const,
      wallet: [] as unknown[],
      wishlist: [] as string[],
      addresses: [] as unknown[],
      city: 'Abidjan',
      passwordHash,
    };
    await db.collection('users').insertOne(userDoc);
    res.status(201).json({ user: toPublicUser(userDoc as unknown as Record<string, unknown>) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur inscription' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ error: "L'email et le mot de passe sont requis." });
      return;
    }
    const db = await getDb();
    const doc = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (!doc || !doc.passwordHash) {
      res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
      return;
    }
    const ok = await bcrypt.compare(password, doc.passwordHash as string);
    if (!ok) {
      res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
      return;
    }
    res.json({ user: toPublicUser(doc as unknown as Record<string, unknown>) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur connexion' });
  }
});

app.post('/api/auth/change-password', async (req: Request, res: Response) => {
  try {
    const { userId, currentPassword, newPassword } = req.body as {
      userId?: string;
      currentPassword?: string;
      newPassword?: string;
    };
    if (!userId || !currentPassword || !newPassword) {
      res.status(400).json({ error: 'Identifiant, mot de passe actuel et nouveau mot de passe sont requis.' });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' });
      return;
    }
    const db = await getDb();
    const doc = await db.collection('users').findOne({ id: userId });
    if (!doc || !doc.passwordHash) {
      res.status(404).json({ error: 'Utilisateur introuvable ou compte sans mot de passe.' });
      return;
    }
    const ok = await bcrypt.compare(currentPassword, doc.passwordHash as string);
    if (!ok) {
      res.status(401).json({ error: 'Mot de passe actuel incorrect.' });
      return;
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.collection('users').updateOne({ id: userId }, { $set: { passwordHash } });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur lors du changement de mot de passe.' });
  }
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, service: 'poidsbaoule-api' });
});

const port = Number(process.env.API_PORT) || 5050;

async function main() {
  await getDb();
  await ensureIndexes();
  await seedProductsIfEmpty();
  await seedTestimonialsIfEmpty();
  app.listen(port, () => {
    console.log(`API MongoDB sur http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  console.error(
    "\n→ Vérifiez que MongoDB est démarré (mongod / Docker / Atlas) et que l'URI est correcte. Fichier .env : MONGODB_URI\n"
  );
  process.exit(1);
});

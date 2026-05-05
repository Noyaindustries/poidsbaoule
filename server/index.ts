import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { getDb } from './db';
import { PRODUCTS } from '../src/constants';
import type { CustomerTestimonial, ProductComment } from '../src/types';

export const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const { uploadDir, uploadsRoot } = (() => {
  // Netlify Functions (lambda) tournent souvent dans un filesystem non-écrivable (ex: /var/task).
  // On tente d'abord le chemin local "uploads/", sinon on bascule sur os.tmpdir().
  const localUploadsRoot = path.join(process.cwd(), 'uploads');
  const localCustomOrdersDir = path.join(localUploadsRoot, 'custom-orders');
  try {
    fs.mkdirSync(localCustomOrdersDir, { recursive: true });
    return { uploadDir: localCustomOrdersDir, uploadsRoot: localUploadsRoot };
  } catch (e) {
    const tmpUploadsRoot = path.join(os.tmpdir(), 'uploads');
    const tmpCustomOrdersDir = path.join(tmpUploadsRoot, 'custom-orders');
    try {
      fs.mkdirSync(tmpCustomOrdersDir, { recursive: true });
      return { uploadDir: tmpCustomOrdersDir, uploadsRoot: tmpUploadsRoot };
    } catch {
      // Dernier recours: on garde un chemin mais sans garantir que l'upload pourra écrire.
      // Cela évite de faire planter toute la fonction au démarrage.
      return { uploadDir: localCustomOrdersDir, uploadsRoot: localUploadsRoot };
    }
  }
})();

app.use('/uploads', express.static(uploadsRoot));

const allowedUploadMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maxUploadBytes = 5 * 1024 * 1024;
const maxUploadFiles = 5;

const customOrderUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const safeExt = path.extname(file.originalname || '').toLowerCase() || '.jpg';
      cb(null, `${Date.now()}-${randomUUID()}${safeExt}`);
    },
  }),
  limits: {
    fileSize: maxUploadBytes,
    files: maxUploadFiles,
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedUploadMimeTypes.has(file.mimetype)) {
      cb(new Error('Format non pris en charge. Utilisez JPG, PNG ou WebP.'));
      return;
    }
    cb(null, true);
  },
});

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
  await db.collection('payment_confirmations').createIndex({ id: 1 }, { unique: true });
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

const ALLOWED_PAYMENT_METHODS = new Set(['Wave', 'Orange Money', 'Paiement à la livraison']);
const MOBILE_MONEY_METHODS = new Set(['Wave', 'Orange Money']);
const ONLINE_PAYMENT_METHODS = new Set(['Wave', 'Orange Money']);
const ORDER_ALLOWED_STATUSES = new Set([
  'En attente de paiement',
  'Paiement reçu',
  'En préparation',
  'Expédiée',
  'Livrée',
  'Annulée',
]);

type NormalizedOrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  images: string[];
};

type PaymentConfirmationRecord = {
  id: string;
  paymentMethod: string;
  amount: number;
  currency: 'XOF';
  provider: 'MOCK_MOBILE_MONEY';
  transactionId: string;
  status: 'CONFIRMED';
  createdAt: string;
  confirmedAt: string;
  usedAt?: string;
  orderId?: string;
};

function toFiniteAmount(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round(n));
}

function sanitizeOrderItems(raw: unknown): NormalizedOrderItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const item = entry as Record<string, unknown>;
      const id = String(item.id ?? '').trim();
      const name = String(item.name ?? '').trim();
      const price = toFiniteAmount(item.price);
      const quantity = Math.max(1, Math.floor(Number(item.quantity)));
      const images = Array.isArray(item.images)
        ? item.images.filter((v): v is string => typeof v === 'string')
        : [];
      if (!id || !name || !Number.isFinite(price) || !Number.isFinite(quantity)) return null;
      return { id, name, price, quantity, images };
    })
    .filter((v): v is NormalizedOrderItem => v !== null);
}

function computeTotalFromItems(items: NormalizedOrderItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function computeAmountDueNow(total: number, paymentMethod: string, paymentStrategy: string): number {
  void paymentMethod;
  if (paymentStrategy === '50-50') return Math.round(total / 2);
  return total;
}

function sanitizeOrderStatus(value: unknown): string {
  const status = String(value ?? '');
  if (!ORDER_ALLOWED_STATUSES.has(status)) return 'En attente de paiement';
  return status;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string): boolean {
  return /^[+\d][\d\s-]{7,}$/.test(value);
}

function validateOnlineOnlyMobilePayment(order: Record<string, unknown>): string | null {
  const paymentMethod = String(order.paymentMethod ?? '');
  if (!MOBILE_MONEY_METHODS.has(paymentMethod)) return null;

  const paymentStrategy = String(order.paymentStrategy ?? '');
  const amountPaid = Number(order.amountPaid);
  const total = Number(order.total);
  const balanceDue = Number(order.balanceDue);

  if (paymentStrategy !== 'FULL' && paymentStrategy !== '50-50') {
    return 'Le paiement mobile autorise uniquement FULL ou 50-50.';
  }
  const expectedDueNow = computeAmountDueNow(total, paymentMethod, paymentStrategy);
  if (!Number.isFinite(amountPaid) || !Number.isFinite(total) || amountPaid < expectedDueNow) {
    return 'Paiement mobile refusé: montant encaissé insuffisant pour la stratégie choisie.';
  }
  const expectedBalance = Math.max(total - expectedDueNow, 0);
  if (!Number.isFinite(balanceDue) || balanceDue !== expectedBalance) {
    return 'Paiement mobile refusé: solde différé incohérent.';
  }
  return null;
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
    const input = req.body as Record<string, unknown>;

    const id = String(input.id ?? '').trim() || randomUUID();
    const userId = String(input.userId ?? '').trim() || `guest-${randomUUID()}`;
    const customerName = String(input.customerName ?? '').trim();
    const customerEmail = String(input.customerEmail ?? '').trim();
    const customerPhone = String(input.customerPhone ?? '').trim();
    const paymentMethod = String(input.paymentMethod ?? '');
    const paymentStrategy = String(input.paymentStrategy ?? 'FULL').trim();
    const items = sanitizeOrderItems(input.items);
    const total = computeTotalFromItems(items);
    const amountDueNow = computeAmountDueNow(total, paymentMethod, paymentStrategy);
    const isOnlinePayment = ONLINE_PAYMENT_METHODS.has(paymentMethod);
    const shippingAddress =
      input.shippingAddress && typeof input.shippingAddress === 'object'
        ? (input.shippingAddress as Record<string, unknown>)
        : {};

    if (!customerName || !customerEmail || !customerPhone) {
      res.status(400).json({ error: 'Informations client incomplètes.' });
      return;
    }
    if (!isValidEmail(customerEmail)) {
      res.status(400).json({ error: 'Adresse email invalide.' });
      return;
    }
    if (!isValidPhone(customerPhone)) {
      res.status(400).json({ error: 'Numéro de téléphone invalide.' });
      return;
    }
    if (!ALLOWED_PAYMENT_METHODS.has(paymentMethod)) {
      res.status(400).json({ error: 'Moyen de paiement non autorisé.' });
      return;
    }
    if (items.length === 0) {
      res.status(400).json({ error: 'Le panier est vide ou invalide.' });
      return;
    }
    if (total <= 0) {
      res.status(400).json({ error: 'Montant de commande invalide.' });
      return;
    }
    const shippingStreet = String(shippingAddress.street ?? '').trim();
    const shippingCity = String(shippingAddress.city ?? '').trim();
    if (!shippingStreet || !shippingCity) {
      res.status(400).json({ error: 'Adresse de livraison incomplète.' });
      return;
    }

    const mobilePaymentError = validateOnlineOnlyMobilePayment({
      paymentMethod,
      paymentStrategy,
      amountPaid: amountDueNow,
      total,
      balanceDue: Math.max(total - amountDueNow, 0),
    });
    if (mobilePaymentError) {
      res.status(400).json({ error: mobilePaymentError });
      return;
    }

    let paymentConfirmation: PaymentConfirmationRecord | null = null;
    if (isOnlinePayment) {
      const paymentConfirmationId = String(input.paymentConfirmationId ?? '').trim();
      if (!paymentConfirmationId) {
        res.status(400).json({
          error: 'Paiement en ligne requis avant validation: confirmation de transaction manquante.',
        });
        return;
      }
      paymentConfirmation = (await db.collection('payment_confirmations').findOne({
        id: paymentConfirmationId,
        status: 'CONFIRMED',
        usedAt: { $exists: false },
      })) as PaymentConfirmationRecord | null;

      if (!paymentConfirmation) {
        res.status(400).json({ error: 'Preuve de paiement invalide ou déjà utilisée.' });
        return;
      }
      if (paymentConfirmation.paymentMethod !== paymentMethod) {
        res.status(400).json({ error: 'La preuve de paiement ne correspond pas au moyen sélectionné.' });
        return;
      }
      if (paymentConfirmation.amount < amountDueNow) {
        res.status(400).json({ error: 'Montant encaissé insuffisant pour valider la commande.' });
        return;
      }
    }

    const now = new Date().toISOString();
    const orderDoc = {
      id,
      userId,
      customerName,
      customerEmail,
      customerPhone,
      items,
      total,
      paymentMethod,
      paymentStrategy,
      amountPaid: isOnlinePayment ? amountDueNow : 0,
      balanceDue: isOnlinePayment ? Math.max(total - amountDueNow, 0) : total,
      status: isOnlinePayment ? 'Paiement reçu' : 'En attente de paiement',
      shippingAddress: {
        id: String(shippingAddress.id ?? `addr-${id}`),
        street: shippingStreet,
        city: shippingCity,
        country: String(shippingAddress.country ?? "Côte d'Ivoire").trim(),
        isDefault: Boolean(shippingAddress.isDefault ?? true),
      },
      paymentReference:
        typeof input.paymentReference === 'string' && input.paymentReference.trim()
          ? input.paymentReference.trim().slice(0, 120)
          : undefined,
      paymentConfirmationId: paymentConfirmation?.id,
      paymentTransactionId: paymentConfirmation?.transactionId,
      paymentConfirmedAt: paymentConfirmation?.confirmedAt,
      createdAt: typeof input.createdAt === 'string' && input.createdAt ? input.createdAt : now,
    };

    await db.collection('orders').insertOne(orderDoc);
    if (paymentConfirmation) {
      await db.collection('payment_confirmations').updateOne(
        { id: paymentConfirmation.id },
        { $set: { usedAt: now, orderId: id } }
      );
    }
    res.status(201).json({ ok: true, orderId: id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur création commande' });
  }
});

app.patch('/api/orders/:id', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const order = (await db.collection('orders').findOne({
      id: req.params.id,
    })) as Record<string, unknown> | null;
    if (!order) {
      res.status(404).json({ error: 'commande introuvable' });
      return;
    }
    const patch = req.body as Record<string, unknown>;
    if ('total' in patch || 'amountPaid' in patch || 'balanceDue' in patch) {
      res.status(400).json({ error: 'Champs financiers protégés côté serveur.' });
      return;
    }

    const sanitizedPatch: Record<string, unknown> = {};
    if ('status' in patch) {
      const nextStatus = sanitizeOrderStatus(patch.status);
      const isOnlineOrder = ONLINE_PAYMENT_METHODS.has(String(order.paymentMethod ?? ''));
      const isPaidStatus = nextStatus !== 'En attente de paiement';
      const hasServerPaymentProof = Boolean(
        order.paymentConfirmationId && order.paymentTransactionId && order.paymentConfirmedAt
      );
      if (isOnlineOrder && isPaidStatus && !hasServerPaymentProof) {
        res.status(400).json({
          error: 'Impossible de valider la commande: aucun paiement en ligne confirmé côté serveur.',
        });
        return;
      }
      sanitizedPatch.status = nextStatus;
    }

    await db.collection('orders').updateOne({ id: req.params.id }, { $set: sanitizedPatch });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur mise à jour commande' });
  }
});

app.post('/api/payments/mobile/charge', async (req: Request, res: Response) => {
  try {
    const pspMode = String(process.env.MOBILE_MONEY_PSP_MODE ?? '').toLowerCase();
    if (pspMode !== 'mock') {
      res.status(503).json({
        error:
          'Prélèvement mobile indisponible: aucun PSP configuré côté serveur. Activez MOBILE_MONEY_PSP_MODE=mock pour les tests.',
      });
      return;
    }

    const payload = req.body as Record<string, unknown>;
    const paymentMethod = String(payload.paymentMethod ?? '');
    const amount = toFiniteAmount(payload.amount);
    const customerPhone = String(payload.customerPhone ?? '').trim();
    const paymentReference = String(payload.paymentReference ?? '').trim();

    if (!MOBILE_MONEY_METHODS.has(paymentMethod)) {
      res.status(400).json({ error: 'Moyen de paiement mobile invalide.' });
      return;
    }
    if (amount <= 0) {
      res.status(400).json({ error: 'Montant de prélèvement invalide.' });
      return;
    }
    if (!customerPhone) {
      res.status(400).json({ error: 'Numéro client requis pour le prélèvement mobile.' });
      return;
    }
    if (!paymentReference) {
      res.status(400).json({ error: 'Référence transaction requise pour confirmer le prélèvement.' });
      return;
    }

    const db = await getDb();
    const now = new Date().toISOString();
    const confirmation: PaymentConfirmationRecord = {
      id: randomUUID(),
      paymentMethod,
      amount,
      currency: 'XOF',
      provider: 'MOCK_MOBILE_MONEY',
      transactionId: `MM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: 'CONFIRMED',
      createdAt: now,
      confirmedAt: now,
    };
    await db.collection('payment_confirmations').insertOne({
      ...confirmation,
      customerPhone,
      paymentReference: paymentReference.slice(0, 120),
    });
    res.status(201).json({
      ok: true,
      paymentConfirmationId: confirmation.id,
      transactionId: confirmation.transactionId,
      status: confirmation.status,
      confirmedAt: confirmation.confirmedAt,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur prélèvement mobile' });
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
    const body = req.body as Record<string, unknown>;
    const customerName = String(body.customerName ?? '').trim();
    const email = String(body.email ?? '').trim();
    const phone = String(body.phone ?? '').trim();
    const type = String(body.type ?? '').trim();
    const neighborhood = String(body.neighborhood ?? '').trim();
    const surface = Number(body.surface);
    const serviceDetails =
      body.serviceDetails && typeof body.serviceDetails === 'object'
        ? (body.serviceDetails as Record<string, unknown>)
        : null;

    if (!customerName || !email || !phone || !type) {
      res.status(400).json({ error: 'Nom, email, téléphone et prestation sont requis.' });
      return;
    }
    if (!Number.isFinite(surface) || surface <= 0) {
      res.status(400).json({ error: 'Surface invalide.' });
      return;
    }
    if (!neighborhood) {
      res.status(400).json({ error: 'Quartier/commune requis.' });
      return;
    }
    if (serviceDetails) {
      const preferredDate = String(serviceDetails.preferredDate ?? '').trim();
      const preferredTimeSlot = String(serviceDetails.preferredTimeSlot ?? '').trim();
      const estimatedDurationHours = Number(serviceDetails.estimatedDurationHours);
      const estimatedCost = Number(serviceDetails.estimatedCost);
      if (!preferredDate || !preferredTimeSlot) {
        res.status(400).json({ error: 'Date et créneau souhaités requis pour la prestation déco.' });
        return;
      }
      if (!Number.isFinite(estimatedDurationHours) || estimatedDurationHours < 1) {
        res.status(400).json({ error: 'Durée estimée invalide.' });
        return;
      }
      if (!Number.isFinite(estimatedCost) || estimatedCost <= 0) {
        res.status(400).json({ error: 'Coût estimatif invalide.' });
        return;
      }
    }

    await db.collection('reservations').insertOne(body);
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

app.post('/api/custom-orders/upload', (req: Request, res: Response) => {
  customOrderUpload.array('files', maxUploadFiles)(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json({ error: 'Chaque fichier doit faire 5 Mo maximum.' });
          return;
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          res.status(400).json({ error: 'Vous pouvez envoyer au maximum 5 images.' });
          return;
        }
      }
      const message = err instanceof Error ? err.message : 'Erreur lors du téléversement.';
      res.status(400).json({ error: message });
      return;
    }
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    if (files.length === 0) {
      res.status(400).json({ error: 'Aucun fichier reçu.' });
      return;
    }
    res.status(201).json({
      files: files.map((file) => ({
        url: `/uploads/custom-orders/${file.filename}`,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
      })),
    });
  });
});

app.post('/api/custom-orders', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const body = req.body as Record<string, unknown>;
    const customerName = String(body.customerName ?? '').trim();
    const email = String(body.email ?? '').trim();
    const type = String(body.type ?? '').trim();
    const description = String(body.description ?? '').trim();
    const preferredDeadline = String(body.preferredDeadline ?? '').trim();
    const customization =
      body.customization && typeof body.customization === 'object'
        ? (body.customization as Record<string, unknown>)
        : null;

    if (!customerName || !email || !type || !description || !preferredDeadline) {
      res.status(400).json({ error: 'Informations sur mesure incomplètes.' });
      return;
    }
    if (customization) {
      const quantity = Number(customization.quantity);
      const estimatedPrice = Number(customization.estimatedPrice);
      const dimensions =
        customization.dimensionsCm && typeof customization.dimensionsCm === 'object'
          ? (customization.dimensionsCm as Record<string, unknown>)
          : null;
      const width = Number(dimensions?.width);
      const height = Number(dimensions?.height);
      if (!Number.isFinite(quantity) || quantity < 1) {
        res.status(400).json({ error: 'Quantité invalide pour la commande sur mesure.' });
        return;
      }
      if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        res.status(400).json({ error: 'Dimensions largeur/hauteur invalides.' });
        return;
      }
      if (!Number.isFinite(estimatedPrice) || estimatedPrice <= 0) {
        res.status(400).json({ error: 'Prix estimatif invalide.' });
        return;
      }
    }

    await db.collection('custom_orders').insertOne(body);
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
  res.json({ ok: true, service: 'poidsbaoule-monolith' });
});

/**
 * Sous Netlify Functions (bundle CJS), `import.meta.url` peut être absent →
 * fileURLToPath(undefined) lève ERR_INVALID_ARG_TYPE et casse tout le handler.
 */
function resolveDistDir(): string {
  try {
    const u = (import.meta as { url?: string }).url;
    if (u && typeof u === 'string') {
      return path.resolve(path.dirname(fileURLToPath(u)), '..', 'dist');
    }
  } catch {
    /* import.meta.url ou fileURLToPath invalides en contexte bundle */
  }
  return path.join(process.cwd(), 'dist');
}

const distDir = resolveDistDir();
const distIndex = path.join(distDir, 'index.html');

// #region agent log
fetch('http://127.0.0.1:27772/ingest/69353350-be9e-4e7e-945f-5b8e0cd4960a', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '64bc3d' },
  body: JSON.stringify({
    sessionId: '64bc3d',
    hypothesisId: 'H-fileURLToPath',
    location: 'server/index.ts:resolveDistDir',
    message: 'dist paths resolved',
    data: {
      distDir,
      cwd: process.cwd(),
      hasImportMetaUrl: Boolean((import.meta as { url?: string }).url),
    },
    timestamp: Date.now(),
  }),
}).catch(() => {});
// #endregion

// Sert l'application front buildée en production monolithique.
app.use(express.static(distDir));
app.get('*', (req: Request, res: Response, next) => {
  if (req.path.startsWith('/api/')) {
    next();
    return;
  }
  res.sendFile(distIndex, (err) => {
    if (err) next(err);
  });
});

const port = Number(process.env.PORT ?? process.env.API_PORT) || 5050;

let initPromise: Promise<void> | null = null;

export async function initializeApp() {
  if (!initPromise) {
    initPromise = (async () => {
      await getDb();
      await ensureIndexes();
      await seedProductsIfEmpty();
      await seedTestimonialsIfEmpty();
    })().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  await initPromise;
}

async function main() {
  await initializeApp();
  app.listen(port, () => {
    console.log(`App monolithique (API + front) sur http://localhost:${port}`);
  });
}

function resolveEntryScriptPath(): string | null {
  try {
    const u = (import.meta as { url?: string }).url;
    if (u && typeof u === 'string') return fileURLToPath(u);
  } catch {
    /* ignore */
  }
  return null;
}

const entryScriptPath = resolveEntryScriptPath();
const isEntrypoint = Boolean(entryScriptPath) && process.argv[1] === entryScriptPath;

if (isEntrypoint) {
  main().catch((err) => {
    console.error(err);
    console.error(
      "\n→ Vérifiez que MongoDB est démarré (mongod / Docker / Atlas) et que l'URI est correcte. Fichier .env : MONGODB_URI\n"
    );
    process.exit(1);
  });
}

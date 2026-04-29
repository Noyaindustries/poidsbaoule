-- Table des Produits
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  dimensions TEXT,
  stock INTEGER DEFAULT 0,
  badge TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des Commandes
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT, -- Peut être lié à auth.users.id
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'Paiement reçu',
  payment_method TEXT,
  payment_strategy TEXT,
  amount_paid NUMERIC,
  balance_due NUMERIC,
  shipping_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des Profils Clients (liaison avec l'Auth Supabase)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer',
  segment TEXT DEFAULT 'Nouveau',
  wallet JSONB DEFAULT '[]',
  wishlist TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des Réservations
CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  type TEXT,
  description TEXT,
  surface NUMERIC,
  neighborhood TEXT,
  preferred_dates JSONB DEFAULT '[]',
  budget TEXT,
  photos TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'Demande reçue',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des Projets Sur Mesure
CREATE TABLE IF NOT EXISTS custom_orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  description TEXT,
  dimensions TEXT,
  finish TEXT,
  color TEXT,
  type TEXT,
  moodboard TEXT[] DEFAULT '{}',
  preferred_deadline TEXT,
  status TEXT DEFAULT 'Étude',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des Codes Promo
CREATE TABLE IF NOT EXISTS promo_codes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL,
  discount_value NUMERIC NOT NULL,
  expiry_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  announcement_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertion des produits existants (Seed)
INSERT INTO products (id, name, description, price, category, images, dimensions, stock, badge)
VALUES 
('1', 'Masque Songe Rêvé', 'Une œuvre originale sculptée à la main en ciment blanc et plâtre, célébrant l''esthétique Wabi-Sabi.', 100000, 'Sculptures & Masques', '{"/PHOTO-2026-04-15-18-25-34.jpg", "/PHOTO-2026-04-15-18-25-34_1.jpg", "/PHOTO-2026-04-15-18-25-33_3.jpg"}', '1m20 × 80 cm', 1, 'Pièce unique'),
('2', 'Masque Présence', 'Masque sculptural imposant, idéal pour une pièce maîtresse de salon.', 150000, 'Sculptures & Masques', '{"/PHOTO-2026-04-15-18-25-33_4.jpg", "/PHOTO-2026-04-15-18-25-33_1.jpg", "/PHOTO-2026-04-15-18-25-32_4.jpg"}', '1m20 × 70 cm', 1, 'Pièce unique'),
('3', 'Arcadia 6 Colonnes', 'Meuble niche architectural inspiré des colonnades classiques avec une touche moderne africaine.', 150000, 'Mobilier Niche', '{"/PHOTO-2026-04-15-18-25-34_2.jpg", "/PHOTO-2026-04-15-18-25-32_2.jpg", "/PHOTO-2026-04-15-18-25-35.jpg"}', 'L 1m65 × H 81 cm × P 35 cm', 2, 'Fait main'),
('4', 'Miroir Reflet Rustique', 'Miroir d''art avec cadre texturé en plâtre et ciment, finition naturelle.', 95000, 'Miroirs d''Art', '{"/PHOTO-2026-04-15-18-25-33_2.jpg", "/PHOTO-2026-04-15-18-25-33.jpg", "/PHOTO-2026-04-15-18-25-32_1.jpg"}', '1m × 83 cm', 3, 'Nouveau'),
('5', 'Meuble Niche Arcadia', 'Petit meuble niche polyvalent pour objets de décoration.', 75000, 'Mobilier Niche', '{"/PHOTO-2026-04-15-18-25-33.jpg", "/PHOTO-2026-04-15-18-25-32.jpg", "/PHOTO-2026-04-15-18-25-32_3.jpg"}', 'L 83 cm × H 77 cm', 5, 'Best-seller')
ON CONFLICT (id) DO NOTHING;

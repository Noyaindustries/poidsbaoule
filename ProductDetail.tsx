import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingCart, Heart, Share2, ShieldCheck, Truck, RotateCcw, Minus, Plus, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PRODUCTS } from '@/constants';
import { toast } from 'sonner';
import { useCart } from '@/lib/CartContext';
import { useProducts } from '@/lib/ProductContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart } = useCart();
  const { products, getProduct } = useProducts();

  const product = getProduct(id || '');

  if (!product) {
    return (
      <div className="pt-32 pb-24 container mx-auto px-4 text-center">
        <h1 className="text-2xl font-serif font-bold mb-4">Produit non trouvé</h1>
        <Button onClick={() => navigate('/shop')}>Retour à la boutique</Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
    toast.success(`${product.name} ajouté au panier`, {
      description: `${quantity} article(s) ajouté(s)`,
    });
  };

  const handleBuyNow = () => {
    addToCart({ ...product, quantity });
    navigate('/checkout');
    window.scrollTo(0, 0);
  };

  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="pt-24 pb-24">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
          <ChevronLeft className="h-3 w-3 rotate-180" />
          <Link to="/shop" className="hover:text-primary transition-colors">Boutique</Link>
          <ChevronLeft className="h-3 w-3 rotate-180" />
          <span className="text-foreground font-bold">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          {/* Image Gallery */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative aspect-[4/5] rounded-[60px] overflow-hidden bg-muted shadow-2xl"
            >
              <img 
                src={product.images[activeImage]} 
                alt={product.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                fetchPriority="high"
                loading="eager"
                decoding="async"
              />
              {product.badge && (
                <Badge className="absolute top-8 left-8 bg-white/90 text-black hover:bg-white backdrop-blur-md border-none font-sans uppercase text-[10px] tracking-[0.4em] px-6 py-2 rounded-full">
                  {product.badge}
                </Badge>
              )}
              {product.stock <= 0 && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center">
                  <Badge className="bg-destructive text-white border-none font-sans uppercase text-sm tracking-[0.4em] px-10 py-4 rounded-full shadow-2xl">
                    Rupture de Stock
                  </Badge>
                </div>
              )}
            </motion.div>
            
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-6">
                {product.images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`aspect-square rounded-[30px] overflow-hidden border-2 transition-all duration-500 ${activeImage === idx ? 'border-primary scale-105 shadow-xl' : 'border-transparent opacity-40 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`${product.name} thumbnail ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>
 
          {/* Product Info */}
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-primary">{product.category}</span>
                <div className="h-[1px] flex-1 bg-primary/10"></div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-accent text-accent" />)}
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-serif font-bold leading-[0.9]">{product.name}</h1>
              <p className="text-4xl font-light text-foreground/60 font-sans">{product.price.toLocaleString()} FCFA</p>
            </div>
 
            <p className="text-muted-foreground leading-relaxed text-xl font-light">
              {product.description}
            </p>
 
            <div className="space-y-8 pt-4">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex items-center border rounded-full p-2 bg-muted/30 w-full sm:w-auto justify-between sm:justify-start">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-12 w-12 rounded-full hover:bg-white"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={product.stock <= 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-12 w-12 rounded-full hover:bg-white"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={product.stock <= 0}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full h-16 rounded-full text-lg font-bold border-primary text-primary hover:bg-primary/5" 
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                >
                  <ShoppingCart className="mr-3 h-6 w-6" /> {product.stock <= 0 ? "Indisponible" : "Ajouter au panier"}
                </Button>
                <Button 
                  className="w-full h-16 rounded-full text-lg font-bold shadow-2xl shadow-primary/20" 
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                >
                  {product.stock <= 0 ? "Rupture de stock" : "Passer en caisse"}
                </Button>
              </div>
 
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-4 p-6 rounded-[30px] bg-muted/20 border border-primary/5">
                  <ShieldCheck className="h-8 w-8 text-primary/60" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em]">Qualité Garantie</p>
                    <p className="text-sm text-muted-foreground">Chaque pièce est unique et sculptée à la main</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-6 rounded-[30px] bg-muted/20 border border-primary/5">
                  <Truck className="h-8 w-8 text-primary/60" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em]">Livraison Locale</p>
                    <p className="text-sm text-muted-foreground italic">Note : Les livraisons sont aux frais des clients.</p>
                  </div>
                </div>
              </div>
            </div>
 
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0 gap-10">
                <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-6 font-bold uppercase tracking-[0.2em] text-[10px] transition-all">Détails</TabsTrigger>
                <TabsTrigger value="dimensions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-6 font-bold uppercase tracking-[0.2em] text-[10px] transition-all">Dimensions</TabsTrigger>
                <TabsTrigger value="shipping" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-6 font-bold uppercase tracking-[0.2em] text-[10px] transition-all">Livraison</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="pt-10 text-lg text-muted-foreground leading-relaxed space-y-6 font-light">
                <p>Chaque pièce est une œuvre originale, sculptée à la main en ciment blanc et plâtre. L'esthétique Wabi-Sabi célèbre l'imperfection comme une marque d'élégance unique.</p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-4">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/40"></div>
                    <span>Matériaux : Ciment blanc, Plâtre, Pigments naturels</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/40"></div>
                    <span>Finition : Mate texturée, toucher organique</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/40"></div>
                    <span>Origine : Fabriqué avec passion à Abidjan</span>
                  </li>
                </ul>
              </TabsContent>
              <TabsContent value="dimensions" className="pt-10">
                <div className="p-8 bg-muted/20 rounded-[30px] border border-primary/5 flex justify-between items-center">
                  <span className="font-bold uppercase tracking-widest text-xs">Dimensions totales</span>
                  <span className="text-2xl font-serif italic">{product.dimensions}</span>
                </div>
              </TabsContent>
              <TabsContent value="shipping" className="pt-10 text-lg text-muted-foreground leading-relaxed font-light">
                <p>Nous livrons partout à Abidjan dans un délai de 2 à 5 jours ouvrables. Pour les commandes hors Abidjan, veuillez nous contacter pour un devis personnalisé.</p>
                <p className="mt-4 font-bold text-primary">Information importante : Les frais de livraison sont à la charge du client et seront réglés lors de la réception du colis.</p>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-32">
            <div className="flex justify-between items-end mb-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-serif font-bold">Produits Similaires</h2>
                <p className="text-muted-foreground">D'autres créations qui pourraient vous plaire.</p>
              </div>
              <Link to="/shop">
                <Button variant="link" className="text-primary font-bold uppercase tracking-widest text-xs">Voir tout</Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((p) => (
                <Link key={p.id} to={`/product/${p.id}`} onClick={() => window.scrollTo(0, 0)} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl mb-4 bg-muted">
                    <img 
                      src={p.images[0]} 
                      alt={p.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      referrerPolicy="no-referrer" 
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                      <Button variant="secondary" className="rounded-full px-4 py-2 shadow-2xl">
                        Commander
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-serif font-bold group-hover:text-primary transition-colors">{p.name}</h3>
                    <p className="text-primary font-bold">{p.price.toLocaleString()} FCFA</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

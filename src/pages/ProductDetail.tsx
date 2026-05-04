import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  ShieldCheck,
  Truck,
  Minus,
  Plus,
  Star,
  Package,
  ZoomIn,
  Heart,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useCart } from '@/lib/CartContext';
import { useProducts } from '@/lib/ProductContext';
import { useUsers } from '@/lib/UserContext';
import { useCategories } from '@/lib/CategoryContext';
import { FALLBACK_CATEGORY_IMAGE, buildWhatsAppProductUrl } from '@/constants';
import { ProductCommentsSection } from '@/components/ProductCommentsSection';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { addToCart, items, totalItems, totalPrice } = useCart();
  const { products, getProduct } = useProducts();
  const { currentUser, toggleWishlist } = useUsers();
  const { getCategoryImage } = useCategories();

  const product = getProduct(id || '');
  const otherCartLines = useMemo(
    () => items.filter((i) => i.id !== (id || '')).slice(0, 4),
    [items, id]
  );

  useEffect(() => {
    if (!lightboxOpen || !product || product.images.length < 2) return;
    const len = product.images.length;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveImage((i) => (i - 1 + len) % len);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveImage((i) => (i + 1) % len);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, product]);

  useEffect(() => {
    setActiveImage(0);
  }, [id]);

  if (!product) {
    return (
      <div className="container mx-auto max-w-full px-4 pb-24 pt-28 text-center md:pt-32">
        <h1 className="text-2xl font-serif font-bold mb-4">Produit non trouvé</h1>
        <Button onClick={() => navigate('/shop')}>Retour à la boutique</Button>
      </div>
    );
  }

  const inCart = items.find((i) => i.id === product.id);
  const inWishlist = !!(currentUser?.wishlist.includes(product.id));
  const lineSubtotal = product.price * quantity;
  const estimatedTotalAfterAdd = totalPrice + product.price * quantity;

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

  const whatsappProductHref = useMemo(() => {
    const productPageUrl =
      typeof window !== 'undefined' ? `${window.location.origin}/product/${encodeURIComponent(product.id)}` : undefined;
    return buildWhatsAppProductUrl(product, quantity, productPageUrl);
  }, [product, quantity]);

  return (
    <div className="min-w-0 max-w-[100vw] overflow-x-clip pb-20 pt-20 sm:pb-24 sm:pt-24 md:pt-28">
      <div className="container mx-auto max-w-full px-3 sm:px-4 md:px-6">
        {/* Breadcrumbs */}
        <nav className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs uppercase tracking-widest text-muted-foreground">
          <Link to="/" className="shrink-0 hover:text-primary transition-colors">
            Accueil
          </Link>
          <ChevronLeft className="h-3 w-3 shrink-0 rotate-180" />
          <Link to="/shop" className="shrink-0 hover:text-primary transition-colors">
            Boutique
          </Link>
          <ChevronLeft className="h-3 w-3 shrink-0 rotate-180" />
          <span className="min-w-0 break-words font-bold text-foreground">{product.name}</span>
        </nav>

        <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Image Gallery — taille réduite (largeur max + colonne 4/12) */}
          <div className="min-w-0 space-y-3 lg:col-span-4">
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              onClick={() => setLightboxOpen(true)}
              aria-label="Explorer la photo en grand format"
              className="group relative m-0 mx-auto aspect-[3/4] w-full max-w-[220px] cursor-zoom-in overflow-hidden rounded-2xl border-0 bg-muted p-0 shadow-md outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:max-w-[260px] md:max-w-[280px] lg:mx-0 lg:max-w-[240px] xl:max-w-[260px]"
            >
              <img
                src={product.images[activeImage]}
                alt={product.name}
                draggable={false}
                className="h-full w-full select-none object-cover"
                referrerPolicy="no-referrer"
                fetchPriority="high"
                loading="eager"
                decoding="async"
              />
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent pt-14 pb-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:pb-3 sm:opacity-100"
                aria-hidden
              >
                <span className="flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-white drop-shadow-md">
                  <ZoomIn className="h-4 w-4 shrink-0" />
                  Explorer
                </span>
              </div>
              {product.badge && (
                <Badge className="pointer-events-none absolute left-3 top-3 z-10 border-none bg-white/90 px-3 py-1 font-sans text-[9px] uppercase tracking-[0.3em] text-black backdrop-blur-md sm:left-4 sm:top-4 sm:px-3.5 sm:py-1.5 sm:text-[10px]">
                  {product.badge}
                </Badge>
              )}
              {product.stock <= 0 && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-md">
                  <Badge className="rounded-full border-none bg-destructive px-8 py-3 font-sans text-sm uppercase tracking-[0.3em] text-white shadow-xl sm:tracking-[0.4em]">
                    Rupture de Stock
                  </Badge>
                </div>
              )}
            </motion.button>
            
            {product.images.length > 1 && (
              <div className="mx-auto grid w-full max-w-[220px] grid-cols-4 gap-1.5 sm:max-w-[260px] sm:gap-2 md:max-w-[280px] lg:mx-0 lg:max-w-[240px] xl:max-w-[260px]">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Voir la miniature ${idx + 1}`}
                    onClick={() => setActiveImage(idx)}
                    className={`aspect-square overflow-hidden rounded-xl border-0 p-0 transition-all duration-300 ring-2 ring-transparent ring-inset sm:rounded-2xl ${activeImage === idx ? 'ring-primary shadow-md' : 'opacity-40 hover:opacity-100'}`}
                  >
                    <img
                      src={img}
                      alt=""
                      draggable={false}
                      className="h-full w-full select-none object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
 
          {/* Product Info */}
          <div className="min-w-0 space-y-7 lg:col-span-8">
            <div className="space-y-3">
              <div className="flex justify-end">
                <a
                  href={whatsappProductHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Contacter sur WhatsApp — informations sur la pièce, lien vers la photo et la fiche produit"
                  className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md shadow-emerald-900/20 transition-transform hover:scale-105 hover:bg-[#20BD5A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2 sm:size-14"
                >
                  <svg viewBox="0 0 24 24" className="size-7 sm:size-8" fill="currentColor" aria-hidden>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              </div>
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                <img
                  src={getCategoryImage(product.category)}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-lg border border-primary/15 object-cover shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_CATEGORY_IMAGE;
                  }}
                />
                <span className="max-w-full shrink-0 text-[10px] font-bold uppercase tracking-[0.35em] text-primary sm:tracking-[0.45em]">
                  {product.category}
                </span>
                <div className="h-px min-w-[1.5rem] flex-1 bg-primary/10" />
                <div className="flex shrink-0 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                  ))}
                </div>
              </div>
              <div className="flex items-start gap-3 sm:gap-4">
                <h1 className="min-w-0 flex-1 break-words text-4xl font-serif font-bold leading-[1.05] sm:text-5xl md:text-6xl lg:text-7xl md:leading-[0.95]">
                  {product.name}
                </h1>
                {currentUser ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="mt-1 shrink-0 rounded-full border-primary/25 shadow-sm"
                    aria-label={inWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    onClick={async () => {
                      const was = inWishlist;
                      try {
                        await toggleWishlist(product.id);
                        toast.success(was ? 'Retiré des favoris' : 'Ajouté aux favoris — retrouvez-la dans Mon compte.');
                      } catch {
                        toast.error('Impossible de mettre à jour les favoris.');
                      }
                    }}
                  >
                    <Heart className={cn('h-5 w-5', inWishlist && 'fill-primary text-primary')} />
                  </Button>
                ) : null}
              </div>
              <p className="font-sans text-3xl font-light text-foreground/60 sm:text-4xl">
                {product.price.toLocaleString()} FCFA
              </p>
            </div>
 
            <p className="text-lg font-light leading-relaxed text-muted-foreground sm:text-xl">
              {product.description}
            </p>

            <div className="space-y-5 pt-1">
              <Card
                size="sm"
                className="w-full max-w-md overflow-visible border-primary/15 bg-gradient-to-b from-card to-muted/20 shadow-md"
              >
                <CardHeader className="border-b border-primary/10 pb-2 [.border-b]:pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="font-serif text-base sm:text-lg">Commander cette pièce</CardTitle>
                    <Package className="h-4 w-4 shrink-0 text-primary/70" aria-hidden />
                  </div>
                  {inCart && (
                    <p className="text-[11px] leading-snug text-muted-foreground">
                      Déjà <span className="font-semibold text-foreground">{inCart.quantity}</span> au panier — ajustez la quantité puis{' '}
                      <span className="font-medium text-foreground">Passer en caisse</span>.
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3 pt-2">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                        Quantité
                      </p>
                      <div className="mt-1.5 flex w-full max-w-[11rem] items-center justify-between rounded-full border bg-muted/30 p-1 sm:w-auto sm:justify-start sm:gap-0 sm:px-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 rounded-full hover:bg-background"
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={product.stock <= 0}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="min-w-[2rem] text-center text-sm font-bold tabular-nums">{quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 rounded-full hover:bg-background"
                          type="button"
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                          disabled={product.stock <= 0}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        Stock :{' '}
                        <span className={product.stock <= 3 ? 'font-semibold text-amber-700' : 'font-medium text-foreground'}>
                          {product.stock} disponible{product.stock > 1 ? 's' : ''}
                        </span>
                      </p>
                    </div>
                    <div className="rounded-xl border border-primary/10 bg-background/80 px-3 py-2 text-right sm:min-w-[9.5rem]">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                        Sous-total
                      </p>
                      <p className="mt-0.5 font-serif text-lg font-bold tabular-nums text-primary sm:text-xl">
                        {lineSubtotal.toLocaleString()} <span className="text-xs font-sans font-normal text-muted-foreground">FCFA</span>
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {product.price.toLocaleString()} × {quantity}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-dashed border-primary/20 bg-muted/30 p-2.5 sm:p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Panier actuel
                    </p>
                    {totalItems === 0 ? (
                      <p className="mt-1.5 text-xs text-muted-foreground">Panier vide.</p>
                    ) : (
                      <>
                        <p className="mt-1 text-xs text-foreground">
                          <span className="font-semibold tabular-nums">{totalItems}</span> article
                          {totalItems > 1 ? 's' : ''} —{' '}
                          <span className="font-semibold tabular-nums text-primary">
                            {totalPrice.toLocaleString()} FCFA
                          </span>
                        </p>
                        {quantity > 0 && (
                          <p className="mt-1.5 border-t border-primary/10 pt-1.5 text-[11px] text-muted-foreground">
                            Estimé après ajout :{' '}
                            <span className="font-semibold text-foreground tabular-nums">
                              {estimatedTotalAfterAdd.toLocaleString()} FCFA
                            </span>
                          </p>
                        )}
                        {otherCartLines.length > 0 && (
                          <ul className="mt-2 max-h-28 space-y-1.5 overflow-y-auto pr-1 text-left">
                            {otherCartLines.map((row) => (
                              <li
                                key={row.id}
                                className="flex items-center gap-2 rounded-md bg-background/60 p-1.5 ring-1 ring-foreground/5"
                              >
                                <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-muted">
                                  <img
                                    src={row.images[0]}
                                    alt=""
                                    className="h-full w-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-[11px] font-medium leading-tight">{row.name}</p>
                                  <p className="text-[10px] text-muted-foreground tabular-nums">
                                    ×{row.quantity} · {(row.price * row.quantity).toLocaleString()} FCFA
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
                <CardFooter
                  className={`flex flex-col gap-2 border-t border-primary/10 bg-muted/20 p-3 sm:p-3 ${inCart ? '' : 'sm:flex-row'}`}
                >
                  {!inCart && (
                    <Button
                      variant="outline"
                      className="h-10 w-full rounded-full border-primary text-sm font-semibold text-primary hover:bg-primary/5 sm:h-10 sm:flex-1"
                      onClick={handleAddToCart}
                      disabled={product.stock <= 0}
                      type="button"
                    >
                      <ShoppingCart className="mr-1.5 h-4 w-4 shrink-0" />
                      {product.stock <= 0 ? 'Indisponible' : 'Ajouter au panier'}
                    </Button>
                  )}
                  {inCart ? (
                    <div className="flex w-full flex-col gap-2 sm:flex-row">
                      <Link
                        to="/cart"
                        onClick={() => window.scrollTo(0, 0)}
                        className={cn(
                          buttonVariants({ variant: 'outline' }),
                          'h-10 w-full rounded-full border-primary/40 text-sm font-semibold sm:h-10 sm:flex-1'
                        )}
                      >
                        Voir le panier
                      </Link>
                      <Button
                        className="h-10 w-full rounded-full text-sm font-semibold shadow-md shadow-primary/15 sm:h-10 sm:flex-1"
                        onClick={handleBuyNow}
                        disabled={product.stock <= 0}
                        type="button"
                      >
                        {product.stock <= 0 ? 'Rupture de stock' : 'Passer en caisse'}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="h-10 w-full rounded-full text-sm font-semibold shadow-md shadow-primary/15 sm:h-10 sm:flex-1"
                      onClick={handleBuyNow}
                      disabled={product.stock <= 0}
                      type="button"
                    >
                      {product.stock <= 0 ? 'Rupture de stock' : 'Passer en caisse'}
                    </Button>
                  )}
                </CardFooter>
              </Card>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-4 rounded-[30px] border border-primary/5 bg-muted/20 p-6">
                  <ShieldCheck className="h-8 w-8 shrink-0 text-primary/60" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em]">Qualité Garantie</p>
                    <p className="text-sm text-muted-foreground">Chaque pièce est unique et sculptée à la main</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-[30px] border border-primary/5 bg-muted/20 p-6">
                  <Truck className="h-8 w-8 shrink-0 text-primary/60" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em]">Livraison Locale</p>
                    <p className="text-sm italic text-muted-foreground">
                      Note : Les livraisons sont aux frais des clients.
                    </p>
                  </div>
                </div>
              </div>
            </div>
 
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="h-auto w-full justify-start gap-6 rounded-none border-b bg-transparent p-0">
                <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent px-0 pb-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all data-[state=active]:border-primary data-[state=active]:bg-transparent">
                  Détails
                </TabsTrigger>
                <TabsTrigger value="dimensions" className="rounded-none border-b-2 border-transparent px-0 pb-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all data-[state=active]:border-primary data-[state=active]:bg-transparent">
                  Dimensions
                </TabsTrigger>
                <TabsTrigger value="shipping" className="rounded-none border-b-2 border-transparent px-0 pb-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all data-[state=active]:border-primary data-[state=active]:bg-transparent">
                  Livraison
                </TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-4 pt-6 text-base font-light leading-relaxed text-muted-foreground sm:text-lg">
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
              <TabsContent value="dimensions" className="pt-6">
                <div className="p-8 bg-muted/20 rounded-[30px] border border-primary/5 flex justify-between items-center">
                  <span className="font-bold uppercase tracking-widest text-xs">Dimensions totales</span>
                  <span className="text-2xl font-serif italic">{product.dimensions}</span>
                </div>
              </TabsContent>
              <TabsContent value="shipping" className="pt-6 text-base font-light leading-relaxed text-muted-foreground sm:text-lg">
                <p>Nous livrons partout à Abidjan dans un délai de 2 à 5 jours ouvrables. Pour les commandes hors Abidjan, veuillez nous contacter pour un devis personnalisé.</p>
                <p className="mt-4 font-bold text-primary">Information importante : Les frais de livraison sont à la charge du client et seront réglés lors de la réception du colis.</p>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <ProductCommentsSection productId={product.id} currentUser={currentUser} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 md:mt-24">
            <div className="mb-8 flex items-end justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-serif font-bold">Produits Similaires</h2>
                <p className="text-muted-foreground">D'autres créations qui pourraient vous plaire.</p>
              </div>
              <Link to="/shop">
                <Button variant="link" className="text-primary font-bold uppercase tracking-widest text-xs">Voir tout</Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          showCloseButton
          className="max-h-[92vh] max-w-[min(96vw,72rem)] overflow-hidden border-0 bg-zinc-950 p-2 text-white shadow-none ring-0 sm:p-4 sm:max-w-[min(96vw,72rem)]"
        >
          <DialogTitle className="sr-only">Galerie photo — {product.name}</DialogTitle>
          <div className="relative flex min-h-[min(50vh,320px)] items-center justify-center">
            <img
              src={product.images[activeImage]}
              alt={product.name}
              draggable={false}
              className="max-h-[min(82vh,900px)] w-full object-contain select-none"
              referrerPolicy="no-referrer"
            />
            {product.images.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute left-1 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full border-0 bg-white/90 text-foreground shadow-md hover:bg-white sm:left-2"
                  aria-label="Photo précédente"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImage((i) => (i - 1 + product.images.length) % product.images.length);
                  }}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute right-1 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full border-0 bg-white/90 text-foreground shadow-md hover:bg-white sm:right-2"
                  aria-label="Photo suivante"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImage((i) => (i + 1) % product.images.length);
                  }}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2 border-t border-white/10 pt-3">
              {product.images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  className={cn(
                    'h-2.5 w-2.5 rounded-full transition-all',
                    idx === activeImage ? 'scale-125 bg-white' : 'bg-white/35 hover:bg-white/60'
                  )}
                  aria-label={`Afficher la photo ${idx + 1}`}
                />
              ))}
            </div>
          )}
          {product.images.length > 1 && (
            <p className="text-center text-[10px] uppercase tracking-widest text-white/45">
              Flèches du clavier · échap pour fermer
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

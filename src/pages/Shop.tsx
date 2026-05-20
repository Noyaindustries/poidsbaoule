import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, Search, LayoutGrid, List, X, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, useSearchParams } from 'react-router-dom';
import { useProducts } from '@/lib/ProductContext';
import { useCategories } from '@/lib/CategoryContext';
import { sortProductsFeatured, primaryProductImage } from '@/lib/productImages';
import { CatalogStatusBanner } from '@/components/CatalogStatusBanner';
import { FALLBACK_CATEGORY_IMAGE } from '@/constants';

export default function Shop() {
  const { products, isLoadingProducts, productsError, refreshProducts } = useProducts();
  const { categories, getCategoryImage } = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filterCategoryLabels = useMemo(() => {
    const s = new Set(categories);
    products.forEach((p) => {
      if (p.category) s.add(p.category);
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [categories, products]);

  const activeCategory = searchParams.get('cat') || 'Tous';
  const sortBy = searchParams.get('sort') || 'featured';

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activeCategory !== 'Tous') {
      result = result.filter(p => p.category.includes(activeCategory) || p.category === activeCategory);
    }

    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const min = priceMin.trim() ? Number(priceMin) : null;
    const max = priceMax.trim() ? Number(priceMax) : null;
    if (min !== null && !Number.isNaN(min)) {
      result = result.filter((p) => p.price >= min);
    }
    if (max !== null && !Number.isNaN(max)) {
      result = result.filter((p) => p.price <= max);
    }

    if (sortBy === 'featured') result = sortProductsFeatured(result);
    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'newest') result.sort((a, b) => b.id.localeCompare(a.id));

    return result;
  }, [activeCategory, searchQuery, sortBy, products, priceMin, priceMax]);

  const handleCategoryChange = (cat: string) => {
    if (cat === 'Tous') {
      searchParams.delete('cat');
    } else {
      searchParams.set('cat', cat);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-w-0 max-w-[100vw] overflow-x-clip pb-16 pt-20 sm:pb-24 sm:pt-24">
      {/* Header */}
      <section className="relative mb-8 overflow-hidden py-10 sm:mb-12 sm:py-16 md:py-32">
        <div className="absolute inset-0 bg-muted/30 -z-10" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2 -z-10" />
        
        <div className="container mx-auto max-w-full space-y-4 px-3 text-center sm:space-y-6 sm:px-4 md:px-6">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] uppercase tracking-[0.5em] font-bold text-primary block"
          >
            Curated Collection
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-serif font-bold sm:text-5xl md:text-7xl lg:text-8xl"
          >
            La <span className="italic">Boutique</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-base font-light leading-relaxed text-muted-foreground sm:text-lg"
          >
            Explorez notre collection de pièces artisanales uniques, sculptées à la main à Abidjan pour sublimer votre sanctuaire personnel.
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto max-w-full px-3 sm:px-4 md:px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-8">
            <div className="space-y-4">
              <h3 className="font-bold uppercase tracking-widest text-xs">Recherche</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher..." 
                  className="pl-10 rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold uppercase tracking-widest text-xs">Catégories</h3>
              <div className="flex flex-col gap-2">
                {['Tous', ...filterCategoryLabels].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className={`flex w-full items-center gap-3 rounded-lg py-2.5 pl-3 pr-4 text-left text-sm transition-colors ${
                      activeCategory === cat
                        ? 'bg-primary font-medium text-white'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {cat === 'Tous' ? (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10">
                        <Sparkles className="h-4 w-4" />
                      </span>
                    ) : (
                      <img
                        src={getCategoryImage(cat)}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-lg border border-white/15 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_CATEGORY_IMAGE;
                        }}
                      />
                    )}
                    <span className="min-w-0 leading-snug">{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold uppercase tracking-widest text-xs">Prix</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    className="h-8 text-xs"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    className="h-8 text-xs"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs rounded-full"
                  onClick={() => {
                    setPriceMin('');
                    setPriceMax('');
                  }}
                >
                  Réinitialiser le prix
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-grow space-y-8">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 rounded-2xl border bg-card p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:p-4">
              <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-4">
                <Sheet>
                  <SheetTrigger render={<Button variant="outline" size="sm" className="lg:hidden rounded-full"><Filter className="mr-2 h-4 w-4" /> Filtres</Button>} />
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle>Filtres</SheetTitle>
                    </SheetHeader>
                    <div className="py-8 space-y-8">
                      <div className="space-y-4">
                        <h3 className="font-bold uppercase tracking-widest text-xs">Catégories</h3>
                        <div className="flex flex-wrap gap-2">
                          {['Tous', ...filterCategoryLabels].map((cat) => (
                            <Badge
                              key={cat}
                              variant={activeCategory === cat ? 'default' : 'outline'}
                              className="flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 pl-2"
                              onClick={() => handleCategoryChange(cat)}
                            >
                              {cat !== 'Tous' ? (
                                <img
                                  src={getCategoryImage(cat)}
                                  alt=""
                                  className="h-7 w-7 rounded-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = FALLBACK_CATEGORY_IMAGE;
                                  }}
                                />
                              ) : null}
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                <p className="text-sm text-muted-foreground">
                  <span className="font-bold text-foreground">{filteredProducts.length}</span> produits trouvés
                </p>
              </div>

              <div className="flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-4">
                <div className="relative w-full sm:hidden">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    className="h-11 rounded-full pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-1 self-start rounded-lg bg-muted p-1 sm:self-center">
                  <Button 
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                <Select value={sortBy} onValueChange={(val) => {
                  searchParams.set('sort', val);
                  setSearchParams(searchParams);
                }}>
                  <SelectTrigger className="h-11 w-full min-w-0 rounded-full sm:h-10 sm:w-[180px]">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">En vedette</SelectItem>
                    <SelectItem value="newest">Nouveautés</SelectItem>
                    <SelectItem value="price-asc">Prix croissant</SelectItem>
                    <SelectItem value="price-desc">Prix décroissant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            {(activeCategory !== 'Tous' || searchQuery) && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mr-2">Filtres actifs:</span>
                {activeCategory !== 'Tous' && (
                  <Badge variant="secondary" className="rounded-full pl-3 pr-1 py-1 gap-1">
                    Catégorie: {activeCategory}
                    <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full" onClick={() => handleCategoryChange('Tous')}>
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="secondary" className="rounded-full pl-3 pr-1 py-1 gap-1">
                    Recherche: {searchQuery}
                    <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full" onClick={() => setSearchQuery('')}>
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                <Button variant="link" size="sm" className="text-xs text-primary" onClick={() => {
                  setSearchQuery('');
                  handleCategoryChange('Tous');
                }}>
                  Tout effacer
                </Button>
              </div>
            )}

            <CatalogStatusBanner
              isLoading={isLoadingProducts}
              error={productsError}
              isEmpty={products.length === 0}
              onRetry={refreshProducts}
            />

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8" : "flex flex-col gap-10"}>
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Link 
                        to={`/product/${product.id}`} 
                        onClick={() => window.scrollTo(0, 0)}
                        className={`group block bg-card rounded-[28px] overflow-hidden border-none hover:shadow-2xl transition-all duration-700 ${viewMode === 'list' ? 'flex flex-col md:flex-row gap-5 p-3 md:p-5' : 'p-3 sm:p-4'}`}
                      >
                        <div className={`relative overflow-hidden bg-muted ${viewMode === 'list' ? 'w-full md:w-72 aspect-[5/6] md:aspect-[4/5] shrink-0 rounded-[24px]' : 'aspect-[6/7] sm:aspect-[4/5]'}`}>
                          <img 
                            src={primaryProductImage(product)} 
                            alt={product.name} 
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            decoding="async"
                          />
                          <div className="absolute inset-0 hidden items-center justify-center bg-black/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100 lg:flex">
                            <Button variant="secondary" className="rounded-full px-6 py-3 shadow-2xl text-sm">
                              Voir les détails
                            </Button>
                          </div>
                          {product.badge && (
                            <Badge className="absolute top-4 left-4 bg-white/90 text-black hover:bg-white backdrop-blur-md border-none font-sans uppercase text-[9px] tracking-[0.3em] px-3 py-2 rounded-full">
                              {product.badge}
                            </Badge>
                          )}
                          {product.stock <= 0 && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                              <Badge className="bg-destructive text-white border-none font-sans uppercase text-[10px] tracking-[0.3em] px-4 py-2 rounded-full shadow-xl">
                                Rupture de Stock
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        <div className={`space-y-3 ${viewMode === 'list' ? 'flex-1 py-4' : 'text-center'}`}>
                          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3">
                            <div className="flex items-center gap-2 justify-center sm:justify-start">
                              <Heart className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                              <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold">{product.category}</p>
                            </div>
                          </div>
                          <h3 className="text-lg sm:text-xl font-serif font-bold group-hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-sm sm:text-base font-semibold text-foreground/80">{product.price.toLocaleString()} FCFA</p>
                          <Button 
                            variant={product.stock <= 0 ? "outline" : "secondary"} 
                            size="sm" 
                            className="mx-auto sm:mx-0 rounded-full px-5 py-3"
                            disabled={product.stock <= 0}
                          >
                            {product.stock <= 0 ? "Indisponible" : "Commander"}
                          </Button>
                          {viewMode === 'list' && (
                            <p className="text-muted-foreground max-w-xl font-light leading-relaxed line-clamp-3">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="py-24 text-center space-y-4 bg-muted/20 rounded-[40px] border border-dashed border-primary/20">
                <div className="text-6xl">🔍</div>
                <h3 className="text-2xl font-serif font-bold">Aucun produit trouvé</h3>
                <p className="text-muted-foreground">Essayez d'ajuster vos filtres ou votre recherche.</p>
                <Button variant="outline" className="rounded-full px-8 py-6" onClick={() => {
                  setSearchQuery('');
                  setPriceMin('');
                  setPriceMax('');
                  handleCategoryChange('Tous');
                }}>
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowRight, ShoppingBag, Tag, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { PRODUCTS } from '@/constants';
import { useProducts } from '@/lib/ProductContext';
import { useCategories } from '@/lib/CategoryContext';
import { FALLBACK_CATEGORY_IMAGE } from '@/constants';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const { products } = useProducts();
  const { categories, getCategoryImage } = useCategories();

  const catalog = useMemo(
    () => (products.length > 0 ? products : PRODUCTS),
    [products]
  );

  const suggestionCategories = useMemo(() => {
    const s = new Set(categories);
    catalog.forEach((p) => {
      if (p.category) s.add(p.category);
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b, 'fr')).slice(0, 4);
  }, [categories, catalog]);

  // Real-time filtering
  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return catalog;

    const searchTerms = normalizedQuery.split(' ').filter(Boolean);
    return catalog.filter(product => {
      const productName = product.name.toLowerCase();
      const productDesc = product.description.toLowerCase();
      const productCat = product.category.toLowerCase();
      
      return searchTerms.every(term => 
        productName.includes(term) || 
        productDesc.includes(term) || 
        productCat.includes(term)
      );
    });
  }, [query, catalog]);

  // Reset query on close
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[min(92dvh,900px)] w-[min(100%,calc(100vw-1rem))] max-w-2xl flex-col overflow-hidden rounded-2xl border-primary/20 bg-background/95 p-0 shadow-2xl backdrop-blur-xl sm:rounded-3xl sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b border-primary/10 bg-muted/30 p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="rounded-2xl bg-primary/10 p-2.5 text-primary sm:p-3">
              <Search className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <DialogTitle className="text-xl font-serif font-bold text-primary sm:text-2xl">Rechercher</DialogTitle>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Trouvez votre pièce unique</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col space-y-4 overflow-hidden p-4 sm:space-y-6 sm:p-6">
          <div className="group relative shrink-0">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary sm:left-6 sm:h-5 sm:w-5" />
            <Input
              autoFocus
              placeholder="Nom, catégorie, description..."
              className="w-full rounded-2xl border-primary/20 bg-background/50 py-5 pl-11 pr-4 text-base font-serif italic transition-all focus-visible:ring-primary/30 sm:py-8 sm:pl-14 sm:pr-6 sm:text-xl"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="flex min-h-0 flex-1 flex-col space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between px-1 sm:px-2">
              <h3 className="min-w-0 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">
                {!query.trim() ? 'Tous les articles de la boutique' : `${results.length} Résultats pour « ${query} »`}
              </h3>
            </div>

            <ScrollArea className="min-h-[180px] min-w-0 flex-1 pr-2 sm:min-h-[240px] sm:pr-4 md:h-[min(400px,55dvh)]">
              <AnimatePresence mode="popLayout">
                {query.length < 2 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {suggestionCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setQuery(cat)}
                        className="flex items-center gap-4 rounded-2xl border border-transparent bg-muted/50 p-4 text-left transition-all hover:border-primary/20 hover:bg-primary/5"
                      >
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm">
                          <img
                            src={getCategoryImage(cat)}
                            alt=""
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = FALLBACK_CATEGORY_IMAGE;
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-serif text-sm font-bold">{cat}</p>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Catégorie</p>
                        </div>
                        <Tag className="ml-auto h-4 w-4 shrink-0 text-primary/40" />
                      </button>
                    ))}
                    <div className="md:col-span-2 p-6 rounded-3xl bg-primary/5 border border-dashed border-primary/20 flex flex-col items-center text-center space-y-3">
                      <Sparkles className="h-8 w-8 text-primary/40" />
                      <p className="text-sm text-foreground/70 italic font-serif">
                        Explorez nos créations en ciment blanc et plâtre, <br />
                        sculptées à la main pour votre intérieur.
                      </p>
                    </div>
                  </motion.div>
                ) : results.length > 0 ? (
                  <div className="space-y-3">
                    {results.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        onClick={() => { onClose(); window.scrollTo(0, 0); }}
                        className="block group"
                      >
                        <motion.div 
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted transition-colors border border-transparent hover:border-primary/10"
                        >
                          <div className="h-20 w-20 rounded-xl overflow-hidden shrink-0 bg-muted">
                            <img 
                              src={product.images[0]} 
                              alt={product.name} 
                              className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            />
                          </div>
                          <div className="flex-grow min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="text-[10px] uppercase tracking-widest text-primary font-bold">{product.category}</p>
                              {product.badge && (
                                <Badge variant="outline" className="text-[8px] px-2 py-0 border-primary/30 text-primary/70">
                                  {product.badge}
                                </Badge>
                              )}
                            </div>
                            <h4 className="text-lg font-serif font-bold truncate group-hover:text-primary transition-colors">
                              {product.name}
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-1 italic font-serif">
                              {product.description}
                            </p>
                          </div>
                          <div className="text-right px-4">
                            <p className="text-sm font-bold whitespace-nowrap">{product.price.toLocaleString()} F</p>
                            <ArrowRight className="h-4 w-4 text-primary ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-center space-y-4"
                  >
                    <div className="h-20 w-20 flex items-center justify-center bg-muted rounded-full">
                      <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-serif font-bold uppercase tracking-widest">Aucun résultat</p>
                      <p className="text-sm text-muted-foreground">Nous n'avons trouvé aucun produit correspondant à "{query}"</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 border-t border-primary/10 bg-muted/30 p-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="hidden items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 sm:flex sm:gap-6">
            <span className="flex items-center gap-2"><kbd className="bg-white px-2 py-1 rounded shadow-sm">ESC</kbd> Fermer</span>
            <span className="flex items-center gap-2"><kbd className="bg-white px-2 py-1 rounded shadow-sm">↵</kbd> Choisir</span>
          </div>
          <Link to="/shop" onClick={onClose} className="text-xs font-bold text-primary hover:underline underline-offset-4">
            Voir toute la boutique →
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}

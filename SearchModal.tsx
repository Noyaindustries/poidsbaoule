import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowRight, ShoppingBag, Tag, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { PRODUCTS, CATEGORIES } from '@/constants';
import { Product } from '@/types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  
  // Real-time filtering
  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return PRODUCTS;

    const searchTerms = normalizedQuery.split(' ').filter(Boolean);
    return PRODUCTS.filter(product => {
      const productName = product.name.toLowerCase();
      const productDesc = product.description.toLowerCase();
      const productCat = product.category.toLowerCase();
      
      return searchTerms.every(term => 
        productName.includes(term) || 
        productDesc.includes(term) || 
        productCat.includes(term)
      );
    });
  }, [query]);

  // Reset query on close
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-primary/20 shadow-2xl rounded-3xl">
        <DialogHeader className="p-6 border-b border-primary/10 bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <Search className="h-6 w-6" />
            </div>
            <div className="flex-grow space-y-1">
              <DialogTitle className="text-2xl font-serif font-bold text-primary">Rechercher</DialogTitle>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Trouvez votre pièce unique</p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              autoFocus
              placeholder="Nom, catégorie, description..."
              className="w-full pl-14 pr-6 py-8 text-xl rounded-2xl border-primary/20 bg-background/50 focus-visible:ring-primary/30 transition-all font-serif italic"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {!query.trim() ? 'Tous les articles de la boutique' : `${results.length} Résultats pour "${query}"`}
              </h3>
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <AnimatePresence mode="popLayout">
                {query.length < 2 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {CATEGORIES.slice(0, 4).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setQuery(cat)}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all text-left"
                      >
                        <div className="h-10 w-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-primary">
                          <Tag className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold font-serif">{cat}</p>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Explorer</p>
                        </div>
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

        <div className="p-4 bg-muted/30 border-t border-primary/10 flex justify-between items-center px-8">
          <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
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

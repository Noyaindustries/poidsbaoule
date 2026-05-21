import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, Filter, MoreVertical, Edit2, 
  Trash2, Eye, Globe, Image as ImageIcon,
  Tag, BarChart2, Layers, Package, AlertTriangle, CheckCircle2, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ADMIN_QUICK_ACTION_EVENT } from '@/lib/admin-utils';
import { useCategories } from '@/lib/CategoryContext';
import { FALLBACK_CATEGORY_IMAGE } from '@/constants';
import { useProducts } from '@/lib/ProductContext';
import { toast } from 'sonner';
import { Product } from '@/types';
import { LocalImageField } from '@/components/admin/LocalImageField';
import { AdminProductImage } from '@/components/admin/AdminProductImage';
import { resolveProductImageUrl } from '@/lib/productImages';

export default function ProductManager() {
  const { products, updateProduct, deleteProduct } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'critical' | 'healthy'>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [pendingDeleteProduct, setPendingDeleteProduct] = useState<Product | null>(null);

  useEffect(() => {
    const onQuick = (e: Event) => {
      if ((e as CustomEvent<string>).detail === 'create-product') {
        setIsCreateOpen(true);
      }
    };
    window.addEventListener(ADMIN_QUICK_ACTION_EVENT, onQuick as EventListener);
    return () => window.removeEventListener(ADMIN_QUICK_ACTION_EVENT, onQuick as EventListener);
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'critical' && p.stock <= 5) ||
      (stockFilter === 'healthy' && p.stock > 5);
    return matchesSearch && matchesStock;
  });

  const visibleProducts = filteredProducts.length > 0 ? filteredProducts : products;
  const criticalStock = products.filter((p) => p.stock <= 5).length;
  const healthyStock = products.filter((p) => p.stock > 5).length;
  const inventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setIsEditing(true);
  };

  const handleSave = async (updatedProduct: any) => {
    try {
      await updateProduct(updatedProduct);
      toast.success("Produit mis à jour avec succès !");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(`Échec de la mise à jour: ${error?.message ?? 'Erreur inconnue'}`);
    }
  };

  const handleCreate = async (newProduct: Product) => {
    try {
      await updateProduct(newProduct);
      toast.success("Produit créé !");
      setIsCreateOpen(false);
    } catch (error: any) {
      toast.error(`Échec de création: ${error?.message ?? 'Erreur inconnue'}`);
    }
  };

  const handleDelete = async (product: Product) => {
    try {
      await deleteProduct(product.id);
      toast.success('Produit supprimé.');
    } catch (error: any) {
      toast.error(`Suppression impossible: ${error?.message ?? 'Erreur inconnue'}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-slate-500">Produits catalogués</p>
              <Package className="h-4 w-4 text-slate-400" />
            </div>
            <p className="text-2xl font-semibold text-slate-900">{products.length}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-slate-500">Stock critique</p>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-semibold text-slate-900">{criticalStock}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-slate-500">Stock sain</p>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-semibold text-slate-900">{healthyStock}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-slate-500">Valeur du stock</p>
              <BarChart2 className="h-4 w-4 text-slate-400" />
            </div>
            <p className="text-2xl font-semibold text-slate-900">{inventoryValue.toLocaleString()} F</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold">Produits</h2>
          <p className="text-sm text-muted-foreground">Gérez votre catalogue de produits.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher un produit..." 
            className="pl-10 rounded-full bg-card border-none shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <Select value={stockFilter} onValueChange={(value: 'all' | 'critical' | 'healthy') => setStockFilter(value)}>
            <SelectTrigger className="w-[200px] rounded-full shadow-sm bg-white">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filtrer le stock" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les stocks</SelectItem>
              <SelectItem value="critical">Stock critique (≤ 5)</SelectItem>
              <SelectItem value="healthy">Stock sain (&gt; 5)</SelectItem>
            </SelectContent>
          </Select>
          <Button className="rounded-full shadow-lg shadow-primary/20" onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nouveau Produit
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500">
                <tr>
                  <th className="px-8 py-4">Produit</th>
                  <th className="px-8 py-4">Catégorie</th>
                  <th className="px-8 py-4">Prix</th>
                  <th className="px-8 py-4">Stock</th>
                  <th className="px-8 py-4">Statut</th>
                  <th className="px-8 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {visibleProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-10 text-center text-muted-foreground">
                        Aucun produit disponible.
                      </td>
                    </tr>
                  ) : (
                    visibleProducts.map((p) => (
                      <motion.tr 
                        key={p.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-slate-50 transition-colors group"
                      >
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl overflow-hidden bg-muted shrink-0 shadow-sm transition-transform group-hover:scale-105">
                            <AdminProductImage
                              src={p.images[0] ?? ''}
                              alt={p.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-bold">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{p.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <Badge variant="secondary" className="rounded-full px-3 py-1 bg-primary/5 text-primary border-none text-[10px] font-bold">
                          {p.category}
                        </Badge>
                      </td>
                      <td className="px-8 py-4 font-medium">{p.price.toLocaleString()} FCFA</td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`h-1.5 w-1.5 rounded-full ${p.stock > 5 ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className={p.stock <= 5 ? 'text-destructive font-bold' : ''}>{p.stock} unités</span>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <Badge className={`rounded-full px-3 py-1 border-none text-[10px] ${
                          p.stock <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {p.stock <= 5 ? 'À surveiller' : 'Stable'}
                        </Badge>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger 
                            render={
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100"><MoreVertical className="h-4 w-4" /></Button>
                            }
                          />
                          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-none">
                            <DropdownMenuItem onClick={() => handleEdit(p)} className="rounded-xl flex gap-3 p-3">
                              <Edit2 className="h-4 w-4" /> Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl flex gap-3 p-3">
                              <ImageIcon className="h-4 w-4" /> Galerie
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl flex gap-3 p-3">
                              <Globe className="h-4 w-4" /> Voir sur le site
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setPendingDeleteProduct(p)} className="rounded-xl flex gap-3 p-3 text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-4 w-4" /> Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))
                )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="w-[min(90vw,820px)] max-h-[82vh] overflow-hidden rounded-3xl p-0 sm:max-w-none" showCloseButton={true}>
          <ProductForm onSave={handleCreate} />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="w-[min(90vw,820px)] max-h-[82vh] overflow-hidden rounded-3xl p-0 sm:max-w-none" showCloseButton={true}>
          <ProductForm 
            product={selectedProduct} 
            onSave={handleSave}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(pendingDeleteProduct)} onOpenChange={(open) => !open && setPendingDeleteProduct(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Supprimer ce produit ?</DialogTitle>
            <DialogDescription>
              Cette action est irreversible. Le produit <span className="font-semibold">{pendingDeleteProduct?.name}</span> sera supprime du catalogue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDeleteProduct(null)}>Annuler</Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!pendingDeleteProduct) return;
                await handleDelete(pendingDeleteProduct);
                setPendingDeleteProduct(null);
              }}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductForm({ product, onSave }: { product?: Product, onSave: (p: Product) => Promise<void> }) {
  const { categories, getCategoryImage } = useCategories();
  const generatedId = `PBH-${Date.now()}`;
  const defaultCategory = categories[0] ?? 'Mobilier Niche';
  const [formData, setFormData] = useState<any>(
    product || {
      id: generatedId,
      name: '',
      category: defaultCategory,
      price: 0,
      description: '',
      images: [],
      stock: 0,
      dimensions: '',
      badge: '',
    }
  );
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryOptions = useMemo(() => {
    const s = new Set(categories);
    if (formData.category) s.add(formData.category);
    return Array.from(s).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [categories, formData.category]);

  const isNewProduct = !product;
  const mainImage = formData.images?.[0];

  const addImageToGallery = (url: string) => {
    const normalized = resolveProductImageUrl(url.trim());
    if (!normalized) return;
    if (formData.images.includes(normalized)) {
      toast.message('Cette image est déjà dans la galerie.');
      return;
    }
    setFormData({ ...formData, images: [...formData.images, normalized] });
    setImageUrlInput('');
  };

  const addImageFromInput = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) {
      toast.error('Importez un fichier ou collez une URL, puis « Ajouter ».');
      return;
    }
    addImageToGallery(trimmed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      toast.error("Le nom du produit est obligatoire.");
      return;
    }

    if (!formData.images?.length) {
      toast.error("Ajoute au moins une image avant de publier.");
      return;
    }

    if (!Number.isFinite(formData.price) || formData.price < 0) {
      toast.error("Le prix doit être un nombre valide.");
      return;
    }

    if (!Number.isFinite(formData.stock) || formData.stock < 0) {
      toast.error("Le stock doit être un nombre valide.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData as Product);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-h-[82vh] overflow-y-auto p-0">
      <DialogHeader className="p-8 pb-4">
        <DialogTitle className="text-3xl font-serif font-bold">
          {product ? "Modifier le Produit" : "Nouveau Produit"}
        </DialogTitle>
        <DialogDescription>
          Remplissez les détails ci-dessous pour {product ? 'mettre à jour' : 'créer'} votre création.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-8 p-8 pt-4">
        <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-500 mb-2">Aperçu rapide</p>
              <h4 className="text-lg font-semibold text-slate-900">{formData.name?.trim() || 'Nom du produit'}</h4>
              <p className="text-sm text-slate-600 mt-1">{formData.category}</p>
              <p className="text-sm font-semibold text-primary mt-2">
                {(Number.isFinite(formData.price) ? formData.price : 0).toLocaleString()} FCFA
              </p>
            </div>
            <div className="h-20 w-20 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0">
              {mainImage ? (
                <AdminProductImage
                  src={mainImage}
                  alt="Aperçu produit"
                  className="h-full w-full min-h-[200px] object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-400">
                  <ImageIcon className="h-5 w-5" />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Basic Info */}
        <section className="space-y-6 rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 text-primary">
            <Edit2 className="h-5 w-5" />
            <h3 className="font-bold uppercase tracking-widest text-xs">Informations de base</h3>
          </div>
          <Separator className="opacity-50" />
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Nom du produit</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="ex: Miroir Contrast" 
                className="rounded-xl border-muted-foreground/20" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select 
                value={formData.category}
                onValueChange={(val) => setFormData({...formData, category: val})}
              >
                <SelectTrigger className="h-auto min-h-10 w-full max-w-full rounded-xl py-2">
                  <img
                    src={getCategoryImage(formData.category)}
                    alt=""
                    className="h-8 w-8 shrink-0 rounded-md border border-border object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_CATEGORY_IMAGE;
                    }}
                  />
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent className="min-w-(--anchor-width)">
                  {categoryOptions.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      <img
                        src={getCategoryImage(cat)}
                        alt=""
                        className="h-7 w-7 shrink-0 rounded-md object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_CATEGORY_IMAGE;
                        }}
                      />
                      <span>{cat}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Prix (FCFA)</Label>
              <Input 
                id="price" 
                type="number" 
                value={formData.price} 
                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                placeholder="0" 
                className="rounded-xl" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description détaillée</Label>
            <Textarea 
              id="description" 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="rounded-xl min-h-[120px]" 
            />
          </div>
        </section>

        {/* Gallery & Variations */}
        <section className="space-y-6 rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 text-primary">
            <Layers className="h-5 w-5" />
            <h3 className="font-bold uppercase tracking-widest text-xs">Galerie & Variantes</h3>
          </div>
          <Separator className="opacity-50" />
          <div className="grid grid-cols-3 gap-4">
            <AnimatePresence>
              {formData.images.map((img: string, i: number) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="aspect-square rounded-2xl overflow-hidden relative group border bg-muted"
                >
                  <AdminProductImage
                    src={img}
                    alt={`Image ${i + 1} du produit`}
                    className="h-full w-full min-h-[100px] object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button 
                      type="button"
                      size="icon" 
                      variant="ghost" 
                      className="text-white hover:text-destructive hover:bg-white/20"
                      onClick={() => setFormData({...formData, images: formData.images.filter((_: any, idx: number) => idx !== i)})}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            <div className="col-span-3 space-y-3">
              <Label htmlFor="product-gallery-url" className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Nouvelle image (URL ou fichier local)
              </Label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <LocalImageField
                  id="product-gallery-url"
                  value={imageUrlInput}
                  onChange={setImageUrlInput}
                  onUploadComplete={addImageToGallery}
                  placeholder="https://… ou fichier local (ajout auto à la galerie)"
                  className="min-w-0 flex-1"
                  onInputKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addImageFromInput();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="h-10 shrink-0 rounded-xl px-6 sm:h-auto sm:self-stretch"
                  onClick={addImageFromInput}
                >
                  <Plus className="mr-2 h-4 w-4" /> Ajouter
                </Button>
              </div>
              <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                « Fichier local » compresse et ajoute l’image à la galerie. Pensez à enregistrer le produit en bas.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock disponible</Label>
              <Input 
                id="stock" 
                type="number" 
                value={formData.stock} 
                onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                className="rounded-xl shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="badge">Badge promotionnel</Label>
              <Select 
                value={formData.badge || 'none'}
                onValueChange={(val) => setFormData({...formData, badge: val === 'none' ? '' : val})}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Aucun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun</SelectItem>
                  <SelectItem value="Nouveau">Nouveau</SelectItem>
                  <SelectItem value="Pièce Unique">Pièce Unique</SelectItem>
                  <SelectItem value="Best-seller">Best-seller</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* SEO Section */}
        <section className="space-y-6 rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 text-primary">
            <Globe className="h-5 w-5" />
            <h3 className="font-bold uppercase tracking-widest text-xs">Référencement (SEO)</h3>
          </div>
          <Separator className="opacity-50" />
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meta-title">Méta-Titre</Label>
              <Input id="meta-title" placeholder="Poids Baoulé | ..." className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta-desc">Méta-Description</Label>
              <Textarea id="meta-desc" placeholder="Décrivez le produit pour Google..." className="rounded-xl" />
            </div>
          </div>
        </section>

        <DialogFooter className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t px-8 py-5 flex gap-4 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-full h-12"
            onClick={() => onSave(formData as Product)}
            disabled={isSubmitting}
          >
            {isNewProduct ? 'Enregistrer en brouillon' : 'Sauvegarder'}
          </Button>
          <Button type="submit" className="flex-2 rounded-full h-12 text-base font-bold" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                Enregistrement...
              </span>
            ) : product ? "Mettre à jour" : "Publier le produit"}
          </Button>
        </DialogFooter>
      </form>
    </div>
  );
}

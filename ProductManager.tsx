import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, Filter, MoreVertical, Edit2, 
  Trash2, Eye, Globe, Image as ImageIcon,
  Tag, BarChart2, Layers
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
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
  SheetDescription, SheetFooter
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES } from '@/constants';
import { useProducts } from '@/lib/ProductContext';
import { toast } from 'sonner';
import { Product } from '@/types';

export default function ProductManager() {
  const { products, updateProduct } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const visibleProducts = filteredProducts.length > 0 ? filteredProducts : products;

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setIsEditing(true);
  };

  const handleSave = async (updatedProduct: any) => {
    await updateProduct(updatedProduct);
    toast.success("Produit mis à jour avec succès !");
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
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
          <Button variant="outline" className="rounded-full shadow-sm">
            <Filter className="mr-2 h-4 w-4" /> Filtres
          </Button>
          <Sheet>
            <SheetTrigger 
              render={
                <Button className="rounded-full shadow-lg shadow-primary/20">
                  <Plus className="mr-2 h-4 w-4" /> Nouveau Produit
                </Button>
              }
            />
            <ProductForm onSave={() => toast.success("Produit créé !")} />
          </Sheet>
        </div>
      </div>

      <Card className="rounded-[32px] border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
                <tr>
                  <th className="px-8 py-4">Produit</th>
                  <th className="px-8 py-4">Catégorie</th>
                  <th className="px-8 py-4">Prix</th>
                  <th className="px-8 py-4">Stock</th>
                  <th className="px-8 py-4">Statut</th>
                  <th className="px-8 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
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
                        className="hover:bg-muted/20 transition-colors group"
                      >
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl overflow-hidden bg-muted shrink-0 shadow-sm transition-transform group-hover:scale-105">
                            <img src={p.images[0]} className="w-full h-full object-cover" />
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
                        <Badge className="rounded-full px-3 py-1 bg-green-100 text-green-700 border-none text-[10px]">
                          Publié
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
                            <DropdownMenuItem className="rounded-xl flex gap-3 p-3 text-destructive hover:bg-destructive/10">
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

      {/* Edit Sheet */}
      <Sheet open={isEditing} onOpenChange={setIsEditing}>
        <ProductForm 
          product={selectedProduct} 
          onSave={(updatedProduct) => {
            handleSave(updatedProduct);
          }} 
        />
      </Sheet>
    </div>
  );
}

function ProductForm({ product, onSave }: { product?: any, onSave: (p: any) => void }) {
  const [formData, setFormData] = useState<any>(product || {
    id: `PBH-${Math.floor(Math.random() * 1000)}`,
    name: '',
    category: 'Mobilier Niche',
    price: 0,
    description: '',
    images: [],
    stock: 0,
    dimensions: '',
    badge: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <SheetContent className="sm:max-w-2xl w-full overflow-y-auto rounded-l-[40px] border-none shadow-2xl p-0">
      <SheetHeader className="p-8 pb-4">
        <SheetTitle className="text-3xl font-serif font-bold">
          {product ? "Modifier le Produit" : "Nouveau Produit"}
        </SheetTitle>
        <SheetDescription>
          Remplissez les détails ci-dessous pour {product ? 'mettre à jour' : 'creer'} votre création.
        </SheetDescription>
      </SheetHeader>

      <form onSubmit={handleSubmit} className="space-y-12 p-8 pt-4 pb-32">
        {/* Basic Info */}
        <section className="space-y-6">
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
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Prix (FCFA)</Label>
              <Input 
                id="price" 
                type="number" 
                value={formData.price} 
                onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
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
        <section className="space-y-6">
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
                  <img src={img} className="w-full h-full object-cover" />
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
            
            <div className="col-span-3 space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="Collez l'URL d'une image..." 
                  className="rounded-xl flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const target = e.target as HTMLInputElement;
                      if (target.value) {
                        setFormData({...formData, images: [...formData.images, target.value]});
                        target.value = '';
                      }
                    }
                  }}
                  id="new-image-url"
                />
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="rounded-xl px-6"
                  onClick={() => {
                    const input = document.getElementById('new-image-url') as HTMLInputElement;
                    if (input.value) {
                      setFormData({...formData, images: [...formData.images, input.value]});
                      input.value = '';
                    } else {
                      toast.error("Veuillez entrer une URL d'image");
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" /> Ajouter
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold px-2">
                Astuce : Collez l'URL de l'image et appuyez sur Entrée
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
                onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
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
        <section className="space-y-6">
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

        <SheetFooter className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md p-8 border-t flex gap-4">
          <Button type="button" variant="outline" className="flex-1 rounded-full h-14" onClick={() => onSave(formData)}>
            Enregistrer en Brouillon
          </Button>
          <Button type="submit" className="flex-[2] rounded-full h-14 text-lg font-bold">
            {product ? "Mettre à jour" : "Publier le Produit"}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  );
}

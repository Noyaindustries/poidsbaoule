import { useMemo, useState } from 'react';
import { Tags, Plus, Pencil, Trash2, Package, RotateCcw, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useCategories } from '@/lib/CategoryContext';
import { useProducts } from '@/lib/ProductContext';
import { FALLBACK_CATEGORY_IMAGE } from '@/constants';
import { LocalImageField } from '@/components/admin/LocalImageField';

export default function CategoryManager() {
  const {
    categoryList,
    categories,
    addCategory,
    removeCategory,
    replaceCategoryInList,
    resetToDefaults,
    setCategoryImage,
    getCategoryImage,
  } = useCategories();
  const { products, updateProduct } = useProducts();
  const [newName, setNewName] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameOld, setRenameOld] = useState('');
  const [renameNew, setRenameNew] = useState('');
  const [busy, setBusy] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [imageTarget, setImageTarget] = useState('');
  const [imageDraft, setImageDraft] = useState('');

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of products) {
      const c = p.category || '—';
      m.set(c, (m.get(c) ?? 0) + 1);
    }
    return m;
  }, [products]);

  const sortedList = useMemo(() => {
    const fromNames = categoryList.map((c) => c.name);
    const extra = [...counts.keys()].filter((c) => !fromNames.includes(c) && c !== '—');
    return [...fromNames, ...extra].sort((a, b) => a.localeCompare(b, 'fr'));
  }, [categoryList, counts]);

  const handleAdd = () => {
    if (!newName.trim()) {
      toast.error('Indiquez un nom de catégorie.');
      return;
    }
    if (!newImageUrl.trim()) {
      toast.error('Ajoutez une image : URL (chemin /public ou HTTPS) ou import depuis votre appareil.');
      return;
    }
    if (addCategory(newName.trim(), newImageUrl.trim())) {
      toast.success('Catégorie ajoutée.');
      setNewName('');
      setNewImageUrl('');
    } else {
      toast.error('Cette catégorie existe déjà (nom identique ou quasi identique).');
    }
  };

  const openImageEditor = (name: string) => {
    setImageTarget(name);
    setImageDraft(getCategoryImage(name));
    setImageOpen(true);
  };

  const saveImage = () => {
    const u = imageDraft.trim();
    if (!u) {
      toast.error('Indiquez une URL ou importez une image.');
      return;
    }
    setCategoryImage(imageTarget, u);
    toast.success('Image de catégorie mise à jour.');
    setImageOpen(false);
  };

  const openRename = (name: string) => {
    setRenameOld(name);
    setRenameNew(name);
    setRenameOpen(true);
  };

  const handleRename = async () => {
    const neu = renameNew.trim();
    if (!neu) {
      toast.error('Le nouveau nom est vide.');
      return;
    }
    if (neu === renameOld) {
      setRenameOpen(false);
      return;
    }
    if (categoryList.some((c) => c.name !== renameOld && c.name.toLowerCase() === neu.toLowerCase())) {
      toast.error('Une catégorie porte déjà ce nom.');
      return;
    }
    setBusy(true);
    try {
      const affected = products.filter((p) => p.category === renameOld);
      for (const p of affected) {
        await updateProduct({ ...p, category: neu });
      }
      replaceCategoryInList(renameOld, neu);
      toast.success(
        affected.length > 0
          ? `Catégorie renommée — ${affected.length} produit(s) mis à jour.`
          : 'Catégorie renommée.'
      );
      setRenameOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Échec du renommage.');
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = (name: string) => {
    const n = counts.get(name) ?? 0;
    if (n > 0) {
      toast.error(`Impossible de supprimer : ${n} produit(s) utilisent encore « ${name} ». Renommez-les ou réassignez-les.`);
      return;
    }
    removeCategory(name);
    toast.success('Catégorie supprimée de la liste.');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Catalogue</p>
          <h2 className="font-serif text-3xl font-bold text-slate-900 md:text-4xl">Catégories boutique</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Chaque catégorie a une image affichée dans les filtres de la boutique et dans les sélecteurs produits. Utilisez une
            URL HTTPS, un chemin sous <code className="rounded bg-muted px-1 text-xs">public</code> (ex.{' '}
            <code className="rounded bg-muted px-1 text-xs">/PHOTO-….jpg</code>) ou le bouton « Fichier local ».
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-full shrink-0"
          onClick={() => {
            resetToDefaults();
            toast.message('Liste réinitialisée', { description: 'Noms et visuels d’origine du site.' });
          }}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Réinitialiser la liste
        </Button>
      </div>

      <Card className="rounded-[28px] border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif text-xl">
            <Plus className="h-5 w-5 text-primary" />
            Ajouter une catégorie
          </CardTitle>
          <CardDescription>Nom + image obligatoires.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div className="space-y-2">
              <Label htmlFor="new-cat">Nom</Label>
              <Input
                id="new-cat"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="rounded-xl"
                placeholder="ex. Luminaires & Suspensions"
              />
            </div>
            <Button type="button" className="rounded-full shrink-0" onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-cat-img">Image (URL ou fichier local)</Label>
            <LocalImageField
              id="new-cat-img"
              value={newImageUrl}
              onChange={setNewImageUrl}
              placeholder="/mon-visuel.jpg ou import…"
            />
          </div>
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
              {newImageUrl.trim() ? (
                <img
                  src={newImageUrl.trim()}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_CATEGORY_IMAGE;
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-400">
                  <ImageIcon className="h-6 w-6" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Aperçu — même rendu que sur la boutique.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-slate-200/80 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="flex items-center gap-2 font-serif text-xl">
            <Tags className="h-5 w-5 text-primary" />
            Catégories ({sortedList.length})
          </CardTitle>
          <CardDescription>
            Les catégories utilisées par des produits mais absentes de la liste apparaissent aussi (définissez leur image puis
            ajoutez-les à la liste si besoin).
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 w-20">Visuel</th>
                  <th className="px-4 py-3">Catégorie</th>
                  <th className="px-4 py-3">Produits</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedList.map((name) => {
                  const n = counts.get(name) ?? 0;
                  const inList = categories.includes(name);
                  const img = getCategoryImage(name);
                  return (
                    <tr key={name} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          className="group relative block h-14 w-14 overflow-hidden rounded-xl border border-slate-200 bg-white"
                          title="Modifier l’image"
                          onClick={() => openImageEditor(name)}
                        >
                          <img
                            src={img}
                            alt=""
                            className="h-full w-full object-cover transition group-hover:opacity-90"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = FALLBACK_CATEGORY_IMAGE;
                            }}
                          />
                          <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-[10px] font-bold text-white opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
                            Image
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-slate-900">{name}</span>
                          {!inList ? (
                            <Badge variant="outline" className="text-[10px]">
                              Hors liste
                            </Badge>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-slate-600">
                          <Package className="h-3.5 w-3.5" />
                          {n}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-lg text-slate-600"
                            title="Image"
                            onClick={() => openImageEditor(name)}
                          >
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-lg text-slate-600"
                            title="Renommer"
                            onClick={() => openRename(name)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-lg text-destructive hover:text-destructive"
                            title={n > 0 ? 'Des produits utilisent encore cette catégorie' : 'Supprimer de la liste'}
                            disabled={n > 0 || !inList}
                            onClick={() => handleRemove(name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Renommer la catégorie</DialogTitle>
            <DialogDescription>
              Tous les produits avec « {renameOld} » recevront le nouveau libellé. L’image reste la même.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="rename-cat">Nouveau nom</Label>
            <Input
              id="rename-cat"
              value={renameNew}
              onChange={(e) => setRenameNew(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" className="rounded-full" onClick={() => setRenameOpen(false)}>
              Annuler
            </Button>
            <Button type="button" className="rounded-full" disabled={busy} onClick={() => void handleRename()}>
              {busy ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={imageOpen} onOpenChange={setImageOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Image — {imageTarget}</DialogTitle>
            <DialogDescription>URL ou fichier local — même rendu filtres boutique et fiches.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="cat-img-url">Image</Label>
            <LocalImageField
              id="cat-img-url"
              value={imageDraft}
              onChange={setImageDraft}
              placeholder="/visuel.jpg ou import…"
            />
            <div className="flex justify-center">
              <div className="h-32 w-32 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <img
                  src={imageDraft.trim() || FALLBACK_CATEGORY_IMAGE}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_CATEGORY_IMAGE;
                  }}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" className="rounded-full" onClick={() => setImageOpen(false)}>
              Annuler
            </Button>
            <Button type="button" className="rounded-full" onClick={saveImage}>
              Enregistrer l’image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Separator className="opacity-40" />
      <p className="text-xs text-muted-foreground">
        Hors liste : ouvrez « Image » sur la ligne pour enregistrer une URL ou un import local — la catégorie est alors ajoutée à
        la liste avec ce visuel. Sinon utilisez « Ajouter une catégorie » avec nom + image dès le départ.
      </p>
    </div>
  );
}

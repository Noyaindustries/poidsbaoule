import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, MessageSquarePlus, Pencil, Trash2, Star, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTestimonials } from '@/lib/TestimonialContext';
import { cn } from '@/lib/utils';
import type { CustomerTestimonial } from '@/types';
import { ADMIN_QUICK_ACTION_EVENT } from '@/lib/admin-utils';

const emptyForm: Omit<CustomerTestimonial, 'id' | 'createdAt'> = {
  author: '',
  role: 'Cliente',
  quote: '',
  location: '',
  context: '',
  date: '',
  rating: 5,
  featured: false,
  verifiedPurchase: false,
  sortOrder: 0,
};

function toForm(t: CustomerTestimonial): Omit<CustomerTestimonial, 'id' | 'createdAt'> {
  return {
    author: t.author,
    role: t.role,
    quote: t.quote,
    location: t.location ?? '',
    context: t.context ?? '',
    date: t.date ?? '',
    rating: t.rating,
    featured: Boolean(t.featured),
    verifiedPurchase: Boolean(t.verifiedPurchase),
    sortOrder: t.sortOrder ?? 0,
  };
}

export default function TestimonialManager() {
  const { testimonials, loading, saveTestimonial, createTestimonial, deleteTestimonial } = useTestimonials();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<CustomerTestimonial, 'id' | 'createdAt'>>(emptyForm);

  useEffect(() => {
    const onQuick = (e: Event) => {
      if ((e as CustomEvent<string>).detail === 'new-testimonial') {
        setEditingId(null);
        setForm({ ...emptyForm, sortOrder: testimonials.length });
        setDialogOpen(true);
      }
    };
    window.addEventListener(ADMIN_QUICK_ACTION_EVENT, onQuick as EventListener);
    return () => window.removeEventListener(ADMIN_QUICK_ACTION_EVENT, onQuick as EventListener);
  }, [testimonials.length]);

  const sorted = useMemo(
    () =>
      [...testimonials].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || (b.createdAt || '').localeCompare(a.createdAt || '')),
    [testimonials]
  );

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, sortOrder: testimonials.length });
    setDialogOpen(true);
  };

  const openEdit = (t: CustomerTestimonial) => {
    setEditingId(t.id);
    setForm(toForm(t));
    setDialogOpen(true);
  };

  const handleDelete = async (t: CustomerTestimonial) => {
    if (!window.confirm(`Supprimer le témoignage de « ${t.author} » ?`)) return;
    try {
      await deleteTestimonial(t.id);
      toast.success('Témoignage supprimé.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Suppression impossible.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.author.trim() || !form.quote.trim()) {
      toast.error('Auteur et citation sont obligatoires.');
      return;
    }
    try {
      if (editingId) {
        const prev = testimonials.find((x) => x.id === editingId);
        await saveTestimonial({
          id: editingId,
          ...form,
          location: form.location?.trim() || undefined,
          context: form.context?.trim() || undefined,
          date: form.date?.trim() || undefined,
          createdAt: prev?.createdAt,
        });
        toast.success('Témoignage mis à jour.');
      } else {
        await createTestimonial({
          ...form,
          location: form.location?.trim() || undefined,
          context: form.context?.trim() || undefined,
          date: form.date?.trim() || undefined,
        });
        toast.success('Témoignage publié.');
      }
      setDialogOpen(false);
      setEditingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Enregistrement impossible.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Contenu vitrine</p>
          <h2 className="font-serif text-3xl font-bold text-slate-900 md:text-4xl">Avis & témoignages</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Les textes affichés sur la page d’accueil (section « Avis clients & témoignages »). Un seul témoignage peut être mis
            en vedette ; il apparaît en grand sur fond sombre.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/#avis-clients"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'default' }),
              'inline-flex rounded-full no-underline hover:no-underline'
            )}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Voir sur l’accueil
          </Link>
          <Button type="button" className="rounded-full" onClick={openCreate}>
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            Nouveau témoignage
          </Button>
        </div>
      </div>

      <Card className="rounded-[28px] border-slate-200/80 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center gap-2 font-serif text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Liste ({testimonials.length})
          </CardTitle>
          <CardDescription>Tri par ordre croissant, puis date de création.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-8 text-sm text-muted-foreground">Chargement…</p>
          ) : sorted.length === 0 ? (
            <p className="p-8 text-sm text-muted-foreground">Aucun témoignage. Ajoutez-en un pour alimenter la page d’accueil.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Ordre</th>
                    <th className="px-4 py-3">Auteur</th>
                    <th className="px-4 py-3">Rôle</th>
                    <th className="px-4 py-3">Note</th>
                    <th className="px-4 py-3">Vedette</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sorted.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 tabular-nums text-slate-600">{t.sortOrder ?? 0}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{t.author}</td>
                      <td className="px-4 py-3 text-slate-600">{t.role}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-0.5 text-amber-600">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          {t.rating}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {t.featured ? (
                          <Badge className="rounded-full text-[10px]">Vedette</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-lg"
                            title="Modifier"
                            onClick={() => openEdit(t)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-lg text-destructive hover:text-destructive"
                            title="Supprimer"
                            onClick={() => void handleDelete(t)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg" showCloseButton>
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {editingId ? 'Modifier le témoignage' : 'Nouveau témoignage'}
            </DialogTitle>
            <DialogDescription>
              Ces informations sont visibles sur le site public. La citation peut être longue pour la carte vedette.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tm-author">Auteur / prénom affiché</Label>
                <Input
                  id="tm-author"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="rounded-xl"
                  placeholder="ex. Sarah K."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tm-role">Rôle ou titre</Label>
                <Input
                  id="tm-role"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="rounded-xl"
                  placeholder="Architecte, cliente…"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tm-loc">Lieu (optionnel)</Label>
                <Input
                  id="tm-loc"
                  value={form.location ?? ''}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="rounded-xl"
                  placeholder="Abidjan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tm-date">Date affichée (optionnel)</Label>
                <Input
                  id="tm-date"
                  value={form.date ?? ''}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="rounded-xl"
                  placeholder="Déc. 2025"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tm-context">Contexte court (optionnel)</Label>
              <Input
                id="tm-context"
                value={form.context ?? ''}
                onChange={(e) => setForm({ ...form, context: e.target.value })}
                className="rounded-xl"
                placeholder="ex. Consultation déco"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tm-quote">Citation</Label>
              <Textarea
                id="tm-quote"
                value={form.quote}
                onChange={(e) => setForm({ ...form, quote: e.target.value })}
                className="min-h-[120px] rounded-xl"
                placeholder="Le témoignage tel qu’affiché sur le site…"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Note</Label>
                <Select
                  value={String(form.rating)}
                  onValueChange={(v) => setForm({ ...form, rating: Number(v) as CustomerTestimonial['rating'] })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} / 5
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tm-order">Ordre d’affichage</Label>
                <Input
                  id="tm-order"
                  type="number"
                  min={0}
                  step={1}
                  value={form.sortOrder ?? 0}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="size-4 rounded border-input"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                />
                <span>
                  <span className="font-medium">Témoignage vedette</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Désactive automatiquement la vedette sur les autres avis.
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="size-4 rounded border-input"
                  checked={form.verifiedPurchase}
                  onChange={(e) => setForm({ ...form, verifiedPurchase: e.target.checked })}
                />
                <span>
                  <span className="font-medium">Achat vérifié</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">Affiche le badge sur la carte.</span>
                </span>
              </label>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" className="rounded-full" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" className="rounded-full">
                {editingId ? 'Enregistrer' : 'Publier'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

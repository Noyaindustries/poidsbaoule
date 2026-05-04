import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { MessageCircle, Send, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { apiJson, ApiError } from '@/lib/api';
import type { ProductComment, User } from '@/types';

function StarsRow({
  rating,
  interactive,
  onChange,
  className,
}: {
  rating: number;
  interactive?: boolean;
  onChange?: (n: 0 | 1 | 2 | 3 | 4 | 5) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(n === rating ? 0 : (n as 1 | 2 | 3 | 4 | 5))}
          className={cn(
            'rounded p-0.5 transition-colors',
            interactive && 'hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
            !interactive && 'cursor-default'
          )}
          aria-label={interactive ? `Noter ${n} sur 5` : undefined}
        >
          <Star
            className={cn(
              'h-4 w-4 sm:h-5 sm:w-5',
              n <= rating ? 'fill-accent text-accent' : 'fill-muted text-muted-foreground/35'
            )}
          />
        </button>
      ))}
    </div>
  );
}

function formatCommentDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

type Props = {
  productId: string;
  currentUser: User | null;
};

export function ProductCommentsSection({ productId, currentUser }: Props) {
  const [comments, setComments] = useState<ProductComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [authorName, setAuthorName] = useState(currentUser?.name ?? '');
  const [authorEmail, setAuthorEmail] = useState(currentUser?.email ?? '');
  const [body, setBody] = useState('');
  const [rating, setRating] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await apiJson<ProductComment[]>(`/api/products/${encodeURIComponent(productId)}/comments`);
      setComments(Array.isArray(list) ? list : []);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setComments([]);
      } else {
        toast.error('Impossible de charger les commentaires', {
          description: e instanceof Error ? e.message : 'Vérifiez la connexion au serveur.',
        });
        setComments([]);
      }
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (currentUser) {
      setAuthorName((prev) => (prev.trim() ? prev : currentUser.name ?? ''));
      setAuthorEmail((prev) => (prev.trim() ? prev : currentUser.email ?? ''));
    }
  }, [currentUser]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        authorName: authorName.trim(),
        body: body.trim(),
        authorEmail: authorEmail.trim() || undefined,
        userId: currentUser?.id,
      };
      if (rating > 0) payload.rating = rating;
      const created = await apiJson<ProductComment>(
        `/api/products/${encodeURIComponent(productId)}/comments`,
        { method: 'POST', body: JSON.stringify(payload) }
      );
      setComments((prev) => [created, ...prev]);
      setBody('');
      setRating(0);
      toast.success('Merci pour votre commentaire', { description: 'Il est visible sur cette page.' });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Erreur inconnue';
      toast.error('Envoi impossible', { description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className="mt-12 border-t border-primary/10 pt-10 sm:mt-16 sm:pt-12 md:mt-20 md:pt-16"
      aria-labelledby="product-comments-heading"
    >
      <div className="mb-8 flex flex-wrap items-end gap-3">
        <MessageCircle className="h-8 w-8 shrink-0 text-primary/70" aria-hidden />
        <div>
          <h2 id="product-comments-heading" className="text-2xl font-serif font-bold md:text-3xl">
            Avis & commentaires
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            Partagez votre ressenti sur cette pièce. Les avis sont publics sur cette fiche.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <Card className="border-primary/10 lg:col-span-5">
          <CardHeader>
            <CardTitle className="font-serif text-lg">Laisser un commentaire</CardTitle>
            <CardDescription>
              {currentUser
                ? 'Vous êtes connecté : votre prénom et email peuvent être préremplis.'
                : 'Vous pouvez commenter sans compte ; indiquez au moins votre nom.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="comment-author">Nom ou pseudo</Label>
                <Input
                  id="comment-author"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={120}
                  autoComplete="name"
                  placeholder="Ex. Aminata"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment-email">Email (optionnel)</Label>
                <Input
                  id="comment-email"
                  type="email"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  maxLength={200}
                  autoComplete="email"
                  placeholder="pour un éventuel suivi"
                />
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium leading-none">Note (optionnelle)</span>
                <StarsRow rating={rating} interactive onChange={setRating} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment-body">Votre message</Label>
                <Textarea
                  id="comment-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  minLength={4}
                  maxLength={2000}
                  rows={5}
                  placeholder="Qualité, livraison, ambiance de la pièce…"
                  className="resize-y min-h-[120px]"
                />
              </div>
              <Button type="submit" className="w-full rounded-full sm:w-auto" disabled={submitting}>
                {submitting ? (
                  'Publication…'
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Publier
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="min-w-0 space-y-4 lg:col-span-7">
          {loading ? (
            <p className="text-sm text-muted-foreground">Chargement des commentaires…</p>
          ) : comments.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-primary/15 bg-muted/20 p-8 text-center text-muted-foreground">
              Aucun commentaire pour le moment. Soyez le premier à donner votre avis.
            </p>
          ) : (
            <ul className="space-y-4">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className="rounded-2xl border border-primary/8 bg-card/50 p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 gap-y-1">
                    <p className="font-semibold text-foreground">{c.authorName}</p>
                    <time className="text-xs uppercase tracking-widest text-muted-foreground" dateTime={c.createdAt}>
                      {formatCommentDate(c.createdAt)}
                    </time>
                  </div>
                  {c.rating != null && c.rating > 0 && (
                    <StarsRow rating={c.rating} className="mt-2" />
                  )}
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground md:text-base">
                    {c.body}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

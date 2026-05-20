import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  onRetry: () => void;
  emptyMessage?: string;
};

export function CatalogStatusBanner({
  isLoading,
  error,
  isEmpty,
  onRetry,
  emptyMessage = 'Aucun produit disponible pour le moment.',
}: Props) {
  if (isLoading && isEmpty && !error) {
    return (
      <div className="rounded-[40px] border border-dashed border-muted-foreground/20 p-10 text-center text-muted-foreground">
        Chargement du catalogue…
      </div>
    );
  }

  if (error && isEmpty) {
    return (
      <div className="space-y-4 rounded-[40px] border border-destructive/30 bg-destructive/5 p-10 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" className="rounded-full" onClick={() => void onRetry()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="rounded-[40px] border border-dashed border-muted-foreground/20 p-10 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return null;
}

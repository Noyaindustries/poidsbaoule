import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { resolveProductImageUrl } from '@/lib/productImages';
import { cn } from '@/lib/utils';

type Props = {
  src: string;
  alt: string;
  className?: string;
};

export function AdminProductImage({ src, alt, className }: Props) {
  const [failed, setFailed] = useState(false);
  const resolved = resolveProductImageUrl(src);

  if (!src?.trim() || failed) {
    return (
      <div
        className={cn(
          'flex min-h-[80px] flex-col items-center justify-center gap-1 bg-muted text-muted-foreground',
          className
        )}
      >
        <ImageIcon className="h-6 w-6 opacity-50" />
        <span className="px-2 text-center text-[9px] uppercase tracking-wider">Image indisponible</span>
      </div>
    );
  }

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

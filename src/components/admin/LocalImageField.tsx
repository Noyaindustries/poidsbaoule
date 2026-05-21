import { useRef, useState, type ChangeEvent, type KeyboardEventHandler } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { uploadProductImage, formatImageRequirements } from '@/lib/uploadProductImage';
import { resolveProductImageUrl } from '@/lib/productImages';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AdminProductImage } from '@/components/admin/AdminProductImage';

type Props = {
  id: string;
  value: string;
  onChange: (next: string) => void;
  /** Ajoute directement l’image à la galerie produit après upload. */
  onUploadComplete?: (url: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  onInputKeyDown?: KeyboardEventHandler<HTMLInputElement>;
};

export function LocalImageField({
  id,
  value,
  onChange,
  onUploadComplete,
  placeholder,
  className,
  inputClassName,
  onInputKeyDown,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const { url, warning } = await uploadProductImage(file);
      onChange(url);
      onUploadComplete?.(url);
      if (warning) toast.warning(warning);
      toast.success('Image téléversée et ajoutée à la galerie.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import impossible.');
    } finally {
      setUploading(false);
    }
  };

  const previewUrl = value.trim() ? resolveProductImageUrl(value.trim()) : '';

  return (
    <div className={cn('flex min-w-0 flex-col gap-3', className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onInputKeyDown}
          className={cn('min-w-0 flex-1 rounded-xl font-mono text-xs', inputClassName)}
          placeholder={placeholder}
          disabled={uploading}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          aria-label="Importer une image depuis votre appareil"
          title="Importer une image depuis votre appareil"
          onChange={(e) => void handleFile(e)}
        />
        <Button
          type="button"
          variant="secondary"
          className="h-10 shrink-0 rounded-xl px-4 sm:h-auto"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {uploading ? 'Envoi…' : 'Fichier local'}
        </Button>
      </div>
      <p className="text-[10px] leading-relaxed text-muted-foreground">{formatImageRequirements()}</p>
      {previewUrl ? (
        <div className="overflow-hidden rounded-xl border bg-muted">
          <AdminProductImage
            src={previewUrl}
            alt="Aperçu"
            className="max-h-48 w-full object-contain"
          />
        </div>
      ) : null}
    </div>
  );
}

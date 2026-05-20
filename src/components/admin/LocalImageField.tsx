import { useRef, type ChangeEvent, type KeyboardEventHandler } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { uploadProductImage } from '@/lib/uploadProductImage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  id: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  onInputKeyDown?: KeyboardEventHandler<HTMLInputElement>;
};

/**
 * Champ URL + import fichier (téléversement serveur `/uploads/products/…`).
 */
export function LocalImageField({
  id,
  value,
  onChange,
  placeholder,
  className,
  inputClassName,
  onInputKeyDown,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const url = await uploadProductImage(file);
      onChange(url);
      toast.success('Image enregistrée sur le serveur.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import impossible.');
    }
  };

  return (
    <div className={cn('flex flex-col gap-2 sm:flex-row sm:items-stretch', className)}>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onInputKeyDown}
        className={cn('min-w-0 flex-1 rounded-xl font-mono text-xs', inputClassName)}
        placeholder={placeholder}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label="Importer une image depuis votre appareil"
        title="Importer une image depuis votre appareil"
        onChange={(e) => void handleFile(e)}
      />
      <Button
        type="button"
        variant="secondary"
        className="h-10 shrink-0 rounded-xl px-4 sm:h-auto"
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="mr-2 h-4 w-4" />
        Fichier local
      </Button>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  getConfiguredAdminAccessPassword,
  isAdminAccessPasswordConfigured,
  unlockAdminPanelGate,
  verifyAdminAccessPassword,
} from '@/lib/adminGate';

type Props = {
  onUnlocked: () => void;
};

export default function AdminPanelGate({ onUnlocked }: Props) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const configured = isAdminAccessPasswordConfigured();
  const devHint =
    import.meta.env.DEV && getConfiguredAdminAccessPassword() === 'poidsbaoule-admin'
      ? 'Mode dev : mot de passe par défaut si VITE_ADMIN_ACCESS_PASSWORD est absent : poidsbaoule-admin'
      : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!verifyAdminAccessPassword(password)) {
      setError('Mot de passe incorrect.');
      return;
    }
    unlockAdminPanelGate();
    onUnlocked();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-slate-100 via-slate-100 to-slate-200/80 px-4 py-12">
      <Card className="w-full max-w-md rounded-[28px] border-slate-200/80 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
            <Shield className="h-7 w-7" aria-hidden />
          </div>
          <CardTitle className="font-serif text-2xl text-slate-900">Accès back-office</CardTitle>
          <CardDescription>
            Saisissez le mot de passe réservé à l’équipe pour ouvrir le tableau de bord administrateur.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!configured ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Variable <code className="rounded bg-amber-100/80 px-1 text-xs">VITE_ADMIN_ACCESS_PASSWORD</code>{' '}
              absente du build de production. Ajoutez-la au fichier <code className="rounded bg-amber-100/80 px-1 text-xs">.env</code>, puis relancez{' '}
              <code className="rounded bg-amber-100/80 px-1 text-xs">npm run build</code>.
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-gate-password">Mot de passe</Label>
                <Input
                  id="admin-gate-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl"
                  placeholder="••••••••"
                />
              </div>
              {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
              {devHint ? <p className="text-xs text-muted-foreground">{devHint}</p> : null}
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Link
                  to="/"
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'rounded-full sm:order-1 inline-flex justify-center'
                  )}
                >
                  Retour au site
                </Link>
                <Button type="submit" className="rounded-full sm:order-2">
                  Accéder à l’admin
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

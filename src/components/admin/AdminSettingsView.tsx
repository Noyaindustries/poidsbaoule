import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Database,
  Globe,
  Image as ImageIcon,
  KeyRound,
  Monitor,
  RefreshCw,
  RotateCcw,
  Shield,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUsers } from '@/lib/UserContext';
import { useProducts } from '@/lib/ProductContext';
import { DEFAULT_HOME_LOGO, useBranding } from '@/lib/BrandingContext';
import { LocalImageField } from '@/components/admin/LocalImageField';

const STORAGE_KEY = 'pb_admin_preferences_v1';

export type AdminPreferences = {
  timezone: string;
  language: 'fr' | 'en';
  notifyNewOrders: boolean;
  notifyLowStock: boolean;
  notifyReservations: boolean;
  notifyDailyDigest: boolean;
  tableDensity: 'comfortable' | 'compact';
  largeText: boolean;
  boutiqueLabel: string;
};

const DEFAULT_PREFS: AdminPreferences = {
  timezone: 'Africa/Abidjan',
  language: 'fr',
  notifyNewOrders: true,
  notifyLowStock: true,
  notifyReservations: true,
  notifyDailyDigest: false,
  tableDensity: 'comfortable',
  largeText: false,
  boutiqueLabel: 'Poids Baoulé',
};

function loadPrefs(): AdminPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    const parsed = JSON.parse(raw) as Partial<AdminPreferences>;
    return { ...DEFAULT_PREFS, ...parsed };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

function savePrefs(p: AdminPreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

function ToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-colors hover:border-primary/20"
    >
      <div className="min-w-0 space-y-1">
        <span className="text-sm font-semibold text-slate-900">{label}</span>
        <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 size-4 shrink-0 rounded border-input text-primary focus-visible:ring-2 focus-visible:ring-ring"
      />
    </label>
  );
}

export default function AdminSettingsView() {
  const { currentUser, users, refreshUsers, changePassword } = useUsers();
  const { products, refreshProducts } = useProducts();
  const { branding, updateBranding, resetLogos, resolvedHomeLogo } = useBranding();
  const [prefs, setPrefs] = useState<AdminPreferences>(() => loadPrefs());
  const [dirty, setDirty] = useState(false);
  const [homeLogoDraft, setHomeLogoDraft] = useState(branding.homeLogoUrl);
  const [adminLogoDraft, setAdminLogoDraft] = useState(branding.adminLogoUrl ?? '');
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  useEffect(() => {
    setHomeLogoDraft(branding.homeLogoUrl);
    setAdminLogoDraft(branding.adminLogoUrl ?? '');
  }, [branding.homeLogoUrl, branding.adminLogoUrl]);

  useEffect(() => {
    document.documentElement.classList.toggle('pb-admin-large-text', prefs.largeText);
  }, [prefs.largeText]);

  const patch = useCallback((partial: Partial<AdminPreferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...partial };
      savePrefs(next);
      return next;
    });
    setDirty(true);
    window.dispatchEvent(new Event('pb-admin-prefs-update'));
  }, []);

  const handleSaveBanner = () => {
    if (!dirty) {
      toast.info('Aucune modification en attente.');
      return;
    }
    toast.success('Paramètres enregistrés sur cet appareil.');
    setDirty(false);
  };

  const handleResetPrefs = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPrefs({ ...DEFAULT_PREFS });
    setDirty(true);
    window.dispatchEvent(new Event('pb-admin-prefs-update'));
    toast.message('Préférences réinitialisées', { description: 'N’oubliez pas d’enregistrer si vous souhaitez conserver les valeurs par défaut.' });
  };

  const handleRefreshProducts = async () => {
    try {
      await refreshProducts();
      toast.success('Catalogue actualisé.');
    } catch {
      toast.error('Impossible de rafraîchir le catalogue.');
    }
  };

  const handleRefreshUsers = async () => {
    try {
      await refreshUsers();
      toast.success('Liste des utilisateurs actualisée.');
    } catch {
      toast.error('Impossible de rafraîchir les utilisateurs.');
    }
  };

  const apiHint = useMemo(() => {
    const base = import.meta.env.VITE_API_URL as string | undefined;
    if (base) return base;
    return typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api';
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Configuration</p>
          <h2 className="font-serif text-3xl font-bold text-slate-900 md:text-4xl">Paramètres du back-office</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Préférences d’affichage et de notification enregistrées localement sur ce navigateur. Les changements sensibles
            (comptes, rôles) passent par la base de données et l’API.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-full" type="button" onClick={handleResetPrefs}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Réinitialiser
          </Button>
          <Button className="rounded-full" type="button" onClick={handleSaveBanner}>
            Enregistrer
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-2xl bg-slate-100/80 p-1.5">
          <TabsTrigger
            value="general"
            className="rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wide data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Globe className="mr-1.5 h-3.5 w-3.5" />
            Général
          </TabsTrigger>
          <TabsTrigger
            value="branding"
            className="rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wide data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
            Logos
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wide data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Bell className="mr-1.5 h-3.5 w-3.5" />
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="display"
            className="rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wide data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Monitor className="mr-1.5 h-3.5 w-3.5" />
            Affichage
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wide data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Shield className="mr-1.5 h-3.5 w-3.5" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger
            value="data"
            className="rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wide data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Database className="mr-1.5 h-3.5 w-3.5" />
            Données
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 outline-none">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-[28px] border-slate-200/80 shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Identité boutique</CardTitle>
                <CardDescription>Nom affiché dans les e-mails et documents générés (brouillon local).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="boutique-label">Libellé atelier</Label>
                  <Input
                    id="boutique-label"
                    value={prefs.boutiqueLabel}
                    onChange={(e) => patch({ boutiqueLabel: e.target.value })}
                    className="rounded-xl"
                    placeholder="Poids Baoulé"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border-slate-200/80 shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Région & langue</CardTitle>
                <CardDescription>Fuseau pour les horodatages et exports.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>Fuseau horaire</Label>
                  <Select value={prefs.timezone} onValueChange={(v) => patch({ timezone: v })}>
                    <SelectTrigger className="h-10 w-full max-w-md rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Abidjan">Africa / Abidjan (GMT+0)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="Europe/Paris">Europe / Paris</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Langue de l’interface</Label>
                  <Select
                    value={prefs.language}
                    onValueChange={(v) => patch({ language: v as AdminPreferences['language'] })}
                  >
                    <SelectTrigger className="h-10 w-full max-w-md rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English (partiel)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    La langue anglaise est indicative : la plupart des libellés restent en français.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6 outline-none">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-[28px] border-slate-200/80 shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Logo site (accueil & navigation)</CardTitle>
                <CardDescription>
                  URL absolue, chemin sous <code className="text-xs">/public</code> (ex.{' '}
                  <code className="text-xs">/0-removebg-preview.png</code>) ou image importée depuis votre appareil. Affiché
                  dans la barre du haut et le pied de page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logo-home">Logo (URL ou fichier local)</Label>
                  <LocalImageField
                    id="logo-home"
                    value={homeLogoDraft}
                    onChange={setHomeLogoDraft}
                    placeholder={DEFAULT_HOME_LOGO}
                  />
                </div>
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Aperçu</p>
                  <img
                    src={homeLogoDraft.trim() || DEFAULT_HOME_LOGO}
                    alt=""
                    className="mx-auto max-h-32 w-auto object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_HOME_LOGO;
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border-slate-200/80 shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Logo back-office</CardTitle>
                <CardDescription>
                  Remplace le carré « PB » dans la barre latérale admin. URL, chemin /public ou fichier local. Laissez vide pour
                  revenir au monogramme.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logo-admin">Logo admin (URL ou fichier local, optionnel)</Label>
                  <LocalImageField
                    id="logo-admin"
                    value={adminLogoDraft}
                    onChange={setAdminLogoDraft}
                    placeholder="https://… ou /mon-logo.png"
                  />
                </div>
                <div className="flex justify-center rounded-2xl border border-slate-800 bg-slate-950 p-8">
                  {adminLogoDraft.trim() ? (
                    <img
                      src={adminLogoDraft.trim()}
                      alt=""
                      className="max-h-14 w-auto max-w-[180px] object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = '0.3';
                      }}
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white font-serif text-lg font-bold text-slate-900 shadow-sm">
                      PB
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    className="rounded-full"
                    onClick={() => {
                      updateBranding({
                        homeLogoUrl: homeLogoDraft.trim() || DEFAULT_HOME_LOGO,
                        adminLogoUrl: adminLogoDraft.trim() || null,
                      });
                      toast.success('Logos appliqués sur la boutique et l’admin.');
                    }}
                  >
                    Appliquer les logos
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => {
                      resetLogos();
                      setHomeLogoDraft(DEFAULT_HOME_LOGO);
                      setAdminLogoDraft('');
                      toast.message('Logos réinitialisés', { description: 'Valeurs par défaut du site.' });
                    }}
                  >
                    Réinitialiser les logos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <p className="text-xs text-muted-foreground">
            Astuce : placez un fichier dans <code className="rounded bg-muted px-1">public/</code> puis référencez-le par{' '}
            <code className="rounded bg-muted px-1">/nom-du-fichier.png</code>. Logo actuellement servi sur le site :{' '}
            <span className="font-mono text-[11px] text-foreground">{resolvedHomeLogo}</span>
          </p>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 outline-none">
          <Card className="rounded-[28px] border-slate-200/80 shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif text-xl">Alertes back-office</CardTitle>
              <CardDescription>
                Ces options pilotent les toasts et badges futurs ; elles sont stockées dans le navigateur.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <ToggleRow
                id="n-orders"
                label="Nouvelles commandes"
                description="Mettre en avant les entrées du module Commandes."
                checked={prefs.notifyNewOrders}
                onChange={(v) => patch({ notifyNewOrders: v })}
              />
              <ToggleRow
                id="n-stock"
                label="Stock critique"
                description="Rappels lorsque le stock d’un produit est bas."
                checked={prefs.notifyLowStock}
                onChange={(v) => patch({ notifyLowStock: v })}
              />
              <ToggleRow
                id="n-res"
                label="Réservations"
                description="Suivi des demandes de consultation et prestations."
                checked={prefs.notifyReservations}
                onChange={(v) => patch({ notifyReservations: v })}
              />
              <ToggleRow
                id="n-digest"
                label="Récap quotidien"
                description="Résumé matinal (e-mail non branché en démo)."
                checked={prefs.notifyDailyDigest}
                onChange={(v) => patch({ notifyDailyDigest: v })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display" className="space-y-6 outline-none">
          <Card className="rounded-[28px] border-slate-200/80 shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif text-xl">Listes & confort</CardTitle>
              <CardDescription>Densité des tableaux et lisibilité.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Densité des tableaux</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={prefs.tableDensity === 'comfortable' ? 'secondary' : 'outline'}
                    className="rounded-full"
                    onClick={() => patch({ tableDensity: 'comfortable' })}
                  >
                    Confort
                  </Button>
                  <Button
                    type="button"
                    variant={prefs.tableDensity === 'compact' ? 'secondary' : 'outline'}
                    className="rounded-full"
                    onClick={() => patch({ tableDensity: 'compact' })}
                  >
                    Compact
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Le mode compact réduit les espacements ; les modules peuvent l’exploiter via une variable CSS future.
                </p>
              </div>
              <Separator />
              <ToggleRow
                id="large-text"
                label="Texte plus grand"
                description="Augmente légèrement la taille de police dans l’admin (classe sur le document)."
                checked={prefs.largeText}
                onChange={(v) => {
                  patch({ largeText: v });
                  document.documentElement.classList.toggle('pb-admin-large-text', v);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 outline-none">
          <Card className="rounded-[28px] border-slate-200/80 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-xl">
                <UserIcon className="h-5 w-5 text-primary" />
                Session & accès
              </CardTitle>
              <CardDescription>Compte utilisé pour les actions API (création de commandes, etc.).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentUser ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">{currentUser.name}</span>
                    <Badge variant="secondary" className="rounded-full text-[10px] uppercase">
                      {currentUser.role}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{currentUser.email}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucune session active. Connectez-vous depuis la boutique pour associer un compte administrateur.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/account"
                  onClick={() => window.scrollTo(0, 0)}
                  className={cn(buttonVariants({ variant: 'outline' }), 'rounded-full')}
                >
                  Ouvrir Mon compte
                </Link>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Compte admin de démo (après <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">npm run seed:test</code>) :{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">admin@demo.poidsbaoule.local</code> /{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">demo123</code>.
              </p>
            </CardContent>
          </Card>

          {currentUser?.role === 'admin' ? (
            <Card className="rounded-[28px] border-slate-200/80 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-xl">
                  <KeyRound className="h-5 w-5 text-primary" />
                  Mot de passe administrateur
                </CardTitle>
                <CardDescription>
                  Saisissez votre mot de passe actuel puis le nouveau. Minimum 6 caractères. Stocké de façon sécurisée sur
                  le serveur (hachage bcrypt).
                </CardDescription>
              </CardHeader>
              <CardContent className="max-w-md space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-pwd-current">Mot de passe actuel</Label>
                  <Input
                    id="admin-pwd-current"
                    type="password"
                    autoComplete="current-password"
                    value={pwdCurrent}
                    onChange={(e) => setPwdCurrent(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-pwd-new">Nouveau mot de passe</Label>
                  <Input
                    id="admin-pwd-new"
                    type="password"
                    autoComplete="new-password"
                    value={pwdNew}
                    onChange={(e) => setPwdNew(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-pwd-confirm">Confirmer le nouveau mot de passe</Label>
                  <Input
                    id="admin-pwd-confirm"
                    type="password"
                    autoComplete="new-password"
                    value={pwdConfirm}
                    onChange={(e) => setPwdConfirm(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <Button
                  type="button"
                  className="rounded-full"
                  disabled={pwdSubmitting}
                  onClick={() => {
                    void (async () => {
                      if (pwdNew !== pwdConfirm) {
                        toast.error('Les deux saisies du nouveau mot de passe ne correspondent pas.');
                        return;
                      }
                      setPwdSubmitting(true);
                      try {
                        await changePassword(pwdCurrent, pwdNew);
                        setPwdCurrent('');
                        setPwdNew('');
                        setPwdConfirm('');
                        toast.success('Mot de passe mis à jour.');
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : 'Échec du changement de mot de passe.');
                      } finally {
                        setPwdSubmitting(false);
                      }
                    })();
                  }}
                >
                  {pwdSubmitting ? 'Enregistrement…' : 'Enregistrer le nouveau mot de passe'}
                </Button>
              </CardContent>
            </Card>
          ) : currentUser ? (
            <p className="text-sm text-muted-foreground">
              Le changement de mot de passe depuis le back-office est réservé aux comptes avec le rôle administrateur.
            </p>
          ) : null}
        </TabsContent>

        <TabsContent value="data" className="space-y-6 outline-none">
          <Card className="rounded-[28px] border-slate-200/80 shadow-sm">
            <CardHeader>
              <CardTitle className="font-serif text-xl">API & synchronisation</CardTitle>
              <CardDescription>Raccourcis pour recharger les données depuis le serveur.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Base API</p>
                <p className="mt-1 break-all font-mono text-xs text-slate-700">{apiHint}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="outline" className="rounded-full" onClick={() => void handleRefreshProducts()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Rafraîchir le catalogue
                </Button>
                <Button type="button" variant="outline" className="rounded-full" onClick={() => void handleRefreshUsers()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Rafraîchir les utilisateurs
                </Button>
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
                  <p className="text-2xl font-bold text-slate-900">{products.length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Produits</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
                  <p className="text-2xl font-bold text-slate-900">{users.length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Utilisateurs</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
                  <p className="text-2xl font-bold text-slate-900">{prefs.timezone.split('/').pop()}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Fuseau</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-primary/15 bg-primary/[0.04] shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-xl">
                <Sparkles className="h-5 w-5 text-primary" />
                À propos
              </CardTitle>
              <CardDescription>Back-office Poids Baoulé — version locale de pilotage.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Les paramètres ci-dessus sont enregistrés dans <code className="rounded bg-white/80 px-1.5 py-0.5 text-xs">localStorage</code>.
              Pour une configuration serveur (URL Mongo, secrets), utilisez les variables d’environnement du projet.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

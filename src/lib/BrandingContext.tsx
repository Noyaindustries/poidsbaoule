import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export const BRANDING_STORAGE_KEY = 'pb_site_branding_v1';

/** Logo public (navbar, footer) — chemin /public ou URL absolue */
export const DEFAULT_HOME_LOGO = '/0-removebg-preview.png';

export type SiteBranding = {
  homeLogoUrl: string;
  /** null = monogramme « PB » dans l’admin */
  adminLogoUrl: string | null;
};

const DEFAULT_BRANDING: SiteBranding = {
  homeLogoUrl: DEFAULT_HOME_LOGO,
  adminLogoUrl: null,
};

function loadBranding(): SiteBranding {
  try {
    const raw = localStorage.getItem(BRANDING_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_BRANDING };
    const p = JSON.parse(raw) as Partial<SiteBranding>;
    const home =
      typeof p.homeLogoUrl === 'string' && p.homeLogoUrl.trim() !== ''
        ? p.homeLogoUrl.trim()
        : DEFAULT_HOME_LOGO;
    const admin =
      typeof p.adminLogoUrl === 'string' && p.adminLogoUrl.trim() !== ''
        ? p.adminLogoUrl.trim()
        : null;
    return { homeLogoUrl: home, adminLogoUrl: admin };
  } catch {
    return { ...DEFAULT_BRANDING };
  }
}

function saveBranding(b: SiteBranding) {
  localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(b));
}

interface BrandingContextType {
  branding: SiteBranding;
  /** URL effective pour le site (jamais vide) */
  resolvedHomeLogo: string;
  updateBranding: (patch: Partial<SiteBranding>) => void;
  resetLogos: () => void;
  refreshBranding: () => void;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function useBranding() {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error('useBranding doit être utilisé dans BrandingProvider');
  return ctx;
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<SiteBranding>(() => loadBranding());

  const refreshBranding = useCallback(() => {
    setBranding(loadBranding());
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === BRANDING_STORAGE_KEY) refreshBranding();
    };
    const onCustom = () => refreshBranding();
    window.addEventListener('storage', onStorage);
    window.addEventListener('pb-branding-update', onCustom);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('pb-branding-update', onCustom);
    };
  }, [refreshBranding]);

  const updateBranding = useCallback((patch: Partial<SiteBranding>) => {
    setBranding((prev) => {
      let home = patch.homeLogoUrl !== undefined ? patch.homeLogoUrl : prev.homeLogoUrl;
      if (!home || !String(home).trim()) home = DEFAULT_HOME_LOGO;
      else home = String(home).trim();
      const admin = patch.adminLogoUrl !== undefined ? patch.adminLogoUrl : prev.adminLogoUrl;
      const next: SiteBranding = { homeLogoUrl: home, adminLogoUrl: admin };
      saveBranding(next);
      window.dispatchEvent(new Event('pb-branding-update'));
      return next;
    });
  }, []);

  const resetLogos = useCallback(() => {
    saveBranding({ ...DEFAULT_BRANDING });
    setBranding({ ...DEFAULT_BRANDING });
    queueMicrotask(() => window.dispatchEvent(new Event('pb-branding-update')));
  }, []);

  const resolvedHomeLogo = useMemo(
    () => (branding.homeLogoUrl?.trim() ? branding.homeLogoUrl.trim() : DEFAULT_HOME_LOGO),
    [branding.homeLogoUrl]
  );

  const value = useMemo(
    () => ({
      branding,
      resolvedHomeLogo,
      updateBranding,
      resetLogos,
      refreshBranding,
    }),
    [branding, resolvedHomeLogo, updateBranding, resetLogos, refreshBranding]
  );

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}

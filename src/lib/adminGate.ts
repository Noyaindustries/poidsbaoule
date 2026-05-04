/** Clé session : accès /admin débloqué pour cet onglet jusqu'à fermeture du navigateur. */
const SESSION_KEY = 'pb_admin_panel_unlock_v1';
const UNLOCK_VALUE = '1';

/** Mot de passe attendu : variable d’environnement (build). En dev sans .env : valeur de secours locale uniquement. */
export function getConfiguredAdminAccessPassword(): string {
  const v = import.meta.env.VITE_ADMIN_ACCESS_PASSWORD;
  if (typeof v === 'string' && v.trim() !== '') return v.trim();
  if (import.meta.env.DEV) return 'poidsbaoule-admin';
  return '';
}

export function isAdminAccessPasswordConfigured(): boolean {
  return getConfiguredAdminAccessPassword().length > 0;
}

export function isAdminPanelGateUnlocked(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === UNLOCK_VALUE;
  } catch {
    return false;
  }
}

export function unlockAdminPanelGate(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, UNLOCK_VALUE);
  } catch {
    /* private mode, etc. */
  }
}

export function clearAdminPanelGate(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function verifyAdminAccessPassword(candidate: string): boolean {
  const expected = getConfiguredAdminAccessPassword();
  if (!expected) return false;
  return candidate === expected;
}

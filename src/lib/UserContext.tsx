import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Discount } from '@/types';
import { useOrders } from './OrderContext';
import { apiJson, ApiError } from './api';

/** Champs profil modifiables côté client (PATCH /api/users/:id) */
export type UserProfilePatch = Partial<Pick<User, 'name' | 'phone' | 'city' | 'addresses' | 'wishlist'>>;

interface UserContextType {
  users: User[];
  currentUser: User | null;
  signup: (name: string, email: string, phone: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  addDiscountToUser: (userId: string, amount: number, expiryDays: number) => Promise<void>;
  useDiscount: (userId: string, discountId: string) => Promise<void>;
  updateUserFields: (userId: string, patch: UserProfilePatch) => Promise<void>;
  /** Mot de passe actuel + nouveau (compte connecté uniquement). */
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const LOCAL_USERS_KEY = 'pb_local_users';
const LOCAL_CURRENT_USER_KEY = 'pb_current_user';

type StoredUser = User & { _passwordHash?: string };

const getLocalUsers = (): User[] => {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveLocalUsers = (users: User[]) => {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
};

const getLocalCurrentUser = (): User | null => {
  try {
    const raw = localStorage.getItem(LOCAL_CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveLocalCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(LOCAL_CURRENT_USER_KEY);
  }
};

const isNetworkError = (error: unknown): boolean => {
  if (!error) return false;
  const message = (
    error instanceof Error ? error.message : String(error)
  ).toLowerCase();
  return (
    message.includes('load failed') ||
    message.includes('fetch failed') ||
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('networkerror') ||
    message.includes('dns') ||
    message.includes('enotfound') ||
    message.includes('connection refused') ||
    message.includes('timeout') ||
    message.includes('err_name_not_resolved')
  );
};

const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(36);
};

export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { orders } = useOrders();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [useLocalFallback, setUseLocalFallback] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await apiJson<User[]>('/api/users');
      setUsers(Array.isArray(data) ? data : []);
      setUseLocalFallback(false);
      return;
    } catch (e: unknown) {
      if (isNetworkError(e)) {
        console.warn('API indisponible, mode local pour les utilisateurs.');
        setUseLocalFallback(true);
      } else {
        console.error('Failed to fetch users:', e);
      }
    }
    setUsers(getLocalUsers());
  };

  useEffect(() => {
    fetchUsers();
    const savedUser = getLocalCurrentUser();
    if (savedUser) {
      setCurrentUser(savedUser);
    }
  }, []);

  useEffect(() => {
    if (users.length === 0) return;

    const syncSegments = async () => {
      for (const user of users) {
        const userOrders = orders.filter((o) => o.customerEmail === user.email);
        const orderCount = userOrders.length;

        let newSegment: User['segment'] = 'Nouveau';
        if (orderCount >= 10) newSegment = 'VIP';
        else if (orderCount >= 3) newSegment = 'Régulier';

        if (user.segment !== newSegment) {
          if (!useLocalFallback) {
            try {
              await apiJson(`/api/users/${encodeURIComponent(user.id)}`, {
                method: 'PATCH',
                body: JSON.stringify({ segment: newSegment }),
              });
            } catch {
              const localUsers = getLocalUsers().map((u) =>
                u.id === user.id ? { ...u, segment: newSegment } : u
              );
              saveLocalUsers(localUsers);
            }
          } else {
            const localUsers = getLocalUsers().map((u) =>
              u.id === user.id ? { ...u, segment: newSegment } : u
            );
            saveLocalUsers(localUsers);
          }
        }
      }
      fetchUsers();
    };

    syncSegments();
  }, [orders]);

  const signup = async (name: string, email: string, phone: string, password: string) => {
    if (!email || !password) {
      throw new Error("L'email et le mot de passe sont requis.");
    }
    if (password.length < 6) {
      throw new Error('Le mot de passe doit contenir au moins 6 caractères.');
    }

    if (!useLocalFallback) {
      try {
        const { user } = await apiJson<{ user: User }>('/api/auth/signup', {
          method: 'POST',
          body: JSON.stringify({ name, email, phone, password }),
        });
        setCurrentUser(user);
        saveLocalCurrentUser(user);
        const localUsers = getLocalUsers().filter((u) => u.email !== user.email);
        localUsers.push(user);
        saveLocalUsers(localUsers);
        await fetchUsers();
        return;
      } catch (e: unknown) {
        if (isNetworkError(e)) {
          console.warn('Inscription via API impossible (réseau), mode local.');
          setUseLocalFallback(true);
        } else if (e instanceof ApiError) {
          throw new Error(e.message);
        } else {
          throw e;
        }
      }
    }

    const localUsers = [...getLocalUsers()] as StoredUser[];
    const existingUser = localUsers.find((u) => u.email === email);
    if (existingUser) {
      throw new Error('Un compte avec cet email existe déjà.');
    }

    const newUserProfile: User = {
      id: 'local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11),
      email,
      name,
      phone,
      role: 'customer',
      segment: 'Nouveau',
      wallet: [],
      wishlist: [],
      addresses: [],
      city: 'Abidjan',
    };

    const stored: StoredUser = { ...newUserProfile, _passwordHash: simpleHash(password) };
    localUsers.push(stored);
    saveLocalUsers(localUsers);

    setCurrentUser(newUserProfile);
    saveLocalCurrentUser(newUserProfile);
    setUsers(localUsers.map(({ _passwordHash: _h, ...rest }) => rest as User));
  };

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error("L'email et le mot de passe sont requis.");
    }

    if (!useLocalFallback) {
      try {
        const { user } = await apiJson<{ user: User }>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        setCurrentUser(user);
        saveLocalCurrentUser(user);
        return;
      } catch (e: unknown) {
        if (isNetworkError(e)) {
          console.warn('Connexion API impossible (réseau), mode local.');
          setUseLocalFallback(true);
        } else if (e instanceof ApiError && e.status === 401) {
          throw new Error('Email ou mot de passe incorrect.');
        } else if (e instanceof ApiError) {
          throw new Error(e.message);
        } else {
          throw e;
        }
      }
    }

    const localUsers = getLocalUsers() as StoredUser[];
    const user = localUsers.find(
      (u) => u.email === email && u._passwordHash === simpleHash(password)
    );
    if (!user) {
      throw new Error('Email ou mot de passe incorrect.');
    }

    const { _passwordHash: _ph, ...cleanUser } = user;
    setCurrentUser(cleanUser);
    saveLocalCurrentUser(cleanUser);
  };

  const logout = async () => {
    setCurrentUser(null);
    saveLocalCurrentUser(null);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!currentUser) {
      throw new Error('Connectez-vous pour modifier le mot de passe.');
    }
    if (newPassword.length < 6) {
      throw new Error('Le nouveau mot de passe doit contenir au moins 6 caractères.');
    }

    if (!useLocalFallback) {
      try {
        await apiJson<{ ok: boolean }>('/api/auth/change-password', {
          method: 'POST',
          body: JSON.stringify({
            userId: currentUser.id,
            currentPassword,
            newPassword,
          }),
        });
        await fetchUsers();
        return;
      } catch (e: unknown) {
        if (isNetworkError(e)) {
          console.warn('Changement de mot de passe API impossible (réseau), mode local.');
          setUseLocalFallback(true);
        } else if (e instanceof ApiError) {
          throw new Error(e.message);
        } else {
          throw e;
        }
      }
    }

    const raw = getLocalUsers() as StoredUser[];
    const idx = raw.findIndex((u) => u.id === currentUser.id);
    if (idx === -1) {
      throw new Error('Utilisateur introuvable en mode local.');
    }
    const u = raw[idx];
    if (!u._passwordHash || u._passwordHash !== simpleHash(currentPassword)) {
      throw new Error('Mot de passe actuel incorrect.');
    }
    raw[idx] = { ...u, _passwordHash: simpleHash(newPassword) };
    saveLocalUsers(raw);
    setUsers(raw.map(({ _passwordHash: __, ...rest }) => rest as User));
  };

  const addDiscountToUser = async (userId: string, amount: number, expiryDays: number) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const newDiscount: Discount = {
      id: 'disc-' + Math.random().toString(36).substring(2, 11),
      amount,
      expiryDate: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString(),
      isUsed: false,
      createdAt: new Date().toISOString(),
    };

    const updatedWallet = [...user.wallet, newDiscount];

    try {
      if (!useLocalFallback) {
        await apiJson(`/api/users/${encodeURIComponent(userId)}`, {
          method: 'PATCH',
          body: JSON.stringify({ wallet: updatedWallet }),
        });
      }
    } catch (e: unknown) {
      if (isNetworkError(e)) {
        setUseLocalFallback(true);
      } else {
        console.error('Failed to add discount in DB:', e);
      }
    }

    const localUsers = getLocalUsers().map((u) =>
      u.id === userId ? { ...u, wallet: updatedWallet } : u
    );
    saveLocalUsers(localUsers);

    if (currentUser?.id === userId) {
      const updated = { ...currentUser, wallet: updatedWallet };
      setCurrentUser(updated);
      saveLocalCurrentUser(updated);
    }

    fetchUsers();
  };

  const useDiscount = async (userId: string, discountId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const updatedWallet = user.wallet.map((d) =>
      d.id === discountId ? { ...d, isUsed: true } : d
    );

    try {
      if (!useLocalFallback) {
        await apiJson(`/api/users/${encodeURIComponent(userId)}`, {
          method: 'PATCH',
          body: JSON.stringify({ wallet: updatedWallet }),
        });
      }
    } catch (e: unknown) {
      if (isNetworkError(e)) {
        setUseLocalFallback(true);
      } else {
        console.error('Failed to use discount in DB:', e);
      }
    }

    const localUsers = getLocalUsers().map((u) =>
      u.id === userId ? { ...u, wallet: updatedWallet } : u
    );
    saveLocalUsers(localUsers);

    if (currentUser?.id === userId) {
      const updated = { ...currentUser, wallet: updatedWallet };
      setCurrentUser(updated);
      saveLocalCurrentUser(updated);
    }

    fetchUsers();
  };

  const updateUserFields = async (userId: string, patch: UserProfilePatch) => {
    const base = users.find((u) => u.id === userId) ?? currentUser;
    if (!base || base.id !== userId) {
      throw new Error('Session invalide ou utilisateur introuvable.');
    }

    if (!useLocalFallback) {
      try {
        const updated = await apiJson<User>(`/api/users/${encodeURIComponent(userId)}`, {
          method: 'PATCH',
          body: JSON.stringify(patch),
        });
        if (currentUser?.id === userId) {
          setCurrentUser(updated);
          saveLocalCurrentUser(updated);
        }
        await fetchUsers();
        return;
      } catch (e: unknown) {
        if (isNetworkError(e)) {
          console.warn('Mise à jour API impossible (réseau), bascule locale.');
          setUseLocalFallback(true);
        } else if (e instanceof ApiError) {
          throw new Error(e.message);
        } else {
          throw e;
        }
      }
    }

    const raw = getLocalUsers() as StoredUser[];
    const idx = raw.findIndex((u) => u.id === userId);
    if (idx === -1) {
      if (currentUser?.id === userId) {
        const next = { ...currentUser, ...patch };
        setCurrentUser(next);
        saveLocalCurrentUser(next);
        return;
      }
      throw new Error('Utilisateur introuvable en mode local.');
    }
    const nextStored: StoredUser = { ...raw[idx], ...patch };
    raw[idx] = nextStored;
    saveLocalUsers(raw);
    const { _passwordHash: _ph, ...pub } = nextStored;
    const publicUser = pub as User;
    if (currentUser?.id === userId) {
      setCurrentUser(publicUser);
      saveLocalCurrentUser(publicUser);
    }
    setUsers(raw.map(({ _passwordHash: __, ...rest }) => rest as User));
  };

  const toggleWishlist = async (productId: string) => {
    if (!currentUser) return;
    const has = currentUser.wishlist.includes(productId);
    const wishlist = has
      ? currentUser.wishlist.filter((id) => id !== productId)
      : [...currentUser.wishlist, productId];
    await updateUserFields(currentUser.id, { wishlist });
  };

  const deleteUser = async (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    if (target.role === 'admin') {
      throw new Error("Suppression d'un compte admin interdite.");
    }

    if (!useLocalFallback) {
      try {
        await apiJson(`/api/users/${encodeURIComponent(userId)}`, { method: 'DELETE' });
      } catch (e: unknown) {
        if (isNetworkError(e)) {
          setUseLocalFallback(true);
        } else if (e instanceof ApiError) {
          throw new Error(e.message);
        } else {
          throw e;
        }
      }
    }

    const localUsers = getLocalUsers().filter((u) => u.id !== userId);
    saveLocalUsers(localUsers);
    setUsers(localUsers);

    if (currentUser?.id === userId) {
      setCurrentUser(null);
      saveLocalCurrentUser(null);
    }
  };

  return (
    <UserContext.Provider
      value={{
        users,
        currentUser,
        signup,
        login,
        logout,
        addDiscountToUser,
        useDiscount,
        updateUserFields,
        changePassword,
        toggleWishlist,
        deleteUser,
        refreshUsers: fetchUsers,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

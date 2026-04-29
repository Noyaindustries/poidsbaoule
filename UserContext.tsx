import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Discount } from '@/types';
import { useOrders } from './OrderContext';
import { supabase } from './supabase';

interface UserContextType {
  users: User[];
  currentUser: User | null;
  signup: (name: string, email: string, phone: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  addDiscountToUser: (userId: string, amount: number, expiryDays: number) => Promise<void>;
  useDiscount: (userId: string, discountId: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const LOCAL_USERS_KEY = 'pb_local_users';
const LOCAL_CURRENT_USER_KEY = 'pb_current_user';

// Helper: get locally stored users
const getLocalUsers = (): User[] => {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// Helper: save users to localStorage
const saveLocalUsers = (users: User[]) => {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
};

// Helper: get locally stored current user
const getLocalCurrentUser = (): User | null => {
  try {
    const raw = localStorage.getItem(LOCAL_CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Helper: save current user to localStorage
const saveLocalCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(LOCAL_CURRENT_USER_KEY);
  }
};

// Check if the error is a network/connection error
const isNetworkError = (error: any): boolean => {
  if (!error) return false;
  const message = (error.message || error.toString() || '').toLowerCase();
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

// Simple hash for localStorage password storage (NOT production-secure)
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
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
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      if (data) {
        setUsers(data);
        return;
      }
    } catch (e: any) {
      if (isNetworkError(e)) {
        console.warn("Supabase unreachable, using local fallback for users.");
        setUseLocalFallback(true);
      } else {
        console.error("Failed to fetch users:", e);
      }
    }
    // Fallback: load from localStorage
    setUsers(getLocalUsers());
  };

  useEffect(() => {
    fetchUsers();

    // Restore locally saved current user
    const savedUser = getLocalCurrentUser();
    if (savedUser) {
      setCurrentUser(savedUser);
    }

    // Setup Auth Listener (may not work if Supabase is unreachable, but that's ok)
    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (profile) {
              setCurrentUser(profile);
              saveLocalCurrentUser(profile);
            }
          } catch (e) {
            // Supabase read failed, rely on local state
          }
        } else if (!getLocalCurrentUser()) {
          setCurrentUser(null);
        }
      });
      subscription = data.subscription;
    } catch (e) {
      console.warn("Auth listener setup failed (Supabase may be unreachable):", e);
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // Recalculate badges based on orders (Local effect, update DB if changed)
  useEffect(() => {
    if (users.length === 0) return;

    const syncSegments = async () => {
      for (const user of users) {
        const userOrders = orders.filter(o => o.customerEmail === user.email);
        const orderCount = userOrders.length;
        
        let newSegment: User['segment'] = 'Nouveau';
        if (orderCount >= 10) newSegment = 'VIP';
        else if (orderCount >= 3) newSegment = 'Régulier';

        if (user.segment !== newSegment) {
          if (!useLocalFallback) {
            try {
              await supabase.from('profiles').update({ segment: newSegment }).eq('id', user.id);
            } catch {
              // If Supabase fails, update locally
              const localUsers = getLocalUsers().map(u => 
                u.id === user.id ? { ...u, segment: newSegment } : u
              );
              saveLocalUsers(localUsers);
            }
          } else {
            const localUsers = getLocalUsers().map(u => 
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
    // Validate inputs first
    if (!email || !password) {
      throw new Error("L'email et le mot de passe sont requis.");
    }
    if (password.length < 6) {
      throw new Error("Le mot de passe doit contenir au moins 6 caractères.");
    }

    // Try Supabase first
    if (!useLocalFallback) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name, phone }
          }
        });

        if (error) {
          if (isNetworkError(error)) {
            console.warn("Supabase signup failed (network), falling back to local.");
            setUseLocalFallback(true);
            // Fall through to local signup below
          } else {
            throw error;
          }
        } else if (data.user) {
          const newUserProfile: User = {
            id: data.user.id,
            email,
            name,
            phone,
            role: 'customer',
            segment: 'Nouveau',
            wallet: [],
            wishlist: [],
            addresses: [],
            city: "Abidjan"
          };

          const { error: profileError } = await supabase.from('profiles').insert(newUserProfile);
          if (profileError) console.error("Error creating profile:", profileError);
          
          setCurrentUser(newUserProfile);
          saveLocalCurrentUser(newUserProfile);

          // Also save locally as backup
          const localUsers = getLocalUsers();
          localUsers.push({ ...newUserProfile, _passwordHash: simpleHash(password) } as any);
          saveLocalUsers(localUsers);

          return;
        }
      } catch (e: any) {
        if (isNetworkError(e)) {
          console.warn("Supabase signup failed (network), falling back to local.");
          setUseLocalFallback(true);
          // Fall through to local signup below
        } else {
          throw e;
        }
      }
    }

    // Local fallback signup
    const localUsers = getLocalUsers();
    const existingUser = localUsers.find(u => u.email === email);
    if (existingUser) {
      throw new Error("Un compte avec cet email existe déjà.");
    }

    const newUserProfile: User = {
      id: 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      email,
      name,
      phone,
      role: 'customer',
      segment: 'Nouveau',
      wallet: [],
      wishlist: [],
      addresses: [],
      city: "Abidjan"
    };

    localUsers.push({ ...newUserProfile, _passwordHash: simpleHash(password) } as any);
    saveLocalUsers(localUsers);
    
    setCurrentUser(newUserProfile);
    saveLocalCurrentUser(newUserProfile);
    setUsers(localUsers.map(({ _passwordHash, ...rest }: any) => rest));
  };

  const login = async (email: string, password: string) => {
    // Validate inputs first
    if (!email || !password) {
      throw new Error("L'email et le mot de passe sont requis.");
    }

    // Try Supabase first
    if (!useLocalFallback) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          if (isNetworkError(error)) {
            console.warn("Supabase login failed (network), falling back to local.");
            setUseLocalFallback(true);
            // Fall through to local login below
          } else {
            throw new Error("Email ou mot de passe incorrect.");
          }
        } else if (data.user) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();
            
            if (profile) {
              setCurrentUser(profile);
              saveLocalCurrentUser(profile);
            }
          } catch {
            // Profile fetch failed, but auth succeeded
          }
          return;
        }
      } catch (e: any) {
        if (isNetworkError(e)) {
          console.warn("Supabase login failed (network), falling back to local.");
          setUseLocalFallback(true);
          // Fall through to local login below
        } else {
          throw e;
        }
      }
    }

    // Local fallback login
    const localUsers = getLocalUsers();
    const user = localUsers.find((u: any) => u.email === email && u._passwordHash === simpleHash(password));
    if (!user) {
      throw new Error("Email ou mot de passe incorrect.");
    }

    const { _passwordHash, ...cleanUser } = user as any;
    setCurrentUser(cleanUser);
    saveLocalCurrentUser(cleanUser);
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Supabase signout may fail if unreachable, that's ok
    }
    setCurrentUser(null);
    saveLocalCurrentUser(null);
  };

  const addDiscountToUser = async (userId: string, amount: number, expiryDays: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const newDiscount: Discount = {
      id: "disc-" + Math.random().toString(36).substr(2, 9),
      amount,
      expiryDate: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString(),
      isUsed: false,
      createdAt: new Date().toISOString()
    };

    const updatedWallet = [...user.wallet, newDiscount];

    try {
      if (!useLocalFallback) {
        const { error } = await supabase
          .from('profiles')
          .update({ wallet: updatedWallet })
          .eq('id', userId);
        
        if (error) throw error;
      }
    } catch (e: any) {
      if (isNetworkError(e)) {
        setUseLocalFallback(true);
      } else {
        console.error("Failed to add discount in DB:", e);
      }
    }

    // Always update local state & localStorage
    const localUsers = getLocalUsers().map(u => 
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
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const updatedWallet = user.wallet.map(d => d.id === discountId ? { ...d, isUsed: true } : d);

    try {
      if (!useLocalFallback) {
        const { error } = await supabase
          .from('profiles')
          .update({ wallet: updatedWallet })
          .eq('id', userId);
        
        if (error) throw error;
      }
    } catch (e: any) {
      if (isNetworkError(e)) {
        setUseLocalFallback(true);
      } else {
        console.error("Failed to use discount in DB:", e);
      }
    }

    // Always update local state & localStorage
    const localUsers = getLocalUsers().map(u => 
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

  return (
    <UserContext.Provider value={{ 
      users, 
      currentUser, 
      signup, 
      login, 
      logout, 
      addDiscountToUser, 
      useDiscount,
      refreshUsers: fetchUsers
    }}>
      {children}
    </UserContext.Provider>
  );
};

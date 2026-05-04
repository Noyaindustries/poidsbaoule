import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ShopCategoryRecord } from '@/types';
import {
  DEFAULT_SHOP_CATEGORIES,
  FALLBACK_CATEGORY_IMAGE,
} from '@/constants';

const STORAGE_V2 = 'pb_shop_categories_v2';
const STORAGE_V1 = 'pb_shop_categories_v1';

function dedupeCategories(list: ShopCategoryRecord[]): ShopCategoryRecord[] {
  const out: ShopCategoryRecord[] = [];
  const seen = new Set<string>();
  for (const c of list) {
    const name = c.name.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const imageUrl =
      typeof c.imageUrl === 'string' && c.imageUrl.trim() !== ''
        ? c.imageUrl.trim()
        : FALLBACK_CATEGORY_IMAGE;
    out.push({ name, imageUrl });
  }
  return out;
}

function normalizeV2Payload(arr: unknown[]): ShopCategoryRecord[] {
  const raw: ShopCategoryRecord[] = [];
  for (const item of arr) {
    if (typeof item === 'string') {
      const name = item.trim();
      if (name) {
        raw.push({
          name,
          imageUrl:
            DEFAULT_SHOP_CATEGORIES.find((d) => d.name === name)?.imageUrl ??
            FALLBACK_CATEGORY_IMAGE,
        });
      }
      continue;
    }
    if (item && typeof item === 'object' && 'name' in item) {
      const o = item as Record<string, unknown>;
      const name = typeof o.name === 'string' ? o.name.trim() : '';
      if (!name) continue;
      const imageUrl =
        typeof o.imageUrl === 'string' && o.imageUrl.trim() !== ''
          ? o.imageUrl.trim()
          : DEFAULT_SHOP_CATEGORIES.find((d) => d.name === name)?.imageUrl ??
            FALLBACK_CATEGORY_IMAGE;
      raw.push({ name, imageUrl });
    }
  }
  const d = dedupeCategories(raw);
  return d.length > 0 ? d : [...DEFAULT_SHOP_CATEGORIES];
}

function loadCategoryList(): ShopCategoryRecord[] {
  try {
    const v2 = localStorage.getItem(STORAGE_V2);
    if (v2) {
      const arr = JSON.parse(v2) as unknown;
      if (Array.isArray(arr) && arr.length > 0) {
        return normalizeV2Payload(arr);
      }
    }
    const v1 = localStorage.getItem(STORAGE_V1);
    if (v1) {
      const names = JSON.parse(v1) as unknown;
      if (Array.isArray(names)) {
        const migrated = normalizeV2Payload(names);
        localStorage.setItem(STORAGE_V2, JSON.stringify(migrated));
        return migrated;
      }
    }
  } catch {
    /* ignore */
  }
  return [...DEFAULT_SHOP_CATEGORIES];
}

function saveCategoryList(list: ShopCategoryRecord[]) {
  const finalList = dedupeCategories(list);
  const toSave = finalList.length > 0 ? finalList : [...DEFAULT_SHOP_CATEGORIES];
  localStorage.setItem(STORAGE_V2, JSON.stringify(toSave));
  window.dispatchEvent(new Event('pb-categories-update'));
}

interface CategoryContextType {
  /** Entrées avec image (source de vérité). */
  categoryList: ShopCategoryRecord[];
  /** Noms uniquement (filtres, produits). */
  categories: string[];
  getCategoryImage: (name: string) => string;
  addCategory: (name: string, imageUrl: string) => boolean;
  setCategoryImage: (name: string, imageUrl: string) => void;
  removeCategory: (name: string) => void;
  replaceCategoryInList: (oldName: string, newName: string) => void;
  resetToDefaults: () => void;
  refreshCategories: () => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function useCategories() {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error('useCategories doit être utilisé dans CategoryProvider');
  return ctx;
}

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categoryList, setCategoryList] = useState<ShopCategoryRecord[]>(() => loadCategoryList());

  const categories = useMemo(() => categoryList.map((c) => c.name), [categoryList]);

  const getCategoryImage = useCallback(
    (name: string) => {
      const hit = categoryList.find((c) => c.name === name);
      if (hit?.imageUrl?.trim()) return hit.imageUrl.trim();
      const def = DEFAULT_SHOP_CATEGORIES.find((c) => c.name === name);
      if (def?.imageUrl) return def.imageUrl;
      return FALLBACK_CATEGORY_IMAGE;
    },
    [categoryList]
  );

  const persist = useCallback((next: ShopCategoryRecord[]) => {
    const deduped = dedupeCategories(next);
    const finalList = deduped.length > 0 ? deduped : [...DEFAULT_SHOP_CATEGORIES];
    setCategoryList(finalList);
    saveCategoryList(finalList);
  }, []);

  const refreshCategories = useCallback(() => {
    setCategoryList(loadCategoryList());
  }, []);

  useEffect(() => {
    const on = () => refreshCategories();
    window.addEventListener('pb-categories-update', on);
    window.addEventListener('storage', on);
    return () => {
      window.removeEventListener('pb-categories-update', on);
      window.removeEventListener('storage', on);
    };
  }, [refreshCategories]);

  const addCategory = useCallback(
    (name: string, imageUrl: string) => {
      const t = name.trim();
      const img = imageUrl.trim();
      if (!t || !img) return false;
      if (categoryList.some((c) => c.name.toLowerCase() === t.toLowerCase())) return false;
      persist([...categoryList, { name: t, imageUrl: img }]);
      return true;
    },
    [categoryList, persist]
  );

  const setCategoryImage = useCallback(
    (name: string, imageUrl: string) => {
      const img = imageUrl.trim();
      if (!img) return;
      const idx = categoryList.findIndex((c) => c.name === name);
      if (idx === -1) {
        persist([...categoryList, { name, imageUrl: img }]);
        return;
      }
      const next = categoryList.map((c) => (c.name === name ? { ...c, imageUrl: img } : c));
      persist(next);
    },
    [categoryList, persist]
  );

  const removeCategory = useCallback(
    (name: string) => {
      persist(categoryList.filter((c) => c.name !== name));
    },
    [categoryList, persist]
  );

  const replaceCategoryInList = useCallback(
    (oldName: string, newName: string) => {
      const t = newName.trim();
      if (!t) return;
      const idx = categoryList.findIndex((c) => c.name === oldName);
      if (idx === -1) {
        if (!categoryList.some((c) => c.name.toLowerCase() === t.toLowerCase())) {
          persist([
            ...categoryList,
            {
              name: t,
              imageUrl:
                DEFAULT_SHOP_CATEGORIES.find((d) => d.name === t)?.imageUrl ??
                FALLBACK_CATEGORY_IMAGE,
            },
          ]);
        }
        return;
      }
      const img = categoryList[idx].imageUrl;
      const next = categoryList.map((c) => (c.name === oldName ? { name: t, imageUrl: img } : c));
      persist(dedupeCategories(next));
    },
    [categoryList, persist]
  );

  const resetToDefaults = useCallback(() => {
    persist([...DEFAULT_SHOP_CATEGORIES]);
  }, [persist]);

  const value = useMemo(
    () => ({
      categoryList,
      categories,
      getCategoryImage,
      addCategory,
      setCategoryImage,
      removeCategory,
      replaceCategoryInList,
      resetToDefaults,
      refreshCategories,
    }),
    [
      categoryList,
      categories,
      getCategoryImage,
      addCategory,
      setCategoryImage,
      removeCategory,
      replaceCategoryInList,
      resetToDefaults,
      refreshCategories,
    ]
  );

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
}

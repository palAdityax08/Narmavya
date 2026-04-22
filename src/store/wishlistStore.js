// ─── Narmavya Wishlist Store (Zustand + Persist) ─────────────────────────────
// Replaces localStorage 'wishlist' array.
//
// Usage:
//   import { useWishlistStore } from '../store/wishlistStore';
//   const { items, toggleItem, isWishlisted } = useWishlistStore();
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [], // Array of slim product objects { id, title, price, url, image, ...}

      /**
       * Toggle: if item exists remove it, otherwise add it.
       * Returns true if the item was ADDED, false if REMOVED.
       */
      toggleItem: (product) => {
        const items = get().items;
        const exists = items.some((i) => i.id === product.id);

        if (exists) {
          set({ items: items.filter((i) => i.id !== product.id) });
          return false; // removed
        } else {
          set({
            items: [
              ...items,
              {
                id: product.id,
                title: product.title,
                price: product.price,
                originalPrice: product.originalPrice,
                url: product.url || product.image || '',
                image: product.image || product.url || '',
                rating: product.rating,
                reviews: product.reviews,
                badge: product.badge,
                origin: product.origin || '',
                category: product.category || '',
                artisan: product.artisan || '',
                description: product.description || '',
              },
            ],
          });
          return true; // added
        }
      },

      removeItem: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),

      clearAll: () => set({ items: [] }),

      isWishlisted: (id) => get().items.some((i) => i.id === id),
    }),
    {
      name: 'narmavya-wishlist',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export default useWishlistStore;

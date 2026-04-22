// ─── Narmavya Cart Store (Zustand + Persist) ─────────────────────────────────
// Replaces localStorage user.products[] — persists cart across sessions
// automatically via Zustand's persist middleware.
//
// Usage:
//   import { useCartStore } from '../store/cartStore';
//   const { items, addItem, removeItem, totalItems, totalPrice } = useCartStore();
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      // ── State ──────────────────────────────────────────────────────────────
      items: [], // Array of { id, title, price, url, quantity, origin, category, artisan }

      // ── Actions ────────────────────────────────────────────────────────────

      /**
       * Add a product to the cart. If it already exists, increment quantity.
       * @param {Object} product - The product object from mpProducts or API
       * @param {number} qty     - Quantity to add (default: 1)
       */
      addItem: (product, qty = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.id === product.id);

        if (existing) {
          set({
            items: items.map((i) =>
              i.id === product.id
                ? { ...i, quantity: Math.min(i.quantity + qty, 10) }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                id: product.id,
                title: product.title,
                price: product.price,
                // Support both `image` (from mpProducts) and `url` (from cart items)
                url: product.url || product.image || '',
                quantity: qty,
                origin: product.origin || '',
                category: product.category || '',
                artisan: product.artisan || '',
              },
            ],
          });
        }
      },

      /**
       * Remove a product from the cart entirely by id.
       */
      removeItem: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),

      /**
       * Set a specific quantity for a cart item. If qty <= 0, removes it.
       */
      updateQty: (id, qty) => {
        if (qty <= 0) {
          set({ items: get().items.filter((i) => i.id !== id) });
        } else {
          set({
            items: get().items.map((i) =>
              i.id === id ? { ...i, quantity: Math.min(qty, 10) } : i
            ),
          });
        }
      },

      /**
       * Clear all items from the cart (called after successful order placement).
       */
      clearCart: () => set({ items: [] }),

      // ── Derived / Computed ─────────────────────────────────────────────────

      /** Total number of individual units in the cart (for the badge). */
      totalItems: () =>
        get().items.reduce((acc, i) => acc + (i.quantity || 1), 0),

      /** Subtotal price (before delivery). */
      totalPrice: () =>
        Math.ceil(
          get().items.reduce((acc, i) => acc + i.price * (i.quantity || 1), 0)
        ),

      /** Delivery charge: free if subtotal >= ₹499, else ₹60. */
      deliveryCharge: () => (get().totalPrice() >= 499 ? 0 : 60),

      /** Grand total including delivery. */
      grandTotal: () => get().totalPrice() + get().deliveryCharge(),

      /** Check if a specific product id is in the cart. */
      isInCart: (id) => get().items.some((i) => i.id === id),
    }),
    {
      name: 'narmavya-cart',          // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist the items array — not the functions
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export default useCartStore;

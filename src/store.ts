import { create } from "zustand";
import { User, Product, Order, Message, Review, LanguageCode } from "./types";

interface CartItem extends Product {
  quantity: number;
}

interface MarketStore {
  // Language Localization State
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;

  // Authentication State
  user: User | null;
  token: string | null;
  setUser: (user: User | null, token: string | null) => void;
  logout: () => void;

  // Navigation / Page Router State (simulation)
  currentPage: string;
  activeProductId: string | null; // For ProductDetails view
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  setCurrentPage: (page: string, productId?: string | null, category?: string) => void;

  // Products Cache / Filters
  products: Product[];
  setProducts: (products: Product[]) => void;
  filters: {
    search: string;
    condition: string;
    minPrice: string;
    maxPrice: string;
    sortBy: string;
    location: string;
  };
  setFilter: (key: string, value: string) => void;
  resetFilters: () => void;

  // Cart State
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;

  // Wishlist State
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;

  // Chat State
  messages: Message[];
  addMessage: (msg: Message) => void;
  setMessages: (msgs: Message[]) => void;
  activeChatUserId: string | null;
  setActiveChatUserId: (userId: string | null) => void;

  // Notifications simulation
  notifications: string[];
  addNotification: (message: string) => void;
  clearNotifications: () => void;

  // AI Copilot Modal State
  isAiOpen: boolean;
  setAiOpen: (open: boolean) => void;
}

export const useMarketStore = create<MarketStore>((set, get) => ({
  // Language Localization State (defaults to 'en' with localStorage persistence)
  language: (localStorage.getItem("ethio_lang") as LanguageCode) || "en",
  setLanguage: (lang: LanguageCode) => {
    localStorage.setItem("ethio_lang", lang);
    set({ language: lang });
  },

  // Auth initialized from localStorage for fluid persistence
  user: JSON.parse(localStorage.getItem("ethio_user") || "null"),
  token: localStorage.getItem("ethio_token"),
  setUser: (user, token) => {
    if (user && token) {
      localStorage.setItem("ethio_user", JSON.stringify(user));
      localStorage.setItem("ethio_token", token);
    } else {
      localStorage.removeItem("ethio_user");
      localStorage.removeItem("ethio_token");
    }
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem("ethio_user");
    localStorage.removeItem("ethio_token");
    set({ user: null, token: null, currentPage: "home", cart: [], wishlist: [] });
  },

  // Interactive Custom Page Router
  currentPage: "home",
  activeProductId: null,
  activeCategory: "All",
  setActiveCategory: (category) => set({ activeCategory: category || "All" }),
  setCurrentPage: (page, productId = null, category = "All") => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    set({ currentPage: page, activeProductId: productId, activeCategory: category });
  },

  // Filters State
  products: [],
  setProducts: (products) => set({ products }),
  filters: {
    search: "",
    condition: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "newest",
    location: ""
  },
  setFilter: (key, value) => {
    if (key === "category") {
      set({ activeCategory: value || "All" });
    } else {
      set((state) => ({
        filters: { ...state.filters, [key]: value }
      }));
    }
  },
  resetFilters: () => set({
    activeCategory: "All",
    filters: {
      search: "",
      condition: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "newest",
      location: ""
    }
  }),

  // Shopping Cart Actions
  cart: JSON.parse(localStorage.getItem("ethio_cart") || "[]"),
  addToCart: (product) => {
    const { cart } = get();
    const existing = cart.find((item) => item.id === product.id);
    let newCart;
    if (existing) {
      newCart = cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }
    localStorage.setItem("ethio_cart", JSON.stringify(newCart));
    set({ cart: newCart });
    get().addNotification(`"${product.title}" added to your shopping cart!`);
  },
  removeFromCart: (productId) => {
    const newCart = get().cart.filter((item) => item.id !== productId);
    localStorage.setItem("ethio_cart", JSON.stringify(newCart));
    set({ cart: newCart });
  },
  updateCartQuantity: (productId, qty) => {
    if (qty <= 0) {
      get().removeFromCart(productId);
      return;
    }
    const newCart = get().cart.map((item) =>
      item.id === productId ? { ...item, quantity: qty } : item
    );
    localStorage.setItem("ethio_cart", JSON.stringify(newCart));
    set({ cart: newCart });
  },
  clearCart: () => {
    localStorage.removeItem("ethio_cart");
    set({ cart: [] });
  },

  // Saved Wishlist Items
  wishlist: JSON.parse(localStorage.getItem("ethio_wishlist") || "[]"),
  toggleWishlist: (product) => {
    const { wishlist } = get();
    const existing = wishlist.find((item) => item.id === product.id);
    let newWish;
    if (existing) {
      newWish = wishlist.filter((item) => item.id !== product.id);
      get().addNotification(`Removed "${product.title}" from saved wishlist.`);
    } else {
      newWish = [...wishlist, product];
      get().addNotification(`Saved "${product.title}" to your wishlist!`);
    }
    localStorage.setItem("ethio_wishlist", JSON.stringify(newWish));
    set({ wishlist: newWish });
  },
  isInWishlist: (productId) => {
    return get().wishlist.some((item) => item.id === productId);
  },

  // Buyer-Seller Communications
  messages: [],
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setMessages: (messages) => set({ messages }),
  activeChatUserId: null,
  setActiveChatUserId: (userId) => set({ activeChatUserId: userId }),

  // Micro Notifications Toast Simulation
  notifications: [],
  addNotification: (message) => set((state) => ({
    notifications: [...state.notifications, message]
  })),
  clearNotifications: () => set({ notifications: [] }),

  // AI Copilot Modal State
  isAiOpen: false,
  setAiOpen: (open: boolean) => set({ isAiOpen: open }),
}));

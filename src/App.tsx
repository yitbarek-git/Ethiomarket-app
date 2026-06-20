import React, { useEffect, useState } from "react";
import { useMarketStore } from "./store"; // Ensure this path is correct
import Home from "./pages/Home";
import Marketplace from "./pages/Marketplace";
import ProductDetails from "./pages/ProductDetails";
import Dashboard from "./pages/Dashboard";
import CartCheckout from "./pages/CartCheckout";
import LoginRegister from "./pages/LoginRegister";
import StaticViews from "./pages/StaticViews";
import {
  ShoppingBag, Search, Sparkles, User, LogOut,
  HelpCircle, MessageCircle, Info, ChevronRight, X
} from "lucide-react";

export default function App() {
  const {
    user,
    logout,
    currentPage,
    setCurrentPage,
    activeProductId,
    activeCategory,
    cart,
    filters,
    setFilter,
    notifications,
    clearNotifications,
    setActiveCategory, // NEW: Import setActiveCategory from the store
  } = useMarketStore();

  const [searchInput, setSearchInput] = useState("");

  // Auto-fill inputs if store changes (e.g. from outer actions)
  useEffect(() => {
    setSearchInput(filters.search || "");
  }, [filters.search]);

  // Handle header search execution
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter("search", searchInput);
    setCurrentPage("marketplace");
  };

  // Keep alert toasts ticking dismissed
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        clearNotifications();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans flex flex-col justify-between selection:bg-amber-100 antialiased">

      {/* 1. TOP HEADER NAVIGATION */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Brand Logo with Ethiopian stripe accents */}
          <div
            onClick={() => {
              setFilter("search", "");
              setSearchInput("");
              setCurrentPage("home");
              setActiveCategory(null); // Clear active category on home
            }}
            className="flex items-center gap-2 cursor-pointer group shrink-0"
          >
            <div className="flex flex-col gap-0.5 justify-center mr-1">
              <span className="w-5 h-1 bg-[#0060A5] rounded-full"></span> {/* Traditional Indigo */}
              <span className="w-5 h-1 bg-[#FCD116] rounded-full"></span> {/* Traditional Yellow */}
              <span className="w-5 h-1 bg-[#DA121A] rounded-full"></span> {/* Traditional Red */}
            </div>

            <span className="text-xl font-bold tracking-tight text-neutral-950 font-sans group-hover:text-amber-500 transition-colors">
              Ethio<span className="text-amber-500">Market</span>
            </span>
          </div>

          {/* Integrated Header Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center flex-grow max-w-md relative"
          >
            <input
              type="text"
              placeholder="Search phones, laptops, cultural dresses..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-100 border-0 rounded-full text-xs text-neutral-800 placeholder-neutral-400 outline-none focus:bg-neutral-50 focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
            <Search className="absolute left-3.5 top-2.5 text-neutral-400 w-4 h-4" />
          </form>

          {/* Navigation link sets */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button
              onClick={() => {
                setFilter("search", "");
                setCurrentPage("marketplace");
                setActiveCategory(null); // Clear active category when navigating to general marketplace
              }}
              className={`text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer ${currentPage === "marketplace" ? "bg-neutral-100 text-neutral-950" : "text-neutral-600 hover:text-neutral-950"
                }`}
            >
              Marketplace
            </button>

            <button
              onClick={() => setCurrentPage("about")}
              className={`text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer hidden sm:block ${currentPage === "about" ? "bg-neutral-100 text-neutral-950" : "text-neutral-600 hover:text-neutral-950"
                }`}
            >
              About
            </button>

            <button
              onClick={() => setCurrentPage("contact")}
              className={`text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer hidden sm:block ${currentPage === "contact" ? "bg-neutral-100 text-neutral-950" : "text-neutral-600 hover:text-neutral-950"
                }`}
            >
              Contact
            </button>

            <span className="w-[1px] h-5 bg-neutral-200 hidden sm:block"></span>

            {/* Shopping interactive Bag */}
            <button
              onClick={() => setCurrentPage("cart-checkout")}
              className="p-2.5 hover:bg-neutral-100 rounded-full text-neutral-700 hover:text-neutral-950 transition-colors cursor-pointer relative"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-neutral-950 font-bold font-mono text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {cart.length}
                </span>
              )}
            </button>

            {/* User credentials portal action */}
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => setCurrentPage("dashboard")}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">My Hub</span>
                </button>

                <button
                  onClick={logout}
                  className="p-2.5 hover:bg-rose-50 hover:text-red-500 text-neutral-500 rounded-full transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentPage("login-register")}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
              >
                <User className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {currentPage === "home" && <Home />}

        {currentPage === "marketplace" && <Marketplace />}

        {currentPage === "product-details" && activeProductId && (
          <ProductDetails productId={activeProductId} />
        )}

        {currentPage === "dashboard" && <Dashboard />}

        {currentPage === "cart-checkout" && <CartCheckout />}

        {currentPage === "login-register" && <LoginRegister />}

        {currentPage === "about" && <StaticViews viewType="about" />}

        {currentPage === "contact" && <StaticViews viewType="contact" />}

      </main>

      {/* 3. TRADEMARK FOOTER */}
      <footer className="bg-neutral-950 text-white border-t border-neutral-900 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-left text-xs text-neutral-400">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Branding Block */}
            <div className="space-y-3">
              <span className="text-sm font-bold text-white tracking-wider block">EthioMarket</span>
              <p className="leading-relaxed font-normal">
                Connecting vendors, micro-merchants, and consumers across Ethiopia with an advanced digital search, bargaining, and instant payment sandbox.
              </p>
              <div className="flex items-center gap-1.5 text-[9px] font-mono bg-neutral-900 w-fit p-1 px-2.5 rounded text-amber-500">
                <Sparkles className="w-3 h-3" /> Powered by Gemini LLM
              </div>
            </div>

            {/* Hub Categories Link */}
            <div className="space-y-3">
              <span className="text-sm font-bold text-white tracking-wider block">Trade Categories</span>
              <ul className="space-y-2">
                {["Phones", "Laptops", "Electronics", "Fashion", "Real Estate"].map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => {
                        setFilter("search", "");
                        setFilter("condition", "");
                        setActiveCategory(cat); // Set the active category
                        setCurrentPage("marketplace"); // Navigate to marketplace
                      }}
                      className="hover:text-amber-500 transition-colors cursor-pointer text-left"
                    >
                      Browse {cat} Listings
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Platform rules */}
            <div className="space-y-3">
              <span className="text-sm font-bold text-white tracking-wider block">Market Compliance</span>
              <ul className="space-y-2">
                <li><button onClick={() => setCurrentPage("about")} className="hover:text-amber-500 transition-colors cursor-pointer text-left">About EthioMarket</button></li>
                <li><button onClick={() => setCurrentPage("contact")} className="hover:text-amber-500 transition-colors cursor-pointer text-left">Help & Support</button></li>
                <li><span className="text-neutral-500 block">Verified Vendor Manual</span></li>
                <li><span className="text-neutral-500 block">Bole Cash Guidelines</span></li>
              </ul>
            </div>

            {/* Supported payment channels summary */}
            <div className="space-y-3">
              <span className="text-sm font-bold text-white tracking-wider block">Secured Gateways</span>
              <p className="leading-relaxed font-normal">
                EthioMarket offers mock sandbox handshakes with national networks. Use simulated systems to instantly verify cart orders.
              </p>
              <div className="flex gap-2 pt-1 font-mono text-[9px] font-bold text-neutral-350">
                <span className="p-1 px-2 bg-neutral-900 border border-neutral-800 rounded uppercase">Chapa</span>
                <span className="p-1 px-2 bg-neutral-900 border border-neutral-800 rounded uppercase text-emerald-500">Telebirr</span>
                <span className="p-1 px-2 bg-neutral-900 border border-neutral-800 rounded uppercase">COD</span>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p className="font-normal">&copy; {new Date().getFullYear()} EthioMarket Inc. All rights reserved.</p>
            <p className="text-neutral-500">Created for EthioMarket virtual users in Addis Ababa, Bole District.</p>
          </div>
        </div>
      </footer>

      {/* 4. FLOATING NOTIFICATION BANNER / TOAST */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2 max-w-sm pointer-events-auto">
        {notifications.map((notif, index) => (
          <div
            key={index}
            className="p-3.5 bg-neutral-900 border border-neutral-800 text-white rounded-2xl flex items-start gap-3 shadow-2xl animate-slide-in"
          >
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0 animate-ping"></div>
            <p className="text-xs font-normal leading-normal select-none flex-grow text-neutral-200">{notif}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
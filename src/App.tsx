import React, { useEffect, useState } from "react";
import { useMarketStore } from "./store";
import { useTranslation } from "./translations";
import LanguageSelector from "./components/LanguageSelector";
import Home from "./pages/Home";
import Marketplace from "./pages/Marketplace";
import ProductDetails from "./pages/ProductDetails";
import Dashboard from "./pages/Dashboard";
import CartCheckout from "./pages/CartCheckout";
import LoginRegister from "./pages/LoginRegister";
import StaticViews from "./pages/StaticViews";
import AIAssistant from "./components/AIAssistant";
import AdminDashboard from "./pages/AdminDashboard";
import { 
  ShoppingBag, Search, Sparkles, User, LogOut, 
  HelpCircle, MessageCircle, Info, ChevronRight, X,
  Home as HomeIcon, Store, Menu, Heart, ShieldCheck
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
    language,
    isAiOpen,
    setAiOpen
  } = useMarketStore();

  const { t } = useTranslation(language);

  const [searchInput, setSearchInput] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check URL hash on load or change (supports direct navigation to #admin)
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === "#admin") {
        setCurrentPage("admin");
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [setCurrentPage]);

  // Auto-fill inputs if store changes (e.g. from outer actions)
  useEffect(() => {
    setSearchInput(filters.search || "");
  }, [filters.search]);

  // Handle header search execution
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter("search", searchInput);
    setCurrentPage("marketplace");
    setMobileSearchOpen(false);
    setMobileMenuOpen(false);
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
    <div className="min-h-screen bg-white text-neutral-900 font-sans flex flex-col justify-between selection:bg-amber-100 antialiased overflow-x-hidden">
      
      {/* 1. TOP HEADER NAVIGATION */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-150">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-4">
          
          {/* Brand Logo with Ethiopian stripe accents */}
          <div 
            onClick={() => {
              setFilter("search", "");
              setSearchInput("");
              setCurrentPage("home");
              setMobileMenuOpen(false);
            }} 
            className="flex items-center gap-1.5 cursor-pointer group shrink-0 min-w-0"
          >
            <div className="flex flex-col gap-0.5 justify-center shrink-0">
              <span className="w-3.5 sm:w-5 h-0.5 sm:h-1 bg-[#0060A5] rounded-full"></span> {/* Traditional Indigo */}
              <span className="w-3.5 sm:w-5 h-0.5 sm:h-1 bg-[#FCD116] rounded-full"></span> {/* Traditional Yellow */}
              <span className="w-3.5 sm:w-5 h-0.5 sm:h-1 bg-[#DA121A] rounded-full"></span> {/* Traditional Red */}
            </div>
            
            <span className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-neutral-950 font-sans group-hover:text-amber-500 transition-colors truncate">
              Ethio<span className="text-amber-500">Market</span>
            </span>
          </div>

          {/* Integrated Desktop Search Bar */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="hidden md:flex items-center flex-grow max-w-md relative mx-2"
          >
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-100 border-0 rounded-full text-xs text-neutral-800 placeholder-neutral-400 outline-none focus:bg-neutral-50 focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
            <Search className="absolute left-3.5 top-2.5 text-neutral-400 w-4 h-4" />
          </form>

          {/* Navigation action set */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Mobile Search Icon Toggle */}
            <button
              onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen);
                if (mobileMenuOpen) setMobileMenuOpen(false);
              }}
              className="p-1.5 sm:p-2 md:hidden rounded-xl text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center shrink-0"
              title={t("search")}
              aria-label="Toggle Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Desktop Navigation Links */}
            <button
              onClick={() => {
                setFilter("search", "");
                setCurrentPage("marketplace");
              }}
              className={`text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer hidden md:block ${
                currentPage === "marketplace" ? "bg-neutral-100 text-neutral-950" : "text-neutral-600 hover:text-neutral-950"
              }`}
            >
              {t("marketplace")}
            </button>

            <button
              onClick={() => setCurrentPage("about")}
              className={`text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer hidden lg:block ${
                currentPage === "about" ? "bg-neutral-100 text-neutral-950" : "text-neutral-600 hover:text-neutral-950"
              }`}
            >
              {t("about")}
            </button>

            <button
              onClick={() => setCurrentPage("contact")}
              className={`text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer hidden xl:block ${
                currentPage === "contact" ? "bg-neutral-100 text-neutral-950" : "text-neutral-600 hover:text-neutral-950"
              }`}
            >
              {t("contact")}
            </button>

            {/* Ethiopian Languages Switcher */}
            <LanguageSelector />

            {/* Shopping Bag Button (Desktop & Tablet >= sm) */}
            <button
              onClick={() => setCurrentPage("cart-checkout")}
              className="p-2 hover:bg-neutral-100 rounded-full text-neutral-700 hover:text-neutral-950 transition-colors cursor-pointer relative hidden sm:flex items-center justify-center min-h-[38px] min-w-[38px] shrink-0"
              title={t("cartTitle")}
            >
              <ShoppingBag className="w-4 h-4" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-neutral-950 font-bold font-mono text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Sign In / User Hub Button - MANDATORY VISIBLE ON ALL SCREENS */}
            {user ? (
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                {user.role === "ADMIN" && (
                  <button
                    onClick={() => setCurrentPage("admin")}
                    className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors min-h-[38px] shrink-0 ${
                      currentPage === "admin"
                        ? "bg-amber-500 text-neutral-950 font-bold"
                        : "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
                    }`}
                    title="Owner Admin Dashboard"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span className="hidden sm:inline">Admin</span>
                  </button>
                )}

                <button
                  onClick={() => setCurrentPage("dashboard")}
                  className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors min-h-[38px] shrink-0"
                  title={t("myHub")}
                >
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline whitespace-nowrap">{user.name.split(" ")[0] || t("myHub")}</span>
                </button>
                
                <button
                  onClick={logout}
                  className="p-2 hover:bg-rose-50 hover:text-red-500 text-neutral-500 rounded-full transition-colors cursor-pointer hidden md:flex items-center justify-center min-h-[38px] min-w-[38px]"
                  title={t("signOut")}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentPage("login-register")}
                className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs min-h-[38px] shrink-0 active:scale-98"
                title={t("signIn")}
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs font-semibold whitespace-nowrap">{t("signIn")}</span>
              </button>
            )}

            {/* Mobile Menu Hamburger Toggle */}
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                if (mobileSearchOpen) setMobileSearchOpen(false);
              }}
              className="p-1.5 sm:p-2 md:hidden rounded-xl text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center shrink-0"
              title="Navigation Menu"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-neutral-950" /> : <Menu className="w-5 h-5 text-neutral-950" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Search Field */}
        {mobileSearchOpen && (
          <div className="md:hidden border-t border-neutral-100 bg-white px-3 py-2.5 shadow-sm animate-in fade-in slide-in-from-top-1">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-8 py-2 bg-neutral-100 border-0 rounded-xl text-xs text-neutral-800 placeholder-neutral-400 outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <Search className="absolute left-3 text-neutral-400 w-3.5 h-3.5" />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute right-2.5 text-neutral-400 hover:text-neutral-700 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-150 bg-white/98 backdrop-blur-md px-3.5 py-4 space-y-3.5 shadow-xl animate-in fade-in slide-in-from-top-2">
            {/* User Quick Info Card */}
            {user ? (
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-150 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-900 truncate">{user.name}</p>
                    <p className="text-[10px] text-neutral-400 font-mono truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      setCurrentPage("dashboard");
                      setMobileMenuOpen(false);
                    }}
                    className="px-2.5 py-1.5 bg-neutral-950 text-white rounded-xl text-xs font-semibold"
                  >
                    {t("myHub")}
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="p-1.5 text-neutral-500 hover:text-red-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title={t("signOut")}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/50 rounded-2xl flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-neutral-900">{t("welcomeBack") || "Welcome to EthioMarket"}</p>
                  <p className="text-[11px] text-neutral-500">{t("loginSub") || "Buy, sell & negotiate easily"}</p>
                </div>
                <button
                  onClick={() => {
                    setCurrentPage("login-register");
                    setMobileMenuOpen(false);
                  }}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded-xl text-xs font-bold shrink-0 shadow-xs cursor-pointer min-h-[38px]"
                >
                  {t("signIn")}
                </button>
              </div>
            )}

            {/* Navigation links */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  setCurrentPage("home");
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors min-h-[44px] ${
                  currentPage === "home" ? "bg-amber-50 text-amber-900 border border-amber-200" : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <HomeIcon className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{t("home") || "Home"}</span>
              </button>

              <button
                onClick={() => {
                  setFilter("search", "");
                  setCurrentPage("marketplace");
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors min-h-[44px] ${
                  currentPage === "marketplace" ? "bg-amber-50 text-amber-900 border border-amber-200" : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <Store className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{t("marketplace")}</span>
              </button>

              <button
                onClick={() => {
                  setCurrentPage("about");
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors min-h-[44px] ${
                  currentPage === "about" ? "bg-amber-50 text-amber-900 border border-amber-200" : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{t("about")}</span>
              </button>

              <button
                onClick={() => {
                  setCurrentPage("contact");
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors min-h-[44px] ${
                  currentPage === "contact" ? "bg-amber-50 text-amber-900 border border-amber-200" : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <MessageCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{t("contact")}</span>
              </button>

              {user?.role === "ADMIN" && (
                <button
                  onClick={() => {
                    setCurrentPage("admin");
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors col-span-2 min-h-[44px] ${
                    currentPage === "admin" ? "bg-amber-500 text-neutral-950 font-bold" : "bg-amber-50 text-amber-900 border border-amber-200"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Admin Dashboard</span>
                </button>
              )}

              <button
                onClick={() => {
                  setCurrentPage("cart-checkout");
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors col-span-2 min-h-[44px] ${
                  currentPage === "cart-checkout" ? "bg-amber-50 text-amber-900 border border-amber-200" : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{t("cartTitle")}</span>
                </div>
                {cart.length > 0 && (
                  <span className="px-2 py-0.5 bg-amber-500 text-neutral-950 font-bold font-mono text-[10px] rounded-full">
                    {cart.length} {t("cartCount") || "items"}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-12">
        
        {currentPage === "home" && <Home />}
        
        {currentPage === "marketplace" && <Marketplace />}
        
        {currentPage === "product-details" && activeProductId && (
          <ProductDetails productId={activeProductId} />
        )}
        
        {currentPage === "dashboard" && <Dashboard />}
        
        {currentPage === "admin" && <AdminDashboard />}
        
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
                {t("footerDesc")}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-mono">
                <span className="bg-neutral-900 border border-neutral-800 text-amber-400 p-1 px-2 rounded-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Multilingual Support
                </span>
                <span className="bg-neutral-900 border border-neutral-800 text-neutral-300 p-1 px-2 rounded-md">
                  🇪🇹 አማርኛ • Oromoo • ትግርኛ • Soomaali
                </span>
              </div>
            </div>

            {/* Hub Categories Link */}
            <div className="space-y-3">
              <span className="text-sm font-bold text-white tracking-wider block">{t("quickCategories")}</span>
              <ul className="space-y-2">
                {[
                  { id: "Phones", label: t("catPhones") },
                  { id: "Laptops", label: t("catLaptops") },
                  { id: "Electronics", label: t("catElectronics") },
                  { id: "Fashion", label: t("catFashion") },
                  { id: "Real Estate", label: t("catRealEstate") },
                ].map((cat) => (
                  <li key={cat.id}>
                    <button 
                      onClick={() => {
                        setFilter("search", "");
                        setFilter("condition", "");
                        setCurrentPage("marketplace", null, cat.id);
                      }}
                      className="hover:text-amber-500 transition-colors cursor-pointer text-left"
                    >
                      {cat.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Platform rules */}
            <div className="space-y-3">
              <span className="text-sm font-bold text-white tracking-wider block">{t("footerCompliance")}</span>
              <ul className="space-y-2">
                <li><button onClick={() => setCurrentPage("about")} className="hover:text-amber-500 transition-colors cursor-pointer text-left">{t("about")}</button></li>
                <li><button onClick={() => setCurrentPage("contact")} className="hover:text-amber-500 transition-colors cursor-pointer text-left">{t("contact")}</button></li>
                <li><button onClick={() => setCurrentPage("admin")} className="hover:text-amber-500 transition-colors cursor-pointer text-left">Admin Portal</button></li>
                <li><span className="text-neutral-500 block">{t("footerVerifiedManual")}</span></li>
                <li><span className="text-neutral-500 block">{t("footerBoleCash")}</span></li>
              </ul>
            </div>

            {/* Supported payment channels summary */}
            <div className="space-y-3">
              <span className="text-sm font-bold text-white tracking-wider block">{t("trustTelebirrTitle")}</span>
              <p className="leading-relaxed font-normal">
                {t("trustTelebirrDesc")}
              </p>
              <div className="flex gap-2 pt-1 font-mono text-[9px] font-bold text-neutral-350">
                <span className="p-1 px-2 bg-neutral-900 border border-neutral-800 rounded uppercase">Chapa</span>
                <span className="p-1 px-2 bg-neutral-900 border border-neutral-800 rounded uppercase text-emerald-500">Telebirr</span>
                <span className="p-1 px-2 bg-neutral-900 border border-neutral-800 rounded uppercase">COD</span>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p className="font-normal">&copy; {new Date().getFullYear()} EthioMarket Inc. {t("footerCopy")}</p>
            <p className="text-neutral-500">{t("footerLocation")}</p>
          </div>
        </div>
      </footer>

      {/* 4. ETHIOMARKET AI ASSISTANT (COPILOT) */}
      <AIAssistant />

      {/* 5. MOBILE BOTTOM NAVIGATION BAR */}
      <nav 
        id="mobile-bottom-nav" 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 px-1 py-1 pb-safe flex items-center justify-around shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      >
        <button
          onClick={() => {
            setCurrentPage("home");
            setMobileMenuOpen(false);
          }}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl min-h-[44px] cursor-pointer transition-colors ${
            currentPage === "home" ? "text-amber-600 font-bold" : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <HomeIcon className="w-5 h-5 shrink-0" />
          <span className="text-[10px] mt-0.5 tracking-tight font-sans truncate max-w-full">
            {t("home") || "Home"}
          </span>
        </button>

        <button
          onClick={() => {
            setFilter("search", "");
            setCurrentPage("marketplace");
            setMobileMenuOpen(false);
          }}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl min-h-[44px] cursor-pointer transition-colors ${
            currentPage === "marketplace" ? "text-amber-600 font-bold" : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <Store className="w-5 h-5 shrink-0" />
          <span className="text-[10px] mt-0.5 tracking-tight font-sans truncate max-w-full">
            {t("marketplace")}
          </span>
        </button>

        {/* Help / Assistant in Bottom Nav */}
        <button
          onClick={() => {
            setAiOpen(!isAiOpen);
            setMobileMenuOpen(false);
          }}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl min-h-[44px] cursor-pointer transition-colors relative ${
            isAiOpen ? "text-amber-600 font-bold" : "text-neutral-500 hover:text-neutral-900"
          }`}
          title="Marketplace Help"
        >
          <div className="relative">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              isAiOpen ? "bg-amber-500 text-neutral-950" : "bg-neutral-950 text-amber-400"
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-sans truncate max-w-full">
            Help
          </span>
        </button>

        <button
          onClick={() => {
            setCurrentPage("cart-checkout");
            setMobileMenuOpen(false);
          }}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl min-h-[44px] cursor-pointer transition-colors relative ${
            currentPage === "cart-checkout" ? "text-amber-600 font-bold" : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 shrink-0" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-amber-500 text-neutral-950 font-bold font-mono text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {cart.length}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-sans truncate max-w-full">
            {t("cartTitle") || "Cart"}
          </span>
        </button>

        <button
          onClick={() => {
            setMobileMenuOpen(false);
            if (user) {
              setCurrentPage("dashboard");
            } else {
              setCurrentPage("login-register");
            }
          }}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl min-h-[44px] cursor-pointer transition-colors ${
            currentPage === "dashboard" || currentPage === "login-register" ? "text-amber-600 font-bold" : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <User className="w-5 h-5 shrink-0" />
          <span className="text-[10px] mt-0.5 tracking-tight font-sans truncate max-w-full">
            {user ? t("myHub") || "Hub" : t("signIn") || "Account"}
          </span>
        </button>
      </nav>

      {/* 6. FLOATING NOTIFICATION BANNER / TOAST */}
      <div className="fixed top-16 sm:top-20 inset-x-3 sm:inset-x-auto sm:right-6 z-50 space-y-2 max-w-sm pointer-events-none">
        {notifications.map((notif, index) => (
          <div 
            key={index}
            className="p-3 sm:p-3.5 bg-neutral-900/95 backdrop-blur-sm border border-neutral-800 text-white rounded-2xl flex items-start gap-2.5 sm:gap-3 shadow-2xl animate-slide-in pointer-events-auto"
          >
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0 animate-ping"></div>
            <p className="text-xs font-normal leading-normal select-none flex-grow text-neutral-200">{notif}</p>
          </div>
        ))}
      </div>

    </div>
  );
}

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, SlidersHorizontal, Grid, MapPin, Heart, ShoppingBag, Filter, RefreshCcw, Globe, X } from "lucide-react";
import { useMarketStore } from "../store";
import { useTranslation, SUPPORTED_LANGUAGES } from "../translations";
import { Product } from "../types";
import { searchAndRankProducts } from "../utils/search";

interface MarketplaceProps {
  products?: Product[];
}

export default function Marketplace({ products: propProducts }: MarketplaceProps) {
  const { 
    products: storeProducts,
    setProducts,
    filters, 
    setFilter, 
    resetFilters, 
    addToCart, 
    toggleWishlist, 
    isInWishlist,
    setCurrentPage,
    activeCategory,
    setActiveCategory,
    language,
    setLanguage
  } = useMarketStore();

  const { t } = useTranslation(language);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
        }
      } catch (err) {
        console.error("Marketplace direct listings pull error:", err);
      }
    }
    loadProducts();
  }, []);

  const products = propProducts || storeProducts || [];

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.search || "");
  const [displayCount, setDisplayCount] = useState(12);

  // Sync external search filter changes to local state
  useEffect(() => {
    setLocalSearch(filters.search || "");
  }, [filters.search]);

  // Reset pagination when activeCategory or filters change
  useEffect(() => {
    setDisplayCount(12);
  }, [activeCategory, filters]);

  const categories = [
    "All", "Phones", "Laptops", "PCs", "Cameras", "AirPods", "Electronics", "Fashion", "Vehicles", "Real Estate", "Agro & Coffee", "Books", "Services"
  ];

  const categoryIcons: Record<string, string> = {
    All: "🛍️",
    Phones: "📱",
    Laptops: "💻",
    PCs: "🖥️",
    Cameras: "📷",
    AirPods: "🎧",
    Electronics: "📺",
    Fashion: "👗",
    Vehicles: "🚗",
    "Real Estate": "🏢",
    "Agro & Coffee": "☕",
    Books: "📚",
    Services: "💼",
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "All": return t("catAll");
      case "Phones": return t("catPhones");
      case "Laptops": return t("catLaptops");
      case "PCs": return t("catPCs");
      case "Cameras": return t("catCameras");
      case "AirPods": return t("catAirPods");
      case "Electronics": return t("catElectronics");
      case "Books": return t("catBooks");
      case "Fashion": return t("catFashion");
      case "Vehicles": return t("catVehicles");
      case "Real Estate": return t("catRealEstate");
      case "Agro & Coffee": return t("catAgro") || "Agro & Specialty Coffee";
      case "Services": return t("catServices");
      default: return cat;
    }
  };

  const conditions = [
    { value: "", label: t("condAll") },
    { value: "NEW", label: t("condNew") },
    { value: "USED", label: t("condUsed") },
    { value: "REFURBISHED", label: t("condRefurbished") }
  ];

  const locations = [
    { value: "", label: t("allRegions") || "All Ethiopia" },
    { value: "bole", label: "Bole, Addis Ababa" },
    { value: "piassa", label: "Piassa, Addis Ababa" },
    { value: "merkato", label: "Merkato, Addis Ababa" },
    { value: "sarbet", label: "Sarbet, Addis Ababa" },
    { value: "megenagna", label: "Megenagna, Addis Ababa" },
    { value: "shiro", label: "Shiro Meda, Addis Ababa" },
    { value: "cmc", label: "CMC / Ayat, Addis Ababa" },
    { value: "kazanchis", label: "Kazanchis, Addis Ababa" },
    { value: "hawassa", label: "Hawassa, Sidama" },
    { value: "mekelle", label: "Mekelle, Tigray" },
    { value: "bahir dar", label: "Bahir Dar, Amhara" },
    { value: "adama", label: "Adama (Nazret), Oromia" },
    { value: "dire dawa", label: "Dire Dawa" },
    { value: "sidama", label: "Sidama Region" }
  ];

  // Apply filters and smart relevance ranking on client side
  const filteredProducts = useMemo(() => {
    const minP = filters.minPrice ? parseFloat(filters.minPrice) : undefined;
    const maxP = filters.maxPrice ? parseFloat(filters.maxPrice) : undefined;

    let list = searchAndRankProducts(products, filters.search || "", {
      category: activeCategory || undefined,
      condition: filters.condition || undefined,
      location: filters.location || undefined,
      minPrice: isNaN(minP as number) ? undefined : minP,
      maxPrice: isNaN(maxP as number) ? undefined : maxP,
    });

    // Sorting (if search is active, default order is relevance-ranked)
    if (filters.sortBy === "newest") {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (filters.sortBy === "price_asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === "price_desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (filters.sortBy === "popularity") {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [products, activeCategory, filters]);

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, displayCount);
  }, [filteredProducts, displayCount]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter("search", localSearch.trim());
  };

  const handleClearSearch = () => {
    setLocalSearch("");
    setFilter("search", "");
  };

  const QUICK_SEARCH_CHIPS = [
    { label: "iPhone", query: "iPhone" },
    { label: "Used Laptop", query: "used laptop" },
    { label: "Phone < 20k ETB", query: "phone under 20000" },
    { label: "Habesha Kemis", query: "Habesha Kemis" },
    { label: "Specialty Coffee", query: "Specialty Coffee" },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header with Ethiopian Language Quick Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">{t("marketplace")}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 font-mono">
              {SUPPORTED_LANGUAGES.find(l => l.code === language)?.nativeName}
            </span>
          </div>
          <p className="text-neutral-500 text-sm mt-1">{t("heroSubtitle")}</p>
        </div>

        {/* Sorting and Mobile Filters Trigger */}
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-700 font-medium text-sm cursor-pointer shadow-sm active:bg-neutral-50"
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-500" />
            {t("filterBoard")}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-medium whitespace-nowrap hidden sm:inline">{t("sortBy")}:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilter("sortBy", e.target.value)}
              className="px-3.5 py-2 border border-neutral-200 rounded-xl text-neutral-700 bg-white text-sm outline-none cursor-pointer focus:border-amber-500"
            >
              <option value="newest">{t("sortNewest")}</option>
              <option value="price_asc">{t("sortPriceAsc")}</option>
              <option value="price_desc">{t("sortPriceDesc")}</option>
              <option value="popularity">{t("sortPopular")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout (Sidebar + Grid) */}
      <div className="flex gap-8 items-start">
        {/* ========= DESKTOP SIDEBAR FILTERS ========= */}
        <aside className="w-64 bg-white border border-neutral-200/80 rounded-2xl p-6 space-y-6 shrink-0 sticky top-24 hidden md:block">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h3 className="font-sans font-bold text-neutral-900 text-sm flex items-center gap-2">
              <Filter className="w-4 h-4 text-amber-500" />
              {t("filterBoard")}
            </h3>
            <button
              onClick={() => {
                resetFilters();
                setActiveCategory("All");
                setLocalSearch("");
              }}
              className="text-[11px] text-amber-600 font-semibold hover:text-amber-700 cursor-pointer flex items-center gap-1 transition-colors"
            >
              <RefreshCcw className="w-3 h-3" /> {t("reset")}
            </button>
          </div>

          {/* Categories Tab list */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">{t("category")}</label>
            <div className="flex flex-col gap-1 max-h-80 sm:max-h-96 overflow-y-auto pr-1.5">
              {categories.map((cat) => {
                const isActive = (activeCategory || "All") === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(activeCategory === cat && cat !== "All" ? "All" : cat)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all flex items-center justify-between min-h-[38px] ${
                      isActive 
                        ? "bg-amber-500 text-neutral-950 font-bold shadow-xs scale-[1.01]" 
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-sm shrink-0">{categoryIcons[cat] || "🏷️"}</span>
                      <span className="truncate">{getCategoryLabel(cat)}</span>
                    </span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-neutral-950 shrink-0"></span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Region / Location Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>Location / Region</span>
            </label>
            <select
              value={filters.location || ""}
              onChange={(e) => setFilter("location", e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-neutral-800 text-xs bg-white outline-none focus:border-amber-500 cursor-pointer"
            >
              {locations.map((loc) => (
                <option key={loc.value} value={loc.value}>
                  {loc.label}
                </option>
              ))}
            </select>
          </div>

          {/* Product Condition */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">{t("condition")}</label>
            <div className="space-y-1.5">
              {conditions.map((cond) => {
                const isSelected = filters.condition === cond.value;
                return (
                  <button
                    key={cond.value}
                    onClick={() => setFilter("condition", cond.value)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      isSelected 
                        ? "bg-neutral-900 text-white font-bold" 
                        : "text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    {cond.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">{t("priceRange")}</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder={t("min")}
                value={filters.minPrice}
                onChange={(e) => setFilter("minPrice", e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded-xl text-neutral-700 text-xs outline-none focus:border-amber-500"
              />
              <input
                type="number"
                placeholder={t("max")}
                value={filters.maxPrice}
                onChange={(e) => setFilter("maxPrice", e.target.value)}
                className="w-full px-3 py-1.5 border border-neutral-200 rounded-xl text-neutral-700 text-xs outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </aside>

        {/* ========= MAIN PRODUCTS LIST area ========= */}
        <div className="flex-grow space-y-6 w-full min-w-0">
          {/* Quick Horizontal Scroll Category Pills (Mobile & Desktop) */}
          <div className="overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
            <div className="flex items-center gap-2 w-max">
              {categories.map((cat) => {
                const isActive = (activeCategory || "All") === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(activeCategory === cat && cat !== "All" ? "All" : cat)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 cursor-pointer transition-all ${
                      isActive
                        ? "bg-amber-500 text-neutral-950 shadow-sm font-bold scale-102"
                        : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    <span className="text-base">{categoryIcons[cat] || "🏷️"}</span>
                    <span>{getCategoryLabel(cat)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Marketplace search form */}
          <div className="space-y-2">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-grow min-w-0">
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      handleClearSearch();
                    }
                  }}
                  className="w-full min-h-[44px] pl-10 pr-9 sm:pl-11 sm:pr-10 py-2.5 border border-neutral-200 rounded-2xl text-xs sm:text-sm outline-none focus:border-amber-500 bg-white"
                />
                <Search className="absolute left-3.5 top-3 text-neutral-400 w-4 h-4 pointer-events-none" />
                {localSearch && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-700 p-0.5 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="min-h-[44px] px-4 sm:px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-semibold rounded-2xl cursor-pointer shadow-xs text-xs sm:text-sm shrink-0 transition-colors"
              >
                {t("search")}
              </button>
            </form>

            {/* Quick Search Suggestion Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px] text-neutral-500 py-0.5">
              <span className="shrink-0 text-neutral-400 font-medium">Suggested:</span>
              {QUICK_SEARCH_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setLocalSearch(chip.query);
                    setFilter("search", chip.query);
                  }}
                  className="px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-amber-50 hover:text-amber-900 border border-neutral-200/60 whitespace-nowrap cursor-pointer transition-colors shrink-0"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

            {/* Active Filters Badges */}
            <div className="flex gap-2 items-center flex-wrap">
              <span className="text-xs text-neutral-400 font-mono uppercase tracking-wider font-medium">{t("filters")}:</span>
              {activeCategory && activeCategory !== "All" ? (
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200/50 flex items-center gap-1.5">
                  <span>{categoryIcons[activeCategory] || "🏷️"}</span>
                  <span>{getCategoryLabel(activeCategory)}</span>
                  <button
                    onClick={() => setActiveCategory("All")}
                    className="hover:text-red-500 ml-0.5 cursor-pointer p-0.5 rounded-full hover:bg-amber-100 transition-colors"
                    title="Clear category filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 text-xs font-semibold border border-neutral-200/40">
                  {t("catAll")}
                </span>
              )}
              {filters.location && (
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200/40 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {locations.find(l => l.value === filters.location)?.label || filters.location}
              </span>
            )}
            {filters.search && (
              <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-semibold border border-neutral-200/30 flex items-center gap-1">
                "{filters.search}"
                <button onClick={handleClearSearch} className="hover:text-red-500 ml-0.5 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.condition && (
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/30 flex items-center gap-1">
                {filters.condition}
              </span>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200/30 flex items-center gap-1">
                {filters.minPrice || "0"} - {filters.maxPrice || "Max"} ETB
              </span>
            )}
            <span className="ml-auto text-xs text-neutral-400 font-mono">
              {t("showingCount") || "Showing"} {visibleProducts.length} of {filteredProducts.length}
            </span>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white border border-neutral-150 rounded-3xl p-6 sm:p-8 space-y-4 max-w-lg mx-auto">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-2xl mx-auto">
                🔍
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-sans font-bold text-neutral-900">
                  {filters.search ? `No listings found for "${filters.search}"` : t("noProductsFound")}
                </h3>
                <p className="text-neutral-500 text-xs sm:text-sm max-w-xs mx-auto">
                  Try checking for spelling errors, using simpler keywords, or resetting your price and category filters.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    resetFilters();
                    handleClearSearch();
                  }}
                  className="min-h-[44px] px-6 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white font-medium text-xs rounded-xl transition-colors cursor-pointer"
                >
                  {t("clearAllFilters") || "Reset All Filters"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
                {visibleProducts.map((p) => {
                  const inWish = isInWishlist(p.id);
                  return (
                    <div
                      key={p.id}
                      className="group bg-white border border-neutral-200/80 rounded-2xl overflow-hidden hover:shadow-lg hover:border-neutral-300 transition-all flex flex-col justify-between"
                    >
                      {/* Photo Area */}
                      <div 
                        className="relative aspect-square overflow-hidden bg-neutral-100 shrink-0 cursor-pointer"
                        onClick={() => setCurrentPage("product-details", p.id)}
                      >
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";
                          }}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 left-3 flex gap-1 flex-wrap">
                          {p.isFeatured && (
                            <span className="px-2 py-0.5 rounded bg-neutral-900/90 text-white text-[9px] font-mono font-bold tracking-widest uppercase shadow-xs">
                              Featured
                            </span>
                          )}
                          <span className={`px-2 py-0.5 text-[9px] font-mono rounded font-bold uppercase shadow-xs ${
                            p.condition === "NEW" ? "bg-emerald-600 text-white" : "bg-teal-600 text-white"
                          }`}>
                            {p.condition}
                          </span>
                        </div>
                        {/* Saved Heart Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(p);
                          }}
                          className="absolute top-3 right-3 p-2 bg-white/95 backdrop-blur-md rounded-full shadow-md text-neutral-700 hover:text-red-500 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                        >
                          <Heart className={`w-4 h-4 ${inWish ? "fill-red-500 text-red-500" : ""}`} />
                        </button>
                      </div>

                      {/* Content Details */}
                      <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                            <span>{p.category}</span>
                            <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3 text-red-400 shrink-0" /> {p.location.split(",")[0]}</span>
                          </div>
                          <h3
                            onClick={() => setCurrentPage("product-details", p.id)}
                            className="font-semibold text-neutral-800 hover:text-amber-600 text-base line-clamp-1 cursor-pointer"
                          >
                            {p.title}
                          </h3>
                          <p className="text-xs text-neutral-500 line-clamp-2">{p.description}</p>
                        </div>

                        {/* Cost & Action area */}
                        <div className="flex items-center justify-between pl-0.5 border-t border-neutral-100 pt-3 gap-2">
                          <div className="font-mono min-w-0">
                            <span className="text-sm sm:text-base font-bold text-neutral-900">{p.price.toLocaleString()}</span>
                            <span className="text-[10px] sm:text-[11px] text-amber-600 font-bold ml-1">ETB</span>
                          </div>
                          <button
                            onClick={() => addToCart(p)}
                            className="min-h-[38px] px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{t("addToCart")}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More Pagination Button */}
              {displayCount < filteredProducts.length && (
                <div className="flex flex-col items-center justify-center pt-8 pb-4 space-y-2">
                  <button
                    onClick={() => setDisplayCount((prev) => prev + 12)}
                    className="min-h-[48px] px-8 py-3 bg-neutral-950 hover:bg-neutral-800 text-white font-semibold rounded-2xl text-sm transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2"
                  >
                    <span>{t("loadMore") || "Load More Listings"}</span>
                    <span className="text-xs text-amber-400 font-mono">
                      ({visibleProducts.length} of {filteredProducts.length})
                    </span>
                  </button>
                  <p className="text-xs text-neutral-400 font-mono">
                    Showing {visibleProducts.length} of {filteredProducts.length} verified listings across Ethiopia
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ========= MOBILE SIDEBAR SLIDE-OUT DRAWER OVERLAY ========= */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-black z-50 md:hidden"
            ></motion.div>

            {/* Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 w-80 max-w-[90%] bg-white z-50 p-6 overscroll-contain overflow-y-auto space-y-6 md:hidden shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <h3 className="font-sans font-bold text-neutral-900 text-base flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-amber-500" />
                  {t("filterBoard")}
                </h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="min-h-[40px] px-3 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-xs cursor-pointer font-bold"
                >
                  {t("close")}
                </button>
              </div>

              {/* Reset inside mobile */}
              <button
                onClick={() => {
                  resetFilters();
                  setActiveCategory("All");
                  setLocalSearch("");
                  setShowMobileFilters(false);
                }}
                className="w-full min-h-[44px] py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-xl cursor-pointer text-center"
              >
                {t("clearAllFilters")}
              </button>

              {/* Location selector on mobile */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>Location / Region</span>
                </label>
                <select
                  value={filters.location || ""}
                  onChange={(e) => {
                    setFilter("location", e.target.value);
                  }}
                  className="w-full min-h-[44px] px-3 py-2 border border-neutral-200 rounded-xl text-neutral-800 text-xs bg-white outline-none focus:border-amber-500 cursor-pointer"
                >
                  {locations.map((loc) => (
                    <option key={loc.value} value={loc.value}>
                      {loc.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">{t("category")}</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {categories.map((cat) => {
                    const isActive = (activeCategory || "All") === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          setActiveCategory(activeCategory === cat && cat !== "All" ? "All" : cat);
                          setShowMobileFilters(false);
                        }}
                        className={`min-h-[44px] text-left px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
                          isActive 
                            ? "bg-amber-500 text-neutral-950 font-bold" 
                            : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                        }`}
                      >
                        <span>{categoryIcons[cat] || "🏷️"}</span>
                        <span className="truncate">{getCategoryLabel(cat)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Product conditions */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">{t("condition")}</label>
                <div className="space-y-1.5">
                  {conditions.map((cond) => {
                    const isSelected = filters.condition === cond.value;
                    return (
                      <button
                        key={cond.value}
                        onClick={() => {
                          setFilter("condition", cond.value);
                          setShowMobileFilters(false);
                        }}
                        className={`w-full min-h-[44px] text-left px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                          isSelected 
                            ? "bg-neutral-900 text-white font-bold" 
                            : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                        }`}
                      >
                        {cond.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cost bounds */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">{t("priceRange")}</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder={t("min")}
                    value={filters.minPrice}
                    onChange={(e) => setFilter("minPrice", e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2.5 border border-neutral-200 rounded-xl text-neutral-700 text-xs outline-none"
                  />
                  <input
                    type="number"
                    placeholder={t("max")}
                    value={filters.maxPrice}
                    onChange={(e) => setFilter("maxPrice", e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2.5 border border-neutral-200 rounded-xl text-neutral-700 text-xs outline-none"
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useEffect } from "react";
import { motion } from "motion/react";
import { ShoppingBag, ArrowRight, ShieldCheck, Heart, Sparkles, MessageSquare, Flame, CheckCircle2 } from "lucide-react";
import { useMarketStore } from "../store";
import { useTranslation } from "../translations";
import { Product } from "../types";

interface HomeProps {
  products?: Product[];
}

export default function Home({ products: propProducts }: HomeProps) {
  const { 
    products: storeProducts, 
    setProducts, 
    setCurrentPage, 
    addToCart, 
    toggleWishlist, 
    isInWishlist,
    language
  } = useMarketStore();

  const { t } = useTranslation(language);

  useEffect(() => {
    async function loadProducts() {
      if (storeProducts && storeProducts.length > 0) return;
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
        }
      } catch (err) {
        console.error("Home direct listings pull error:", err);
      }
    }
    loadProducts();
  }, [storeProducts]);

  const products = propProducts || storeProducts || [];
  const featured = products.filter((p) => p.isFeatured).slice(0, 4);
  const latest = products.slice().sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);

  const categories = [
    { id: "Agro & Coffee", name: t("catAgro") || "Agro & Coffee", count: "40+ items", icon: "☕" },
    { id: "Phones", name: t("catPhones"), count: "120+ listings", icon: "📱" },
    { id: "Laptops", name: t("catLaptops"), count: "80+ listings", icon: "💻" },
    { id: "Fashion", name: t("catFashion"), count: "340+ listings", icon: "👗" },
    { id: "Vehicles", name: t("catVehicles"), count: "45+ listings", icon: "🚗" },
    { id: "Real Estate", name: t("catRealEstate"), count: "95+ listings", icon: "🏢" },
    { id: "AirPods", name: t("catAirPods"), count: "50+ items", icon: "🎧" },
    { id: "Cameras", name: t("catCameras"), count: "30+ listings", icon: "📷" }
  ];

  return (
    <div className="space-y-10 sm:space-y-16">
      {/* 1. Hero Spotlight Section */}
      <section className="relative overflow-hidden bg-neutral-950 py-10 px-4 sm:py-16 sm:px-8 md:py-20 md:px-12 rounded-2xl sm:rounded-3xl text-white">
        {/* Subtle Decorative Background Gold Lines */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-500 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-emerald-600 blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center space-y-4 sm:space-y-6 md:space-y-7 z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] sm:text-xs font-mono max-w-full"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t("heroBadge")}</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-bold tracking-tight leading-[1.2] sm:leading-[1.15] max-w-3xl mx-auto text-balance break-words"
          >
            {t("heroTitle")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-neutral-300 text-xs sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            {t("heroSubtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center w-full max-w-xs sm:max-w-none mx-auto pt-1"
          >
            <button
              onClick={() => setCurrentPage("marketplace")}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded-xl font-semibold shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 group cursor-pointer text-sm sm:text-base min-h-[44px]"
            >
              {t("exploreMarket") || "Explore Marketplace"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setCurrentPage("dashboard")}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 rounded-xl font-semibold transition-all cursor-pointer text-sm sm:text-base min-h-[44px]"
            >
              {t("sellItem") || "Sell an Item"}
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. Quick Features Info */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-4 sm:p-6 bg-white border border-neutral-150 rounded-2xl flex items-start gap-3 sm:gap-4 shadow-xs">
          <div className="p-2.5 sm:p-3 bg-amber-50 rounded-xl text-amber-600 shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-neutral-900 text-sm sm:text-base">{t("trustVendorsTitle")}</h3>
            <p className="text-neutral-500 text-xs sm:text-sm mt-1 leading-relaxed">
              {t("trustVendorsDesc")}
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-white border border-neutral-150 rounded-2xl flex items-start gap-3 sm:gap-4 shadow-xs">
          <div className="p-2.5 sm:p-3 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-neutral-900 text-sm sm:text-base">{t("trustTelebirrTitle")}</h3>
            <p className="text-neutral-500 text-xs sm:text-sm mt-1 leading-relaxed">
              {t("trustTelebirrDesc")}
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-white border border-neutral-150 rounded-2xl flex items-start gap-3 sm:gap-4 shadow-xs">
          <div className="p-2.5 sm:p-3 bg-teal-50 rounded-xl text-teal-600 shrink-0">
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-neutral-900 text-sm sm:text-base">{t("trustChatTitle")}</h3>
            <p className="text-neutral-500 text-xs sm:text-sm mt-1 leading-relaxed">
              {t("trustChatDesc")}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Browse Categories */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">{t("popularCategories")}</h2>
            <p className="text-neutral-500 text-xs sm:text-sm">{t("popularCategoriesDesc")}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
          {categories.map((cat, idx) => (
            <motion.div
              whileHover={{ y: -3 }}
              key={idx}
              onClick={() => setCurrentPage("marketplace", null, cat.id)}
              className="p-3 sm:p-4 bg-neutral-50 hover:bg-white border border-neutral-150 hover:border-amber-500/30 rounded-xl sm:rounded-2xl text-center cursor-pointer transition-all space-y-1.5 sm:space-y-2.5 flex flex-col justify-between shadow-xs"
            >
              <span className="text-2xl sm:text-3xl inline-block">{cat.icon}</span>
              <div className="space-y-0.5">
                <h4 className="font-semibold text-neutral-900 text-xs sm:text-sm line-clamp-1">{cat.name}</h4>
                <p className="text-[10px] sm:text-xs text-neutral-400 font-mono">{cat.count}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Featured Spotlight Products */}
      {featured.length > 0 && (
        <section className="space-y-4 sm:space-y-6">
          <div className="flex justify-between items-end gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">{t("featuredProducts")}</h2>
              <p className="text-neutral-500 text-xs sm:text-sm">{t("featuredProductsDesc")}</p>
            </div>
            <button 
              onClick={() => setCurrentPage("marketplace")}
              className="text-amber-600 hover:text-amber-700 font-semibold text-xs sm:text-sm flex items-center gap-1 cursor-pointer shrink-0"
            >
              {t("viewAll")} <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map((p) => {
              const inWish = isInWishlist(p.id);
              return (
                <div key={p.id} className="group bg-white border border-neutral-150 rounded-2xl overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between shadow-xs">
                  {/* Photo area with tags */}
                  <div className="relative aspect-square overflow-hidden bg-neutral-100 shrink-0">
                    <img 
                      src={p.images[0]} 
                      alt={p.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-neutral-950/80 backdrop-blur-md text-white text-[9px] font-mono tracking-wider font-semibold">
                        Featured
                      </span>
                      <span className={`px-2 py-0.5 text-[9px] font-mono rounded-md font-bold uppercase ${
                        p.condition === "NEW" ? "bg-emerald-600 text-white" : "bg-neutral-800 text-neutral-200"
                      }`}>
                        {p.condition}
                      </span>
                    </div>
                    {/* Floating Heart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(p);
                      }}
                      className="absolute top-2.5 right-2.5 p-2 bg-white/90 hover:bg-white backdrop-blur-md rounded-full shadow-md text-neutral-700 hover:text-red-500 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                    >
                      <Heart className={`w-4 h-4 ${inWish ? "fill-red-500 text-red-500" : ""}`} />
                    </button>
                  </div>

                  {/* Text details */}
                  <div className="p-3.5 sm:p-4 flex-grow flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                        <span>{p.category}</span>
                        <span>{p.location.split(",")[0]}</span>
                      </div>
                      <h3 
                        onClick={() => setCurrentPage("product-details", p.id)}
                        className="font-semibold text-neutral-800 hover:text-amber-600 text-sm sm:text-base line-clamp-1 cursor-pointer"
                      >
                        {p.title}
                      </h3>
                      <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5">{p.description}</p>
                    </div>

                    <div className="flex items-center justify-between mt-3 sm:mt-4 pl-0.5 border-t border-neutral-100 pt-2.5 sm:pt-3">
                      <div className="font-mono">
                        <span className="text-sm sm:text-base font-bold text-neutral-900">{p.price.toLocaleString()}</span>
                        <span className="text-[10px] text-amber-600 font-bold ml-1">ETB</span>
                      </div>
                      <button
                        onClick={() => addToCart(p)}
                        className="px-3 py-1.5 sm:py-2 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors min-h-[36px]"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        {t("addToCart")}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. Fresh Incoming Deals (Latest Products) */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex justify-between items-end gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">{t("freshListings")}</h2>
            <p className="text-neutral-500 text-xs sm:text-sm">{t("freshListingsDesc")}</p>
          </div>
          <button 
            onClick={() => setCurrentPage("marketplace")}
            className="text-amber-600 hover:text-amber-700 font-semibold text-xs sm:text-sm flex items-center gap-1 cursor-pointer shrink-0"
          >
            {t("viewAll")} <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {latest.map((p) => {
            const inWish = isInWishlist(p.id);
            return (
              <div key={p.id} className="group bg-white border border-neutral-150 rounded-2xl overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between shadow-xs">
                {/* Photo area with tags */}
                <div className="relative aspect-square overflow-hidden bg-neutral-100 shrink-0">
                  <img 
                    src={p.images[0]} 
                    alt={p.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className={`px-2 py-0.5 text-[9px] font-mono rounded-md font-bold uppercase ${
                      p.condition === "NEW" ? "bg-emerald-600 text-white" : "bg-neutral-800 text-neutral-200"
                    }`}>
                      {p.condition}
                    </span>
                  </div>
                  {/* Floating Heart Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(p);
                    }}
                    className="absolute top-2.5 right-2.5 p-2 bg-white/90 hover:bg-white backdrop-blur-md rounded-full shadow-md text-neutral-700 hover:text-red-500 transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                  >
                    <Heart className={`w-4 h-4 ${inWish ? "fill-red-500 text-red-500" : ""}`} />
                  </button>
                </div>

                {/* Text details */}
                <div className="p-3.5 sm:p-4 flex-grow flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                      <span>{p.category}</span>
                      <span>{p.location.split(",")[0]}</span>
                    </div>
                    <h3 
                      onClick={() => setCurrentPage("product-details", p.id)}
                      className="font-semibold text-neutral-800 hover:text-amber-600 text-sm sm:text-base line-clamp-1 cursor-pointer"
                    >
                      {p.title}
                    </h3>
                    <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5">{p.description}</p>
                  </div>

                  <div className="flex items-center justify-between mt-3 sm:mt-4 pl-0.5 border-t border-neutral-100 pt-2.5 sm:pt-3">
                    <div className="font-mono">
                      <span className="text-sm sm:text-base font-bold text-neutral-900">{p.price.toLocaleString()}</span>
                      <span className="text-[10px] text-amber-600 font-bold ml-1">ETB</span>
                    </div>
                    <button
                      onClick={() => addToCart(p)}
                      className="px-3 py-1.5 sm:py-2 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors min-h-[36px]"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {t("addToCart")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Ethiopian Coffee Story & CTA Section */}
      <section className="bg-amber-50 rounded-2xl sm:rounded-3xl p-5 sm:p-12 border border-amber-100 flex flex-col lg:flex-row gap-6 lg:gap-10 items-center shadow-xs">
        <div className="flex-1 space-y-4 sm:space-y-6">
          <div className="inline-block p-2 bg-amber-100 rounded-xl text-amber-800">
            <Flame className="w-5 h-5" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-neutral-950">
            {t("storyTitle")}
          </h2>
          <p className="text-neutral-600 leading-relaxed text-xs sm:text-base">
            {t("storyDesc")}
          </p>
          <ul className="text-xs sm:text-sm text-neutral-700 space-y-2 sm:space-y-2.5 font-medium">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-emerald-600 shrink-0" /> {t("storyBullet1")}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-emerald-600 shrink-0" /> {t("storyBullet2")}
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-emerald-600 shrink-0" /> {t("storyBullet3")}
            </li>
          </ul>
          <div className="pt-1">
            <button
              onClick={() => setCurrentPage("marketplace", null, "Agro & Coffee")}
              className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              <span>{t("catAgro")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 w-full max-w-md shrink-0">
          <img 
            src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&auto=format&fit=crop&q=80" 
            alt="Ethiopian Coffee bean trade"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80";
            }}
            className="w-full aspect-4/3 object-cover rounded-xl sm:rounded-2xl shadow-xl border border-amber-200"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>
    </div>
  );
}

import React, { useEffect } from "react";
import { motion } from "motion/react";
import { ShoppingBag, ArrowRight, ShieldCheck, Heart, Sparkles, MessageSquare, Flame, CheckCircle2 } from "lucide-react";
import { useMarketStore } from "../store";
import { Product } from "../types";

interface HomeProps {
  products?: Product[];
}

export default function Home({ products: propProducts }: HomeProps) {
  const { products: storeProducts, setProducts, setCurrentPage, addToCart, toggleWishlist, isInWishlist } = useMarketStore();

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
  const latest = products.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);

  const categories = [
    { name: "Phones", count: "120+ listings", icon: "📱", color: "from-amber-500 to-yellow-600" },
    { name: "Laptops", count: "80+ listings", icon: "💻", color: "from-yellow-600 to-amber-700" },
    { name: "Fashion", count: "340+ listings", icon: "👗", color: "from-amber-700 to-emerald-800" },
    { name: "Vehicles", count: "45+ listings", icon: "🚗", color: "from-emerald-800 to-teal-800" },
    { name: "Real Estate", count: "95+ listings", icon: "🏢", color: "from-teal-800 to-amber-900" },
    { name: "Cameras", count: "30+ listings", icon: "📷", color: "from-purple-800 to-indigo-900" }
  ];

  return (
    <div className="space-y-16">
      {/* 1. Hero Spotlight Section */}
      <section className="relative overflow-hidden bg-neutral-950 py-20 px-6 sm:px-12 rounded-3xl text-white">
        {/* Subtle Decorative Background Gold Lines */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-500 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-emerald-600 blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center space-y-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono"
          >
            <Sparkles className="w-3.5 h-3.5" />
            የኢትዮጵያ ገበያ ማእከል • ETHIOPIA'S PREMIER MARKETPLACE
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-sans font-bold tracking-tight leading-tight"
          >
            Buy & Sell Anything Across <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-emerald-400">
              Ethiopia in Minutes
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-neutral-400 text-base sm:text-lg max-w-2xl mx-auto"
          >
            Connecting local vendors, small businesses, and buyers across Addis Ababa and beyond.
            Enjoy safe transactions with integrated <strong>Chapa</strong> and <strong>Telebirr</strong> simulation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={() => setCurrentPage("marketplace")}
              className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded-xl font-medium shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              Explore Products
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setCurrentPage("dashboard")}
              className="w-full sm:w-auto px-8 py-4 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 rounded-xl font-medium transition-all cursor-pointer"
            >
              Sell Your Item
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. Quick Features Info */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-neutral-100 rounded-2xl flex items-start gap-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-neutral-900">Vetted Local Vendors</h3>
            <p className="text-neutral-500 text-sm mt-1">
              Registered businesses undergo manual approvals. Buy traditional garments, rentals, and electronics in complete safety.
            </p>
          </div>
        </div>

        <div className="p-6 bg-white border border-neutral-100 rounded-2xl flex items-start gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-neutral-900">Ethiopian Payments Integration</h3>
            <p className="text-neutral-500 text-sm mt-1">
              Test payments completely with simulated integrations for Telebirr and Chapa bank cards and mobile wallets.
            </p>
          </div>
        </div>

        <div className="p-6 bg-white border border-neutral-100 rounded-2xl flex items-start gap-4">
          <div className="p-3 bg-teal-50 rounded-xl text-teal-600 shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-neutral-900">Instantly Negotiable Prices</h3>
            <p className="text-neutral-500 text-sm mt-1">
              Chat live with buyers or sellers right in the app. Coordinate delivery routes or pickup zones safely.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Browse Categories */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Popular Categories</h2>
            <p className="text-neutral-500 text-sm">Find what you need in under 2 seconds</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, idx) => (
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              key={idx}
              onClick={() => setCurrentPage("marketplace", null, cat.name)}
              className="p-5 bg-neutral-50 hover:bg-white border hover:border-amber-500/30 rounded-2xl text-center cursor-pointer transition-all space-y-3"
            >
              <span className="text-3xl inline-block">{cat.icon}</span>
              <div className="space-y-1">
                <h4 className="font-semibold text-neutral-900 text-sm">{cat.name}</h4>
                <p className="text-xs text-neutral-400 font-mono">{cat.count}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Featured Spotlight Products */}
      {featured.length > 0 && (
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Premium Featured Listings</h2>
              <p className="text-neutral-500 text-sm">Carefully moderated and highly recommended</p>
            </div>
            <button
              onClick={() => setCurrentPage("marketplace")}
              className="text-amber-600 hover:text-amber-700 font-semibold text-sm flex items-center gap-1 cursor-pointer"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((p) => {
              const inWish = isInWishlist(p.id);
              return (
                <div key={p.id} className="group bg-white border border-neutral-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between">
                  {/* Photo area with tags */}
                  <div className="relative aspect-square overflow-hidden bg-neutral-100 shrink-0">
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                      <span className="px-2.5 py-1 rounded-full bg-neutral-900/80 backdrop-blur-md text-white text-[10px] font-mono tracking-wider font-semibold">
                        FEATURED
                      </span>
                      <span className={`px-2 py-0.5 text-[9px] font-mono uppercase rounded-full tracking-wider font-bold ${p.condition === "NEW" ? "bg-emerald-500 text-white" : "bg-teal-500 text-white"
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
                      className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white backdrop-blur-md rounded-full shadow-md text-neutral-700 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Heart className={`w-4 h-4 ${inWish ? "fill-red-500 text-red-500" : ""}`} />
                    </button>
                  </div>

                  {/* Text details */}
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                        <span>{p.category}</span>
                        <span>{p.location.split(",")[0]}</span>
                      </div>
                      <h3
                        onClick={() => setCurrentPage("product-details", p.id)}
                        className="font-semibold text-neutral-800 hover:text-amber-600 text-base line-clamp-1 cursor-pointer"
                      >
                        {p.title}
                      </h3>
                      <p className="text-xs text-neutral-500 line-clamp-2 mt-1">{p.description}</p>
                    </div>

                    <div className="flex items-center justify-between mt-4 pl-0.5 border-t border-neutral-50 pt-3">
                      <div className="font-mono">
                        <span className="text-sm font-semibold text-neutral-900">{p.price.toLocaleString()}</span>
                        <span className="text-[10px] text-amber-600 font-bold ml-1">ETB</span>
                      </div>
                      <button
                        onClick={() => addToCart(p)}
                        className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Add
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
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Fresh Local Listings</h2>
            <p className="text-neutral-500 text-sm">Directly from sellers across Ethiopian communities</p>
          </div>
          <button
            onClick={() => setCurrentPage("marketplace")}
            className="text-amber-600 hover:text-amber-700 font-semibold text-sm flex items-center gap-1 cursor-pointer"
          >
            See What's New <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {latest.map((p) => {
            const inWish = isInWishlist(p.id);
            return (
              <div key={p.id} className="group bg-white border border-neutral-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between">
                {/* Photo area with tags */}
                <div className="relative aspect-square overflow-hidden bg-neutral-100 shrink-0">
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-0.5 text-[9px] font-mono uppercase rounded-full tracking-wider font-bold ${p.condition === "NEW" ? "bg-emerald-500 text-white" : "bg-teal-500 text-white"
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
                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white backdrop-blur-md rounded-full shadow-md text-neutral-700 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Heart className={`w-4 h-4 ${inWish ? "fill-red-500 text-red-500" : ""}`} />
                  </button>
                </div>

                {/* Text details */}
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                      <span>{p.category}</span>
                      <span>{p.location.split(",")[0]}</span>
                    </div>
                    <h3
                      onClick={() => setCurrentPage("product-details", p.id)}
                      className="font-semibold text-neutral-800 hover:text-amber-600 text-base line-clamp-1 cursor-pointer"
                    >
                      {p.title}
                    </h3>
                    <p className="text-xs text-neutral-500 line-clamp-2 mt-1">{p.description}</p>
                  </div>

                  <div className="flex items-center justify-between mt-4 pl-0.5 border-t border-neutral-50 pt-3">
                    <div className="font-mono">
                      <span className="text-sm font-semibold text-neutral-900">{p.price.toLocaleString()}</span>
                      <span className="text-[10px] text-amber-600 font-bold ml-1">ETB</span>
                    </div>
                    <button
                      onClick={() => addToCart(p)}
                      className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Ethiopian Coffee Story & CTA Section */}
      <section className="bg-amber-50 rounded-3xl p-8 sm:p-12 border border-amber-100 flex flex-col lg:flex-row gap-10 items-center">
        <div className="flex-1 space-y-6">
          <div className="inline-block p-2 bg-amber-100 rounded-xl text-amber-800">
            <Flame className="w-5 h-5" />
          </div>
          <h2 className="text-3xl font-sans font-bold tracking-tight text-neutral-950">
            Empowering Ethiopia's Local Commerce From Merkato to Piassa
          </h2>
          <p className="text-neutral-600 leading-relaxed text-sm sm:text-base">
            EthioMarket matches the physical warmth of traditional Ethiopian greeting ("እንኳን ደህና መጡ")
            with modern high-performance technology. We verify local producers so you can find premium specialty coffee, custom Habesha garments, or electronics right from your phone.
          </p>
          <ul className="text-sm text-neutral-700 space-y-2.5 font-medium">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" /> Local Bole, Stadium, Hawassa, and Gonder geo-listings and delivery zones.
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" /> 100% Free registration for micro-vendors and traditional weavers.
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" /> In-built instant bargaining chat with auto-translation assistance.
            </li>
          </ul>
        </div>
        <div className="flex-1 w-full max-w-md shrink-0">
          <img
            src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&auto=format&fit=crop&q=80"
            alt="Ethiopian Coffee bean trade"
            className="w-full aspect-4/3 object-cover rounded-2xl shadow-xl border border-amber-200"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>
    </div>
  );
}

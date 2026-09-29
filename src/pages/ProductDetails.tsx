import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Heart, ShoppingBag, ArrowLeft, MapPin, ShieldCheck, 
  MessageCircle, Phone, Star, AlertCircle, Sparkles, Send, CheckCircle2, Globe, Languages, RotateCcw 
} from "lucide-react";
import { useMarketStore } from "../store";
import { useTranslation, SUPPORTED_LANGUAGES } from "../translations";
import { Product, Review, LanguageCode } from "../types";

interface ProductDetailsProps {
  productId: string;
}

export default function ProductDetails({ productId }: ProductDetailsProps) {
  const { 
    user, 
    setCurrentPage, 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    addNotification,
    setFilter,
    setActiveChatUserId,
    language
  } = useMarketStore();

  const { t } = useTranslation(language);

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Live translation state
  const [activeLang, setActiveLang] = useState<LanguageCode | "orig">("orig");
  const [translatedTitle, setTranslatedTitle] = useState<string | null>(null);
  const [translatedDesc, setTranslatedDesc] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);

  // Leave a review form state
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);

  // AI Generator state
  const [aiGenerating, setAiGenerating] = useState(false);

  useEffect(() => {
    async function fetchDetails() {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.data);
          // Fetch reviews
          const revRes = await fetch(`/api/reviews/product/${productId}`);
          const revData = await revRes.json();
          if (revData.success) {
            setReviews(revData.data);
          }
        } else {
          setErrorMsg(data.error || "Failed to load product details.");
        }
      } catch (err: any) {
        setErrorMsg("Network error trying to contact the EthioMarket server.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (productId) {
      fetchDetails();
    }
  }, [productId]);

  // Handle direct Message integration
  const handleInitiateChat = () => {
    if (!product) return;
    if (!user) {
      addNotification("Please register or log in to message vendors.");
      setCurrentPage("login-register");
      return;
    }
    if (user.id === product.vendorId) {
      addNotification("You cannot chat with yourself! This is your own listing.");
      return;
    }

    // Set active conversation context in zustand store
    setActiveChatUserId(product.vendorId);
    setFilter("activeVendorName", product.vendorName);
    setFilter("activeContextProductId", product.id);
    setFilter("activeContextProductTitle", product.title);
    
    // Redirect to Dashboard under Messaging tab
    setCurrentPage("dashboard");
    addNotification(`Contacting ${product.vendorName} about "${product.title}"...`);
  };

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!user) {
      addNotification("Please login to leave an review.");
      setCurrentPage("login-register");
      return;
    }

    try {
      setReviewSubmitLoading(true);
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          reviewerId: user.id,
          reviewerName: user.name,
          rating: userRating,
          comment: userComment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews([data.data, ...reviews]);
        addNotification("Review posted successfully! Thank you for the feedback.");
        setUserComment("");
        // Re-request product details to get updated ratings counter
        const prodRes = await fetch(`/api/products/${productId}`);
        const prodData = await prodRes.json();
        if (prodData.success) setProduct(prodData.data);
      } else {
        addNotification(data.error || "Review submission failed.");
      }
    } catch (err: any) {
      console.error(err);
      addNotification("Could not submit review to the server.");
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  // Live translation handler for Ethiopian languages
  const handleTranslateProduct = async (targetLang: LanguageCode | "orig") => {
    if (!product) return;
    if (targetLang === "orig") {
      setActiveLang("orig");
      setTranslatedTitle(null);
      setTranslatedDesc(null);
      return;
    }

    try {
      setTranslating(true);
      setActiveLang(targetLang);
      const res = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `${product.title}\n--SPLIT--\n${product.description}`,
          targetLang
        })
      });
      const data = await res.json();
      if (data.success && data.data?.translatedText) {
        const parts = data.data.translatedText.split("--SPLIT--");
        if (parts.length > 1) {
          setTranslatedTitle(parts[0].trim());
          setTranslatedDesc(parts.slice(1).join("\n").trim());
        } else {
          setTranslatedDesc(data.data.translatedText);
        }
        const langObj = SUPPORTED_LANGUAGES.find(l => l.code === targetLang);
        addNotification(`Translated listing into ${langObj?.nativeName || targetLang}`);
      } else {
        addNotification("Translation completed with local language dictionary.");
      }
    } catch (err) {
      console.error(err);
      addNotification("Could not translate listing text.");
    } finally {
      setTranslating(false);
    }
  };

  // Vendor Description Optimizer
  const handleAiOptimizeDescription = async () => {
    if (!product) return;
    try {
      setAiGenerating(true);
      addNotification("Generating description...");
      
      const res = await fetch("/api/ai/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: product.title,
          category: product.category,
          condition: product.condition,
          location: product.location
        })
      });

      const data = await res.json();
      if (data.success) {
        // Update product in backend with description
        const updateRes = await fetch(`/api/products/${product.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: data.data.text })
        });
        const updateData = await updateRes.json();
        if (updateData.success) {
          setProduct(updateData.data);
          addNotification("Description updated successfully.");
        } else {
          addNotification("Failed to save description.");
        }
      } else {
        addNotification(data.error || "Could not generate description. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      addNotification("Could not generate description. Please try again.");
    } finally {
      setAiGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin"></div>
        <p className="text-neutral-500 font-semibold text-sm">Reviewing product specifications...</p>
      </div>
    );
  }

  if (errorMsg || !product) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-sans font-bold text-neutral-900">Listing Not Found</h2>
        <p className="text-neutral-500 text-sm">{errorMsg || "The requested item might have been unlisted or deleted."}</p>
        <button
          onClick={() => setCurrentPage("marketplace")}
          className="px-5 py-2.5 bg-neutral-950 text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          Back to Marketplace
        </button>
      </div>
    );
  }

  const inWish = isInWishlist(product.id);
  const isOwner = user?.id === product.vendorId;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto">
      {/* Back button */}
      <button 
        onClick={() => setCurrentPage("marketplace")}
        className="inline-flex items-center gap-1.5 text-neutral-600 hover:text-amber-500 text-xs sm:text-sm font-semibold cursor-pointer min-h-[36px]"
      >
        <ArrowLeft className="w-4 h-4" /> {t("back")}
      </button>

      {/* Ethiopian Languages Instant Translator Bar */}
      <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900">
          <Languages className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-xs sm:text-sm">Translate listing:</span>
          {translating && (
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-mono animate-pulse">
              Translating...
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleTranslateProduct(lang.code)}
              disabled={translating}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 sm:gap-1.5 ${
                activeLang === lang.code
                  ? "bg-amber-500 text-neutral-950 shadow-xs font-bold scale-102"
                  : "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.nativeName}</span>
            </button>
          ))}
          {activeLang !== "orig" && (
            <button
              onClick={() => handleTranslateProduct("orig")}
              className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title="Revert to Original"
            >
              <RotateCcw className="w-3 h-3" />
              Original
            </button>
          )}
        </div>
      </div>

      {/* Main product showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 items-start">
        {/* Left Column: Product Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-neutral-900 overflow-hidden rounded-2xl border border-neutral-100 relative group/pic shadow-xs">
            <img 
              src={product.images[0]} 
              alt={product.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {product.isFeatured && (
              <span className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-amber-500 text-neutral-950 text-[10px] font-mono font-bold tracking-widest uppercase px-2.5 py-1 rounded">
                Featured Deal
              </span>
            )}
            <span className={`absolute top-3 right-3 sm:top-4 sm:right-4 text-[10px] sm:text-xs font-mono font-bold uppercase text-white px-2 sm:px-2.5 py-1 rounded ${
              product.condition === "NEW" ? "bg-emerald-600" : "bg-teal-600"
            }`}>
              {t("condition")}: {product.condition}
            </span>
          </div>
        </div>

        {/* Right Column: Key purchase sheet */}
        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-2 border-b border-neutral-100 pb-4 sm:pb-5">
            <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono font-bold">
              <span>{product.category}</span>
              <span>•</span>
              <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3 text-red-500 scale-90" /> {product.location}</span>
              {activeLang !== "orig" && (
                <span className="ml-auto px-2 py-0.5 bg-amber-100 text-amber-900 rounded text-[10px] font-mono font-bold">
                  {SUPPORTED_LANGUAGES.find(l => l.code === activeLang)?.nativeName}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-950 leading-tight">
              {translatedTitle || product.title}
            </h1>
            
            {/* Custom ratings stars */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex text-amber-500">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${s <= Math.round(product.rating) ? "fill-amber-500" : "text-neutral-200"}`} />
                ))}
              </div>
              <span className="text-xs font-semibold text-neutral-700 font-mono">({product.rating || "0.0"})</span>
              <span className="text-xs text-neutral-400 font-medium">• {reviews.length} {t("reviews")}</span>
            </div>
          </div>

          {/* Pricing grid */}
          <div className="p-4 sm:p-5 bg-neutral-50 rounded-xl sm:rounded-2xl border border-neutral-150 space-y-3 sm:space-y-4 shadow-xs">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[10px] sm:text-xs text-neutral-400 font-mono font-semibold uppercase block">{t("price")}</span>
                <span className="text-2xl sm:text-3xl font-mono font-bold text-neutral-900 tracking-tight">
                  {product.price.toLocaleString()}
                </span>
                <span className="text-xs sm:text-sm font-bold text-amber-600 font-mono ml-1.5">ETB</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] sm:text-xs text-neutral-400 font-mono font-semibold uppercase block">Stock</span>
                <span className={`text-xs font-bold leading-none ${product.stock > 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {product.stock > 0 ? `${product.stock} Units` : "Sold out"}
                </span>
              </div>
            </div>

            {/* Quick checkout actions */}
            <div className="flex gap-2 sm:gap-3 pt-1">
              <button
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
                className="flex-grow min-h-[44px] py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-semibold shadow-xs active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>{t("addToCart")}</span>
              </button>
              
              <button
                onClick={() => toggleWishlist(product)}
                className="min-h-[44px] min-w-[44px] p-3 sm:p-3.5 bg-white border border-neutral-200 rounded-xl text-neutral-700 hover:text-red-500 hover:border-neutral-300 transition-colors cursor-pointer flex items-center justify-center shrink-0"
              >
                <Heart className={`w-5 h-5 ${inWish ? "fill-red-500 text-red-500" : ""}`} />
              </button>
            </div>
          </div>

          {/* Vendor profile details */}
          <div className="p-4 sm:p-5 border border-neutral-150 rounded-xl sm:rounded-2xl space-y-3 sm:space-y-4 shadow-xs">
            <h3 className="font-sans font-bold text-neutral-900 text-xs sm:text-sm border-b border-neutral-100 pb-2">{t("vendor")}</h3>
            <div className="flex items-center justify-between gap-3 sm:gap-4 flex-wrap">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                  <img 
                    src={product.vendorId === "user-vendor-1" 
                      ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                      : "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
                    } 
                    alt={product.vendorName} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900 text-xs sm:text-sm truncate max-w-[160px] sm:max-w-none">{product.vendorName}</h4>
                  <div className="flex items-center gap-1 text-[11px] sm:text-xs text-neutral-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" /> {t("verifiedVendor")}
                  </div>
                </div>
              </div>

              {/* Chat action */}
              <button
                onClick={handleInitiateChat}
                className="min-h-[40px] px-3.5 sm:px-4 py-2 sm:py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <MessageCircle className="w-3.5 h-3.5" /> {t("directChat")}
              </button>
            </div>

            {/* Simulated verification phone anchor */}
            <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 sm:items-center text-xs text-neutral-600 pt-2 border-t border-neutral-100 font-mono">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-neutral-400" /> +251 9** *** ***
              </span>
              <span className="hidden sm:inline text-neutral-300">|</span>
              <span className="text-[11px] text-neutral-500">Chat with vendor to view full number</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product description & AI utility */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10 border-t border-neutral-150 pt-6 sm:pt-10">
        {/* Description panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900">{t("description")}</h2>
            
            {/* Vendor Only optimize description banner */}
            {isOwner && (
              <button
                onClick={handleAiOptimizeDescription}
                disabled={aiGenerating}
                className="min-h-[36px] px-3 sm:px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-neutral-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 transition-all"
              >
                {aiGenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-neutral-950 border-t-transparent animate-spin"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Suggest Description</span>
                  </>
                )}
              </button>
            )}
          </div>
          
          <div className="prose text-neutral-600 text-xs sm:text-sm leading-relaxed max-w-none space-y-3 font-normal">
            <p className="whitespace-pre-wrap">{translatedDesc || product.description}</p>
          </div>

          {/* Quick instructions panel */}
          <div className="p-3.5 sm:p-4 bg-emerald-50 border border-emerald-100/60 rounded-xl sm:rounded-2xl flex items-start gap-3 sm:gap-4 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-700 leading-normal">
              <strong>EthioMarket Caution:</strong> Always meet vendors in safe public places like Bole malls, Stadium lobbies, or Piassa coffee shops. Never transfer money in advance without visual validation of products!
            </div>
          </div>
        </div>

        {/* Reviews section */}
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 border-b border-neutral-100 pb-2">
            Feedback ({reviews.length})
          </h2>

          {/* Create review form */}
          {user ? (
            <form onSubmit={handleSubmitReview} className="p-3.5 sm:p-4 border border-neutral-200 rounded-xl sm:rounded-2xl space-y-3 bg-neutral-50 shadow-xs">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">Submit Feedback</span>
              
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-500">Score:</span>
                <div className="flex">
                  {[1,2,3,4,5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setUserRating(s)}
                      className="p-1 min-w-[28px] min-h-[28px] text-amber-500 hover:scale-110 cursor-pointer flex items-center justify-center"
                    >
                      <Star className={`w-4 h-4 ${s <= userRating ? "fill-amber-500" : "text-neutral-200"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <textarea
                  placeholder="Share details about delivery speed, item condition, or vendor communications..."
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  required
                  rows={2}
                  className="w-full p-2.5 border border-neutral-200 rounded-xl text-neutral-700 text-xs bg-white outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={reviewSubmitLoading}
                className="w-full min-h-[40px] py-2 bg-neutral-950 text-white font-semibold rounded-xl text-xs hover:bg-neutral-800 cursor-pointer disabled:opacity-50 transition-colors"
              >
                {reviewSubmitLoading ? "Submitting..." : "Post Review"}
              </button>
            </form>
          ) : (
            <div className="p-4 border border-neutral-150 rounded-xl sm:rounded-2xl text-center space-y-2">
              <p className="text-xs text-neutral-500">Log in to leave feedback for this vendor.</p>
              <button 
                onClick={() => setCurrentPage("login-register")}
                className="text-amber-600 hover:underline text-xs font-bold cursor-pointer min-h-[36px] inline-flex items-center"
              >
                Login Now
              </button>
            </div>
          )}

          {/* Feedback listing */}
          <div className="space-y-3 sm:space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {reviews.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-6">No ratings or evaluations have been posted yet for this listing.</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="p-3.5 sm:p-4 bg-white border border-neutral-150 rounded-xl space-y-2 shadow-xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-neutral-800 truncate mr-2">{rev.reviewerName}</span>
                    <span className="text-[10px] text-neutral-400 font-mono shrink-0">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex text-amber-500">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={`w-3 h-3 ${s <= rev.rating ? "fill-amber-500" : "text-neutral-200"}`} />
                    ))}
                  </div>

                  <p className="text-xs text-neutral-600 italic font-medium">"{rev.comment}"</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

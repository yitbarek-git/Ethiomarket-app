import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Heart, ShoppingBag, ArrowLeft, MapPin, ShieldCheck,
  MessageCircle, Phone, Star, AlertCircle, Sparkles, Send, CheckCircle2
} from "lucide-react";
import { useMarketStore } from "../store";
import { Product, Review } from "../types";

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
    setActiveChatUserId
  } = useMarketStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

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

  // Vendor AI Description Optimizer
  const handleAiOptimizeDescription = async () => {
    if (!product) return;
    try {
      setAiGenerating(true);
      addNotification("Consulting EthioMarket's server-side Gemini AI copywriter...");

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
        // Update product in backend with optimized description
        const updateRes = await fetch(`/api/products/${product.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: data.data.text })
        });
        const updateData = await updateRes.json();
        if (updateData.success) {
          setProduct(updateData.data);
          addNotification("Gemini Description successfully updated on this listing!");
        } else {
          addNotification("Failed to write optimized description to product record.");
        }
      } else {
        addNotification(data.error || "AI could not generate description.");
      }
    } catch (err: any) {
      console.error(err);
      addNotification("Could not make AI connection request.");
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
    <div className="space-y-12 max-w-6xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => setCurrentPage("marketplace")}
        className="inline-flex items-center gap-1.5 text-neutral-600 hover:text-amber-500 text-sm font-semibold cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </button>

      {/* Main product showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Left Column: Product Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-neutral-900 overflow-hidden rounded-2xl border border-neutral-100 relative group/pic">
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {product.isFeatured && (
              <span className="absolute top-4 left-4 bg-amber-500 text-neutral-950 text-[10px] font-mono font-bold tracking-widest uppercase px-2.5 py-1 rounded">
                Featured Deal
              </span>
            )}
            <span className={`absolute top-4 right-4 text-xs font-mono font-bold uppercase text-white px-2.5 py-1 rounded ${product.condition === "NEW" ? "bg-emerald-600" : "bg-teal-600"
              }`}>
              Condition: {product.condition}
            </span>
          </div>
        </div>

        {/* Right Column: Key purchase sheet */}
        <div className="space-y-6">
          <div className="space-y-2 border-b border-neutral-100 pb-5">
            <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono font-bold">
              <span>{product.category}</span>
              <span>•</span>
              <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3 text-red-500 scale-90" /> {product.location}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-950 leading-tight">{product.title}</h1>

            {/* Custom ratings stars */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? "fill-amber-500" : "text-neutral-200"}`} />
                ))}
              </div>
              <span className="text-xs font-semibold text-neutral-700 font-mono">({product.rating || "0.0"})</span>
              <span className="text-xs text-neutral-400 font-medium">• {reviews.length} feedback posts</span>
            </div>
          </div>

          {/* Pricing grid */}
          <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-xs text-neutral-400 font-mono font-semibold uppercase block">Listing Price</span>
                <span className="text-3xl font-mono font-bold text-neutral-900 tracking-tight">
                  {product.price.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-amber-600 font-mono ml-1.5">ETB</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-neutral-400 font-mono font-semibold uppercase block">Availability</span>
                <span className={`text-xs font-bold leading-none ${product.stock > 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {product.stock > 0 ? `${product.stock} Units Current Stock` : "Temporarily Sold out"}
                </span>
              </div>
            </div>

            {/* Quick checkout actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
                className="flex-grow py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-semibold shadow-md active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className="p-3.5 bg-white border border-neutral-200 rounded-xl text-neutral-700 hover:text-red-500 hover:border-neutral-300 transition-colors cursor-pointer"
              >
                <Heart className={`w-5 h-5 ${inWish ? "fill-red-500 text-red-500" : ""}`} />
              </button>
            </div>
          </div>

          {/* Vendor profile details */}
          <div className="p-5 border border-neutral-150 rounded-2xl space-y-4">
            <h3 className="font-sans font-bold text-neutral-900 text-sm border-b border-neutral-50 pb-2">Listed By</h3>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
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
                  <h4 className="font-semibold text-neutral-900 text-sm whitespace-nowrap">{product.vendorName}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Verified Vendor
                  </div>
                </div>
              </div>

              {/* Chat action */}
              <button
                onClick={handleInitiateChat}
                className="px-4 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Direct Chat
              </button>
            </div>

            {/* Simulated verification phone anchor */}
            <div className="flex gap-4 items-center text-xs text-neutral-600 pt-2 border-t border-neutral-50 font-mono">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-neutral-400" /> +251 9** *** ***
              </span>
              <span className="text-neutral-300">|</span>
              <span className="text-neutral-500">Inquire inside chat to reveal full contact</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product description & AI utility */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 border-t border-neutral-150 pt-10">
        {/* Description panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-50 pb-2">
            <h2 className="text-xl font-bold tracking-tight text-neutral-900">Detailed Specifications</h2>

            {/* Vendor Only optimize description banner */}
            {isOwner && (
              <button
                onClick={handleAiOptimizeDescription}
                disabled={aiGenerating}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-neutral-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 transition-all"
              >
                {aiGenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-neutral-950 border-t-transparent animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Gemini AI Expand
                  </>
                )}
              </button>
            )}
          </div>

          <div className="prose text-neutral-600 text-sm leading-relaxed max-w-none space-y-4 font-normal">
            <p className="whitespace-pre-wrap">{product.description}</p>
          </div>

          {/* Quick instructions panel */}
          <div className="p-4 bg-emerald-50 border border-emerald-100/50 rounded-2xl flex items-start gap-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-700 leading-normal">
              <strong>EthioMarket Trade Caution:</strong> We guarantee simulated transactions. If coordinate local cash transactions, always meet vendors in safe public places like Bole malls, Stadium lobbies, or Piassa coffee shops. Never transfer money in advance without visual validation of products!
            </div>
          </div>
        </div>

        {/* Reviews section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 border-b border-neutral-100 pb-2">
            Customer Feedback ({reviews.length})
          </h2>

          {/* Create review form */}
          {user ? (
            <form onSubmit={handleSubmitReview} className="p-4 border border-neutral-200 rounded-2xl space-y-3 bg-neutral-50">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">Submit Feedback</span>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-500">Score:</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setUserRating(s)}
                      className="text-amber-500 hover:scale-110 cursor-pointer text-sm"
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
                className="w-full py-2 bg-neutral-950 text-white font-semibold rounded-xl text-xs hover:bg-neutral-800 cursor-pointer disabled:opacity-50 transition-colors"
              >
                {reviewSubmitLoading ? "Submitting..." : "Post Review"}
              </button>
            </form>
          ) : (
            <div className="p-4 border border-neutral-150 rounded-2xl text-center space-y-2">
              <p className="text-xs text-neutral-500">Log in to leave feedback for this vendor.</p>
              <button
                onClick={() => setCurrentPage("login-register")}
                className="text-amber-600 hover:underline text-xs font-bold cursor-pointer"
              >
                Login Now
              </button>
            </div>
          )}

          {/* Feedback listing */}
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {reviews.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-6">No ratings or evaluations have been posted yet for this listing.</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="p-4 bg-white border border-neutral-100 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-neutral-800">{rev.reviewerName}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
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

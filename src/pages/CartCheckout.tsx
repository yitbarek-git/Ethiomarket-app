import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag, Trash2, Heart, ArrowRight, ShieldCheck,
  MapPin, Phone, CreditCard, Sparkles, CheckCircle2,
  Wallet, ChevronRight, Bookmark, X
} from "lucide-react";
import { useMarketStore } from "../store";

export default function CartCheckout() {
  const {
    user,
    cart,
    wishlist,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    addToCart,
    addNotification,
    setCurrentPage
  } = useMarketStore();

  // Local state
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingPhone, setShippingPhone] = useState(user?.phone || "+251911");
  const [selectedMethod, setSelectedMethod] = useState<"CASH_ON_DELIVERY" | "TELEBIRR" | "CHAPA">("TELEBIRR");

  // Gateway Modals
  const [telebirrModalOpen, setTelebirrModalOpen] = useState(false);
  const [chapaModalOpen, setChapaModalOpen] = useState(false);
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);

  // Telebirr simulation portal inputs
  const [telebirrPhone, setTelebirrPhone] = useState(user?.phone || "+251911");
  const [telebirrOtp, setTelebirrOtp] = useState("");
  const [telebirrLoading, setTelebirrLoading] = useState(false);

  // Chapa transfer simulation inputs
  const [chapaName, setChapaName] = useState(user?.name || "");
  const [chapaCard, setChapaCard] = useState("4000 1234 5678 9010");
  const [chapaCvc, setChapaCvc] = useState("123");
  const [chapaLoading, setChapaLoading] = useState(false);

  // Math totals
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal > 0 ? 150 : 0; // standard 150 Birr delivery fee
  const orderTotal = subtotal + shippingFee;

  // Handles Checkout submission
  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      addNotification("Please register or log in to complete checkout.");
      setCurrentPage("login-register");
      return;
    }
    if (cart.length === 0) {
      addNotification("Your shopping cart is currently empty.");
      return;
    }
    if (!shippingAddress.trim() || !shippingPhone.trim()) {
      addNotification("Please enter delivery address and phone coordinate.");
      return;
    }

    // Direct routing to corresponding payment portals
    if (selectedMethod === "TELEBIRR") {
      setTelebirrModalOpen(true);
    } else if (selectedMethod === "CHAPA") {
      setChapaModalOpen(true);
    } else {
      // Cash on Delivery - process order right away
      await processCompletedOrder("PENDING");
    }
  };

  // Triggers Backend order placements
  const processCompletedOrder = async (payStatus: "PAID" | "PENDING") => {
    try {
      const orderItems = cart.map((it) => ({
        productId: it.id,
        title: it.title,
        price: it.price,
        quantity: it.quantity,
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerId: user?.id,
          buyerName: user?.name,
          items: orderItems,
          totalAmount: orderTotal,
          paymentMethod: selectedMethod,
          phone: shippingPhone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // If payment was already processed paid in modal simulation, update status in server
        if (payStatus === "PAID") {
          await fetch(`/api/orders/${data.data.id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentStatus: "PAID" }),
          });
        }
        setOrderSuccessId(data.data.id);
        clearCart();
        addNotification(`Order placed successfully! Transaction Ref: ${data.data.id}`);
      } else {
        addNotification(data.error || "Order placement failed.");
      }
    } catch (err: any) {
      console.error(err);
      addNotification("Network error trying to contact order APIs.");
    }
  };

  // Telebirr simulation trigger
  const handleTelebirrSubmit = async () => {
    if (!telebirrOtp.trim()) {
      addNotification("Please enter the 4-digit SMS verification code.");
      return;
    }
    try {
      setTelebirrLoading(true);
      // Simulate API handshake latency
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setTelebirrModalOpen(false);
      setTelebirrOtp("");
      await processCompletedOrder("PAID");
    } catch (err) {
      console.error(err);
    } finally {
      setTelebirrLoading(false);
    }
  };

  // Chapa Simulation trigger
  const handleChapaSubmit = async () => {
    try {
      setChapaLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1800));
      setChapaModalOpen(false);
      await processCompletedOrder("PAID");
    } catch (err) {
      console.error(err);
    } finally {
      setChapaLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* 1. Header Row */}
      <div className="border-b border-neutral-100 pb-6 text-left">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Checkout Cart</h1>
        <p className="text-neutral-500 text-sm">Review your bundles, choose local payment gateways, and finalize transactions</p>
      </div>

      {/* Success Receipt Card */}
      {orderSuccessId ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl mx-auto p-8 border border-emerald-100 rounded-3xl bg-emerald-50/50 text-center space-y-6"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-sans font-bold text-neutral-900">Transaction Complete!</h2>
            <p className="text-xs text-neutral-600 font-normal">
              Your bargain has been queued on EthioMarket's transactional pipeline. The listing vendor has been notified inside their dashboard chat.
            </p>
          </div>

          <div className="p-4 bg-white border border-emerald-100/50 rounded-2xl font-mono text-left space-y-2">
            <div className="flex justify-between text-xs text-neutral-500">
              <span>Order ID:</span>
              <span className="font-bold text-neutral-900">{orderSuccessId}</span>
            </div>
            <div className="flex justify-between text-xs text-neutral-500">
              <span>Payment Gateway:</span>
              <span className="font-bold text-neutral-900 tracking-wider text-[10px] bg-amber-100 px-2 py-0.5 rounded uppercase">{selectedMethod}</span>
            </div>
            <div className="flex justify-between text-xs text-neutral-500">
              <span>Total Amount Recipient:</span>
              <span className="font-bold text-neutral-900">{orderTotal.toLocaleString()} ETB</span>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setOrderSuccessId(null);
                setCurrentPage("dashboard");
              }}
              className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white font-semibold text-xs rounded-xl cursor-pointer shadow-md transition-colors"
            >
              Track Order
            </button>
            <button
              onClick={() => {
                setOrderSuccessId(null);
                setCurrentPage("marketplace");
              }}
              className="px-5 py-2.5 bg-white border border-neutral-200 text-neutral-700 font-semibold text-xs rounded-xl cursor-pointer hover:bg-neutral-50"
            >
              Keep Shopping
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

          {/* LEFT LIST: CART PANEL SUMMARY */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                Selected Items ({cart.length})
              </h2>

              {cart.length === 0 ? (
                <div className="p-8 bg-neutral-50 rounded-2xl text-center border border-neutral-100/30 space-y-3">
                  <p className="text-xs text-neutral-500">Your shopping cart is currently empty. Explore the finest products across Ethiopia to load bargains!</p>
                  <button
                    onClick={() => setCurrentPage("marketplace")}
                    className="px-4 py-2 bg-neutral-950 text-white rounded-xl text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5"
                  >
                    Explore Marketplace <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="p-4 border border-neutral-200 rounded-2xl flex gap-4 bg-white items-center">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="flex-grow min-w-0">
                        <h4 className="font-semibold text-neutral-800 text-sm truncate">{item.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-neutral-500 font-mono font-semibold mt-0.5">
                          <span>{item.price.toLocaleString()} ETB</span>
                          <span>•</span>
                          <span className="text-amber-600">Vendor: {item.vendorName.split(" ")[0]}</span>
                        </div>
                      </div>

                      {/* Quantity manipulation selector */}
                      <div className="flex items-center gap-2 shrink-0 border border-neutral-150 rounded-lg p-1 px-1.5 bg-neutral-50">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="w-5 h-5 flex items-center justify-center font-bold text-neutral-500 hover:text-neutral-900 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold font-mono text-neutral-800 w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="w-5 h-5 flex items-center justify-center font-bold text-neutral-500 hover:text-neutral-900 cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      {/* Delete item */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-neutral-400 hover:text-red-500 transition-colors shrink-0 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SAVED WISHLIST SHELF */}
            <div className="space-y-4 border-t border-neutral-100 pt-8">
              <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-500" />
                Saved Wishlist ({wishlist.length})
              </h2>

              {wishlist.length === 0 ? (
                <p className="text-xs text-neutral-400 font-medium">No saved listings are currently on your wishlist.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlist.map((it) => (
                    <div key={it.id} className="p-3 border border-neutral-150 rounded-2xl flex gap-3 bg-white hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-50 shrink-0">
                        <img
                          src={it.images[0]}
                          alt={it.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="min-w-0 flex-grow">
                        <h4 className="font-semibold text-neutral-850 text-xs truncate">{it.title}</h4>
                        <span className="text-xs text-neutral-500 font-mono truncate block mt-0.5">{it.price.toLocaleString()} ETB</span>
                      </div>
                      <button
                        onClick={() => addToCart(it)}
                        className="p-2 h-fit bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold cursor-pointer shrink-0"
                      >
                        Buy
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR: ORDER BILLING & COGNITIVE CHECKS */}
          <div className="lg:col-span-1 border border-neutral-200 rounded-2xl bg-white p-5 space-y-6">
            <h3 className="font-sans font-bold text-neutral-900 text-sm border-b border-neutral-50 pb-2">Order Bill Invoice</h3>

            {/* Price lines */}
            <div className="space-y-3 font-mono text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Total Items ({totalItemCount}):</span>
                <span>{subtotal.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Delivery Fee:</span>
                <span>{shippingFee.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between text-neutral-900 font-bold border-t border-neutral-100 pt-3 text-sm">
                <span>Total Bill (Birr):</span>
                <span className="text-amber-600">{orderTotal.toLocaleString()} ETB</span>
              </div>
            </div>


            {/* Check out form details */}
            <form onSubmit={handleInitiatePayment} className="space-y-4 pt-4 border-t border-neutral-50">
              {/* Shipping location address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">Delivery Address</label>
                <input
                  type="text"
                  placeholder="e.g. Apartment, Bole High Street, Addis"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-neutral-700 text-xs bg-white outline-none focus:border-amber-500"
                />
              </div>

              {/* Shipping phone */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">Contact Phone Coordinate</label>
                <input
                  type="tel"
                  placeholder="e.g. +251 911"
                  value={shippingPhone}
                  onChange={(e) => setShippingPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-neutral-700 text-xs bg-white outline-none focus:border-amber-500"
                />
              </div>

              {/* Gateway Channel */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">Payment Channel</label>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod("TELEBIRR")}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${selectedMethod === "TELEBIRR"
                      ? "border-emerald-500 bg-emerald-50/40 font-bold text-emerald-900"
                      : "border-neutral-200 hover:bg-neutral-50 text-neutral-700"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs">Telebirr Portal Mobile Wallet</span>
                    </div>
                    {selectedMethod === "TELEBIRR" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod("CHAPA")}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${selectedMethod === "CHAPA"
                      ? "border-amber-500 bg-amber-50/40 font-bold text-amber-900"
                      : "border-neutral-200 hover:bg-neutral-50 text-neutral-700"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="text-xs">Chapa Payment Gateway (Cards)</span>
                    </div>
                    {selectedMethod === "CHAPA" && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod("CASH_ON_DELIVERY")}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${selectedMethod === "CASH_ON_DELIVERY"
                      ? "border-neutral-900 bg-neutral-55/10 font-bold text-neutral-900"
                      : "border-neutral-200 hover:bg-neutral-50 text-neutral-700"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-neutral-500 shrink-0" />
                      <span className="text-xs">Cash on Delivery</span>
                    </div>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={cart.length === 0}
                className="w-full py-3.5 bg-neutral-950 text-white font-semibold rounded-xl text-xs hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-50"
              >
                Place Bill Order ({orderTotal.toLocaleString()} ETB)
              </button>
            </form>
          </div>
        </div>
      )}


      {/* =======================================================
          GATEWAY MODAL SIMULATION: TELEBIRR
          ======================================================= */}
      <AnimatePresence>
        {telebirrModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-emerald-900 text-white rounded-3xl p-6 w-full max-w-sm border border-emerald-500 relative shadow-2xl space-y-5"
            >
              <button
                onClick={() => setTelebirrModalOpen(false)}
                className="absolute top-4 right-4 text-emerald-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-2">
                <span className="text-[10px] font-mono tracking-widest font-bold bg-white/20 px-3 py-1 rounded inline-block uppercase">telebirr simulator</span>
                <h3 className="text-lg font-bold font-sans">Payment verification portal</h3>
                <p className="text-xs text-emerald-100 max-w-xs mx-auto">
                  A verification code has been simulated for your number to debit <strong>{orderTotal.toLocaleString()} ETB</strong>.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {/* Simulated fields */}
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-semibold uppercase block text-emerald-200">Telebirr Mobile Number</label>
                  <input
                    type="tel"
                    value={telebirrPhone}
                    onChange={(e) => setTelebirrPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-emerald-950 border border-emerald-600 rounded-lg text-xs outline-none text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-semibold uppercase block text-emerald-200">4-Digit SMS verification OTP</label>
                  <input
                    type="text"
                    placeholder="Enter any validation digits e.g. 1234"
                    maxLength={4}
                    value={telebirrOtp}
                    onChange={(e) => setTelebirrOtp(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-emerald-950 border border-emerald-600 rounded-lg text-xs text-center outline-none text-white font-mono placeholder:text-emerald-500"
                  />
                </div>

                <button
                  onClick={handleTelebirrSubmit}
                  disabled={telebirrLoading}
                  className="w-full py-3 bg-white text-emerald-900 rounded-xl font-bold text-xs hover:bg-emerald-50 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {telebirrLoading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-emerald-950 border-t-transparent animate-spin"></div>
                      Verifying mobile wallet...
                    </>
                  ) : (
                    "Authorize Telebirr Debit"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* =======================================================
          GATEWAY MODAL SIMULATION: CHAPA
          ======================================================= */}
      <AnimatePresence>
        {chapaModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 text-white rounded-3xl p-6 w-full max-w-sm border border-amber-500/30 relative shadow-2xl space-y-5"
            >
              <button
                onClick={() => setChapaModalOpen(false)}
                className="absolute top-4 right-4 text-neutral-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-2">
                <span className="text-[10px] font-mono tracking-widest font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30 px-3 py-1 rounded inline-block uppercase">chapa checkout</span>
                <h3 className="text-lg font-bold font-sans">Verified Card authorization</h3>
                <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                  Rerouting safely to Chapa transaction portal. Total checkout: <span className="font-bold text-white">{orderTotal.toLocaleString()} ETB</span>.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {/* Simulated form fields */}
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-semibold uppercase block text-neutral-500">Holder Full Name</label>
                  <input
                    type="text"
                    value={chapaName}
                    onChange={(e) => setChapaName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs outline-none text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-semibold uppercase block text-neutral-500">Credit / Bank card number</label>
                  <input
                    type="text"
                    value={chapaCard}
                    onChange={(e) => setChapaCard(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs outline-none text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-semibold uppercase block text-neutral-500">CVV</label>
                  <input
                    type="password"
                    maxLength={3}
                    value={chapaCvc}
                    onChange={(e) => setChapaCvc(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-center outline-none text-white font-mono"
                  />
                </div>

                <button
                  onClick={handleChapaSubmit}
                  disabled={chapaLoading}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-neutral-950 font-bold rounded-xl text-xs hover:from-amber-600 hover:to-yellow-600 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {chapaLoading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-neutral-950 border-t-transparent animate-spin"></div>
                      Encrypting credit transfer...
                    </>
                  ) : (
                    "Authorize Chapa checkout"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, Plus, Sparkles, LayoutGrid, Check, 
  Trash2, TrendingUp, DollarSign, Package, Users, 
  ShieldAlert, CheckCircle, Send, MessageSquare, 
  UserPlus, Mail, Phone, MapPin, User, Save, RefreshCw,
  Database, Server, Layers, CheckCircle2, Code, ArrowLeft
} from "lucide-react";
import { useMarketStore } from "../store";
import { useTranslation } from "../translations";
import { Product, Message, Order, User as UserType } from "../types";

export default function Dashboard() {
  const { 
    user, 
    setUser, 
    setCurrentPage, 
    addNotification, 
    activeChatUserId, 
    setActiveChatUserId, 
    filters,
    setFilter,
    language
  } = useMarketStore();

  const { t } = useTranslation(language);

  const chatFilters = filters as any;

  const [activeTab, setActiveTab ] = useState("overview");

  // General products state for dashboards
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);

  // Vendor state
  const [vendorOrders, setVendorOrders] = useState<Order[]>([]);

  // Messenger State
  const [conversations, setConversations] = useState<Message[]>([]);
  const [selectedConvoUserId, setSelectedConvoUserId] = useState<string | null>(null);
  const [selectedConvoUserName, setSelectedConvoUserName] = useState<string>("");
  const [convoMessages, setConvoMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Product Creation state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Phones");
  const [newPrice, setNewPrice] = useState("");
  const [newCondition, setNewCondition] = useState<"NEW" | "USED" | "REFURBISHED">("NEW");
  const [newStock, setNewStock] = useState("3");
  const [newLoc, setNewLoc] = useState("Bole, Addis Ababa");
  const [newImg, setNewImg] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Profile Form state
  const [profName, setProfName] = useState(user?.name || "");
  const [profLocation, setProfLocation] = useState(user?.location || "");
  const [profPhone, setProfPhone] = useState(user?.phone || "");
  const [profSaving, setProfSaving] = useState(false);

  // Order List state
  const [buyerOrders, setBuyerOrders] = useState<Order[]>([]);

  // Fetch all lists for dashboard panels
  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      // 1. Fetch general listings
      const res = await fetch("/api/products");
      const pData = await res.json();
      if (pData.success) {
        if (user.role === "VENDOR") {
          // Filter to vendor specific products
          setDbProducts(pData.data.filter((p: Product) => p.vendorId === user.id));
        } else {
          setDbProducts(pData.data);
        }
      }

      // 2. Fetch conversions threads
      const msgRes = await fetch(`/api/messages/user/${user.id}`);
      const mData = await msgRes.json();
      if (mData.success) {
        setConversations(mData.data);
      }

      // 3. Vendor stats / Admin stats
      if (user.role === "ADMIN") {
        const adminRes = await fetch("/api/admin/stats");
        const aData = await adminRes.json();
        if (aData.success) setAdminStats(aData.data);
      }

      if (user.role === "VENDOR") {
        const ordRes = await fetch(`/api/orders/vendor/${user.id}`);
        const oData = await ordRes.json();
        if (oData.success) setVendorOrders(oData.data);
      }

      if (user.role === "BUYER") {
        const ordRes = await fetch(`/api/orders/user/${user.id}`);
        const oData = await ordRes.json();
        if (oData.success) setBuyerOrders(oData.data);
      }

      // 4. Fetch database engine status
      const dbRes = await fetch("/api/db/status");
      const dbJson = await dbRes.json();
      if (dbJson.success) setDbStatus(dbJson.data);
    } catch (err) {
      console.error("Dashboard pull error:", err);
    }
  };

  useEffect(() => {
    if (!user) {
      setCurrentPage("login-register");
      return;
    }
    fetchDashboardData();

    // Check if redirecting from details to open a conversation
    if (activeChatUserId) {
      setSelectedConvoUserId(activeChatUserId);
      const name = chatFilters.activeVendorName || "Vendor";
      setSelectedConvoUserName(name);
      setActiveTab("messages");
    }
  }, [user, activeChatUserId]);

  // Load chat messages when a conversation thread is clicked
  useEffect(() => {
    if (selectedConvoUserId && user) {
      const messagesWithThisUser = conversations.filter(
        (m) =>
          (m.senderId === user.id && m.receiverId === selectedConvoUserId) ||
          (m.senderId === selectedConvoUserId && m.receiverId === user.id)
      ).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      setConvoMessages(messagesWithThisUser);

      // Reset external chat hook context upon visual engagement
      if (activeChatUserId === selectedConvoUserId) {
        setActiveChatUserId(null);
      }
    }
  }, [selectedConvoUserId, conversations]);

  // Handle send reply block
  const handleSendTextMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !user || !selectedConvoUserId) return;

    try {
      const activeProdId = chatFilters.activeContextProductId || "";
      const activeProdTitle = chatFilters.activeContextProductTitle || "";

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: replyText,
          senderId: user.id,
          receiverId: selectedConvoUserId,
          senderName: user.name,
          receiverName: selectedConvoUserName,
          productId: activeProdId || undefined,
          productTitle: activeProdTitle || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setConvoMessages([...convoMessages, data.data]);
        setConversations([data.data, ...conversations]);
        setReplyText("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setProfSaving(true);
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          name: profName,
          location: profLocation,
          phone: profPhone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data, localStorage.getItem("ethio_token"));
        addNotification("Profile credentials successfully modified!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProfSaving(false);
    }
  };

  // Submit Product creation (Vendor Only)
  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!newTitle || !newPrice) {
      addNotification("Please provide at least a title and price.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          price: newPrice,
          condition: newCondition,
          stock: newStock,
          location: newLoc,
          images: newImg ? [newImg] : undefined,
          description: newDesc,
          vendorId: user.id,
          vendorName: user.name,
        }),
      });
      const data = await res.json();
      if (data.success) {
        addNotification(`"${newTitle}" successfully listed on the marketplace!`);
        // Reset inputs
        setNewTitle("");
        setNewPrice("");
        setNewImg("");
        setNewDesc("");
        // Reload dashboard
        fetchDashboardData();
        setActiveTab("overview");
      }
    } catch (err) {
      console.error(err);
      addNotification("Listing upload failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // Product Description Generator
  const handleGeminiAutoWrite = async () => {
    if (!newTitle.trim()) {
      addNotification("Please enter a product title first.");
      return;
    }
    try {
      setAiGenerating(true);
      addNotification("Generating product description...");
      const res = await fetch("/api/ai/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          condition: newCondition,
          location: newLoc
        })
      });

      const data = await res.json();
      if (data.success && data.data?.text) {
        setNewDesc(data.data.text);
        addNotification("Description generated. You can edit it before publishing.");
      } else {
        addNotification(data.error || "Could not generate description. Please try again.");
      }
    } catch (err) {
      console.error(err);
      addNotification("Could not generate description. Please try again.");
    } finally {
      setAiGenerating(false);
    }
  };

  // Delete product listing (iframe-safe two-step confirmation)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDeleteListing = async (prodId: string) => {
    if (confirmDeleteId !== prodId) {
      setConfirmDeleteId(prodId);
      addNotification("Click delete again to confirm unlisting this item.");
      return;
    }
    setConfirmDeleteId(null);
    try {
      const res = await fetch(`/api/products/${prodId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setDbProducts(dbProducts.filter((p) => p.id !== prodId));
        addNotification("Product successfully unlisted.");
      }
    } catch (err) {
      console.error(err);
      addNotification("Failed to unlist product.");
    }
  };

  // Change Admin Moderation Status (Approve/Deny)
  const handleModerateProduct = async (prodId: string, approved: boolean) => {
    try {
      const res = await fetch(`/api/products/${prodId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: approved }),
      });
      const data = await res.json();
      if (data.success) {
        setDbProducts(dbProducts.map((p) => p.id === prodId ? { ...p, isApproved: approved } : p));
        addNotification(approved ? "Listing approved!" : "Listing rejected.");
        // Re-pull to show correct stats
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Deduplicate conversations list to show distinct contact persons
  const distinctConversations = useMemo(() => {
    if (!user) return [];
    const map = new Map<string, Message>();
    conversations.forEach((msg) => {
      const contactId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
      const contactName = msg.senderId === user.id ? msg.receiverName : msg.senderName;
      
      const existing = map.get(contactId);
      if (!existing || new Date(msg.createdAt) > new Date(existing.createdAt)) {
        map.set(contactId, { ...msg, senderName: contactName }); // Alias senderName to the contact name
      }
    });
    return Array.from(map.values()).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [conversations, user]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
      {/* 1. SIDEBAR / MOBILE NAVIGATION */}
      <aside className="lg:col-span-1 bg-white border border-neutral-200 rounded-2xl p-4 sm:p-5 space-y-4 sm:space-y-6 shrink-0 h-fit">
        <div className="flex items-center gap-3 border-b border-neutral-100 pb-3 sm:pb-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold shrink-0 text-sm">
            {user?.name.substr(0,1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-neutral-900 text-xs sm:text-sm truncate">{user?.name}</h3>
            <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-wider font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              {user?.role} Portal
            </span>
          </div>
        </div>

        <nav className="flex lg:flex-col gap-1.5 text-xs font-semibold text-neutral-600 overflow-x-auto no-scrollbar pb-1 lg:pb-0 -mx-1 px-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`whitespace-nowrap px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "overview" 
                ? "bg-amber-500 text-neutral-950 font-bold shadow-xs" 
                : "hover:bg-neutral-50 bg-neutral-50/70 lg:bg-transparent"
            }`}
          >
            <LayoutGrid className="w-4 h-4 shrink-0" />
            <span>{t("dashboard")}</span>
          </button>

          {user?.role === "VENDOR" && (
            <button
              onClick={() => setActiveTab("create-product")}
              className={`whitespace-nowrap px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === "create-product" 
                  ? "bg-amber-500 text-neutral-950 font-bold shadow-xs" 
                  : "hover:bg-neutral-50 bg-neutral-50/70 lg:bg-transparent"
              }`}
            >
              <Plus className="w-4 h-4 shrink-0 hover:rotate-90 transition-transform" />
              <span>{t("addProduct")}</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("messages")}
            className={`whitespace-nowrap px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "messages" 
                ? "bg-amber-500 text-neutral-950 font-bold shadow-xs" 
                : "hover:bg-neutral-50 bg-neutral-50/70 lg:bg-transparent"
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>{t("messages")}</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`whitespace-nowrap px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "profile" 
                ? "bg-amber-500 text-neutral-950 font-bold shadow-xs" 
                : "hover:bg-neutral-50 bg-neutral-50/70 lg:bg-transparent"
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span>{t("profile")}</span>
          </button>

          <button
            onClick={() => setActiveTab("database")}
            className={`whitespace-nowrap px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === "database" 
                ? "bg-amber-500 text-neutral-950 font-bold shadow-xs" 
                : "hover:bg-neutral-50 bg-neutral-50/70 lg:bg-transparent"
            }`}
          >
            <Database className="w-4 h-4 shrink-0" />
            <span>MySQL DB</span>
          </button>
        </nav>
      </aside>

      {/* 2. RIGHT CONTROL SHEETS PANEL */}
      <main className="lg:col-span-3 space-y-6">
        
        {/* =======================================================
            TAB VIEW: CONTROL CENTER OVERVIEW
            ======================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{t("dashboard")}</h1>
                <p className="text-neutral-500 text-xs">Direct oversight of your transactions, listing moderation, and inventory trackers</p>
              </div>
              <button 
                onClick={fetchDashboardData}
                className="p-2 border border-neutral-200 hover:border-neutral-300 rounded-xl hover:bg-neutral-50 text-neutral-600 transition-colors cursor-pointer"
                title="Refresh Cache"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* A. VENDOR OVERVIEW BLOCK */}
            {user?.role === "VENDOR" && (
              <div className="space-y-8">
                {/* Stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="p-5 bg-white border border-neutral-200 rounded-2xl flex items-start justify-between">
                    <div>
                      <span className="text-xs text-neutral-400 font-mono font-bold block uppercase tracking-wider">My Listings</span>
                      <span className="text-3xl font-bold text-neutral-900 leading-tight mt-1">{dbProducts.length}</span>
                    </div>
                    <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600"><Package className="w-5 h-5" /></div>
                  </div>

                  <div className="p-5 bg-white border border-neutral-200 rounded-2xl flex items-start justify-between">
                    <div>
                      <span className="text-xs text-neutral-400 font-mono font-bold block uppercase tracking-wider">Gross Sales</span>
                      <span className="text-3xl font-mono font-bold text-neutral-900 leading-tight mt-1">
                        {vendorOrders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-amber-600 font-bold block mt-0.5">ETB</span>
                    </div>
                    <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600"><DollarSign className="w-5 h-5" /></div>
                  </div>

                  <div className="p-5 bg-white border border-neutral-200 rounded-2xl flex items-start justify-between">
                    <div>
                      <span className="text-xs text-neutral-400 font-mono font-bold block uppercase tracking-wider">Core Orders</span>
                      <span className="text-3xl font-bold text-neutral-900 leading-tight mt-1">{vendorOrders.length}</span>
                    </div>
                    <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600"><TrendingUp className="w-5 h-5" /></div>
                  </div>
                </div>

                {/* My Active Listings Grid */}
                <div className="space-y-4">
                  <h3 className="text-lg font-sans font-semibold text-neutral-900">Current Selling Inventory</h3>
                  {dbProducts.length === 0 ? (
                    <div className="text-center py-10 bg-neutral-50 border border-neutral-100/50 rounded-2xl space-y-3">
                      <p className="text-xs text-neutral-500">You haven't uploaded any products yet. Showcase your products to reach buyers across Ethiopia!</p>
                      <button
                        onClick={() => setActiveTab("create-product")}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-semibold rounded-xl text-xs cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> Create Product Listing
                      </button>
                    </div>
                  ) : (
                    <div className="border border-neutral-200 rounded-2xl bg-white overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-neutral-50 text-[10px] font-mono font-bold uppercase text-neutral-450 border-b border-neutral-150">
                              <th className="p-4">Item Details</th>
                              <th className="p-4">Category</th>
                              <th className="p-4">Listing Price</th>
                              <th className="p-4">Stock</th>
                              <th className="p-4">Condition</th>
                              <th className="p-4 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100 text-xs">
                            {dbProducts.map((p) => (
                              <tr key={p.id} className="hover:bg-neutral-50/55">
                                <td className="p-4 font-semibold text-neutral-900">{p.title}</td>
                                <td className="p-4 text-neutral-500">{p.category}</td>
                                <td className="p-4 font-mono font-semibold">{p.price.toLocaleString()} ETB</td>
                                <td className="p-4 text-neutral-700">{p.stock} units</td>
                                <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                    p.condition === "NEW" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-teal-50 text-teal-700 border border-teal-100"
                                  }`}>{p.condition}</span>
                                </td>
                                <td className="p-4 flex gap-1 justify-center">
                                  <button
                                    onClick={() => handleDeleteListing(p.id)}
                                    className="p-1 text-red-500 hover:bg-neutral-100 rounded-lg cursor-pointer"
                                    title="Unlist permanently"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Vendor Orders Incoming */}
                <div className="space-y-4">
                  <h3 className="text-lg font-sans font-semibold text-neutral-900">Incoming Buyer Orders</h3>
                  {vendorOrders.length === 0 ? (
                    <p className="text-xs text-neutral-400">No transactions recorded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {vendorOrders.map((ord) => (
                        <div key={ord.id} className="p-4 border border-neutral-150 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase font-bold text-amber-600 block">{ord.id}</span>
                            <span className="text-xs text-neutral-500 block">Buyer: <strong>{ord.buyerName}</strong></span>
                            <span className="text-xs text-neutral-700">Items: {ord.items.map((it) => `${it.title} (x${it.quantity})`).join(", ")}</span>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-xs font-semibold block text-neutral-900 font-mono">{ord.totalAmount.toLocaleString()} ETB</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white block mt-1 ${
                                ord.paymentStatus === "PAID" ? "bg-emerald-500" : "bg-rose-500"
                              }`}>{ord.paymentStatus}</span>
                            </div>
                            
                            <div className="text-right leading-none">
                              <span className="text-[10px] text-neutral-400 uppercase font-bold">Delivery Status</span>
                              <div className="mt-1">
                                <span className="px-2 py-0.5 bg-neutral-100 text-neutral-800 rounded font-semibold text-xs">{ord.deliveryStatus}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* B. ADMIN OVERVIEW BLOCK */}
            {user?.role === "ADMIN" && (
              <div className="space-y-8">
                {/* Stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-white border border-neutral-200 rounded-2xl">
                    <span className="text-[10px] text-neutral-400 font-mono font-bold block uppercase tracking-wider">Gross Trade Volume</span>
                    <span className="text-2xl font-mono font-bold text-neutral-900 block mt-1">
                      {adminStats?.totalSales?.toLocaleString() || "0"}
                    </span>
                    <span className="text-[10px] text-amber-600 font-bold font-mono">ETB</span>
                  </div>

                  <div className="p-4 bg-white border border-neutral-200 rounded-2xl">
                    <span className="text-[10px] text-neutral-400 font-mono font-bold block uppercase tracking-wider">Total Listings</span>
                    <span className="text-2xl font-bold text-neutral-900 block mt-1">{adminStats?.totalProducts || "0"}</span>
                  </div>

                  <div className="p-4 bg-white border border-neutral-200 rounded-2xl">
                    <span className="text-[10px] text-neutral-400 font-mono font-bold block uppercase tracking-wider">Active Vendors</span>
                    <span className="text-2xl font-bold text-neutral-900 block mt-1">{adminStats?.vendorCount || "0"}</span>
                  </div>

                  <div className="p-4 bg-white border border-neutral-200 rounded-2xl">
                    <span className="text-[10px] text-neutral-400 font-mono font-bold block uppercase tracking-wider">Registered Buyers</span>
                    <span className="text-2xl font-bold text-neutral-900 block mt-1">{adminStats?.buyerCount || "0"}</span>
                  </div>
                </div>

                {/* Admin Moderation Queue */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                    <h3 className="text-lg font-sans font-bold text-neutral-900">E-Commerce Listings Moderation</h3>
                  </div>

                  <div className="border border-neutral-200 rounded-2xl bg-white overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-neutral-50 text-[10px] font-mono font-bold uppercase text-neutral-450 border-b border-neutral-150">
                            <th className="p-4">Product Catalog Name</th>
                            <th className="p-4">Vendor Name</th>
                            <th className="p-4">Cost in ETB</th>
                            <th className="p-4">Verification Check</th>
                            <th className="p-4 text-center">Mod Panel Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
                          {dbProducts.map((p) => (
                            <tr key={p.id} className="hover:bg-neutral-50/50">
                              <td className="p-4 font-semibold text-neutral-900">
                                {p.title}
                              </td>
                              <td className="p-4 text-neutral-600">{p.vendorName || "Dawit electronics"}</td>
                              <td className="p-4 font-mono">{p.price.toLocaleString()}</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                  p.isApproved ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-neutral-100 text-neutral-600"
                                }`}>
                                  {p.isApproved ? "ACTIVE & LIVE" : "DENIED"}
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                {p.isApproved ? (
                                  <button
                                    onClick={() => handleModerateProduct(p.id, false)}
                                    className="px-2.5 py-1 bg-red-50 text-red-600 rounded font-semibold text-[10px] hover:bg-red-100 cursor-pointer border border-red-100"
                                  >
                                    Deactivate
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleModerateProduct(p.id, true)}
                                    className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded font-semibold text-[10px] hover:bg-emerald-100 cursor-pointer border border-emerald-100"
                                  >
                                    Approve
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* C. BUYER PORTAL OVERVIEW */}
            {user?.role === "BUYER" && (
              <div className="space-y-8">
                {/* Visual stats and greetings */}
                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                  <h3 className="font-sans font-bold text-neutral-900 text-base">እንኳን በደህና መጡ (Welcome back), {user.name}!</h3>
                  <p className="text-neutral-600 text-xs mt-1 leading-relaxed">
                    This is your buyer dashboard control center. From here, you can manage your system profile, view past e-commerce receipts, and respond to negotiation chats.
                  </p>
                </div>

                {/* Buyer Orders History */}
                <div className="space-y-4">
                  <h3 className="text-lg font-sans font-semibold text-neutral-900">My Purchase Orders history</h3>
                  {buyerOrders.length === 0 ? (
                    <div className="text-center py-10 bg-neutral-50 border border-neutral-100/50 rounded-2xl">
                      <p className="text-xs text-neutral-500">You haven't made any orders yet on EthioMarket.</p>
                      <button 
                        onClick={() => setCurrentPage("marketplace")}
                        className="px-4 py-2 bg-neutral-950 text-white font-semibold text-xs rounded-xl mt-3 cursor-pointer"
                      >
                        Browse Market
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {buyerOrders.map((ord) => (
                        <div key={ord.id} className="p-4 border border-neutral-150 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase font-bold text-amber-600 block">{ord.id}</span>
                            <span className="text-xs text-neutral-700 block mt-1">Items of purchase: {ord.items.map((it) => `${it.title} (x${it.quantity})`).join(", ")}</span>
                            <span className="text-xs text-neutral-500 block">Date: {new Date(ord.createdAt).toLocaleDateString()}</span>
                          </div>

                          <div className="flex gap-4 items-center">
                            <div className="text-right">
                              <span className="text-xs font-semibold block text-neutral-900 font-mono">{ord.totalAmount.toLocaleString()} ETB</span>
                              <span className={`px-2.5 py-0.5 rounded text-[9px] uppercase font-bold text-white block mt-1 ${
                                ord.paymentStatus === "PAID" ? "bg-emerald-500" : "bg-rose-500"
                              }`}>{ord.paymentStatus}</span>
                            </div>

                            <div className="text-right leading-none">
                              <span className="text-[10px] text-neutral-400 uppercase font-bold">Shipping</span>
                              <div className="mt-1">
                                <span className="px-2 py-0.5 bg-neutral-100 text-neutral-800 rounded font-semibold text-[10px]">{ord.deliveryStatus}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =======================================================
            TAB VIEW: ADD PRODUCT LISTING (VENDOR ONLY)
            ======================================================= */}
        {activeTab === "create-product" && user?.role === "VENDOR" && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 leading-none">List Your Product</h2>
              <p className="text-neutral-500 text-xs mt-1.5">Put your listing on EthioMarket to begin receiving customer chat bargaining offers.</p>
            </div>

            <form onSubmit={handleCreateProductSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">Product Title</label>
                  <input
                    type="text"
                    placeholder="e.g. iPhone 15 Pro Max 256GB"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-neutral-700 text-xs outline-none focus:border-amber-500"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-neutral-700 bg-white text-xs outline-none cursor-pointer focus:border-amber-500"
                  >
                    <option value="Phones">Phones</option>
                    <option value="Laptops">Laptops</option>
                    <option value="PCs">PCs</option>
                    <option value="Cameras">Cameras</option>
                    <option value="AirPods">AirPods</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Books">Books</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Services">Services</option>
                  </select>
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">Price (ETB)</label>
                  <input
                    type="number"
                    placeholder="e.g. 54000"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-neutral-700 text-xs outline-none focus:border-amber-500"
                  />
                </div>

                {/* Stock */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">Inventory Stock Count</label>
                  <input
                    type="number"
                    placeholder="e.g. 5"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-neutral-700 text-xs outline-none focus:border-amber-500"
                  />
                </div>

                {/* Condition */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">Condition State</label>
                  <div className="flex gap-2">
                    {["NEW", "USED", "REFURBISHED"].map((cond) => (
                      <button
                        type="button"
                        key={cond}
                        onClick={() => setNewCondition(cond as any)}
                        className={`flex-grow py-2 rounded-xl text-[10px] font-mono font-semibold cursor-pointer border transition-colors ${
                          newCondition === cond 
                            ? "bg-neutral-900 border-neutral-900 text-white font-bold" 
                            : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                        }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">Location / District</label>
                  <input
                    type="text"
                    placeholder="e.g. Bole, Addis Ababa"
                    value={newLoc}
                    onChange={(e) => setNewLoc(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-neutral-700 text-xs outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Photo Image URL option */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">Showcase Image URL (or blank for default placeholder)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newImg}
                  onChange={(e) => setNewImg(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-neutral-700 text-xs outline-none focus:border-amber-500"
                />
              </div>

              {/* Description + Gemini writing tools */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">Listing Description</label>
                  
                  {/* Description generator */}
                  <button
                    type="button"
                    onClick={handleGeminiAutoWrite}
                    disabled={aiGenerating}
                    className="px-3.5 py-1 text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {aiGenerating ? (
                      <div className="w-3 h-3 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    Suggest Description
                  </button>
                </div>
                <textarea
                  placeholder="Describe the item, main features, condition, and any details buyers should know..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={4}
                  className="w-full p-3.5 border border-neutral-200 rounded-xl text-neutral-700 text-xs outline-none focus:border-amber-500 whitespace-pre-wrap font-normal leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-neutral-950 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                {submitting ? "Publishing listing..." : "Publish Listing"}
              </button>
            </form>
          </div>
        )}

        {/* =======================================================
            TAB VIEW: MESSENGER THREADS (HIGH-FIDELITY BATCH CHAT)
            ======================================================= */}
        {activeTab === "messages" && (
          <div className="grid grid-cols-1 md:grid-cols-3 border border-neutral-200 rounded-2xl bg-white overflow-hidden min-h-[500px]">
            
            {/* Conversations list sidebar */}
            <div className={`md:col-span-1 border-r border-neutral-200 divide-y divide-neutral-100 max-h-[550px] overflow-y-auto ${
              selectedConvoUserId ? "hidden md:block" : "block"
            }`}>
              <div className="p-4 bg-neutral-50/70 border-b border-neutral-100 font-bold text-neutral-900 text-xs font-mono uppercase tracking-wider">
                Messages
              </div>
              {distinctConversations.length === 0 ? (
                <p className="text-xs text-neutral-400 p-6 text-center">No messages yet.</p>
              ) : (
                distinctConversations.map((convo) => {
                  const contactId = convo.senderId === user?.id ? convo.receiverId : convo.senderId;
                  const isSelected = selectedConvoUserId === contactId;
                  return (
                    <div
                      key={convo.id}
                      onClick={() => {
                        setSelectedConvoUserId(contactId);
                        setSelectedConvoUserName(convo.senderName);
                      }}
                      className={`p-4 cursor-pointer hover:bg-neutral-50 flex items-start gap-3 transition-colors ${
                        isSelected ? "bg-amber-100/60 font-semibold" : ""
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-neutral-150 flex items-center justify-center font-bold text-neutral-700 font-mono text-sm shrink-0">
                        {convo.senderName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-grow">
                        <h4 className="font-semibold text-neutral-900 text-xs truncate leading-normal">{convo.senderName}</h4>
                        <p className="text-[10px] text-neutral-450 truncate">{convo.text}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Conversation detail message stream */}
            <div className={`md:col-span-2 flex flex-col justify-between max-h-[550px] ${
              !selectedConvoUserId ? "hidden md:flex" : "flex"
            }`}>
              {selectedConvoUserId ? (
                <>
                  {/* Chat header */}
                  <div className="p-3 sm:p-4 border-b border-neutral-200 bg-neutral-50/50 flex justify-between items-center text-xs shrink-0 gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Mobile back to contacts button */}
                      <button
                        onClick={() => setSelectedConvoUserId(null)}
                        className="p-1.5 -ml-1 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-lg md:hidden cursor-pointer shrink-0"
                        title="Back to contacts"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <div className="min-w-0">
                        <span className="font-semibold text-neutral-900 block truncate">{selectedConvoUserName}</span>
                        <span className="text-[10px] text-amber-600 block truncate">Active negotiation thread</span>
                      </div>
                    </div>

                    {/* Context contextual banner showing product badge if any */}
                    {chatFilters.activeContextProductTitle && (
                      <div className="p-1 px-2.5 bg-white border border-neutral-150 rounded-lg text-[9px] font-semibold text-neutral-600 font-mono max-w-36 sm:max-w-48 truncate shrink-0">
                        Re: {chatFilters.activeContextProductTitle}
                      </div>
                    )}
                  </div>

                  {/* Messages list */}
                  <div className="p-3 sm:p-4 flex-grow overflow-y-auto space-y-3.5 bg-neutral-50/30 max-h-[380px]">
                    {convoMessages.map((msg) => {
                      const isMe = msg.senderId === user?.id;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`p-3 max-w-[85%] sm:max-w-xs rounded-2xl text-xs leading-normal ${
                            isMe 
                              ? "bg-neutral-950 text-white rounded-br-none" 
                              : "bg-white text-neutral-800 border border-neutral-150 rounded-bl-none"
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Send area */}
                  <form onSubmit={handleSendTextMessage} className="p-3 border-t border-neutral-200 flex gap-2 shrink-0">
                    <input
                      type="text"
                      placeholder="Type message or bid..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-grow min-w-0 px-3 py-2 border border-neutral-200 rounded-xl text-xs outline-none focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      className="p-2.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold rounded-xl cursor-pointer shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 space-y-3 text-neutral-400">
                  <MessageSquare className="w-12 h-12 text-neutral-300" />
                  <p className="text-xs">No active negotiation thread selected.</p>
                  <p className="text-[10px] text-neutral-450">Select a contact row on the left to review barter updates.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =======================================================
            TAB VIEW: SYSTEM PROFILE MANAGEMENT
            ======================================================= */}
        {activeTab === "profile" && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-6 max-w-lg mx-auto">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 leading-none">Profile Credentials</h2>
              <p className="text-neutral-500 text-xs mt-1.5 font-normal">Manage your contact credentials and geographical listings details.</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Display Account details */}
              <div className="p-4 bg-neutral-50 rounded-xl space-y-2 border border-neutral-100 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Registrar Email:</span>
                  <span className="font-mono text-neutral-900">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Registered Role:</span>
                  <span className="font-bold text-amber-600 font-mono tracking-wider">{user?.role}</span>
                </div>
              </div>

              {/* Editable Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">Full Name</label>
                <input
                  type="text"
                  placeholder="My legal name"
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-neutral-700 text-xs outline-none focus:border-amber-500 bg-white"
                />
              </div>

              {/* Editable Location */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono font-normal">Primary Trade Location (Ethiopia)</label>
                <input
                  type="text"
                  placeholder="e.g. Bole, Addis Ababa"
                  value={profLocation}
                  onChange={(e) => setProfLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-neutral-700 text-xs outline-none focus:border-amber-500 bg-white"
                />
              </div>

              {/* Editable Phone */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono font-normal">Contact Mobile Phone</label>
                <input
                  type="tel"
                  placeholder="e.g. +251 911 445566"
                  value={profPhone}
                  onChange={(e) => setProfPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-neutral-700 text-xs outline-none focus:border-amber-500 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={profSaving}
                className="w-full py-3 bg-neutral-950 hover:bg-neutral-800 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                {profSaving ? "Saving details..." : "Persist Changes"}
              </button>
            </form>
          </div>
        )}

        {/* =======================================================
            TAB VIEW: MYSQL DATABASE DIAGNOSTICS & SCHEMA
            ======================================================= */}
        {activeTab === "database" && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-150 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                    MySQL Relational Database Engine
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Production Ready
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Engine status, live record counts, and connection architecture
                  </p>
                </div>
              </div>
              <button
                onClick={fetchDashboardData}
                className="p-2 text-neutral-500 hover:text-neutral-900 rounded-xl hover:bg-neutral-100 transition-colors"
                title="Refresh Status"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Status Card */}
            <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Active Database Engine
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  {dbStatus?.engine || "MySQL 8.x (Dual-Mode Sync)"}
                </span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                EthioMarket executes all data access via the standard <code className="px-1.5 py-0.5 bg-neutral-200 rounded text-neutral-900 font-mono text-[11px]">mysql2/promise</code> repository layer with full UTF-8 MB4 support for Ge'ez Fidel script (አማርኛ, ትግርኛ) and parameterized prepared statements.
              </p>
            </div>

            {/* Table Metrics */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Live Database Tables & Record Counts
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-neutral-200">
                  <span className="text-neutral-400 text-[10px] block font-mono">TABLE users</span>
                  <span className="text-xl font-bold text-neutral-900">
                    {dbStatus?.tables?.users ?? 0}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">Registered Accounts</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-neutral-200">
                  <span className="text-neutral-400 text-[10px] block font-mono">TABLE products</span>
                  <span className="text-xl font-bold text-amber-600">
                    {dbStatus?.tables?.products ?? 0}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">Catalogue Listings</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-neutral-200">
                  <span className="text-neutral-400 text-[10px] block font-mono">TABLE orders</span>
                  <span className="text-xl font-bold text-neutral-900">
                    {dbStatus?.tables?.orders ?? 0}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">Orders & Payments</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-neutral-200">
                  <span className="text-neutral-400 text-[10px] block font-mono">TABLE messages</span>
                  <span className="text-xl font-bold text-neutral-900">
                    {dbStatus?.tables?.messages ?? 0}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">Chat Messages</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-neutral-200">
                  <span className="text-neutral-400 text-[10px] block font-mono">TABLE reviews</span>
                  <span className="text-xl font-bold text-neutral-900">
                    {dbStatus?.tables?.reviews ?? 0}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">Verified Ratings</span>
                </div>
              </div>
            </div>

            {/* DDL Schema Preview */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                <span>Production MySQL Schema DDL (/schema.sql)</span>
                <span className="text-[10px] font-mono text-amber-600">CHARACTER SET utf8mb4</span>
              </h4>
              <div className="p-4 rounded-2xl bg-neutral-950 text-neutral-300 font-mono text-[11px] overflow-x-auto border border-neutral-800 leading-relaxed max-h-48">
                <span className="text-amber-400">CREATE DATABASE IF NOT EXISTS</span> ethiomarket <span className="text-neutral-500">CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;</span><br />
                <span className="text-amber-400">CREATE TABLE IF NOT EXISTS</span> users (id VARCHAR(64) PRIMARY KEY, email VARCHAR(255) UNIQUE...);<br />
                <span className="text-amber-400">CREATE TABLE IF NOT EXISTS</span> products (id VARCHAR(64) PRIMARY KEY, title VARCHAR(255), price DECIMAL(12,2)...);<br />
                <span className="text-amber-400">CREATE TABLE IF NOT EXISTS</span> orders (id VARCHAR(64) PRIMARY KEY, total_amount DECIMAL(12,2), payment_method ENUM...);<br />
                <span className="text-amber-400">CREATE TABLE IF NOT EXISTS</span> messages (id VARCHAR(64) PRIMARY KEY, sender_id VARCHAR(64), text TEXT...);<br />
                <span className="text-amber-400">CREATE TABLE IF NOT EXISTS</span> reviews (id VARCHAR(64) PRIMARY KEY, rating TINYINT...);
              </div>
            </div>

            {/* Connection Instructions */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1.5 text-xs text-amber-950">
              <span className="font-bold flex items-center gap-1.5 text-amber-900">
                <Code className="w-3.5 h-3.5" />
                Connecting External MySQL
              </span>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Supply <code className="font-mono text-amber-950 bg-amber-200/60 px-1 py-0.5 rounded">MYSQL_HOST</code>, <code className="font-mono text-amber-950 bg-amber-200/60 px-1 py-0.5 rounded">MYSQL_USER</code>, <code className="font-mono text-amber-950 bg-amber-200/60 px-1 py-0.5 rounded">MYSQL_PASSWORD</code>, and <code className="font-mono text-amber-950 bg-amber-200/60 px-1 py-0.5 rounded">MYSQL_DATABASE</code> in your environment or Cloud Run container variables. The system will automatically run schema migrations and seed the initial marketplace catalogue on startup.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

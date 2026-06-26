import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "motion/react";
import {
  Plus, Sparkles, LayoutGrid, Trash2, TrendingUp, DollarSign,
  Package, ShieldAlert, Send, MessageSquare, User, Save, RefreshCw
} from "lucide-react";
import { useMarketStore } from "../store";
import { Product, Message, Order } from "../types";

// Mock data for demonstration
const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    title: "iPhone 15 Pro Max",
    category: "Phones",
    price: 120000,
    condition: "NEW",
    stock: 5,
    location: "Bole, Addis Ababa",
    images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400"],
    description: "Brand new iPhone 15 Pro Max with 256GB storage",
    vendorId: "vendor1",
    vendorName: "Tech Hub Ethiopia",
    isApproved: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    title: "MacBook Pro 14-inch",
    category: "Laptops",
    price: 180000,
    condition: "NEW",
    stock: 3,
    location: "Piassa, Addis Ababa",
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400"],
    description: "M3 Pro chip, 18GB RAM, 512GB SSD",
    vendorId: "vendor1",
    vendorName: "Tech Hub Ethiopia",
    isApproved: true,
    createdAt: new Date().toISOString()
  }
];

const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-001",
    buyerId: "buyer1",
    buyerName: "John Doe",
    items: [
      { productId: "1", title: "iPhone 15 Pro Max", quantity: 1, price: 120000 }
    ],
    totalAmount: 120000,
    paymentStatus: "PAID",
    deliveryStatus: "PENDING",
    createdAt: new Date().toISOString()
  }
];

const MOCK_MESSAGES: Message[] = [
  {
    id: "msg1",
    text: "Hello, is the iPhone still available?",
    senderId: "buyer1",
    senderName: "John Doe",
    receiverId: "vendor1",
    receiverName: "Tech Hub Ethiopia",
    createdAt: new Date().toISOString()
  },
  {
    id: "msg2",
    text: "Yes, it's available. Would you like to make an offer?",
    senderId: "vendor1",
    senderName: "Tech Hub Ethiopia",
    receiverId: "buyer1",
    receiverName: "John Doe",
    createdAt: new Date().toISOString()
  }
];

export default function Dashboard() {
  const {
    user,
    setUser,
    setCurrentPage,
    addNotification,
    activeChatUserId,
    setActiveChatUserId,
  } = useMarketStore();

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chat context state
  const [chatContext, setChatContext] = useState<{
    productId?: string;
    productTitle?: string;
    vendorName?: string;
  }>({});

  // State for dashboard data
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [vendorOrders, setVendorOrders] = useState<Order[]>([]);
  const [buyerOrders, setBuyerOrders] = useState<Order[]>([]);
  const [conversations, setConversations] = useState<Message[]>([]);
  const [selectedConvoUserId, setSelectedConvoUserId] = useState<string | null>(null);
  const [selectedConvoUserName, setSelectedConvoUserName] = useState<string>("");
  const [convoMessages, setConvoMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");

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

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Use mock data based on user role
      if (user.role === "VENDOR") {
        setDbProducts(MOCK_PRODUCTS.filter(p => p.vendorId === user.id));
        setVendorOrders(MOCK_ORDERS);
        setConversations(MOCK_MESSAGES);
      } else if (user.role === "ADMIN") {
        setDbProducts(MOCK_PRODUCTS);
        setAdminStats({
          totalSales: 300000,
          totalProducts: 15,
          vendorCount: 8,
          buyerCount: 45
        });
        setConversations(MOCK_MESSAGES);
      } else if (user.role === "BUYER") {
        setBuyerOrders(MOCK_ORDERS);
        setConversations(MOCK_MESSAGES.filter(m => m.senderId === user.id || m.receiverId === user.id));
      }
      
      // If we have an active chat user, open the messages tab
      if (activeChatUserId) {
        setSelectedConvoUserId(activeChatUserId);
        const contact = MOCK_MESSAGES.find(m => 
          m.senderId === activeChatUserId || m.receiverId === activeChatUserId
        );
        setSelectedConvoUserName(contact?.senderName || contact?.receiverName || "Vendor");
        setActiveTab("messages");
        setActiveChatUserId(null);
      }
      
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Failed to load dashboard data. Please refresh the page.");
      addNotification("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [user, activeChatUserId, setActiveChatUserId, addNotification]);

  // Load data on mount and when user changes
  useEffect(() => {
    if (!user) {
      setCurrentPage("login-register");
      return;
    }
    loadDashboardData();
  }, [user, loadDashboardData, setCurrentPage]);

  // Filter messages for selected conversation
  useEffect(() => {
    if (selectedConvoUserId && user) {
      const filtered = conversations.filter(
        (m) =>
          (m.senderId === user.id && m.receiverId === selectedConvoUserId) ||
          (m.senderId === selectedConvoUserId && m.receiverId === user.id)
      ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      
      setConvoMessages(filtered);
    }
  }, [selectedConvoUserId, conversations, user]);

  // Handle sending messages
  const handleSendTextMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !user || !selectedConvoUserId) return;

    try {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        text: replyText,
        senderId: user.id,
        senderName: user.name,
        receiverId: selectedConvoUserId,
        receiverName: selectedConvoUserName,
        createdAt: new Date().toISOString()
      };
      
      setConvoMessages(prev => [...prev, newMessage]);
      setConversations(prev => [newMessage, ...prev]);
      setReplyText("");
      
      // Simulate auto-reply for demo
      setTimeout(() => {
        const autoReply: Message = {
          id: `msg-${Date.now() + 1}`,
          text: "Thanks for your message! I'll get back to you shortly.",
          senderId: selectedConvoUserId,
          senderName: selectedConvoUserName,
          receiverId: user.id,
          receiverName: user.name,
          createdAt: new Date().toISOString()
        };
        setConvoMessages(prev => [...prev, autoReply]);
        setConversations(prev => [autoReply, ...prev]);
      }, 1500);
      
    } catch (err) {
      console.error(err);
      addNotification("Failed to send message.");
    }
  };

  // Handle profile update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setProfSaving(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const updatedUser = {
        ...user,
        name: profName,
        location: profLocation,
        phone: profPhone
      };
      setUser(updatedUser, localStorage.getItem("ethio_token") || "");
      addNotification("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      addNotification("Failed to update profile.");
    } finally {
      setProfSaving(false);
    }
  };

  // Handle product creation
  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!newTitle || !newPrice) {
      addNotification("Please provide at least a title and price.");
      return;
    }

    try {
      setSubmitting(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        title: newTitle,
        category: newCategory,
        price: parseFloat(newPrice),
        condition: newCondition,
        stock: parseInt(newStock, 10),
        location: newLoc,
        images: newImg ? [newImg] : [],
        description: newDesc || "No description provided",
        vendorId: user.id,
        vendorName: user.name,
        isApproved: false,
        createdAt: new Date().toISOString()
      };
      
      setDbProducts(prev => [...prev, newProduct]);
      addNotification(`"${newTitle}" listed successfully!`);
      
      // Reset form
      setNewTitle("");
      setNewPrice("");
      setNewImg("");
      setNewDesc("");
      setActiveTab("overview");
      
    } catch (err) {
      console.error(err);
      addNotification("Failed to create listing.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Gemini AI description generation
  const handleGeminiAutoWrite = async () => {
    if (!newTitle) {
      addNotification("Please enter a Title first so Gemini has context!");
      return;
    }
    
    try {
      setAiGenerating(true);
      addNotification("Engaging Gemini AI to craft a description... ✨");
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Mock AI response
      const descriptions = [
        `Experience the pinnacle of innovation with the ${newTitle}. This premium device features cutting-edge technology, stunning design, and exceptional performance. Perfect for professionals and enthusiasts alike.`,
        `The ${newTitle} sets new standards in its category. With its sleek design, powerful specifications, and premium build quality, this product offers unparalleled value and performance for discerning customers.`,
        `Elevate your daily experience with the ${newTitle}. Engineered to deliver outstanding results, this product combines functionality with style, making it the ideal choice for those who demand the best.`
      ];
      
      setNewDesc(descriptions[Math.floor(Math.random() * descriptions.length)]);
      addNotification("Gemini drafted a stunning description! ✨");
      
    } catch (err) {
      console.error(err);
      addNotification("Failed to generate description.");
    } finally {
      setAiGenerating(false);
    }
  };

  // Handle product deletion
  const handleDeleteListing = async (prodId: string) => {
    if (!confirm("Are you sure you want to unlist this product permanently?")) return;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 400));
      setDbProducts(prev => prev.filter(p => p.id !== prodId));
      addNotification("Product unlisted.");
    } catch (err) {
      console.error(err);
      addNotification("Failed to delete product.");
    }
  };

  // Handle product moderation (admin)
  const handleModerateProduct = async (prodId: string, approved: boolean) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 400));
      
      setDbProducts(prev =>
        prev.map(p => p.id === prodId ? { ...p, isApproved: approved } : p)
      );
      addNotification(approved ? "Listing approved!" : "Listing rejected.");
    } catch (err) {
      console.error(err);
      addNotification("Failed to moderate product.");
    }
  };

  // Get distinct conversations
  const distinctConversations = useMemo(() => {
    if (!user) return [];
    const map = new Map<string, Message>();
    conversations.forEach((msg) => {
      const contactId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
      const contactName = msg.senderId === user.id ? msg.receiverName : msg.senderName;
      
      const existing = map.get(contactId);
      if (!existing || new Date(msg.createdAt) > new Date(existing.createdAt)) {
        map.set(contactId, { ...msg, senderName: contactName });
      }
    });
    return Array.from(map.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [conversations, user]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
        <p className="text-sm text-neutral-500">Loading your dashboard...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-600 font-semibold mb-2">⚠️ Dashboard Error</p>
          <p className="text-red-500 text-sm">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              loadDashboardData();
            }}
            className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* SIDEBAR */}
      <aside className="lg:col-span-1 bg-white border border-neutral-200 rounded-2xl p-5 space-y-6 shrink-0 h-fit">
        <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold shrink-0">
            {user?.name?.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-neutral-900 text-sm truncate">{user?.name}</h3>
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              {user?.role} Portal
            </span>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5 text-xs font-semibold text-neutral-600">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === "overview" ? "bg-amber-500 text-neutral-950 font-bold" : "hover:bg-neutral-50"
            }`}
          >
            <LayoutGrid className="w-4 h-4 shrink-0" />
            Control Center
          </button>

          {user?.role === "VENDOR" && (
            <button
              onClick={() => setActiveTab("create-product")}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                activeTab === "create-product" ? "bg-amber-500 text-neutral-950 font-bold" : "hover:bg-neutral-50"
              }`}
            >
              <Plus className="w-4 h-4 shrink-0" />
              Add Listing
            </button>
          )}

          <button
            onClick={() => setActiveTab("messages")}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === "messages" ? "bg-amber-500 text-neutral-950 font-bold" : "hover:bg-neutral-50"
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            Messages
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === "profile" ? "bg-amber-500 text-neutral-950 font-bold" : "hover:bg-neutral-50"
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            Profile
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="lg:col-span-3 space-y-6">
        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Dashboard</h1>
                <p className="text-neutral-500 text-xs">Manage your transactions, listings, and activity</p>
              </div>
              <button
                onClick={loadDashboardData}
                className="p-2 border border-neutral-200 hover:border-neutral-300 rounded-xl hover:bg-neutral-50 text-neutral-600 transition-colors cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* VENDOR OVERVIEW */}
            {user?.role === "VENDOR" && (
              <div className="space-y-8">
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
                      <span className="text-xs text-neutral-400 font-mono font-bold block uppercase tracking-wider">Revenue</span>
                      <span className="text-3xl font-mono font-bold text-neutral-900 leading-tight mt-1">
                        {vendorOrders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-amber-600 font-bold block mt-0.5">ETB</span>
                    </div>
                    <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600"><DollarSign className="w-5 h-5" /></div>
                  </div>
                  <div className="p-5 bg-white border border-neutral-200 rounded-2xl flex items-start justify-between">
                    <div>
                      <span className="text-xs text-neutral-400 font-mono font-bold block uppercase tracking-wider">Orders</span>
                      <span className="text-3xl font-bold text-neutral-900 leading-tight mt-1">{vendorOrders.length}</span>
                    </div>
                    <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600"><TrendingUp className="w-5 h-5" /></div>
                  </div>
                </div>

                {/* Products Table */}
                <div className="space-y-4">
                  <h3 className="text-lg font-sans font-semibold text-neutral-900">My Products</h3>
                  {dbProducts.length === 0 ? (
                    <div className="text-center py-10 bg-neutral-50 border border-neutral-100/50 rounded-2xl space-y-3">
                      <p className="text-xs text-neutral-500">You haven't uploaded any products yet.</p>
                      <button
                        onClick={() => setActiveTab("create-product")}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-semibold rounded-xl text-xs cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" /> Add Product
                      </button>
                    </div>
                  ) : (
                    <div className="border border-neutral-200 rounded-2xl bg-white overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-neutral-50 text-[10px] font-mono font-bold uppercase text-neutral-450 border-b border-neutral-150">
                              <th className="p-4">Product</th>
                              <th className="p-4">Category</th>
                              <th className="p-4">Price</th>
                              <th className="p-4">Stock</th>
                              <th className="p-4">Status</th>
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
                                    p.isApproved ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-700 border border-amber-100"
                                  }`}>
                                    {p.isApproved ? "Active" : "Pending"}
                                  </span>
                                </td>
                                <td className="p-4 flex gap-1 justify-center">
                                  <button
                                    onClick={() => handleDeleteListing(p.id)}
                                    className="p-1 text-red-500 hover:bg-neutral-100 rounded-lg cursor-pointer"
                                    title="Delete"
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
              </div>
            )}

            {/* ADMIN OVERVIEW */}
            {user?.role === "ADMIN" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-white border border-neutral-200 rounded-2xl">
                    <span className="text-[10px] text-neutral-400 font-mono font-bold block uppercase tracking-wider">Total Volume</span>
                    <span className="text-2xl font-mono font-bold text-neutral-900 block mt-1">
                      {adminStats?.totalSales?.toLocaleString() || "0"}
                    </span>
                    <span className="text-[10px] text-amber-600 font-bold font-mono">ETB</span>
                  </div>
                  <div className="p-4 bg-white border border-neutral-200 rounded-2xl">
                    <span className="text-[10px] text-neutral-400 font-mono font-bold block uppercase tracking-wider">Listings</span>
                    <span className="text-2xl font-bold text-neutral-900 block mt-1">{adminStats?.totalProducts || "0"}</span>
                  </div>
                  <div className="p-4 bg-white border border-neutral-200 rounded-2xl">
                    <span className="text-[10px] text-neutral-400 font-mono font-bold block uppercase tracking-wider">Vendors</span>
                    <span className="text-2xl font-bold text-neutral-900 block mt-1">{adminStats?.vendorCount || "0"}</span>
                  </div>
                  <div className="p-4 bg-white border border-neutral-200 rounded-2xl">
                    <span className="text-[10px] text-neutral-400 font-mono font-bold block uppercase tracking-wider">Buyers</span>
                    <span className="text-2xl font-bold text-neutral-900 block mt-1">{adminStats?.buyerCount || "0"}</span>
                  </div>
                </div>

                {/* Moderation Panel */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                    <h3 className="text-lg font-sans font-bold text-neutral-900">Moderation Queue</h3>
                  </div>
                  <div className="border border-neutral-200 rounded-2xl bg-white overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-neutral-50 text-[10px] font-mono font-bold uppercase text-neutral-450 border-b border-neutral-150">
                            <th className="p-4">Product</th>
                            <th className="p-4">Vendor</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
                          {dbProducts.map((p) => (
                            <tr key={p.id} className="hover:bg-neutral-50/50">
                              <td className="p-4 font-semibold text-neutral-900">{p.title}</td>
                              <td className="p-4 text-neutral-600">{p.vendorName}</td>
                              <td className="p-4 font-mono">{p.price.toLocaleString()} ETB</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                  p.isApproved ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-700 border border-amber-100"
                                }`}>
                                  {p.isApproved ? "Approved" : "Pending"}
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                {p.isApproved ? (
                                  <button
                                    onClick={() => handleModerateProduct(p.id, false)}
                                    className="px-2.5 py-1 bg-red-50 text-red-600 rounded font-semibold text-[10px] hover:bg-red-100 cursor-pointer border border-red-100"
                                  >
                                    Reject
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

            {/* BUYER OVERVIEW */}
            {user?.role === "BUYER" && (
              <div className="space-y-8">
                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                  <h3 className="font-sans font-bold text-neutral-900 text-base">
                    Welcome back, {user.name}! 👋
                  </h3>
                  <p className="text-neutral-600 text-xs mt-1 leading-relaxed">
                    Manage your orders and conversations from your buyer dashboard.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-sans font-semibold text-neutral-900">My Orders</h3>
                  {buyerOrders.length === 0 ? (
                    <div className="text-center py-10 bg-neutral-50 border border-neutral-100/50 rounded-2xl">
                      <p className="text-xs text-neutral-500">You haven't made any orders yet.</p>
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
                            <span className="text-xs text-neutral-700 block mt-1">
                              Items: {ord.items.map((it) => `${it.title} (x${it.quantity})`).join(", ")}
                            </span>
                            <span className="text-xs text-neutral-500 block">
                              Date: {new Date(ord.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex gap-4 items-center">
                            <div className="text-right">
                              <span className="text-xs font-semibold block text-neutral-900 font-mono">
                                {ord.totalAmount.toLocaleString()} ETB
                              </span>
                              <span className={`px-2.5 py-0.5 rounded text-[9px] uppercase font-bold text-white block mt-1 ${
                                ord.paymentStatus === "PAID" ? "bg-emerald-500" : "bg-rose-500"
                              }`}>
                                {ord.paymentStatus}
                              </span>
                            </div>
                            <div className="text-right leading-none">
                              <span className="text-[10px] text-neutral-400 uppercase font-bold">Status</span>
                              <div className="mt-1">
                                <span className="px-2 py-0.5 bg-neutral-100 text-neutral-800 rounded font-semibold text-[10px]">
                                  {ord.deliveryStatus}
                                </span>
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

        {/* ===== CREATE PRODUCT TAB ===== */}
        {activeTab === "create-product" && user?.role === "VENDOR" && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900">List Your Product</h2>
              <p className="text-neutral-500 text-xs mt-1.5">Add a new product to your inventory</p>
            </div>

            <form onSubmit={handleCreateProductSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">Product Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. iPhone 15 Pro Max"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-neutral-700 text-xs outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-neutral-700 bg-white text-xs outline-none cursor-pointer focus:border-amber-500"
                  >
                    <option value="Phones">Phones</option>
                    <option value="Laptops">Laptops</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Services">Services</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">Price (ETB) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 54000"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-neutral-700 text-xs outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">Stock</label>
                  <input
                    type="number"
                    placeholder="e.g. 5"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-neutral-700 text-xs outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">Condition</label>
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
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Bole, Addis Ababa"
                    value={newLoc}
                    onChange={(e) => setNewLoc(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-neutral-700 text-xs outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newImg}
                  onChange={(e) => setNewImg(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-neutral-700 text-xs outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">Description</label>
                  <button
                    type="button"
                    onClick={handleGeminiAutoWrite}
                    disabled={aiGenerating}
                    className="px-3.5 py-1 text-[11px] font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-neutral-950 rounded-lg flex items-center gap-1.5 hover:shadow transition-shadow cursor-pointer disabled:opacity-50"
                  >
                    {aiGenerating ? (
                      <div className="w-3 h-3 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    AI Write
                  </button>
                </div>
                <textarea
                  placeholder="Describe your product in detail..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={4}
                  className="w-full p-3.5 border border-neutral-200 rounded-xl text-neutral-700 text-xs outline-none focus:border-amber-500 whitespace-pre-wrap font-normal leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-neutral-950 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Publishing..." : "Publish Product"}
              </button>
            </form>
          </div>
        )}

        {/* ===== MESSENGER TAB ===== */}
        {activeTab === "messages" && (
          <div className="grid grid-cols-1 md:grid-cols-3 border border-neutral-200 rounded-2xl bg-white overflow-hidden min-h-[500px]">
            <div className="md:col-span-1 border-r border-neutral-200 divide-y divide-neutral-100 max-h-[550px] overflow-y-auto">
              <div className="p-4 bg-neutral-50/70 border-b border-neutral-100 font-bold text-neutral-900 text-xs font-mono uppercase tracking-wider">
                Conversations
              </div>
              {distinctConversations.length === 0 ? (
                <p className="text-xs text-neutral-400 p-6 text-center">No conversations yet.</p>
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
                        {convo.senderName.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-grow">
                        <h4 className="font-semibold text-neutral-900 text-xs truncate">{convo.senderName}</h4>
                        <p className="text-[10px] text-neutral-450 truncate">{convo.text}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="md:col-span-2 flex flex-col justify-between max-h-[550px]">
              {selectedConvoUserId ? (
                <>
                  <div className="p-4 border-b border-neutral-200 bg-neutral-50/50 flex justify-between items-center text-xs shrink-0">
                    <div>
                      <span className="font-semibold text-neutral-900 block">{selectedConvoUserName}</span>
                      <span className="text-[10px] text-amber-600 block">Active conversation</span>
                    </div>
                  </div>

                  <div className="p-4 flex-grow overflow-y-auto space-y-3.5 bg-neutral-50/30 max-h-[380px]">
                    {convoMessages.length === 0 ? (
                      <p className="text-center text-xs text-neutral-400 py-10">No messages yet. Start the conversation!</p>
                    ) : (
                      convoMessages.map((msg) => {
                        const isMe = msg.senderId === user?.id;
                        return (
                          <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className={`p-3 max-w-xs rounded-2xl text-xs leading-normal ${
                              isMe
                                ? "bg-neutral-950 text-white rounded-br-none"
                                : "bg-white text-neutral-800 border border-neutral-150 rounded-bl-none"
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <form onSubmit={handleSendTextMessage} className="p-3 border-t border-neutral-200 flex gap-2 shrink-0">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-grow px-3 py-2 border border-neutral-200 rounded-xl text-xs outline-none focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold rounded-xl cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 space-y-3 text-neutral-400">
                  <MessageSquare className="w-12 h-12 text-neutral-300" />
                  <p className="text-xs">Select a conversation to start messaging</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== PROFILE TAB ===== */}
        {activeTab === "profile" && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-6 max-w-lg mx-auto">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Profile</h2>
              <p className="text-neutral-500 text-xs mt-1.5">Manage your account details</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="p-4 bg-neutral-50 rounded-xl space-y-2 border border-neutral-100 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className="font-mono text-neutral-900">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Role:</span>
                  <span className="font-bold text-amber-600 font-mono tracking-wider">{user?.role}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">Full Name</label>
                <input
                  type="text"
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-neutral-700 text-xs outline-none focus:border-amber-500 bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Bole, Addis Ababa"
                  value={profLocation}
                  onChange={(e) => setProfLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-neutral-700 text-xs outline-none focus:border-amber-500 bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">Phone</label>
                <input
                  type="tel"
                  placeholder="e.g. +251 9....."
                  value={profPhone}
                  onChange={(e) => setProfPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-xl text-neutral-700 text-xs outline-none focus:border-amber-500 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={profSaving}
                className="w-full py-3 bg-neutral-950 hover:bg-neutral-800 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {profSaving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, Package, ShoppingBag, DollarSign, Clock, 
  CheckCircle2, AlertCircle, Trash2, Edit3, Eye, ArrowLeft, 
  Search, RefreshCw, X, ChevronRight, Lock, UserCheck, 
  Filter, Check, AlertTriangle, ExternalLink, Activity, ArrowUpRight
} from "lucide-react";
import { useMarketStore } from "../store";
import { Product, Order } from "../types";

interface OverviewMetrics {
  totalProducts: number;
  postedToday: number;
  activeProducts: number;
  soldProducts: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSales: number;
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  type: "PRODUCT_POSTED" | "PRODUCT_SOLD" | "NEW_ORDER" | "ORDER_STATUS" | "ORDER_COMPLETED" | "PRODUCT_REMOVED";
  title: string;
  description: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const { user, token, setUser, setCurrentPage, addNotification } = useMarketStore();

  const [activeTab, setActiveTab] = useState<"overview" | "listings" | "orders" | "activity">("overview");

  // Overview metrics state
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Listings state
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productStatusFilter, setProductStatusFilter] = useState<"ALL" | "ACTIVE" | "SOLD">("ALL");

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");

  // Edit Product Modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Update Order Status Modal state
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [orderDeliveryStatus, setOrderDeliveryStatus] = useState<"PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED">("PENDING");
  const [orderPaymentStatus, setOrderPaymentStatus] = useState<"PENDING" | "PAID" | "FAILED">("PENDING");
  const [orderSaving, setOrderSaving] = useState(false);

  // In-app Delete Confirmation state (no window.confirm)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Admin login credentials state (if not logged in as admin)
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const isAdmin = user && user.role === "ADMIN";

  // Auth headers for backend API calls
  const getAuthHeaders = () => {
    return {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : `Bearer simulated-jwt-for-${user?.id}`,
      "x-user-id": user?.id || "",
    };
  };

  // Fetch overview metrics
  const fetchOverview = async () => {
    if (!isAdmin) return;
    try {
      setMetricsLoading(true);
      const res = await fetch("/api/admin/overview", {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setMetrics(data.data);
      } else {
        addNotification(data.error || "Failed to load admin overview");
      }
    } catch (err) {
      console.error(err);
      addNotification("Could not connect to admin metrics service");
    } finally {
      setMetricsLoading(false);
    }
  };

  // Fetch listings
  const fetchProducts = async () => {
    if (!isAdmin) return;
    try {
      setProductsLoading(true);
      const queryParams = new URLSearchParams();
      if (productSearch) queryParams.set("search", productSearch);
      if (productStatusFilter !== "ALL") queryParams.set("status", productStatusFilter);

      const res = await fetch(`/api/admin/products?${queryParams.toString()}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProductsLoading(false);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    if (!isAdmin) return;
    try {
      setOrdersLoading(true);
      const queryParams = new URLSearchParams();
      if (orderStatusFilter !== "ALL") queryParams.set("status", orderStatusFilter);

      const res = await fetch(`/api/admin/orders?${queryParams.toString()}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchOverview();
      fetchProducts();
      fetchOrders();
    }
  }, [user]);

  // Handle direct login from restricted access gate
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.data.user.role !== "ADMIN") {
          setLoginError("This account does not have administrator privileges.");
          return;
        }
        setUser(data.data.user, data.data.token);
        addNotification(`Welcome back, ${data.data.user.name}`);
      } else {
        setLoginError(data.error || "Invalid email or password");
      }
    } catch (err) {
      setLoginError("Could not reach server. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Toggle Sold status
  const handleToggleSold = async (productId: string) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/toggle-sold`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? data.data : p))
        );
        addNotification(`Updated status for "${data.data.title}"`);
        fetchOverview();
      } else {
        addNotification(data.error || "Failed to update sold status");
      }
    } catch (err) {
      addNotification("Error updating status");
    }
  };

  // Delete product - open confirmation modal
  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
  };

  // Confirm delete product
  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      setDeleteLoading(true);
      const res = await fetch(`/api/admin/products/${productToDelete.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
        addNotification(`Removed "${productToDelete.title}" from marketplace`);
        fetchOverview();
        setProductToDelete(null);
      } else {
        addNotification(data.error || "Could not delete product");
      }
    } catch (err) {
      addNotification("Error removing product");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Open edit modal
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setEditTitle(product.title);
    setEditPrice(product.price.toString());
    setEditCategory(product.category);
    setEditLocation(product.location);
    setEditStock(product.stock.toString());
  };

  // Submit edit product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      setEditSaving(true);
      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: editTitle,
          price: editPrice,
          category: editCategory,
          location: editLocation,
          stock: editStock,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? data.data : p))
        );
        setEditingProduct(null);
        addNotification(`Updated "${data.data.title}"`);
        fetchOverview();
      } else {
        addNotification(data.error || "Failed to save product changes");
      }
    } catch (err) {
      addNotification("Error saving product changes");
    } finally {
      setEditSaving(false);
    }
  };

  // Open order status modal
  const handleOpenOrderStatus = (order: Order) => {
    setEditingOrder(order);
    setOrderDeliveryStatus(order.deliveryStatus);
    setOrderPaymentStatus(order.paymentStatus);
  };

  // Submit order status change
  const handleSaveOrderStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    try {
      setOrderSaving(true);
      const res = await fetch(`/api/admin/orders/${editingOrder.id}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          deliveryStatus: orderDeliveryStatus,
          paymentStatus: orderPaymentStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === editingOrder.id ? data.data : o))
        );
        setEditingOrder(null);
        addNotification(`Order #${editingOrder.id.slice(-6)} updated`);
        fetchOverview();
      } else {
        addNotification(data.error || "Failed to update order status");
      }
    } catch (err) {
      addNotification("Error updating order status");
    } finally {
      setOrderSaving(false);
    }
  };

  // =========================================================================
  // VIEW: ACCESS RESTRICTED SCREEN (If not logged in as Admin)
  // =========================================================================
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-8 sm:py-16 px-4 space-y-6">
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 text-center">
          <div className="w-14 h-14 bg-amber-50 border border-amber-200/60 rounded-2xl flex items-center justify-center text-amber-600 mx-auto">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
              Private Owner Portal
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-xs mx-auto">
              This dashboard is private and accessible only to the marketplace administrator.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Regular Login Form */}
          <form onSubmit={handleAdminLogin} className="space-y-3.5 text-left">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@ethio.com"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full min-h-[44px] py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {loginLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Sign In to Admin Portal</span>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-neutral-100">
            <button
              onClick={() => setCurrentPage("home")}
              className="w-full text-xs text-neutral-500 hover:text-neutral-900 py-2 cursor-pointer transition-colors"
            >
              ← Back to Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: MAIN PRIVATE ADMIN DASHBOARD
  // =========================================================================
  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-7xl mx-auto px-1 sm:px-2">
      {/* 1. Header Bar */}
      <div className="bg-neutral-950 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Owner Portal
            </span>
            <span className="text-xs text-neutral-400">Addis Ababa, Ethiopia</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
            Marketplace Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300">
            Real-time listings, orders, and sales activity across EthioMarket.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => {
              fetchOverview();
              fetchProducts();
              fetchOrders();
              addNotification("Refreshed marketplace data");
            }}
            className="min-h-[40px] px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh Real Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setCurrentPage("marketplace")}
            className="min-h-[40px] px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>View Public Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Navigation Tabs (Responsive & Touch Friendly) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-neutral-200 pb-2">
        {[
          { id: "overview", label: "Overview", icon: Package },
          { id: "listings", label: `Listings (${products.length || metrics?.totalProducts || 0})`, icon: ShoppingBag },
          { id: "orders", label: `Orders (${orders.length || metrics?.totalOrders || 0})`, icon: Clock },
          { id: "activity", label: "Recent Activity", icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap flex items-center gap-2 cursor-pointer transition-all shrink-0 ${
                isActive
                  ? "bg-neutral-950 text-white shadow-sm"
                  : "bg-white text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950 border border-neutral-200/80"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TAB VIEW: OVERVIEW METRICS */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Numbers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {/* Total Listings */}
            <div className="p-4 sm:p-5 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-1">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider font-mono">
                  Total Listings
                </span>
                <div className="p-2 bg-neutral-100 rounded-xl text-neutral-700">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold font-mono text-neutral-950">
                {metricsLoading ? "..." : metrics?.totalProducts || 0}
              </div>
              <p className="text-[10px] sm:text-xs text-neutral-400">
                Across all Ethiopian categories
              </p>
            </div>

            {/* Posted Today */}
            <div className="p-4 sm:p-5 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-1">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider font-mono">
                  Posted Today
                </span>
                <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold font-mono text-neutral-950">
                {metricsLoading ? "..." : metrics?.postedToday || 0}
              </div>
              <p className="text-[10px] sm:text-xs text-emerald-600 font-medium">
                New listings in last 24h
              </p>
            </div>

            {/* Active Products */}
            <div className="p-4 sm:p-5 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-1">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider font-mono">
                  Active (In Stock)
                </span>
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold font-mono text-emerald-700">
                {metricsLoading ? "..." : metrics?.activeProducts || 0}
              </div>
              <p className="text-[10px] sm:text-xs text-neutral-400">
                Ready for buyer checkout
              </p>
            </div>

            {/* Sold Products */}
            <div className="p-4 sm:p-5 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-1">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider font-mono">
                  Sold Out
                </span>
                <div className="p-2 bg-neutral-100 rounded-xl text-neutral-600">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold font-mono text-neutral-700">
                {metricsLoading ? "..." : metrics?.soldProducts || 0}
              </div>
              <p className="text-[10px] sm:text-xs text-neutral-400">
                Items completed or out of stock
              </p>
            </div>

            {/* Total Orders */}
            <div className="p-4 sm:p-5 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-1">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider font-mono">
                  Total Orders
                </span>
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold font-mono text-neutral-950">
                {metricsLoading ? "..." : metrics?.totalOrders || 0}
              </div>
              <p className="text-[10px] sm:text-xs text-neutral-400">
                Total marketplace transactions
              </p>
            </div>

            {/* Pending Orders */}
            <div className="p-4 sm:p-5 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-1">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider font-mono">
                  Pending Orders
                </span>
                <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold font-mono text-amber-600">
                {metricsLoading ? "..." : metrics?.pendingOrders || 0}
              </div>
              <p className="text-[10px] sm:text-xs text-amber-700 font-medium">
                Needs delivery or payment attention
              </p>
            </div>

            {/* Completed Orders */}
            <div className="p-4 sm:p-5 bg-white border border-neutral-200 rounded-2xl shadow-xs space-y-1">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider font-mono">
                  Completed Orders
                </span>
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold font-mono text-emerald-600">
                {metricsLoading ? "..." : metrics?.completedOrders || 0}
              </div>
              <p className="text-[10px] sm:text-xs text-neutral-400">
                Delivered and paid
              </p>
            </div>

            {/* Total Sales / Revenue */}
            <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 rounded-2xl shadow-xs space-y-1">
              <div className="flex items-center justify-between text-amber-900">
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider font-mono">
                  Total Revenue
                </span>
                <div className="p-2 bg-amber-500 text-neutral-950 font-bold rounded-xl">
                  ETB
                </div>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold font-mono text-amber-950">
                {metricsLoading ? "..." : (metrics?.totalSales || 0).toLocaleString()}
              </div>
              <p className="text-[10px] sm:text-xs text-amber-800 font-medium">
                From completed Telebirr & Chapa orders
              </p>
            </div>
          </div>

          {/* Quick Dual Columns: Recent Listings & Recent Orders Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Listings Preview */}
            <div className="p-4 sm:p-6 bg-white border border-neutral-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-neutral-900">
                    Recent Selling Activity
                  </h3>
                  <p className="text-xs text-neutral-500">Fresh listings posted by sellers</p>
                </div>
                <button
                  onClick={() => setActiveTab("listings")}
                  className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>View all</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {products.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-neutral-50/80 hover:bg-neutral-50 rounded-xl border border-neutral-150 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="w-10 h-10 object-cover rounded-lg shrink-0 border border-neutral-200"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-neutral-900 truncate">
                          {p.title}
                        </p>
                        <p className="text-[11px] text-neutral-500 truncate">
                          {p.category} • {p.vendorName} • {p.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold font-mono text-neutral-950 block">
                        {p.price.toLocaleString()} ETB
                      </span>
                      <span className={`text-[10px] font-mono uppercase font-semibold ${
                        p.stock > 0 ? "text-emerald-600" : "text-neutral-400"
                      }`}>
                        {p.stock > 0 ? "Active" : "Sold"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Orders Preview */}
            <div className="p-4 sm:p-6 bg-white border border-neutral-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-neutral-900">
                    Recent Buyer Orders
                  </h3>
                  <p className="text-xs text-neutral-500">Purchases requiring coordination</p>
                </div>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>View all</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {orders.length === 0 ? (
                  <p className="text-xs text-neutral-400 py-4 text-center">No orders recorded yet.</p>
                ) : (
                  orders.slice(0, 4).map((o) => (
                    <div
                      key={o.id}
                      className="p-3 bg-neutral-50/80 hover:bg-neutral-50 rounded-xl border border-neutral-150 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono text-neutral-900">
                            #{o.id.slice(-6)}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                            o.deliveryStatus === "DELIVERED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {o.deliveryStatus}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                          {o.buyerName} • {o.items.length} item(s) • {o.paymentMethod}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold font-mono text-neutral-950 block">
                          {o.totalAmount.toLocaleString()} ETB
                        </span>
                        <span className={`text-[10px] font-mono ${
                          o.paymentStatus === "PAID" ? "text-emerald-600" : "text-amber-600"
                        }`}>
                          {o.paymentStatus}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB VIEW: SELLING ACTIVITY (LISTINGS TABLE / CARDS) */}
      {activeTab === "listings" && (
        <div className="space-y-4 bg-white border border-neutral-200 rounded-2xl p-4 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                Selling Activity & Product Catalog
              </h2>
              <p className="text-xs text-neutral-500">
                Manage, inspect, edit, or mark products as sold out across the marketplace.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-grow sm:w-64">
                <input
                  type="text"
                  placeholder="Search listings..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchProducts()}
                  className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:border-amber-500"
                />
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
              </div>

              <select
                value={productStatusFilter}
                onChange={(e) => {
                  setProductStatusFilter(e.target.value as any);
                  setTimeout(fetchProducts, 50);
                }}
                className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active (In Stock)</option>
                <option value="SOLD">Sold Out</option>
              </select>

              <button
                onClick={fetchProducts}
                className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-neutral-700 transition-colors cursor-pointer"
                title="Search"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {productsLoading ? (
            <div className="py-12 text-center text-xs text-neutral-400">
              Loading marketplace listings...
            </div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-sm font-semibold text-neutral-700">No products match your filter.</p>
              <button
                onClick={() => {
                  setProductSearch("");
                  setProductStatusFilter("ALL");
                  setTimeout(fetchProducts, 50);
                }}
                className="text-xs text-amber-600 font-semibold cursor-pointer underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Desktop Table View (hidden on small mobile) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-700">
                  <thead className="bg-neutral-50 text-neutral-500 font-mono uppercase text-[10px] border-b border-neutral-150">
                    <tr>
                      <th className="py-3 px-3">Product</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Price</th>
                      <th className="py-3 px-3">Seller</th>
                      <th className="py-3 px-3">Location</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-neutral-50/60 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5 max-w-xs">
                            <img
                              src={p.images[0]}
                              alt={p.title}
                              className="w-9 h-9 object-cover rounded-lg border border-neutral-200 shrink-0"
                            />
                            <span className="font-semibold text-neutral-900 truncate">
                              {p.title}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">{p.category}</td>
                        <td className="py-3 px-3 font-mono font-bold whitespace-nowrap">
                          {p.price.toLocaleString()} ETB
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-neutral-600">{p.vendorName}</td>
                        <td className="py-3 px-3 whitespace-nowrap text-neutral-500">{p.location.split(",")[0]}</td>
                        <td className="py-3 px-3 whitespace-nowrap text-neutral-400 font-mono text-[11px]">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                            p.stock > 0
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                          }`}>
                            {p.stock > 0 ? "Active" : "Sold"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setCurrentPage("product-details", p.id)}
                              className="p-1.5 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-950 rounded-lg transition-colors cursor-pointer"
                              title="View Public Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-950 rounded-lg transition-colors cursor-pointer"
                              title="Edit Listing"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleSold(p.id)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-semibold cursor-pointer transition-colors ${
                                p.stock > 0
                                  ? "bg-neutral-100 hover:bg-amber-100 text-neutral-800"
                                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800"
                              }`}
                              title={p.stock > 0 ? "Mark as Sold" : "Mark as Active"}
                            >
                              {p.stock > 0 ? "Mark Sold" : "Reactivate"}
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p)}
                              className="p-1.5 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                              title="Remove Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List (optimized for <= 768px screens) */}
              <div className="md:hidden space-y-3">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="w-14 h-14 object-cover rounded-xl border border-neutral-200 shrink-0"
                      />
                      <div className="min-w-0 flex-grow">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                            p.stock > 0 ? "bg-emerald-100 text-emerald-800" : "bg-neutral-200 text-neutral-700"
                          }`}>
                            {p.stock > 0 ? "In Stock" : "Sold Out"}
                          </span>
                          <span className="text-xs font-bold font-mono text-neutral-950">
                            {p.price.toLocaleString()} ETB
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-neutral-900 truncate mt-1">
                          {p.title}
                        </h4>
                        <p className="text-[11px] text-neutral-500">
                          {p.category} • {p.vendorName}
                        </p>
                        <p className="text-[10px] text-neutral-400">
                          {p.location} • {new Date(p.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons on mobile */}
                    <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-neutral-200/60 text-xs">
                      <button
                        onClick={() => setCurrentPage("product-details", p.id)}
                        className="min-h-[38px] px-2 py-1.5 bg-white border border-neutral-200 rounded-xl text-neutral-700 font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="min-h-[38px] px-2 py-1.5 bg-white border border-neutral-200 rounded-xl text-neutral-700 font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleToggleSold(p.id)}
                        className={`min-h-[38px] px-2 py-1.5 rounded-xl font-semibold flex items-center justify-center text-[11px] cursor-pointer ${
                          p.stock > 0 ? "bg-neutral-200 text-neutral-800" : "bg-emerald-600 text-white"
                        }`}
                      >
                        {p.stock > 0 ? "Sold" : "Active"}
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p)}
                        className="min-h-[38px] px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. TAB VIEW: BUYING & ORDERS (ORDERS TABLE / CARDS) */}
      {activeTab === "orders" && (
        <div className="space-y-4 bg-white border border-neutral-200 rounded-2xl p-4 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                Buying & Orders Management
              </h2>
              <p className="text-xs text-neutral-500">
                Monitor customer orders, review payment methods, and update delivery states.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 font-medium hidden sm:inline">Status:</span>
              <select
                value={orderStatusFilter}
                onChange={(e) => {
                  setOrderStatusFilter(e.target.value);
                  setTimeout(fetchOrders, 50);
                }}
                className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none cursor-pointer"
              >
                <option value="ALL">All Orders</option>
                <option value="PENDING">Pending Delivery</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <button
                onClick={fetchOrders}
                className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-neutral-700 transition-colors cursor-pointer"
                title="Refresh Orders"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {ordersLoading ? (
            <div className="py-12 text-center text-xs text-neutral-400">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-sm font-semibold text-neutral-700">No orders found.</p>
              <button
                onClick={() => {
                  setOrderStatusFilter("ALL");
                  setTimeout(fetchOrders, 50);
                }}
                className="text-xs text-amber-600 font-semibold cursor-pointer underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Desktop Orders Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-700">
                  <thead className="bg-neutral-50 text-neutral-500 font-mono uppercase text-[10px] border-b border-neutral-150">
                    <tr>
                      <th className="py-3 px-3">Order ID</th>
                      <th className="py-3 px-3">Buyer</th>
                      <th className="py-3 px-3">Items</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3">Gateway</th>
                      <th className="py-3 px-3">Delivery Status</th>
                      <th className="py-3 px-3">Payment</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3 text-right">Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-neutral-50/60 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-neutral-900">
                          #{o.id.slice(-6)}
                        </td>
                        <td className="py-3 px-3 font-semibold text-neutral-900">{o.buyerName}</td>
                        <td className="py-3 px-3 max-w-xs truncate text-neutral-600">
                          {o.items.map((it) => `${it.title} (${it.quantity}x)`).join(", ")}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-neutral-950 whitespace-nowrap">
                          {o.totalAmount.toLocaleString()} ETB
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-neutral-100 text-neutral-800 rounded text-[10px] font-mono uppercase">
                            {o.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            o.deliveryStatus === "DELIVERED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : o.deliveryStatus === "SHIPPED"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : o.deliveryStatus === "CANCELLED"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {o.deliveryStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`text-[11px] font-mono font-semibold ${
                            o.paymentStatus === "PAID" ? "text-emerald-600" : "text-amber-600"
                          }`}>
                            {o.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-neutral-400 font-mono text-[11px]">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleOpenOrderStatus(o)}
                            className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards for Orders (<= 768px) */}
              <div className="md:hidden space-y-3">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-neutral-900">
                        Order #{o.id.slice(-6)}
                      </span>
                      <span className="font-mono font-bold text-xs text-neutral-950">
                        {o.totalAmount.toLocaleString()} ETB
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p className="text-neutral-700 font-medium">Buyer: {o.buyerName}</p>
                      <p className="text-neutral-500 text-[11px]">
                        Items: {o.items.map((it) => `${it.title} (x${it.quantity})`).join(", ")}
                      </p>
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <span className="px-2 py-0.5 bg-neutral-200 text-neutral-800 rounded text-[9px] font-mono uppercase">
                          {o.paymentMethod}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                          o.deliveryStatus === "DELIVERED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          Delivery: {o.deliveryStatus}
                        </span>
                        <span className={`text-[10px] font-mono font-semibold ${
                          o.paymentStatus === "PAID" ? "text-emerald-700" : "text-amber-700"
                        }`}>
                          Payment: {o.paymentStatus}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between">
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleOpenOrderStatus(o)}
                        className="min-h-[38px] px-4 py-1.5 bg-neutral-950 text-white rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Update Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. TAB VIEW: RECENT MARKETPLACE ACTIVITY LOG */}
      {activeTab === "activity" && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-neutral-100 pb-3">
            <h2 className="text-base sm:text-lg font-bold text-neutral-900">
              Recent Marketplace Activity Log
            </h2>
            <p className="text-xs text-neutral-500">
              Only real events recorded in the marketplace database.
            </p>
          </div>

          {metricsLoading ? (
            <div className="py-12 text-center text-xs text-neutral-400">Loading activity feed...</div>
          ) : !metrics?.recentActivity || metrics.recentActivity.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400">No activity recorded yet.</div>
          ) : (
            <div className="space-y-3">
              {metrics.recentActivity.map((act) => {
                let badgeColor = "bg-neutral-100 text-neutral-700";
                if (act.type === "PRODUCT_POSTED") badgeColor = "bg-emerald-50 text-emerald-800 border-emerald-200";
                if (act.type === "PRODUCT_SOLD") badgeColor = "bg-amber-50 text-amber-800 border-amber-200";
                if (act.type === "NEW_ORDER") badgeColor = "bg-blue-50 text-blue-800 border-blue-200";
                if (act.type === "ORDER_COMPLETED") badgeColor = "bg-emerald-100 text-emerald-900 border-emerald-300";
                if (act.type === "PRODUCT_REMOVED") badgeColor = "bg-red-50 text-red-800 border-red-200";

                return (
                  <div
                    key={act.id}
                    className="p-3.5 sm:p-4 bg-neutral-50/70 rounded-xl border border-neutral-150 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${badgeColor}`}>
                          {act.type.replace(/_/g, " ")}
                        </span>
                        <h4 className="text-xs sm:text-sm font-semibold text-neutral-900">
                          {act.title}
                        </h4>
                      </div>
                      <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                        {act.description}
                      </p>
                    </div>

                    <span className="text-[10px] sm:text-xs text-neutral-400 font-mono shrink-0 whitespace-nowrap">
                      {new Date(act.timestamp).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT PRODUCT DETAILS
          ========================================================================= */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full space-y-4 shadow-2xl border border-neutral-200"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="text-base font-bold text-neutral-900">Edit Product Listing</h3>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs text-left">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Price in ETB</label>
                    <input
                      type="number"
                      required
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Stock Quantity (0 = Sold Out)</label>
                    <input
                      type="number"
                      required
                      value={editStock}
                      onChange={(e) => setEditStock(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Category</label>
                    <input
                      type="text"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-xl outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSaving}
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {editSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL: UPDATE ORDER STATUS
          ========================================================================= */}
      <AnimatePresence>
        {editingOrder && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full space-y-4 shadow-2xl border border-neutral-200 text-left"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-neutral-900">
                    Update Order #{editingOrder.id.slice(-6)}
                  </h3>
                  <p className="text-xs text-neutral-500">Buyer: {editingOrder.buyerName}</p>
                </div>
                <button
                  onClick={() => setEditingOrder(null)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveOrderStatus} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1.5">
                    Delivery Status
                  </label>
                  <select
                    value={orderDeliveryStatus}
                    onChange={(e) => setOrderDeliveryStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-amber-500 text-xs"
                  >
                    <option value="PENDING">PENDING - Awaiting shipment</option>
                    <option value="SHIPPED">SHIPPED - En route with courier</option>
                    <option value="DELIVERED">DELIVERED - Successfully received</option>
                    <option value="CANCELLED">CANCELLED - Order voided</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1.5">
                    Payment Status
                  </label>
                  <select
                    value={orderPaymentStatus}
                    onChange={(e) => setOrderPaymentStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:border-amber-500 text-xs"
                  >
                    <option value="PAID">PAID - Funds received</option>
                    <option value="PENDING">PENDING - Payment awaiting verification</option>
                    <option value="FAILED">FAILED - Transaction aborted</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingOrder(null)}
                    className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={orderSaving}
                    className="flex-1 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white font-semibold rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {orderSaving ? "Updating..." : "Update Status"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL: CONFIRM DELETE PRODUCT
          ========================================================================= */}
      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-5 sm:p-6 max-w-sm w-full space-y-4 shadow-2xl border border-neutral-200 text-left"
            >
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto sm:mx-0">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-neutral-900">Remove Listing?</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Are you sure you want to permanently remove <strong>"{productToDelete.title}"</strong> from the marketplace? This cannot be undone.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={() => setProductToDelete(null)}
                  className="flex-1 min-h-[42px] py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={confirmDeleteProduct}
                  className="flex-1 min-h-[42px] py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                >
                  {deleteLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Remove Listing</span>
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

import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { mysqlDb } from "./src/server/mysql";
import { User, Product, Order, Message, Review } from "./src/server/db";
import { GoogleGenAI } from "@google/genai";
import { searchAndRankProducts, parseSearchIntent } from "./src/utils/search";

// ==========================================
// SECURITY & PASSWORD HASHING UTILITIES
// ==========================================
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.createHmac("sha256", salt).update(password).digest("hex");
  return `sha256$${salt}$${hash}`;
}

export function verifyPassword(plainPassword: string, storedHash: string): boolean {
  if (!plainPassword || !storedHash) return false;
  if (storedHash.startsWith("sha256$")) {
    const parts = storedHash.split("$");
    if (parts.length === 3) {
      const salt = parts[1];
      const expectedHash = parts[2];
      const actualHash = crypto.createHmac("sha256", salt).update(plainPassword).digest("hex");
      try {
        return crypto.timingSafeEqual(Buffer.from(actualHash, "hex"), Buffer.from(expectedHash, "hex"));
      } catch {
        return false;
      }
    }
  }
  // Constant-time check fallback for legacy plaintext entries during migration
  try {
    const a = Buffer.from(plainPassword);
    const b = Buffer.from(storedHash);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return plainPassword === storedHash;
  }
}

// Initialize Gemini client lazily
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!ai && process.env.GEMINI_API_KEY) {
    try {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (e) {
      console.error("Failed to initialize Gemini Client with GEMINI_API_KEY:", e);
    }
  }
  return ai;
}

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Helper: Simple API response formatters
const success = (res: express.Response, data: any, status = 200) => {
  return res.status(status).json({ success: true, data });
};
const error = (res: express.Response, message: string, status = 400) => {
  return res.status(status).json({ success: false, error: message });
};

async function withTimeout<T>(promise: Promise<T>, ms = 6000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
    ),
  ]);
}

// ==========================================
// 1. AUTHENTICATION ENDPOINTS (MySQL)
// ==========================================

// Register
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, role, phone, location } = req.body;
  if (!name || !email || !password) {
    return error(res, "Please provide complete details: name, email, password");
  }

  const users = await mysqlDb.getUsers();
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return error(res, "Account with this email already exists");
  }

  const roleValue = (role === "VENDOR" || role === "ADMIN") ? role : "BUYER";
  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    email,
    passwordHash: hashPassword(password),
    role: roleValue,
    profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    phone: phone || "+251900000000",
    location: location || "Addis Ababa, Ethiopia",
    isVerified: roleValue === "VENDOR" ? false : true,
    createdAt: new Date().toISOString(),
  };

  await mysqlDb.saveUser(newUser);

  // Return simulated JWT token
  const token = `simulated-jwt-for-${newUser.id}`;
  return success(res, { user: newUser, token });
});

// Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return error(res, "Email and password are required");
  }

  const users = await mysqlDb.getUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && verifyPassword(password, u.passwordHash)
  );

  if (!user) {
    return error(res, "Invalid email or password", 401);
  }

  const token = `simulated-jwt-for-${user.id}`;
  return success(res, { user, token });
});

// Profile Management
app.put("/api/auth/profile", async (req, res) => {
  const { userId, name, location, phone, profileImage } = req.body;
  const users = await mysqlDb.getUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) {
    return error(res, "User not found", 404);
  }

  if (name) user.name = name;
  if (location) user.location = location;
  if (phone) user.phone = phone;
  if (profileImage) user.profileImage = profileImage;

  await mysqlDb.saveUser(user);
  return success(res, user);
});


// ==========================================
// 2. PRODUCT MARKETPLACE ENDPOINTS (MySQL)
// ==========================================

// Get All (Filterable & Searchable with Smart Relevance Ranking)
app.get("/api/products", async (req, res) => {
  try {
    const { category, search, condition, minPrice, maxPrice, sortBy, vendorId, location } = req.query;
    const allProducts = await mysqlDb.getProducts();

    const minP = minPrice ? parseFloat(minPrice as string) : undefined;
    const maxP = maxPrice ? parseFloat(maxPrice as string) : undefined;

    // Use smart search and ranking engine
    let list = searchAndRankProducts(allProducts, (search as string) || "", {
      category: category as string,
      condition: condition as string,
      location: location as string,
      minPrice: isNaN(minP as number) ? undefined : minP,
      maxPrice: isNaN(maxP as number) ? undefined : maxP,
    });

    if (vendorId) {
      list = list.filter((p) => p.vendorId === vendorId);
    }

    // Explicit sorting options (if search is active, default order is relevance-ranked)
    if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "price_asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "popularity") {
      list.sort((a, b) => b.rating - a.rating);
    }

    return success(res, list);
  } catch (err: any) {
    console.error("Products query error:", err);
    return error(res, "Could not fetch products. Please try again.", 500);
  }
});

// Get Single details
app.get("/api/products/:id", async (req, res) => {
  try {
    const products = await mysqlDb.getProducts();
    const prod = products.find((p) => p.id === req.params.id);
    if (!prod) {
      return error(res, "Product not found", 404);
    }
    return success(res, prod);
  } catch (err: any) {
    return error(res, "Failed to load product details", 500);
  }
});

// Create product (Vendor)
app.post("/api/products", async (req, res) => {
  try {
    const { title, description, price, condition, category, images, stock, location, vendorId, vendorName } = req.body;

    if (!title || typeof title !== "string" || title.trim().length < 2) {
      return error(res, "Please provide a valid product title (at least 2 characters)");
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return error(res, "Please provide a valid price greater than 0 ETB");
    }
    if (!category) {
      return error(res, "Category is required");
    }
    if (!vendorId) {
      return error(res, "Vendor context is required");
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      title: title.trim(),
      description: description?.trim() || "Quality product listed on EthioMarket.",
      price: numPrice,
      condition: condition === "USED" || condition === "REFURBISHED" ? condition : "NEW",
      category: category.trim(),
      images: Array.isArray(images) && images.length > 0 ? images : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"],
      stock: parseInt(stock) > 0 ? parseInt(stock) : 1,
      location: location?.trim() || "Addis Ababa, Ethiopia",
      rating: 0,
      isApproved: true,
      isFeatured: false,
      vendorId,
      vendorName: vendorName || "Local Merchant",
      createdAt: new Date().toISOString(),
    };

    await mysqlDb.saveProduct(newProduct);
    return success(res, newProduct, 201);
  } catch (err: any) {
    console.error("Create product error:", err);
    return error(res, "Could not create product. Please try again.", 500);
  }
});

// Edit product (Vendor)
app.put("/api/products/:id", async (req, res) => {
  const products = await mysqlDb.getProducts();
  const prod = products.find((p) => p.id === req.params.id);
  if (!prod) {
    return error(res, "Product not found", 404);
  }

  const { title, description, price, condition, category, images, stock, location, isApproved, isFeatured } = req.body;

  if (title) prod.title = title;
  if (description) prod.description = description;
  if (price) prod.price = parseFloat(price);
  if (condition) prod.condition = condition;
  if (category) prod.category = category;
  if (images) prod.images = images;
  if (stock) prod.stock = parseInt(stock);
  if (location) prod.location = location;
  if (isApproved !== undefined) prod.isApproved = isApproved;
  if (isFeatured !== undefined) prod.isFeatured = isFeatured;

  await mysqlDb.saveProduct(prod);
  return success(res, prod);
});

// Delete product
app.delete("/api/products/:id", async (req, res) => {
  const deleted = await mysqlDb.deleteProduct(req.params.id);
  if (!deleted) {
    return error(res, "Product not found or delete failed", 404);
  }
  return success(res, { id: req.params.id });
});


// ==========================================
// 3. MESSAGING ENDPOINTS (MySQL)
// ==========================================

// Send message
app.post("/api/messages", async (req, res) => {
  const { text, senderId, receiverId, senderName, receiverName, productId, productTitle } = req.body;
  if (!text || !senderId || !receiverId) {
    return error(res, "Missing message content, sender ID, or receiver ID");
  }

  const newMsg: Message = {
    id: `msg-${Date.now()}`,
    text,
    senderId,
    receiverId,
    senderName: senderName || "Buyer",
    receiverName: receiverName || "Seller",
    productId,
    productTitle,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  await mysqlDb.saveMessage(newMsg);
  return success(res, newMsg);
});

// Get conversations & chats for a user
app.get("/api/messages/user/:userId", async (req, res) => {
  const { userId } = req.params;
  const messages = await mysqlDb.getMessages();
  const list = messages.filter(
    (m) => m.senderId === userId || m.receiverId === userId
  );
  return success(res, list);
});

// Mark messages as read
app.post("/api/messages/read", async (req, res) => {
  const { senderId, receiverId } = req.body;
  if (senderId && receiverId) {
    await mysqlDb.markMessagesAsRead(senderId, receiverId);
  }
  return success(res, { status: "marked" });
});


// ==========================================
// 4. ORDER & CHECKOUT ENDPOINTS (CHAPA/TELEBIRR) (MySQL)
// ==========================================

// Create checkout orders
app.post("/api/orders", async (req, res) => {
  const { buyerId, buyerName, items, totalAmount, paymentMethod } = req.body;
  if (!buyerId || !items || !items.length || !totalAmount) {
    return error(res, "Missing purchase details");
  }

  const newOrder: Order = {
    id: `ethio-ord-${Math.floor(100000 + Math.random() * 900000)}`,
    buyerId,
    buyerName: buyerName || "EthioBuyer",
    items,
    totalAmount: parseFloat(totalAmount),
    paymentMethod: paymentMethod || "CASH_ON_DELIVERY",
    paymentStatus: paymentMethod === "CASH_ON_DELIVERY" ? "PENDING" : "PENDING",
    deliveryStatus: "PENDING",
    createdAt: new Date().toISOString(),
  };

  // Generate payment references for Ethiopian gateways
  if (paymentMethod === "CHAPA") {
    newOrder.chapaRef = `CHAPA-TX-${newOrder.id}-${Math.floor(Date.now() / 1000)}`;
  } else if (paymentMethod === "TELEBIRR") {
    newOrder.chapaRef = `TELEBIRR-AUTH-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  await mysqlDb.saveOrder(newOrder);
  return success(res, newOrder);
});

// GET all orders for user
app.get("/api/orders/user/:userId", async (req, res) => {
  const orders = await mysqlDb.getOrders();
  const list = orders.filter((o) => o.buyerId === req.params.userId);
  return success(res, list);
});

// GET all orders for vendor products
app.get("/api/orders/vendor/:vendorId", async (req, res) => {
  const { vendorId } = req.params;
  const allOrders = await mysqlDb.getOrders();
  const allProducts = await mysqlDb.getProducts();
  const vendorProducts = allProducts.filter((p) => p.vendorId === vendorId);
  const vendorProductIds = new Set(vendorProducts.map((p) => p.id));

  const filtered = allOrders.filter((ord) => {
    return ord.items.some((it) => vendorProductIds.has(it.productId));
  }).map((ord) => {
    const itemsBelonging = ord.items.filter((it) => vendorProductIds.has(it.productId));
    const totalForVendor = itemsBelonging.reduce((sum, it) => sum + it.price * it.quantity, 0);
    return {
      ...ord,
      items: itemsBelonging,
      totalAmount: totalForVendor,
    };
  });

  return success(res, filtered);
});

// Update order delivery or payment status
app.put("/api/orders/:id/status", async (req, res) => {
  const orders = await mysqlDb.getOrders();
  const ord = orders.find((o) => o.id === req.params.id);
  if (!ord) {
    return error(res, "Order not found", 404);
  }

  const { paymentStatus, deliveryStatus } = req.body;
  if (paymentStatus) ord.paymentStatus = paymentStatus;
  if (deliveryStatus) ord.deliveryStatus = deliveryStatus;

  await mysqlDb.saveOrder(ord);
  return success(res, ord);
});


// ==========================================
// 5. PRODUCT REVIEWS ENDPOINTS (MySQL)
// ==========================================

app.post("/api/reviews", async (req, res) => {
  const { productId, reviewerId, reviewerName, rating, comment } = req.body;
  if (!productId || !reviewerId || !rating) {
    return error(res, "Missing product ID, Reviewer context, or rating value");
  }

  const newReview: Review = {
    id: `rev-${Date.now()}`,
    productId,
    reviewerId,
    reviewerName: reviewerName || "Verified Buyer",
    rating: parseInt(rating),
    comment: comment || "",
    createdAt: new Date().toISOString(),
  };

  await mysqlDb.saveReview(newReview);
  return success(res, newReview);
});

app.get("/api/reviews/product/:productId", async (req, res) => {
  const reviews = await mysqlDb.getReviews();
  const list = reviews.filter((r) => r.productId === req.params.productId);
  return success(res, list);
});


// ==========================================
// 6. ADMIN SUMMARY API & PRIVATE OWNER DASHBOARD
// ==========================================

// Activity Log in memory for admin actions (synced with real database records)
interface ActivityLog {
  id: string;
  type: "PRODUCT_POSTED" | "PRODUCT_SOLD" | "NEW_ORDER" | "ORDER_STATUS" | "PRODUCT_REMOVED";
  title: string;
  description: string;
  timestamp: string;
}
const adminCustomActivityLogs: ActivityLog[] = [];

// Server-side Middleware: Verify Administrator Privileges
async function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const authHeader = req.headers.authorization || "";
    const customUserId = (req.headers["x-user-id"] as string) || "";
    let userId = "";

    if (authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      if (token.startsWith("simulated-jwt-for-")) {
        userId = token.replace("simulated-jwt-for-", "");
      } else {
        userId = token;
      }
    } else if (customUserId) {
      userId = customUserId;
    }

    if (!userId) {
      return error(res, "Access denied. Authentication required.", 401);
    }

    const users = await mysqlDb.getUsers();
    const user = users.find((u) => u.id === userId);

    if (!user || user.role !== "ADMIN") {
      return error(res, "Access denied. Administrator privileges required.", 403);
    }

    (req as any).adminUser = user;
    next();
  } catch (err: any) {
    console.error("Admin auth check error:", err);
    return error(res, "Authentication check failed", 500);
  }
}

// 1. Comprehensive Admin Overview Metrics
app.get("/api/admin/overview", requireAdminAuth, async (req, res) => {
  try {
    const products = await mysqlDb.getProducts();
    const orders = await mysqlDb.getOrders();

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Real calculations from database
    const totalProducts = products.length;
    const postedToday = products.filter((p) => new Date(p.createdAt) >= oneDayAgo).length;
    const activeProducts = products.filter((p) => p.isApproved && p.stock > 0).length;
    const soldProducts = products.filter((p) => p.stock === 0).length;

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(
      (o) => o.deliveryStatus === "PENDING" || o.paymentStatus === "PENDING"
    ).length;
    const completedOrders = orders.filter(
      (o) => o.deliveryStatus === "DELIVERED" || o.paymentStatus === "PAID"
    ).length;

    const totalSales = orders
      .filter((o) => o.paymentStatus === "PAID")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    // Synthesize real activity feed from database records + custom admin actions
    const dbActivities: ActivityLog[] = [];

    // Products posted
    for (const p of products.slice(0, 10)) {
      if (p.stock === 0) {
        dbActivities.push({
          id: `act-sold-${p.id}`,
          type: "PRODUCT_SOLD",
          title: "Product Marked Sold Out",
          description: `"${p.title}" is out of stock (${p.price.toLocaleString()} ETB)`,
          timestamp: p.createdAt,
        });
      } else {
        dbActivities.push({
          id: `act-prod-${p.id}`,
          type: "PRODUCT_POSTED",
          title: "New Product Listed",
          description: `"${p.title}" posted by ${p.vendorName} (${p.price.toLocaleString()} ETB)`,
          timestamp: p.createdAt,
        });
      }
    }

    // Orders placed and completed
    for (const o of orders.slice(0, 10)) {
      if (o.deliveryStatus === "DELIVERED" || o.paymentStatus === "PAID") {
        dbActivities.push({
          id: `act-ord-done-${o.id}`,
          type: "ORDER_COMPLETED",
          title: "Order Completed",
          description: `Order #${o.id.slice(-6)} for ${o.totalAmount.toLocaleString()} ETB completed (${o.paymentMethod})`,
          timestamp: o.createdAt,
        } as any);
      } else {
        dbActivities.push({
          id: `act-ord-${o.id}`,
          type: "NEW_ORDER",
          title: "New Order Placed",
          description: `Order #${o.id.slice(-6)} by ${o.buyerName} for ${o.totalAmount.toLocaleString()} ETB`,
          timestamp: o.createdAt,
        });
      }
    }

    // Combine with custom admin event logs, sort newest first, and take top 15
    const combined = [...adminCustomActivityLogs, ...dbActivities];
    combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return success(res, {
      totalProducts,
      postedToday,
      activeProducts,
      soldProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalSales,
      recentActivity: combined.slice(0, 15),
    });
  } catch (err: any) {
    console.error("Admin overview error:", err);
    return error(res, "Failed to load admin overview metrics", 500);
  }
});

// 2. Selling Activity: List all products for Admin
app.get("/api/admin/products", requireAdminAuth, async (req, res) => {
  try {
    const { search, status, category } = req.query;
    let products = await mysqlDb.getProducts();

    if (search && typeof search === "string" && search.trim()) {
      const q = search.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.vendorName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
      );
    }

    if (status === "ACTIVE") {
      products = products.filter((p) => p.isApproved && p.stock > 0);
    } else if (status === "SOLD") {
      products = products.filter((p) => p.stock === 0);
    }

    if (category && typeof category === "string" && category !== "All") {
      products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    return success(res, products);
  } catch (err: any) {
    console.error("Admin products fetch error:", err);
    return error(res, "Failed to fetch products", 500);
  }
});

// 3. Edit Product (Admin)
app.put("/api/admin/products/:id", requireAdminAuth, async (req, res) => {
  try {
    const products = await mysqlDb.getProducts();
    const product = products.find((p) => p.id === req.params.id);
    if (!product) {
      return error(res, "Product not found", 404);
    }

    const { title, price, category, condition, location, stock, isApproved, isFeatured, description } = req.body;

    if (title) product.title = title.trim();
    if (price !== undefined && !isNaN(parseFloat(price))) product.price = parseFloat(price);
    if (category) product.category = category.trim();
    if (condition) product.condition = condition;
    if (location) product.location = location.trim();
    if (stock !== undefined && !isNaN(parseInt(stock, 10))) product.stock = parseInt(stock, 10);
    if (isApproved !== undefined) product.isApproved = Boolean(isApproved);
    if (isFeatured !== undefined) product.isFeatured = Boolean(isFeatured);
    if (description) product.description = description.trim();

    await mysqlDb.saveProduct(product);

    adminCustomActivityLogs.unshift({
      id: `act-edit-${Date.now()}`,
      type: "ORDER_STATUS",
      title: "Product Updated by Admin",
      description: `Updated details for "${product.title}" (${product.price} ETB)`,
      timestamp: new Date().toISOString(),
    });

    return success(res, product);
  } catch (err: any) {
    console.error("Admin update product error:", err);
    return error(res, "Failed to update product", 500);
  }
});

// 4. Toggle Product Sold Status (Admin)
app.post("/api/admin/products/:id/toggle-sold", requireAdminAuth, async (req, res) => {
  try {
    const products = await mysqlDb.getProducts();
    const product = products.find((p) => p.id === req.params.id);
    if (!product) {
      return error(res, "Product not found", 404);
    }

    const wasSold = product.stock === 0;
    product.stock = wasSold ? 1 : 0;
    await mysqlDb.saveProduct(product);

    adminCustomActivityLogs.unshift({
      id: `act-sold-toggle-${Date.now()}`,
      type: wasSold ? "PRODUCT_POSTED" : "PRODUCT_SOLD",
      title: wasSold ? "Product Restocked" : "Product Marked Sold",
      description: `"${product.title}" marked as ${wasSold ? "active (in stock)" : "sold out"}`,
      timestamp: new Date().toISOString(),
    });

    return success(res, product);
  } catch (err: any) {
    console.error("Admin toggle sold error:", err);
    return error(res, "Failed to toggle sold status", 500);
  }
});

// 5. Remove Product (Admin)
app.delete("/api/admin/products/:id", requireAdminAuth, async (req, res) => {
  try {
    const products = await mysqlDb.getProducts();
    const product = products.find((p) => p.id === req.params.id);
    const title = product ? product.title : req.params.id;

    const deleted = await mysqlDb.deleteProduct(req.params.id);
    if (!deleted) {
      return error(res, "Failed to delete product or product not found", 404);
    }

    adminCustomActivityLogs.unshift({
      id: `act-del-${Date.now()}`,
      type: "PRODUCT_REMOVED",
      title: "Product Removed",
      description: `Listing "${title}" was permanently removed by Admin`,
      timestamp: new Date().toISOString(),
    });

    return success(res, { id: req.params.id, deleted: true });
  } catch (err: any) {
    console.error("Admin delete product error:", err);
    return error(res, "Failed to remove product", 500);
  }
});

// 6. Buying / Orders: List all orders for Admin
app.get("/api/admin/orders", requireAdminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    let orders = await mysqlDb.getOrders();

    if (status && typeof status === "string" && status !== "ALL") {
      orders = orders.filter(
        (o) => o.deliveryStatus === status || o.paymentStatus === status
      );
    }

    return success(res, orders);
  } catch (err: any) {
    console.error("Admin orders fetch error:", err);
    return error(res, "Failed to fetch orders", 500);
  }
});

// 7. Update Order Status (Admin)
app.put("/api/admin/orders/:id/status", requireAdminAuth, async (req, res) => {
  try {
    const { deliveryStatus, paymentStatus } = req.body;
    const orders = await mysqlDb.getOrders();
    const order = orders.find((o) => o.id === req.params.id);

    if (!order) {
      return error(res, "Order not found", 404);
    }

    if (deliveryStatus) order.deliveryStatus = deliveryStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await mysqlDb.saveOrder(order);

    adminCustomActivityLogs.unshift({
      id: `act-ord-stat-${Date.now()}`,
      type: "ORDER_STATUS",
      title: "Order Status Updated",
      description: `Order #${order.id.slice(-6)} updated to Delivery: ${order.deliveryStatus}, Payment: ${order.paymentStatus}`,
      timestamp: new Date().toISOString(),
    });

    return success(res, order);
  } catch (err: any) {
    console.error("Admin update order error:", err);
    return error(res, "Failed to update order status", 500);
  }
});

app.get("/api/admin/stats", async (req, res) => {
  const products = await mysqlDb.getProducts();
  const users = await mysqlDb.getUsers();
  const orders = await mysqlDb.getOrders();

  const totalSales = orders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const vendorCount = users.filter((u) => u.role === "VENDOR").length;
  const buyerCount = users.filter((u) => u.role === "BUYER").length;

  const categoryStats = products.reduce((acc: any, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});

  return success(res, {
    totalProducts: products.length,
    totalUsers: users.length,
    vendorCount,
    buyerCount,
    totalOrders: orders.length,
    totalSales,
    categoryStats,
  });
});

app.get("/api/db/status", async (req, res) => {
  try {
    const status = await mysqlDb.getStatus();
    return success(res, status);
  } catch (err: any) {
    return error(res, `Failed to retrieve DB status: ${err.message}`);
  }
});


// ==========================================
// 7. SHOPPING ASSISTANT (INTEGRATED WITH REAL MARKETPLACE DATA)
// ==========================================

app.post("/api/ai/assistant", async (req, res) => {
  const { messages, context } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return error(res, "Messages array is required");
  }

  const latestUserMessage = messages[messages.length - 1]?.content || "";
  const allProducts = await mysqlDb.getProducts();
  const activeProducts = allProducts.filter((p) => p.isApproved);

  // 1. Extract search intent from user query (category, price range, condition, location, keywords)
  const intent = parseSearchIntent(latestUserMessage);

  // 2. Query real database using the smart search algorithm
  const matchedRealProducts = searchAndRankProducts(activeProducts, latestUserMessage, {
    category: intent.category,
    condition: intent.condition,
    location: intent.location,
    minPrice: intent.minPrice,
    maxPrice: intent.maxPrice,
  });

  // Top matches to discuss or recommend
  const topMatches = matchedRealProducts.slice(0, 5);

  const client = getGeminiClient();

  // If Gemini API Key is not configured, deliver an honest, helpful response using real database items
  if (!client) {
    const q = latestUserMessage.toLowerCase();
    let reply = "";
    let recommendedProducts: Product[] = [];

    if (q.includes("telebirr") || q.includes("chapa") || q.includes("payment") || q.includes("ክፍያ") || q.includes("kaffaltii")) {
      reply = `Payment methods on EthioMarket:
1. **Telebirr**: Fast mobile checkout via Ethio Telecom.
2. **Chapa**: Supports local debit cards and CBE Birr.
3. **Cash on Delivery**: Available for verified sellers in Addis Ababa.
4. **Safety**: Inspect the item upon meetup or delivery before confirming receipt.`;
    } else if (q.includes("sell") || q.includes("vendor") || q.includes("መሸጥ") || q.includes("gurguruu")) {
      reply = `How to sell on EthioMarket:
1. Sign in and open your seller account from **My Hub**.
2. Click **Create New Listing**.
3. Set your price in **ETB**, upload clear photos, select your neighborhood (e.g. Bole, Merkato, Piassa), and publish.
4. Chat with buyers directly and coordinate pickup or local delivery.`;
    } else if (topMatches.length > 0) {
      recommendedProducts = topMatches.slice(0, 4);
      const itemsList = topMatches.slice(0, 3).map((p) => `• **${p.title}** - ${p.price.toLocaleString()} ETB (${p.condition}, ${p.location}) by ${p.vendorName}`).join("\n");
      reply = `Here are the matching listings from our marketplace:\n\n${itemsList}\n\nYou can click any product below to view full details or message the seller directly.`;
    } else {
      // No products matched the criteria
      if (intent.maxPrice || intent.category) {
        const filterDetails = [
          intent.category ? `category "${intent.category}"` : "",
          intent.maxPrice ? `under ${intent.maxPrice.toLocaleString()} ETB` : "",
        ].filter(Boolean).join(" ");

        reply = `There are currently no listings matching ${filterDetails} in the marketplace. You can adjust your price filter or browse our popular categories.`;
      } else {
        reply = `Hello! I can help you search for products, check prices in ETB, and guide you through payment and delivery across Ethiopia. What are you looking for today?`;
      }
    }

    return success(res, {
      reply,
      recommendedProducts,
      isFallback: true,
    });
  }

  // Live Gemini generation using real catalog context
  try {
    const userLanguage = context?.language || "en";

    // Compact summary of real products found for this specific query
    const realMatchesContext = topMatches.map((p) => ({
      id: p.id,
      title: p.title,
      price: `${p.price} ETB`,
      category: p.category,
      condition: p.condition,
      location: p.location,
      stock: p.stock,
      vendor: p.vendorName,
    }));

    const systemInstruction = `You are the Shopping Assistant for EthioMarket, an online Ethiopian marketplace.

STRICT ACCURACY RULES:
1. You must ONLY reference products that actually exist in the MATCHED PRODUCTS LIST below.
2. NEVER invent fake products, fake prices, fake sellers, fake locations, fake reviews, or fake availability.
3. If the MATCHED PRODUCTS LIST is empty, explicitly tell the user that no listings currently match their search in the EthioMarket database (e.g., "There are currently no phones listed under 20,000 ETB"). Suggest adjusting the budget or checking other categories.
4. Distinguish clearly between:
   - (a) Verified marketplace listings from the database
   - (b) General shopping advice, specs, or product tips
   - (c) Information you cannot verify
5. Currency is always Ethiopian Birr (ETB). Payment gateways are Telebirr, CBE Birr/Chapa, and Cash on Delivery.
6. Tone: Natural, simple, everyday English. Do NOT use buzzwords like "revolutionary", "cutting-edge", "elevate", "seamless", or "smart assistant".
7. If the user writes in Amharic, reply in natural Amharic. If they write in Afaan Oromoo, Tigrinya, or Somali, reply in that language. Otherwise use simple English.
8. When recommending items from the list, append this exact line at the end:
RECOMMENDED_PRODUCTS: ["prod-id1", "prod-id2"] (only valid IDs from the list below).

MATCHED PRODUCTS IN DATABASE:
${JSON.stringify(realMatchesContext, null, 2)}`;

    // Format conversation history
    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await withTimeout(
      client.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      }),
      6500
    );

    const rawReply = response.text || "I am here to help you find listings, check prices in ETB, and contact sellers.";

    // Parse RECOMMENDED_PRODUCTS
    let cleanReply = rawReply;
    let recommendedIds: string[] = [];
    const match = rawReply.match(/RECOMMENDED_PRODUCTS:\s*(\[[^\]]+\])/i);
    if (match && match[1]) {
      try {
        recommendedIds = JSON.parse(match[1]);
        cleanReply = rawReply.replace(match[0], "").trim();
      } catch (e) {
        // Ignored
      }
    }

    let recommendedProducts = activeProducts.filter((p) => recommendedIds.includes(p.id));
    if (recommendedProducts.length === 0 && topMatches.length > 0 && !cleanReply.toLowerCase().includes("no listings")) {
      recommendedProducts = topMatches.slice(0, 3);
    }

    return success(res, {
      reply: cleanReply,
      recommendedProducts,
      isFallback: false,
    });
  } catch (err: any) {
    console.warn("Assistant fallback error:", err?.message || err);

    let reply = "";
    if (topMatches.length > 0) {
      const itemsList = topMatches.slice(0, 3).map((p) => `• **${p.title}** - ${p.price.toLocaleString()} ETB (${p.condition}, ${p.location})`).join("\n");
      reply = `Here are the matching listings from our marketplace:\n\n${itemsList}\n\nYou can view full details or message the seller directly below.`;
    } else {
      reply = `There are currently no listings matching your search in the marketplace. Try searching with different keywords or browse our categories.`;
    }

    return success(res, {
      reply,
      recommendedProducts: topMatches.slice(0, 3),
      isFallback: true,
    });
  }
});


// ==========================================
// 8. GEMINI AI: DESCRIPTION GENERATION (gemini-3.8-flash)
// ==========================================

app.post("/api/ai/describe", async (req, res) => {
  const { title, category, condition, location } = req.body;
  if (!title || !category) {
    return error(res, "Provide title and category for description generation");
  }

  const client = getGeminiClient();
  if (!client) {
    const fallbacks: Record<string, string> = {
      Phones: `Smartphone in ${condition?.toLowerCase() || "good"} condition, available for pickup or delivery in ${location || "Addis Ababa"}. Screen and battery tested. Includes charger. Payment accepted via Telebirr or cash on pickup.`,
      Laptops: `Laptop in ${condition?.toLowerCase() || "good"} working order. Fast performance suitable for work, university, or daily use. Located in ${location || "Addis Ababa"}. You can inspect and test the device before finalizing payment.`,
      Fashion: `Traditional handwoven item made with quality cotton and authentic Ethiopian embroidery. Perfect for holidays and celebrations. Available for pickup or delivery.`,
      "Agro & Coffee": `Authentic Ethiopian specialty coffee sourced from verified growers. Fresh roast with distinct aroma and balanced flavor. Packed in Addis Ababa with delivery across the city.`,
    };

    const text = fallbacks[category] || `Item in ${condition?.toLowerCase() || "good"} condition. Located in ${location || "Addis Ababa, Ethiopia"}. Available for inspection and delivery. Message me directly to negotiate or arrange pickup.`;

    return success(res, {
      text,
      isFallback: true,
    });
  }

  try {
    const prompt = `Write a clear, helpful, and honest product description for an Ethiopian marketplace listing.
Product Title: "${title}"
Category: "${category}"
Condition: "${condition || "NEW"}"
Location: "${location || "Addis Ababa, Ethiopia"}"

Guidelines:
- 2 short paragraphs max.
- Paragraph 1: Describe the item's main features, practical uses, and condition.
- Paragraph 2: Mention location in Ethiopia, inspection upon pickup, and payment via Telebirr or cash.
- Use natural, simple English. Avoid marketing buzzwords like "cutting-edge", "revolutionary", or "unmatched".`;

    const response = await client.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You write practical, concise product descriptions for local Ethiopian commerce.",
        temperature: 0.5,
      }
    });

    const generatedText = response.text || `Quality ${title} in ${condition?.toLowerCase() || "good"} condition. Located in ${location || "Addis Ababa"}. Message seller to arrange pickup.`;
    return success(res, { text: generatedText, isFallback: false });
  } catch (err: any) {
    const text = `Item in ${condition?.toLowerCase() || "good"} condition. Located in ${location || "Addis Ababa, Ethiopia"}. Available for inspection and delivery. Message me directly to negotiate or arrange pickup.`;
    return success(res, { text, isFallback: true });
  }
});


// ==========================================
// 9. GEMINI AI: ETHIOPIAN MULTILINGUAL TRANSLATION (gemini-3.8-flash)
// ==========================================

app.post("/api/ai/translate", async (req, res) => {
  const { text, targetLang } = req.body;
  if (!text || !targetLang) {
    return error(res, "Please provide text and targetLang (am, om, ti, so, en)");
  }

  const langNames: Record<string, string> = {
    am: "Amharic (አማርኛ) using Ethiopian Ge'ez Fidel script",
    om: "Afaan Oromoo (Oromifa) using Latin Qubee orthography",
    ti: "Tigrinya (ትግርኛ) using Ge'ez Fidel script",
    so: "Somali (Af-Soomaali) using standard Latin orthography",
    en: "English",
  };

  const targetLangLabel = langNames[targetLang] || targetLang;
  const client = getGeminiClient();

  if (!client) {
    const prefixMap: Record<string, string> = {
      am: `[ትርጉም አማርኛ]: ${text}`,
      om: `[Hiikkaa Afaan Oromoo]: ${text}`,
      ti: `[ትርጉም ትግርኛ]: ${text}`,
      so: `[Turjumaad Soomaali]: ${text}`,
      en: text,
    };
    return success(res, {
      translatedText: prefixMap[targetLang] || text,
      isFallback: true,
      message: "Showing translated text. Connect GEMINI_API_KEY for dynamic neural translation."
    });
  }

  try {
    const prompt = `Translate the following Ethiopian marketplace product title, description, or buyer inquiry accurately and naturally into ${targetLangLabel}.
Ensure natural vernacular vocabulary suitable for commerce in Ethiopia. Preserve numeric prices, currency abbreviations (like ETB or ብር), phone numbers, and brand names (e.g., iPhone, Samsung, Dell, Telebirr, Chapa).

Text to translate:
"${text}"

Return ONLY the translated text without introductory phrases or quotes.`;

    const response = await client.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional Ethiopian linguist and translator expert in Amharic, Afaan Oromoo, Tigrinya, and Somali e-commerce terminology.",
        temperature: 0.3,
      },
    });

    const translatedText = response.text?.trim() || text;
    return success(res, { translatedText, isFallback: false });
  } catch (err: any) {
    console.error("Gemini translation error:", err);
    return error(res, `Translation failed: ${err.message || err}`);
  }
});


// ==========================================
// 10. VITE MIDDLEWARE CONFIGURATION & SERVER RUN
// ==========================================

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[EthioMarket Server] Active at http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start EthioMarket FullStack server:", err);
});

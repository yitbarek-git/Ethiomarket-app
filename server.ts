import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { dbInstance, User, Product, Order, Message, Review } from "./src/server/db.js";
import { GoogleGenAI } from "@google/genai";

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

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================

// Register
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, role, phone, location } = req.body;
  if (!name || !email || !password) {
    return error(res, "Please provide complete details: name, email, password");
  }

  const existing = dbInstance.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return error(res, "Account with this email already exists");
  }

  const roleValue = (role === "VENDOR" || role === "ADMIN") ? role : "BUYER";
  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    email,
    passwordHash: password, // For simulation
    role: roleValue,
    profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    phone: phone || "+251900000000",
    location: location || "Addis Ababa, Ethiopia",
    isVerified: roleValue === "VENDOR" ? false : true, // Vendor needs validation
    createdAt: new Date().toISOString(),
  };

  dbInstance.saveUser(newUser);

  // Return simulated JWT token
  const token = `simulated-jwt-for-${newUser.id}`;
  return success(res, { user: newUser, token });
});

// Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return error(res, "Email and password are required");
  }

  const user = dbInstance.getUsers().find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === password
  );

  if (!user) {
    return error(res, "Invalid email or password");
  }

  const token = `simulated-jwt-for-${user.id}`;
  return success(res, { user, token });
});

// Profile Management
app.put("/api/auth/profile", (req, res) => {
  const { userId, name, location, phone, profileImage } = req.body;
  const user = dbInstance.getUsers().find((u) => u.id === userId);
  if (!user) {
    return error(res, "User not found", 404);
  }

  if (name) user.name = name;
  if (location) user.location = location;
  if (phone) user.phone = phone;
  if (profileImage) user.profileImage = profileImage;

  dbInstance.saveUser(user);
  return success(res, user);
});


// ==========================================
// 2. PRODUCT MARKETPLACE ENDPOINTS
// ==========================================

// Get All (Filterable & Searchable)
app.get("/api/products", (req, res) => {
  const { category, search, condition, minPrice, maxPrice, sortBy, vendorId } = req.query;
  let list = dbInstance.getProducts();

  // Filter out unapproved if not vendor/admin (for simulation, we let all default products show)
  list = list.filter((p) => p.isApproved);

  if (category && category !== "All") {
    list = list.filter((p) => p.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(
      (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }

  if (condition) {
    list = list.filter((p) => p.condition === condition);
  }

  if (minPrice) {
    list = list.filter((p) => p.price >= parseFloat(minPrice as string));
  }

  if (maxPrice) {
    list = list.filter((p) => p.price <= parseFloat(maxPrice as string));
  }

  if (vendorId) {
    list = list.filter((p) => p.vendorId === vendorId);
  }

  // Sorting
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
});

// Get Single details
app.get("/api/products/:id", (req, res) => {
  const prod = dbInstance.getProducts().find((p) => p.id === req.params.id);
  if (!prod) {
    return error(res, "Product not found", 404);
  }
  return success(res, prod);
});

// Create product (Vendor)
app.post("/api/products", (req, res) => {
  const { title, description, price, condition, category, images, stock, location, vendorId, vendorName } = req.body;

  if (!title || !price || !category || !vendorId) {
    return error(res, "Missing title, price, category or vendorId context");
  }

  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    title,
    description: description || "No detailed description provided.",
    price: parseFloat(price),
    condition: condition || "NEW",
    category,
    images: images && images.length > 0 ? images : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"],
    stock: parseInt(stock) || 1,
    location: location || "Addis Ababa, Ethiopia",
    rating: 0,
    isApproved: true, // Autoapprove for developer convenience
    isFeatured: false,
    vendorId,
    vendorName: vendorName || "Local Vendor",
    createdAt: new Date().toISOString(),
  };

  dbInstance.saveProduct(newProduct);
  return success(res, newProduct, 21);
});

// Edit product (Vendor)
app.put("/api/products/:id", (req, res) => {
  const prod = dbInstance.getProducts().find((p) => p.id === req.params.id);
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

  dbInstance.saveProduct(prod);
  return success(res, prod);
});

// Delete product
app.delete("/api/products/:id", (req, res) => {
  const deleted = dbInstance.deleteProduct(req.params.id);
  if (!deleted) {
    return error(res, "Product not found or delete failed", 404);
  }
  return success(res, { id: req.params.id });
});


// ==========================================
// 3. MESSAGING ENDPOINTS
// ==========================================

// Send message
app.post("/api/messages", (req, res) => {
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

  dbInstance.saveMessage(newMsg);
  return success(res, newMsg);
});

// Get conversations & chats for a user
app.get("/api/messages/user/:userId", (req, res) => {
  const { userId } = req.params;
  const list = dbInstance.getMessages().filter(
    (m) => m.senderId === userId || m.receiverId === userId
  );
  return success(res, list);
});

// Mark messages as read
app.post("/api/messages/read", (req, res) => {
  const { senderId, receiverId } = req.body;
  if (senderId && receiverId) {
    dbInstance.markMessagesAsRead(senderId, receiverId);
  }
  return success(res, { status: "marked" });
});


// ==========================================
// 4. ORDER & CHECKOUT ENDPOINTS (CHAPA/TELEBIRR INTEGRATION)
// ==========================================

// Create checkout orders
app.post("/api/orders", (req, res) => {
  const { buyerId, buyerName, items, totalAmount, paymentMethod, phone } = req.body;
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

  dbInstance.saveOrder(newOrder);
  return success(res, newOrder);
});

// GET all orders for user
app.get("/api/orders/user/:userId", (req, res) => {
  const list = dbInstance.getOrders().filter((o) => o.buyerId === req.params.userId);
  return success(res, list);
});

// GET all orders for vendor products
app.get("/api/orders/vendor/:vendorId", (req, res) => {
  const { vendorId } = req.params;
  // Filter orders that contain items belonging to this vendor
  const allOrders = dbInstance.getOrders();
  const vendorProducts = dbInstance.getProducts().filter((p) => p.vendorId === vendorId);
  const vendorProductIds = new Set(vendorProducts.map((p) => p.id));

  const filtered = allOrders.filter((ord) => {
    return ord.items.some((it) => vendorProductIds.has(it.productId));
  }).map((ord) => {
    // Only return the order details and the items that belong to this vendor
    const itemsBelonging = ord.items.filter((it) => vendorProductIds.has(it.productId));
    const totalForVendor = itemsBelonging.reduce((sum, it) => sum + it.price * it.quantity, 0);
    return {
      ...ord,
      items: itemsBelonging,
      totalAmount: totalForVendor, // Vendor portion
    };
  });

  return success(res, filtered);
});

// Update order delivery or payment status
app.put("/api/orders/:id/status", (req, res) => {
  const ord = dbInstance.getOrders().find((o) => o.id === req.params.id);
  if (!ord) {
    return error(res, "Order not found", 404);
  }

  const { paymentStatus, deliveryStatus } = req.body;
  if (paymentStatus) ord.paymentStatus = paymentStatus;
  if (deliveryStatus) ord.deliveryStatus = deliveryStatus;

  dbInstance.saveOrder(ord);
  return success(res, ord);
});


// ==========================================
// 5. PRODUCT REVIEWS ENDPOINTS
// ==========================================

app.post("/api/reviews", (req, res) => {
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

  dbInstance.saveReview(newReview);
  return success(res, newReview);
});

app.get("/api/reviews/product/:productId", (req, res) => {
  const list = dbInstance.getReviews().filter((r) => r.productId === req.params.productId);
  return success(res, list);
});


// ==========================================
// 6. ADMIN SUMMARY API
// ==========================================

app.get("/api/admin/stats", (req, res) => {
  const products = dbInstance.getProducts();
  const users = dbInstance.getUsers();
  const orders = dbInstance.getOrders();

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


// ==========================================
// 7. GEMINI AI: ADVANCED COGNITIVE DESCRIPTION GENERATION
// ==========================================

app.post("/api/ai/describe", async (req, res) => {
  const { title, category, condition, location } = req.body;
  if (!title || !category) {
    return error(res, "Provide title and category for description generation");
  }

  const client = getGeminiClient();
  if (!client) {
    // Elegant fallback descriptions if API key is not yet configured by the user in Secrets panel
    const fallbacks: Record<string, string> = {
      Phones: `High performance premium smartphone in ${condition?.toLowerCase() || "pristine"} condition, ideal for work and play in ${location || "Addis Ababa"}. Includes long-lasting battery life, high-resolution cameras, and sleek responsive design. Buy with 100% security on EthioMarket!`,
      Laptops: `State-of-the-art portable computed system perfect for university students, local Ethiopian developers, and digital designers in ${location || "Addis Ababa"}. Offers lightning-fast boot speeds, vibrant visual colors, and excellent typing comfort. Special listing price on EthioMarket!`,
      Fashion: `Artfully designed ethnic cultural piece crafted under premium standards. Adds a touch of traditional Ethiopian elegance suitable for beautiful holidays, family affairs, and elegant weddings. Highly coveted and breathable material.`,
    };

    const text = fallbacks[category] || `Premium carefully inspected ${title} in ${condition?.toLowerCase() || "excellent"} condition. Located in ${location || "Addis Ababa, Ethiopia"}. Highly durable, fully vetted, and available for delivery. Make direct inquiries with the vendor on EthioMarket's built-in chat!`;

    return success(res, {
      text,
      isFallback: true,
      message: "Showing simulated high-quality description template. Provide your GEMINI_API_KEY in Settings > Secrets to unlock dynamic AI-powered generation!"
    });
  }

  try {
    const prompt = `Generate a modern, enticing, and professional product marketplace listing description in English with a subtle, warm, and professional local Ethiopian context.
    Product Title: "${title}"
    Category: "${category}"
    Condition: "${condition || "NEW"}"
    Location: "${location || "Addis Ababa, Ethiopia"}"
    
    Structure the response into 2 clean, short paragraphs.
    Paragraph 1: Highlight key benefits, premium features, and quality of state.
    Paragraph 2: Highlight local appeal and encourage buyers to inquire via EthioMarket's secure chat or make instant payment using Chapa/Telebirr.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite copywriter and bazaar marketing specialist for EthioMarket, the premium Ethiopian e-commerce marketplace.",
        temperature: 0.7,
      }
    });

    const generatedText = response.text || "An exceptional choice with high specifications and supreme reliability. Contact the vendor directly to secure this deal.";
    return success(res, { text: generatedText, isFallback: false });
  } catch (err: any) {
    console.error("Gemini description error:", err);
    return error(res, `Gemini API call failed: ${err.message || err}`);
  }
});


// ==========================================
// 8. VITE MIDDLEWARE CONFIGURATION & SERVER RUN
// ==========================================

async function start() {
  if (process.env.NODE_ENV !== "production") {
    // Development server with HMR Vite injection
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static compiled assets in production
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

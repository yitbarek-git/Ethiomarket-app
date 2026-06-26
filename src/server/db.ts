import fs from "fs";
import path from "path";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "BUYER" | "VENDOR" | "ADMIN";
  profileImage: string;
  location: string;
  phone: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number; // in ETB
  condition: "NEW" | "USED" | "REFURBISHED";
  category: string;
  images: string[];
  stock: number;
  location: string;
  rating: number;
  isApproved: boolean;
  isFeatured: boolean;
  vendorId: string;
  vendorName: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: "CHAPA" | "TELEBIRR" | "CASH_ON_DELIVERY";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  deliveryStatus: "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  chapaRef?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  receiverName: string;
  productId?: string;
  productTitle?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  reviewerId: string;
  reviewerName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface DbSchema {
  users: User[];
  products: Product[];
  orders: Order[];
  messages: Message[];
  reviews: Review[];
}

const DB_PATH = path.join(process.cwd(), "db.json");

const SEED_USERS: User[] = [
  {
    id: "user-buyer",
    name: "Sisay A",
    email: "buyer@ethio.com",
    passwordHash: "password", // Simple for developer ease
    role: "BUYER",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    location: "Megenagna, Addis Ababa",
    phone: "+251911445566",
    isVerified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "user-vendor-1",
    name: "Bole Electronic Store (Dawit)",
    email: "vendor@ethio.com",
    passwordHash: "password",
    role: "VENDOR",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    location: "Bole, Addis Ababa",
    phone: "+251912556677",
    isVerified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "user-vendor-2",
    name: "Habesha Hand-Weavers",
    email: "weaver@ethio.com",
    passwordHash: "password",
    role: "VENDOR",
    profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    location: "Shiro Meda, Addis Ababa",
    phone: "+251913667788",
    isVerified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "user-admin",
    name: "EthioMarket Admin (Selam)",
    email: "admin@ethio.com",
    passwordHash: "password",
    role: "ADMIN",
    profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    location: "Piassa, Addis Ababa",
    phone: "+251911000000",
    isVerified: true,
    createdAt: new Date().toISOString()
  }
];

const SEED_PRODUCTS: Product[] = [
  {
    id: "p1",
    title: "iPhone 15 Pro Max - 256GB",
    description: "Brand new original iPhone 15 Pro Max, titanium grey, physical dual SIM. Store warranty included.",
    price: 92000,
    condition: "NEW",
    category: "Phones",
    images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80"],
    stock: 5,
    location: "Bole, Addis Ababa",
    rating: 4.8,
    isApproved: true,
    isFeatured: true,
    vendorId: "user-vendor-1",
    vendorName: "Bole Electronic Store (Dawit)",
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString() // 3 days ago
  },
  {
    id: "p2",
    title: "MacBook Pro M3 Max (16-inch)",
    description: "Apple M3 Max Chip, 36GB Unified Memory, 1TB SSD. Space Black. Barely utilized, pristine shape. Comes with original charger and box.",
    price: 155000,
    condition: "USED",
    category: "Laptops",
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80"],
    stock: 1,
    location: "Megenagna, Addis Ababa",
    rating: 4.9,
    isApproved: true,
    isFeatured: true,
    vendorId: "user-vendor-1",
    vendorName: "Bole Electronic Store (Dawit)",
    createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString() // 1 day ago
  },
  {
    id: "p3",
    title: "Canon EOS R6 Mark II Mirrorless Camera",
    description: "Excellent mirrorless hybrid camera. 24.2 MP, up to 40fps electronic shutter, body-only configuration. Ideal for photography geeks in Addis.",
    price: 178000,
    condition: "NEW",
    category: "Cameras",
    images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80"],
    stock: 2,
    location: "Bahir Dar, Ethiopia",
    rating: 4.5,
    isApproved: true,
    isFeatured: false,
    vendorId: "user-vendor-1",
    vendorName: "Bole Electronic Store (Dawit)",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString() // 12 hours ago
  },
  {
    id: "p4",
    title: "Elegant Traditional Habesha Kemis (Traditional Dress)",
    description: "Stunning hand-woven cotton traditional dress adorned with classic gold-patterned Tilet. Tailor-made for weddings, holidays, and celebrations.",
    price: 8500,
    condition: "NEW",
    category: "Fashion",
    images: ["https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80"],
    stock: 4,
    location: "Shiro Meda, Addis Ababa",
    rating: 5.0,
    isApproved: true,
    isFeatured: true,
    vendorId: "user-vendor-2",
    vendorName: "Habesha Hand-Weavers",
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
  },
  {
    id: "p5",
    title: "AirPods Pro (2nd Generation) - USB-C",
    description: "Authentic Apple AirPods Pro 2 with Active Noise Cancellation, Adaptive Audio, and touch controls. Comes with MagSafe Charging Case.",
    price: 11200,
    condition: "NEW",
    category: "AirPods",
    images: ["https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80"],
    stock: 12,
    location: "Bole, Addis Ababa",
    rating: 4.7,
    isApproved: true,
    isFeatured: false,
    vendorId: "user-vendor-1",
    vendorName: "Bole Electronic Store (Dawit)",
    createdAt: new Date().toISOString()
  },
  {
    id: "p6",
    title: "Toyota Vitz 2012 (Yaris Hatchback)",
    description: "Excellent fuel efficiency, clean automatic transmission, perfect engine condition. Original silver-painted exterior. Plate code B2-A...",
    price: 5350000,
    condition: "USED",
    category: "Vehicles",
    images: ["https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80"],
    stock: 1,
    location: "Addis Ababa",
    rating: 4.2,
    isApproved: true,
    isFeatured: true,
    vendorId: "user-vendor-2",
    vendorName: "Habesha Hand-Weavers",
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    id: "p7",
    title: "Luxury 3-Bedroom Apartment in Bole",
    description: "Prestigious location, fully furnished with security backup systems, modern kitchen appliances, reliable WiFi connection, and standard parking garage.",
    price: 45000, // Monthly lease
    condition: "NEW",
    category: "Real Estate",
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80"],
    stock: 1,
    location: "Bole, Addis Ababa",
    rating: 4.6,
    isApproved: true,
    isFeatured: true,
    vendorId: "user-vendor-2",
    vendorName: "Habesha Hand-Weavers",
    createdAt: new Date(Date.now() - 3600000 * 24 * 8).toISOString()
  },
  {
    id: "p8",
    title: "Organic Sidama Coffee Beans (Specialty Grade-1) - 1kg",
    description: "Unparalleled coffee beans straight from Sidama highlands. Medium roast with light floral and citrus notes. Freshly packed on order.",
    price: 850,
    condition: "NEW",
    category: "Books", // Using Books category, or Electronics/Services since categories are customizable
    images: ["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&auto=format&fit=crop&q=80"],
    stock: 50,
    location: "Sidama, Ethiopia",
    rating: 5.0,
    isApproved: true,
    isFeatured: false,
    vendorId: "user-vendor-2",
    vendorName: "Habesha Hand-Weavers",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

const SEED_REVIEWS: Review[] = [
  {
    id: "r1",
    productId: "p1",
    reviewerId: "user-buyer",
    reviewerName: "Sisay A",
    rating: 5,
    comment: "Exceptional service from Dawit! The iPhone is absolutely brand new and original. Quick transaction using Telebirr.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    id: "r2",
    productId: "p4",
    reviewerId: "user-buyer",
    reviewerName: "Yitbarek K",
    rating: 5,
    comment: "The embroidery and Hand-weaving details are gorgeous. It fits perfectly! Best Habesha Kemis I've ever purchased.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString()
  }
];

const SEED_MESSAGES: Message[] = [
  {
    id: "m1",
    text: "Meles, is the Toyota Vitz price negotiable? Can I pay part via Chapa bank transfer?",
    senderId: "user-buyer",
    receiverId: "user-vendor-2",
    senderName: "Yitbarek K",
    receiverName: "Habesha Hand-Weavers",
    productId: "p6",
    productTitle: "Toyota Vitz 2012 (Yaris Hatchback)",
    isRead: true,
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString()
  },
  {
    id: "m2",
    text: "Selam Yitbarek! Yes, we can negotiate slightly. Bank transfer is highly preferred. When would you like to view the car in Bole?",
    senderId: "user-vendor-2",
    receiverId: "user-buyer",
    senderName: "Habesha Hand-Weavers",
    receiverName: "Sisay K",
    productId: "p6",
    productTitle: "Toyota Vitz 2012 (Yaris Hatchback)",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 9).toISOString()
  }
];

const SEED_ORDERS: Order[] = [
  {
    id: "order-1",
    buyerId: "user-buyer",
    buyerName: "Sisay A",
    items: [
      {
        productId: "p4",
        title: "Elegant Traditional Habesha Kemis (Traditional Dress)",
        price: 8500,
        quantity: 1
      }
    ],
    totalAmount: 8500,
    paymentMethod: "TELEBIRR",
    paymentStatus: "PAID",
    deliveryStatus: "SHIPPED",
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString()
  }
];

export class Database {
  private schema: DbSchema;

  constructor() {
    this.schema = this.load();
  }

  private load(): DbSchema {
    try {
      if (fs.existsSync(DB_PATH)) {
        const fileContent = fs.readFileSync(DB_PATH, "utf-8");
        return JSON.parse(fileContent);
      }
    } catch (e) {
      console.error("Error reading db.json, generating seeds instead:", e);
    }

    const defaultSchema: DbSchema = {
      users: SEED_USERS,
      products: SEED_PRODUCTS,
      orders: SEED_ORDERS,
      messages: SEED_MESSAGES,
      reviews: SEED_REVIEWS,
    };
    this.save(defaultSchema);
    return defaultSchema;
  }

  private save(schema: DbSchema): void {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(schema, null, 2), "utf-8");
    } catch (e) {
      console.error("Error saving to db.json:", e);
    }
  }

  public getUsers(): User[] {
    return this.schema.users;
  }

  public getProducts(): Product[] {
    return this.schema.products;
  }

  public getOrders(): Order[] {
    return this.schema.orders;
  }

  public getMessages(): Message[] {
    return this.schema.messages;
  }

  public getReviews(): Review[] {
    return this.schema.reviews;
  }

  public saveUser(user: User): User {
    const idx = this.schema.users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      this.schema.users[idx] = user;
    } else {
      this.schema.users.push(user);
    }
    this.save(this.schema);
    return user;
  }

  public saveProduct(product: Product): Product {
    const idx = this.schema.products.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      this.schema.products[idx] = product;
    } else {
      this.schema.products.push(product);
    }
    this.save(this.schema);
    return product;
  }

  public deleteProduct(productId: string): boolean {
    const initialLen = this.schema.products.length;
    this.schema.products = this.schema.products.filter((p) => p.id !== productId);
    this.save(this.schema);
    return this.schema.products.length < initialLen;
  }

  public saveOrder(order: Order): Order {
    const idx = this.schema.orders.findIndex((o) => o.id === order.id);
    if (idx >= 0) {
      this.schema.orders[idx] = order;
    } else {
      this.schema.orders.unshift(order); // Put new order at the top
    }
    this.save(this.schema);
    return order;
  }

  public saveMessage(message: Message): Message {
    this.schema.messages.push(message);
    this.save(this.schema);
    return message;
  }

  public markMessagesAsRead(senderId: string, receiverId: string): void {
    let changed = false;
    this.schema.messages.forEach((msg) => {
      if (msg.senderId === senderId && msg.receiverId === receiverId && !msg.isRead) {
        msg.isRead = true;
        changed = true;
      }
    });
    if (changed) {
      this.save(this.schema);
    }
  }

  public saveReview(review: Review): Review {
    const idx = this.schema.reviews.findIndex(
      (r) => r.productId === review.productId && r.reviewerId === review.reviewerId
    );
    if (idx >= 0) {
      this.schema.reviews[idx] = review;
    } else {
      this.schema.reviews.push(review);
    }

    // Update product rating
    const productReviews = this.schema.reviews.filter(
      (r) => r.productId === review.productId
    );
    const sum = productReviews.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = productReviews.length > 0 ? sum / productReviews.length : review.rating;

    const pIdx = this.schema.products.findIndex((p) => p.id === review.productId);
    if (pIdx >= 0) {
      this.schema.products[pIdx].rating = parseFloat(avg.toFixed(1));
    }

    this.save(this.schema);
    return review;
  }
}

export const dbInstance = new Database();

import fs from "fs";
import path from "path";
import { SEED_USERS, SEED_PRODUCTS, SEED_REVIEWS, SEED_MESSAGES, SEED_ORDERS } from "./seedData";

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

export class Database {
  private schema: DbSchema;

  constructor() {
    this.schema = this.load();
  }

  private load(): DbSchema {
    try {
      if (fs.existsSync(DB_PATH)) {
        const fileContent = fs.readFileSync(DB_PATH, "utf-8");
        const parsed: DbSchema = JSON.parse(fileContent);
        // Ensure rich Ethiopian product catalogue and vendors are populated
        if (!parsed.products || parsed.products.length < SEED_PRODUCTS.length) {
          parsed.products = SEED_PRODUCTS;
          parsed.users = SEED_USERS;
          if (!parsed.reviews || parsed.reviews.length < SEED_REVIEWS.length) {
            parsed.reviews = SEED_REVIEWS;
          }
          if (!parsed.messages || parsed.messages.length === 0) {
            parsed.messages = SEED_MESSAGES;
          }
          if (!parsed.orders || parsed.orders.length === 0) {
            parsed.orders = SEED_ORDERS;
          }
          this.save(parsed);
        }
        return parsed;
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

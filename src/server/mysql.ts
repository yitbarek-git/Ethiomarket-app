import "dotenv/config";
import mysql, { Pool, RowDataPacket } from "mysql2/promise";
import { User, Product, Order, Message, Review, DbSchema } from "./db";
import { SEED_USERS, SEED_PRODUCTS, SEED_REVIEWS, SEED_MESSAGES, SEED_ORDERS } from "./seedData";
import fs from "fs";
import path from "path";

export interface MySQLConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
}

export interface DBStatus {
  connected: boolean;
  engine: "MySQL" | "Embedded JSON Fallback";
  host: string;
  database: string;
  user: string;
  tables: {
    users: number;
    products: number;
    orders: number;
    messages: number;
    reviews: number;
  };
  lastError?: string;
}

const DB_PATH = path.join(process.cwd(), "db.json");

class MySQLDatabaseManager {
  private pool: Pool | null = null;
  private isConnected = false;
  private lastError: string | null = null;
  private initPromise: Promise<void> | null = null;

  // Embedded memory fallback to ensure zero downtime if MySQL instance isn't provisioned yet
  private fallbackData: DbSchema = {
    users: SEED_USERS,
    products: SEED_PRODUCTS,
    orders: SEED_ORDERS,
    messages: SEED_MESSAGES,
    reviews: SEED_REVIEWS,
  };

  constructor() {
    this.loadFallbackFromFile();
    // Start asynchronous initialization
    this.initPromise = this.init();
  }

  private loadFallbackFromFile() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.products && parsed.products.length > 0) {
          this.fallbackData = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn("[DB] Note reading db.json for fallback:", e);
    }
    this.saveFallbackToFile();
  }

  private saveFallbackToFile() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.fallbackData, null, 2), "utf-8");
    } catch (e) {
      console.error("[DB] Failed to save fallback data to db.json:", e);
    }
  }

  public async init(): Promise<void> {
    const host = process.env.MYSQL_HOST || "localhost";
    const port = parseInt(process.env.MYSQL_PORT || "3306", 10);
    const user = process.env.MYSQL_USER || "root";
    const password = process.env.MYSQL_PASSWORD || "";
    const database = process.env.MYSQL_DATABASE || "ethiomarket";

    try {
      // Create connection pool with timeout to prevent hanging
      this.pool = mysql.createPool({
        host,
        port,
        user,
        password,
        database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 10000, // Increased for cloud latency
        ssl: {
          rejectUnauthorized: false // 👈 REQUIRED for Aiven MySQL
        },
      });

      // Probe connection with a simple query
      const conn = await this.pool.getConnection();
      console.log(`[MySQL] Successfully connected to MySQL server at ${host}:${port}/${database}`);
      conn.release();

      this.isConnected = true;
      this.lastError = null;

      // Ensure tables exist and seed if necessary
      await this.runMigrations();
    } catch (err: any) {
      this.isConnected = false;
      this.lastError = err.message || String(err);
      console.warn(
        `[MySQL] Notice: MySQL server at ${host}:${port} is not accessible (${this.lastError}). Operating in dual-mode with synchronized embedded storage until MySQL credentials are provided.`
      );
    }
  }

  private async runMigrations(): Promise<void> {
    if (!this.pool || !this.isConnected) return;

    try {
      // 1. Users Table
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          role ENUM('BUYER', 'VENDOR', 'ADMIN') NOT NULL DEFAULT 'BUYER',
          profile_image TEXT,
          location VARCHAR(255) DEFAULT 'Addis Ababa, Ethiopia',
          phone VARCHAR(64) DEFAULT '+251900000000',
          is_verified BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_users_email (email),
          INDEX idx_users_role (role)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 2. Products Table
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS products (
          id VARCHAR(64) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          price DECIMAL(12, 2) NOT NULL,
          product_condition ENUM('NEW', 'USED', 'REFURBISHED') NOT NULL DEFAULT 'NEW',
          category VARCHAR(100) NOT NULL,
          images_json JSON,
          stock INT NOT NULL DEFAULT 1,
          location VARCHAR(255) NOT NULL DEFAULT 'Addis Ababa, Ethiopia',
          rating DECIMAL(3, 2) DEFAULT 0.00,
          is_approved BOOLEAN DEFAULT TRUE,
          is_featured BOOLEAN DEFAULT FALSE,
          vendor_id VARCHAR(64) NOT NULL,
          vendor_name VARCHAR(255) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_products_category (category),
          INDEX idx_products_price (price),
          INDEX idx_products_condition (product_condition),
          INDEX idx_products_vendor (vendor_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 3. Orders Table
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id VARCHAR(64) PRIMARY KEY,
          buyer_id VARCHAR(64) NOT NULL,
          buyer_name VARCHAR(255) NOT NULL,
          items_json JSON NOT NULL,
          total_amount DECIMAL(12, 2) NOT NULL,
          payment_method ENUM('CHAPA', 'TELEBIRR', 'CASH_ON_DELIVERY') NOT NULL DEFAULT 'CASH_ON_DELIVERY',
          payment_status ENUM('PENDING', 'PAID', 'FAILED') NOT NULL DEFAULT 'PENDING',
          delivery_status ENUM('PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
          chapa_ref VARCHAR(255),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_orders_buyer (buyer_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 4. Messages Table
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id VARCHAR(64) PRIMARY KEY,
          text TEXT NOT NULL,
          sender_id VARCHAR(64) NOT NULL,
          receiver_id VARCHAR(64) NOT NULL,
          sender_name VARCHAR(255) NOT NULL,
          receiver_name VARCHAR(255) NOT NULL,
          product_id VARCHAR(64),
          product_title VARCHAR(255),
          is_read BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_messages_sender (sender_id),
          INDEX idx_messages_receiver (receiver_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 5. Reviews Table
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS reviews (
          id VARCHAR(64) PRIMARY KEY,
          product_id VARCHAR(64) NOT NULL,
          reviewer_id VARCHAR(64) NOT NULL,
          reviewer_name VARCHAR(255) NOT NULL,
          rating TINYINT NOT NULL,
          comment TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_reviews_product (product_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // Check if products need initial seeding
      const [rows]: [RowDataPacket[], any] = await this.pool.query(
        `SELECT COUNT(*) as cnt FROM products`
      );
      const count = rows[0]?.cnt || 0;

      if (count === 0) {
        console.log("[MySQL] Seeding initial Ethiopian marketplace products into MySQL...");
        for (const prod of SEED_PRODUCTS) {
          await this.pool.query(
            `INSERT IGNORE INTO products (id, title, description, price, product_condition, category, images_json, stock, location, rating, is_approved, is_featured, vendor_id, vendor_name, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              prod.id,
              prod.title,
              prod.description,
              prod.price,
              prod.condition,
              prod.category,
              JSON.stringify(prod.images),
              prod.stock,
              prod.location,
              prod.rating,
              prod.isApproved ? 1 : 0,
              prod.isFeatured ? 1 : 0,
              prod.vendorId,
              prod.vendorName,
              new Date(prod.createdAt),
            ]
          );
        }

        for (const u of SEED_USERS) {
          await this.pool.query(
            `INSERT IGNORE INTO users (id, name, email, password_hash, role, profile_image, location, phone, is_verified, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              u.id,
              u.name,
              u.email,
              u.passwordHash,
              u.role,
              u.profileImage,
              u.location,
              u.phone,
              u.isVerified ? 1 : 0,
              new Date(u.createdAt),
            ]
          );
        }

        for (const o of SEED_ORDERS) {
          await this.pool.query(
            `INSERT IGNORE INTO orders (id, buyer_id, buyer_name, items_json, total_amount, payment_method, payment_status, delivery_status, chapa_ref, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              o.id,
              o.buyerId,
              o.buyerName,
              JSON.stringify(o.items),
              o.totalAmount,
              o.paymentMethod,
              o.paymentStatus,
              o.deliveryStatus,
              o.chapaRef || null,
              new Date(o.createdAt),
            ]
          );
        }
        console.log("[MySQL] Seeding completed successfully.");
      }
    } catch (e) {
      console.error("[MySQL] Error running migrations:", e);
    }
  }

  // -------------------------------------------------------------
  // Diagnostic / Status
  // -------------------------------------------------------------
  public async getStatus(): Promise<DBStatus> {
    const host = process.env.MYSQL_HOST || "localhost";
    const database = process.env.MYSQL_DATABASE || "ethiomarket";
    const user = process.env.MYSQL_USER || "root";

    let tableCounts = {
      users: this.fallbackData.users.length,
      products: this.fallbackData.products.length,
      orders: this.fallbackData.orders.length,
      messages: this.fallbackData.messages.length,
      reviews: this.fallbackData.reviews.length,
    };

    if (this.isConnected && this.pool) {
      try {
        const [u]: any = await this.pool.query(`SELECT COUNT(*) as c FROM users`);
        const [p]: any = await this.pool.query(`SELECT COUNT(*) as c FROM products`);
        const [o]: any = await this.pool.query(`SELECT COUNT(*) as c FROM orders`);
        const [m]: any = await this.pool.query(`SELECT COUNT(*) as c FROM messages`);
        const [r]: any = await this.pool.query(`SELECT COUNT(*) as c FROM reviews`);
        tableCounts = {
          users: u[0]?.c || 0,
          products: p[0]?.c || 0,
          orders: o[0]?.c || 0,
          messages: m[0]?.c || 0,
          reviews: r[0]?.c || 0,
        };
      } catch (err: any) {
        console.warn("[MySQL] Count check error:", err);
      }
    }

    return {
      connected: this.isConnected,
      engine: this.isConnected ? "MySQL" : "Embedded JSON Fallback",
      host,
      database,
      user,
      tables: tableCounts,
      lastError: this.lastError || undefined,
    };
  }

  // -------------------------------------------------------------
  // USERS
  // -------------------------------------------------------------
  public async getUsers(): Promise<User[]> {
    if (this.isConnected && this.pool) {
      try {
        const [rows]: any = await this.pool.query(`SELECT * FROM users ORDER BY created_at DESC`);
        return rows.map((r: any) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          passwordHash: r.password_hash,
          role: r.role,
          profileImage: r.profile_image,
          location: r.location,
          phone: r.phone,
          isVerified: Boolean(r.is_verified),
          createdAt: new Date(r.created_at).toISOString(),
        }));
      } catch (e) {
        console.error("[MySQL] getUsers error, falling back:", e);
      }
    }
    return this.fallbackData.users;
  }

  public async saveUser(user: User): Promise<User> {
    // Save in fallback first
    const idx = this.fallbackData.users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      this.fallbackData.users[idx] = user;
    } else {
      this.fallbackData.users.push(user);
    }
    this.saveFallbackToFile();

    if (this.isConnected && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO users (id, name, email, password_hash, role, profile_image, location, phone, is_verified, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             name = VALUES(name),
             email = VALUES(email),
             password_hash = VALUES(password_hash),
             role = VALUES(role),
             profile_image = VALUES(profile_image),
             location = VALUES(location),
             phone = VALUES(phone),
             is_verified = VALUES(is_verified)`,
          [
            user.id,
            user.name,
            user.email,
            user.passwordHash,
            user.role,
            user.profileImage,
            user.location,
            user.phone,
            user.isVerified ? 1 : 0,
            new Date(user.createdAt),
          ]
        );
      } catch (e) {
        console.error("[MySQL] saveUser error:", e);
      }
    }
    return user;
  }

  // -------------------------------------------------------------
  // PRODUCTS
  // -------------------------------------------------------------
  public async getProducts(): Promise<Product[]> {
    if (this.isConnected && this.pool) {
      try {
        const [rows]: any = await this.pool.query(`SELECT * FROM products ORDER BY created_at DESC`);
        return rows.map((r: any) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          price: parseFloat(r.price),
          condition: r.product_condition,
          category: r.category,
          images: typeof r.images_json === "string" ? JSON.parse(r.images_json) : (r.images_json || []),
          stock: r.stock,
          location: r.location,
          rating: parseFloat(r.rating) || 0,
          isApproved: Boolean(r.is_approved),
          isFeatured: Boolean(r.is_featured),
          vendorId: r.vendor_id,
          vendorName: r.vendor_name,
          createdAt: new Date(r.created_at).toISOString(),
        }));
      } catch (e) {
        console.error("[MySQL] getProducts error, falling back:", e);
      }
    }
    return this.fallbackData.products;
  }

  public async saveProduct(product: Product): Promise<Product> {
    // Fallback sync
    const idx = this.fallbackData.products.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      this.fallbackData.products[idx] = product;
    } else {
      this.fallbackData.products.push(product);
    }
    this.saveFallbackToFile();

    if (this.isConnected && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO products (id, title, description, price, product_condition, category, images_json, stock, location, rating, is_approved, is_featured, vendor_id, vendor_name, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             title = VALUES(title),
             description = VALUES(description),
             price = VALUES(price),
             product_condition = VALUES(product_condition),
             category = VALUES(category),
             images_json = VALUES(images_json),
             stock = VALUES(stock),
             location = VALUES(location),
             rating = VALUES(rating),
             is_approved = VALUES(is_approved),
             is_featured = VALUES(is_featured),
             vendor_id = VALUES(vendor_id),
             vendor_name = VALUES(vendor_name)`,
          [
            product.id,
            product.title,
            product.description,
            product.price,
            product.condition,
            product.category,
            JSON.stringify(product.images),
            product.stock,
            product.location,
            product.rating,
            product.isApproved ? 1 : 0,
            product.isFeatured ? 1 : 0,
            product.vendorId,
            product.vendorName,
            new Date(product.createdAt),
          ]
        );
      } catch (e) {
        console.error("[MySQL] saveProduct error:", e);
      }
    }
    return product;
  }

  public async deleteProduct(id: string): Promise<boolean> {
    const initialLen = this.fallbackData.products.length;
    this.fallbackData.products = this.fallbackData.products.filter((p) => p.id !== id);
    this.saveFallbackToFile();

    if (this.isConnected && this.pool) {
      try {
        const [res]: any = await this.pool.query(`DELETE FROM products WHERE id = ?`, [id]);
        return res.affectedRows > 0;
      } catch (e) {
        console.error("[MySQL] deleteProduct error:", e);
      }
    }
    return this.fallbackData.products.length < initialLen;
  }

  // -------------------------------------------------------------
  // ORDERS
  // -------------------------------------------------------------
  public async getOrders(): Promise<Order[]> {
    if (this.isConnected && this.pool) {
      try {
        const [rows]: any = await this.pool.query(`SELECT * FROM orders ORDER BY created_at DESC`);
        return rows.map((r: any) => ({
          id: r.id,
          buyerId: r.buyer_id,
          buyerName: r.buyer_name,
          items: typeof r.items_json === "string" ? JSON.parse(r.items_json) : (r.items_json || []),
          totalAmount: parseFloat(r.total_amount),
          paymentMethod: r.payment_method,
          paymentStatus: r.payment_status,
          deliveryStatus: r.delivery_status,
          chapaRef: r.chapa_ref || undefined,
          createdAt: new Date(r.created_at).toISOString(),
        }));
      } catch (e) {
        console.error("[MySQL] getOrders error, falling back:", e);
      }
    }
    return this.fallbackData.orders;
  }

  public async saveOrder(order: Order): Promise<Order> {
    const idx = this.fallbackData.orders.findIndex((o) => o.id === order.id);
    if (idx >= 0) {
      this.fallbackData.orders[idx] = order;
    } else {
      this.fallbackData.orders.unshift(order);
    }
    this.saveFallbackToFile();

    if (this.isConnected && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO orders (id, buyer_id, buyer_name, items_json, total_amount, payment_method, payment_status, delivery_status, chapa_ref, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             buyer_name = VALUES(buyer_name),
             items_json = VALUES(items_json),
             total_amount = VALUES(total_amount),
             payment_method = VALUES(payment_method),
             payment_status = VALUES(payment_status),
             delivery_status = VALUES(delivery_status),
             chapa_ref = VALUES(chapa_ref)`,
          [
            order.id,
            order.buyerId,
            order.buyerName,
            JSON.stringify(order.items),
            order.totalAmount,
            order.paymentMethod,
            order.paymentStatus,
            order.deliveryStatus,
            order.chapaRef || null,
            new Date(order.createdAt),
          ]
        );
      } catch (e) {
        console.error("[MySQL] saveOrder error:", e);
      }
    }
    return order;
  }

  // -------------------------------------------------------------
  // MESSAGES
  // -------------------------------------------------------------
  public async getMessages(): Promise<Message[]> {
    if (this.isConnected && this.pool) {
      try {
        const [rows]: any = await this.pool.query(`SELECT * FROM messages ORDER BY created_at ASC`);
        return rows.map((r: any) => ({
          id: r.id,
          text: r.text,
          senderId: r.sender_id,
          receiverId: r.receiver_id,
          senderName: r.sender_name,
          receiverName: r.receiver_name,
          productId: r.product_id || undefined,
          productTitle: r.product_title || undefined,
          isRead: Boolean(r.is_read),
          createdAt: new Date(r.created_at).toISOString(),
        }));
      } catch (e) {
        console.error("[MySQL] getMessages error, falling back:", e);
      }
    }
    return this.fallbackData.messages;
  }

  public async saveMessage(message: Message): Promise<Message> {
    this.fallbackData.messages.push(message);
    this.saveFallbackToFile();

    if (this.isConnected && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO messages (id, text, sender_id, receiver_id, sender_name, receiver_name, product_id, product_title, is_read, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            message.id,
            message.text,
            message.senderId,
            message.receiverId,
            message.senderName,
            message.receiverName,
            message.productId || null,
            message.productTitle || null,
            message.isRead ? 1 : 0,
            new Date(message.createdAt),
          ]
        );
      } catch (e) {
        console.error("[MySQL] saveMessage error:", e);
      }
    }
    return message;
  }

  public async markMessagesAsRead(senderId: string, receiverId: string): Promise<void> {
    this.fallbackData.messages.forEach((m) => {
      if (m.senderId === senderId && m.receiverId === receiverId && !m.isRead) {
        m.isRead = true;
      }
    });
    this.saveFallbackToFile();

    if (this.isConnected && this.pool) {
      try {
        await this.pool.query(
          `UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ?`,
          [senderId, receiverId]
        );
      } catch (e) {
        console.error("[MySQL] markMessagesAsRead error:", e);
      }
    }
  }

  // -------------------------------------------------------------
  // REVIEWS
  // -------------------------------------------------------------
  public async getReviews(): Promise<Review[]> {
    if (this.isConnected && this.pool) {
      try {
        const [rows]: any = await this.pool.query(`SELECT * FROM reviews ORDER BY created_at DESC`);
        return rows.map((r: any) => ({
          id: r.id,
          productId: r.product_id,
          reviewerId: r.reviewer_id,
          reviewerName: r.reviewer_name,
          rating: r.rating,
          comment: r.comment || "",
          createdAt: new Date(r.created_at).toISOString(),
        }));
      } catch (e) {
        console.error("[MySQL] getReviews error, falling back:", e);
      }
    }
    return this.fallbackData.reviews;
  }

  public async saveReview(review: Review): Promise<Review> {
    const idx = this.fallbackData.reviews.findIndex(
      (r) => r.productId === review.productId && r.reviewerId === review.reviewerId
    );
    if (idx >= 0) {
      this.fallbackData.reviews[idx] = review;
    } else {
      this.fallbackData.reviews.push(review);
    }

    // Update product rating in fallback
    const productReviews = this.fallbackData.reviews.filter(
      (r) => r.productId === review.productId
    );
    const sum = productReviews.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = productReviews.length > 0 ? sum / productReviews.length : review.rating;
    const pIdx = this.fallbackData.products.findIndex((p) => p.id === review.productId);
    if (pIdx >= 0) {
      this.fallbackData.products[pIdx].rating = parseFloat(avg.toFixed(1));
    }
    this.saveFallbackToFile();

    if (this.isConnected && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO reviews (id, product_id, reviewer_id, reviewer_name, rating, comment, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             rating = VALUES(rating),
             comment = VALUES(comment)`,
          [
            review.id,
            review.productId,
            review.reviewerId,
            review.reviewerName,
            review.rating,
            review.comment,
            new Date(review.createdAt),
          ]
        );

        // Update product average rating in MySQL
        await this.pool.query(
          `UPDATE products p
           SET rating = (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE product_id = ?)
           WHERE id = ?`,
          [review.productId, review.productId]
        );
      } catch (e) {
        console.error("[MySQL] saveReview error:", e);
      }
    }
    return review;
  }
}

export const mysqlDb = new MySQLDatabaseManager();

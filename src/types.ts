export interface User {
  id: string;
  name: string;
  email: string;
  role: "BUYER" | "VENDOR" | "ADMIN";
  profileImage?: string;
  location?: string;
  phone?: string;
  isVerified?: boolean;
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
  rating: number;
  comment: string;
  createdAt: string;
}

export type CategoryType = 
  | "All"
  | "Phones"
  | "Laptops"
  | "PCs"
  | "Cameras"
  | "AirPods"
  | "Electronics"
  | "Books"
  | "Fashion"
  | "Vehicles"
  | "Real Estate"
  | "Services";

export type LanguageCode = "en" | "am" | "om" | "ti" | "so";

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
}

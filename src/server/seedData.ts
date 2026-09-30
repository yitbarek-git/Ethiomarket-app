import { User, Product, Order, Message, Review } from "./db";

export const SEED_USERS: User[] = [
  {
    id: "user-buyer",
    name: "Almaz Kebede",
    email: "buyer@ethio.com",
    passwordHash: "password",
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
    id: "user-vendor-3",
    name: "Merkato Spices & Agro (Kedir)",
    email: "merkato@ethio.com",
    passwordHash: "password",
    role: "VENDOR",
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    location: "Merkato, Addis Ababa",
    phone: "+251911889900",
    isVerified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "user-vendor-4",
    name: "Sheger Auto & Real Estate (Robel)",
    email: "sheger@ethio.com",
    passwordHash: "password",
    role: "VENDOR",
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    location: "Sarbet, Addis Ababa",
    phone: "+251912334455",
    isVerified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "user-vendor-5",
    name: "Piassa Digital Gadgets (Meron)",
    email: "piassa@ethio.com",
    passwordHash: "password",
    role: "VENDOR",
    profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    location: "Piassa, Addis Ababa",
    phone: "+251914223344",
    isVerified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "user-vendor-6",
    name: "Abyssinia Leather Craft (Tewodros)",
    email: "leather@ethio.com",
    passwordHash: "password",
    role: "VENDOR",
    profileImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    location: "Merkato, Addis Ababa",
    phone: "+251915667788",
    isVerified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "user-admin",
    name: "EthioMarket Admin (Selam)",
    email: "admin@ethio.com",
    passwordHash: "sha256$97839e3e684df96b111ebc7397601d2e$a67e17d7e5d3563b6bcdccc0b488e9b107e897304e77fb0572d83742f744bd16",
    role: "ADMIN",
    profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    location: "Piassa, Addis Ababa",
    phone: "+251911000000",
    isVerified: true,
    createdAt: new Date().toISOString()
  }
];

export const SEED_PRODUCTS: Product[] = [
  // --- PHONES ---
  {
    id: "p1",
    title: "iPhone 15 Pro Max - 256GB Dual SIM (Natural Titanium)",
    description: "Original brand new factory unlocked iPhone 15 Pro Max in Natural Titanium. Physical dual SIM capability, battery health 100%, includes 1-year shop replacement warranty and Apple original braided USB-C cable.",
    price: 92000,
    condition: "NEW",
    category: "Phones",
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 6,
    location: "Bole, Addis Ababa",
    rating: 4.9,
    isApproved: true,
    isFeatured: true,
    vendorId: "user-vendor-1",
    vendorName: "Bole Electronic Store (Dawit)",
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  },
  {
    id: "p9",
    title: "Samsung Galaxy S24 Ultra 512GB - Titanium Black",
    description: "Flagship Galaxy AI phone with embedded S-Pen, 200MP camera, Snapdragon 8 Gen 3 for Galaxy, and 12GB RAM. Brand new box with official Samsung warranty seal. Telebirr and Chapa payments accepted.",
    price: 98500,
    condition: "NEW",
    category: "Phones",
    images: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 4,
    location: "Piassa, Addis Ababa",
    rating: 4.9,
    isApproved: true,
    isFeatured: true,
    vendorId: "user-vendor-5",
    vendorName: "Piassa Digital Gadgets (Meron)",
    createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString()
  },
  {
    id: "p10",
    title: "Tecno Camon 30 Premier 5G (512GB ROM + 12GB RAM)",
    description: "Exceptional smartphone photography with Sony LYTIA 701 camera sensor, 70W ultra fast charger included in the box, and stunning curved 1.5K AMOLED display. Authorized distributor stock in Addis.",
    price: 22500,
    condition: "NEW",
    category: "Phones",
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 15,
    location: "Mexico, Addis Ababa",
    rating: 4.6,
    isApproved: true,
    isFeatured: false,
    vendorId: "user-vendor-1",
    vendorName: "Bole Electronic Store (Dawit)",
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: "p39",
    title: "Xiaomi Redmi Note 13 Pro+ 5G (256GB / 8GB RAM)",
    description: "200MP main camera with OIS, 120W HyperCharge (0 to 100% in 19 minutes), IP68 water resistance, and crystal-clear 120Hz curved AMOLED screen. Fast delivery in Addis.",
    price: 28000,
    condition: "NEW",
    category: "Phones",
    images: [
      "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 8,
    location: "Merkato, Addis Ababa",
    rating: 4.7,
    isApproved: true,
    isFeatured: false,
    vendorId: "user-vendor-5",
    vendorName: "Piassa Digital Gadgets (Meron)",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: "p40",
    title: "Samsung Galaxy A15 (128GB Storage, 6GB RAM) - Blue Black",
    description: "Crisp 6.5-inch Super AMOLED 90Hz display, 50MP triple camera system, massive 5000mAh all-day battery with 25W fast charging. Dual SIM, brand new sealed box with original charger. Perfect daily driver in Addis.",
    price: 16800,
    condition: "NEW",
    category: "Phones",
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 10,
    location: "Bole, Addis Ababa",
    rating: 4.8,
    isApproved: true,
    isFeatured: false,
    vendorId: "user-vendor-1",
    vendorName: "Bole Electronic Store (Dawit)",
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString()
  },
  {
    id: "p41",
    title: "Tecno Spark 20 (128GB + 8GB Extended RAM) - Gravity Black",
    description: "Reliable and fast everyday phone with 50MP ultra clear camera, dual stereo speakers with DTS sound, smooth 90Hz hole-screen display, and 5000mAh battery. Excellent value under 20,000 ETB.",
    price: 12500,
    condition: "NEW",
    category: "Phones",
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 14,
    location: "Piassa, Addis Ababa",
    rating: 4.7,
    isApproved: true,
    isFeatured: false,
    vendorId: "user-vendor-5",
    vendorName: "Piassa Digital Gadgets (Meron)",
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString()
  },

  // --- LAPTOPS ---
  {
    id: "p2",
    title: "MacBook Pro M3 Max (16-inch, 36GB RAM, 1TB SSD)",
    description: "Apple M3 Max Chip (14-core CPU, 30-core GPU), 36GB Unified Memory, 1TB blazing fast SSD. Space Black finish. Pristine condition with only 12 battery cycles. Includes original MagSafe charger and box.",
    price: 155000,
    condition: "USED",
    category: "Laptops",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 2,
    location: "Bole, Addis Ababa",
    rating: 4.9,
    isApproved: true,
    isFeatured: true,
    vendorId: "user-vendor-1",
    vendorName: "Bole Electronic Store (Dawit)",
    createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString()
  },
  {
    id: "p42",
    title: "Lenovo ThinkPad T480 (Intel Core i5, 16GB RAM, 512GB SSD)",
    description: "Durable business laptop in very good used condition. Dual hot-swappable batteries for up to 10 hours runtime, spill-resistant keyboard, 14-inch Full HD IPS screen, Windows 11 Pro. Clean and fully tested.",
    price: 18500,
    condition: "USED",
    category: "Laptops",
    images: [
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 4,
    location: "Bole, Addis Ababa",
    rating: 4.8,
    isApproved: true,
    isFeatured: true,
    vendorId: "user-vendor-1",
    vendorName: "Bole Electronic Store (Dawit)",
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString()
  },
  {
    id: "p43",
    title: "Dell Latitude 7490 Ultrabook (Core i7 8th Gen, 16GB RAM)",
    description: "Slim business ultrabook in clean used condition. Fast 256GB NVMe SSD, backlit keyboard, fingerprint reader, Full HD screen. Battery health excellent. Tested and ready for work or school.",
    price: 16800,
    condition: "USED",
    category: "Laptops",
    images: [
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 3,
    location: "Megenagna, Addis Ababa",
    rating: 4.7,
    isApproved: true,
    isFeatured: false,
    vendorId: "user-vendor-5",
    vendorName: "Piassa Digital Gadgets (Meron)",
    createdAt: new Date(Date.now() - 3600000 * 52).toISOString()
  },
  {
    id: "p11",
    title: "Dell XPS 15 9530 OLED Touch (13th Gen Core i9, 32GB)",
    description: "High performance creator workstation. 13th Gen Intel Core i9-13900H, 32GB DDR5 RAM, 1TB NVMe SSD, NVIDIA GeForce RTX 4070, and breathtaking 3.5K OLED InfinityEdge touch display.",
    price: 118000,
    condition: "NEW",
    category: "Laptops",
    images: [
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 3,
    location: "Bole Medhanialem, Addis Ababa",
    rating: 4.8,
    isApproved: true,
    isFeatured: false,
    vendorId: "user-vendor-1",
    vendorName: "Bole Electronic Store (Dawit)",
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString()
  },
  {
    id: "p12",
    title: "Lenovo ThinkPad T14s Gen 4 (AMD Ryzen 7 PRO, 16GB)",
    description: "Military-grade durability, legendary ergonomic ThinkPad keyboard, AMD Ryzen 7 PRO processor, 512GB SSD, 14\" WUXGA anti-glare screen with privacy guard. The ultimate corporate laptop in Ethiopia.",
    price: 68000,
    condition: "NEW",
    category: "Laptops",
    images: [
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 5,
    location: "Sarbet, Addis Ababa",
    rating: 4.8,
    isApproved: true,
    isFeatured: false,
    vendorId: "user-vendor-5",
    vendorName: "Piassa Digital Gadgets (Meron)",
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString()
  },
  {
    id: "p13",
    title: "HP Pavilion Gaming 15 (Ryzen 7 7840HS, RTX 4060, 16GB)",
    description: "Smooth 144Hz high refresh display, dual cooling fans with thermal control, RGB backlit keyboard, 1TB PCIe NVMe SSD. Ideal for 3D architecture rendering and AAA gaming.",
    price: 64000,
    condition: "REFURBISHED",
    category: "Laptops",
    images: [
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 2,
    location: "Megenagna, Addis Ababa",
    rating: 4.5,
    isApproved: true,
    isFeatured: false,
    vendorId: "user-vendor-1",
    vendorName: "Bole Electronic Store (Dawit)",
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString()
  },

  // --- PCS & MONITORS ---
  {
    id: "p14",
    title: "Custom Intel Core i9 RTX 4080 Liquid-Cooled Gaming PC",
    description: "Intel Core i9-14900K, 64GB DDR5 RGB RAM, ASUS ROG Strix GeForce RTX 4080 16GB, 2TB Gen4 NVMe SSD, Corsair 360mm AIO Liquid Cooler, Lian Li O11 Dynamic EVO case.",
    price: 195000,
    condition: "NEW",
    category: "PCs",
    images: [
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 2,
    location: "Bole, Addis Ababa",
    rating: 5.0,
    isApproved: true,
    isFeatured: true,
    vendorId: "user-vendor-1",
    vendorName: "Bole Electronic Store (Dawit)",
    createdAt: new Date(Date.now() - 3600000 * 40).toISOString()
  },
  {
    id: "p15",
    title: "Dell OptiPlex 7090 Business Desktop + 24\" IPS Dell Monitor",
    description: "Complete office workstation package. Intel Core i7-11700, 16GB DDR4 RAM, 512GB SSD, Windows 11 Pro, bundled with 24-inch borderless Full HD Dell IPS display, keyboard, and mouse.",
    price: 38000,
    condition: "USED",
    category: "PCs",
    images: [
      "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 7,
    location: "Piassa, Addis Ababa",
    rating: 4.6,
    isApproved: true,
    isFeatured: false,
    vendorId: "user-vendor-5",
    vendorName: "Piassa Digital Gadgets (Meron)",
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString()
  },
  {
    id: "p16",
    title: "Samsung Odyssey G7 32\" 240Hz 1ms Curved Gaming Monitor",
    description: "1000R curvature matching human eye field of view, WQHD (2560x1440) resolution, QLED color depth with HDR600, G-Sync compatible. Perfect for esports and productivity.",
    price: 42000,
    condition: "NEW",
    category: "PCs",
    images: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 4,
    location: "Merkato, Addis Ababa",
    rating: 4.8,
    isApproved: true,
    isFeatured: false,
    vendorId: "user-vendor-5",
    vendorName: "Piassa Digital Gadgets (Meron)",
    createdAt: new Date(Date.now() - 3600000 * 60).toISOString()
  },

  // --- CAMERAS ---
  {
    id: "p3",
    title: "Canon EOS R6 Mark II Mirrorless Camera (Body Only)",
    description: "24.2 MP full-frame sensor, up to 40 fps electronic shutter, 6K oversampled 4K 60p video, in-body image stabilization up to 8 stops. Highly sought-after camera for weddings, films, and studios across Ethiopia.",
    price: 178000,
    condition: "NEW",
    category: "Cameras",
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 3,
    location: "Bole, Addis Ababa",
    rating: 4.9,
    isApproved: true,
    isFeatured: true,
    vendorId: "user-vendor-1",
    vendorName: "Bole Electronic Store (Dawit)",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: "p17",
    title: "Sony Alpha 7 IV Full-Frame Camera + FE 24-70mm GM Lens",
    description: "33MP Exmor R CMOS sensor, 4K 60p 10-bit 4:2:2 recording, real-time eye autofocus for human/animals. Comes bundled with premium Sony G Master 24-70mm f/2.8 lens and 2 original NP-FZ100 batteries.",
    price: 215000,
    condition: "USED",
    category: "Cameras",
    images: [
      "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 1,
    location: "Kazanchis, Addis Ababa",
    rating: 5.0,
    isApproved: true,
    isFeatured: true,
    vendorId: "user-vendor-5",
    vendorName: "Piassa Digital Gadgets (Meron)",
    createdAt: new Date(Date.now() - 3600000 * 80).toISOString()
  },
  {
    id: "p18",
    title: "DJI Mini 4 Pro Drone (Fly More Combo Plus with RC 2)",
    description: "Under 249g ultra-lightweight foldable drone with omnidirectional obstacle sensing, 4K/60fps HDR true vertical shooting for social media, and 45-minute extended battery flight time.",
    price: 96000,
    condition: "NEW",
    category: "Cameras",
    images: [
      "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 3,
    location: "Bole, Addis Ababa",
    rating: 4.8,
    isApproved: true,
    isFeatured: false,
    vendorId: "user-vendor-1",
    vendorName: "Bole Electronic Store (Dawit)",
    createdAt: new Date(Date.now() - 3600000 * 25).toISOString()
  },

  // --- AIRPODS & AUDIO ---
  {
    id: "p5",
    title: "AirPods Pro (2nd Generation) - USB-C MagSafe Case",
    description: "Authentic Apple AirPods Pro 2 with 2x Active Noise Cancellation, Adaptive Audio, Conversation Awareness, and personalized Spatial Audio. Sealed Apple packaging.",
    price: 11200,
    condition: "NEW",
    category: "AirPods",
    images: [
      "https://images.unsplash.com/photo-1588449668338-d15176090c6e?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 18,
    location: "Bole, Addis Ababa",
    rating: 4.8,
    isApproved: true,
    isFeatured: false,
    vendorId: "user-vendor-1",
    vendorName: "Bole Electronic Store (Dawit)",
    createdAt: new Date().toISOString()
  },
  {
    id: "p19",
    title: "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
    description: "Industry leading noise cancellation with two processors and 8 microphones. Up to 30 hours of battery life with quick charging, hands-free Speak-to-Chat, and crystal clear call quality. Silver color.",
    price: 24500,
    condition: "NEW",
    category: "AirPods",
    images: [
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 8,
    location: "Sarbet, Addis Ababa",
    rating: 4.9,
    isApproved: true,
    isFeatured: false,
    vendorId: "user-vendor-5",
    vendorName: "Piassa Digital Gadgets (Meron)",
    createdAt: new Date(Date.now() - 3600000 * 50).toISOString()
  },

  // --- ELECTRONICS & ENTERTAINMENT ---
  {
    id: "p20",
    title: "JBL PartyBox 310 Portable Bluetooth Party Speaker",
    description: "240W powerful JBL Pro sound, synchronized dynamic light show that dances to the beat, built-in karaoke mic and guitar inputs, 18-hour rechargeable battery, and smooth-glide wheels with handle.",
    price: 48000,
    condition: "NEW",
    category: "Electronics",
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 5,
    location: "CMC, Addis Ababa",
    rating: 4.9,
    isApproved: true,
    isFeatured: true,
    vendorId: "user-vendor-1",
    vendorName: "Bole Electronic Store (Dawit)",
    createdAt: new Date(Date.now() - 3600000 * 35).toISOString()
  },
  {
    id: "p21",
    title: "LG 55\" 4K OLED evo Smart TV (WebOS, Dolby Atmos)",
    description: "LG OLED55C3 evo with self-lit pixels for infinite contrast, α9 AI Processor 4K Gen6, 120Hz native refresh rate, 4 HDMI 2.1 ports for gaming, and smart connectivity for DSTV, Netflix, and YouTube.",
    price: 76000,
    condition: "NEW",
    category: "Electronics",
    images: [
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 4,
    location: "Bole, Addis Ababa",
    rating: 4.8,
    isApproved: true,
    isFeatured: false,
    vendorId: "user-vendor-1",
    vendorName: "Bole Electronic Store (Dawit)",
    createdAt: new Date(Date.now() - 3600000 * 90).toISOString()
  },
  {
    id: "p22",
    title: "Sony PlayStation 5 Slim (1TB Disc Edition) + 2 Controllers",
    description: "Original PS5 Slim Disc Edition with 1TB SSD storage, dual DualSense wireless controllers, and includes EA FC 24 game voucher. Official Sony warranty included.",
    price: 52000,
    condition: "NEW",
    category: "Electronics",
    images: [
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 6,
    location: "Megenagna, Addis Ababa",
    rating: 4.9,
    isApproved: true,
    isFeatured: true,
    vendorId: "user-vendor-1",
    vendorName: "Bole Electronic Store (Dawit)",
    createdAt: new Date(Date.now() - 3600000 * 15).toISOString()
  },

  // --- ETHIOPIAN TRADITIONAL FASHION ---
  {
    id: "p4",
    title: "Royal Menen Traditional Habesha Kemis with Gold Netela",
    description: "Exquisite hand-woven Ethiopian fine cotton (Shema) dress decorated with regal multi-color gold Tilet embroidery. Includes matching full-length Netela. Tailored for weddings, holiday celebrations, and special occasions.",
    price: 14500,
    condition: "NEW",
    category: "Fashion",
    images: [
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 8,
    location: "Shiro Meda, Addis Ababa",
    rating: 5.0,
    isApproved: true,
    isFeatured: true,
    vendorId: "user-vendor-2",
    vendorName: "Habesha Hand-Weavers",
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
  },
  {
    id: "p23",
    title: "Oromo Cultural Attire (Hand-Embroidered Wandaboo & Wayyaa)",
    description: "Authentic traditional Oromo dress crafted from premium cotton fabrics featuring classic red, black, and white decorative embroidery patterns. Includes headwrap accessories for Irreecha and wedding festivities.",
    price: 9800,
    condition: "NEW",
    category: "Fashion",
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 6,
    location: "Adama, Ethiopia",
    rating: 4.9,
    isApproved: true,
    isFeatured: true,
    vendorId: "user-vendor-2",
    vendorName: "Habesha Hand-Weavers",
    createdAt: new Date(Date.now() - 3600000 * 45).toISOString()
  },
  {
    id: "p24",
    title: "Tigray Traditional Tilfi Kemis (Authentic Handwoven Cotton)",
    description: "Magnificent handwoven Tilfi dress with intricate geometric needlework along the collar, hem, and cuffs. Soft 100% natural cotton that breathes effortlessly.",
    price: 11000,
    condition: "NEW",
    category: "Fashion",
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 5,
    location: "Mekelle, Ethiopia",
    rating: 4.8,
    isApproved: true,
    isFeatured: false,
    vendorId: "user-vendor-2",
    vendorName: "Habesha Hand-Weavers",
    createdAt: new Date(Date.now() - 3600000 * 110).toISOString()
  },
  {
    id: "p25",
    title: "Men's Traditional Ethiopian Gabi & Kuta Fine Handspun Weave",
    description: "Four-layer thick warm Ethiopian cotton Gabi paired with lightweight single-layer Kuta with elegant green-yellow-red borders. Perfect for church, gatherings, and evening warmth.",
    price: 4200,
    condition: "NEW",
    category: "Fashion",
    images: [
      "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 12,
    location: "Shiro Meda, Addis Ababa",
    rating: 4.9,
    isApproved: true,
    isFeatured: false,
    vendorId: "user-vendor-2",
    vendorName: "Habesha Hand-Weavers",
    createdAt: new Date(Date.now() - 3600000 * 65).toISOString()
  },
  {
    id: "p26",
    title: "Genuine Handcrafted Ethiopian Leather Chelsea Boots",
    description: "Premium full-grain Ethiopian bovine leather boots hand-stitched by master cobblers in Addis Ababa. Durable non-slip rubber lug sole, breathable leather lining, available in sizes 39-45.",
    price: 3800,
    condition: "NEW",
    category: "Fashion",
    images: [
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 20,
    location: "Merkato, Addis Ababa",
    rating: 4.7,
    isApproved: true,
    isFeatured: false,
    vendorId: "user-vendor-6",
    vendorName: "Abyssinia Leather Craft (Tewodros)",
    createdAt: new Date(Date.now() - 3600000 * 85).toISOString()
  },

  // --- VEHICLES ---
  {
    id: "p6",
    title: "Toyota Vitz 2012 (Yaris Hatchback) - Automatic",
    description: "Very economical 1.0L 1KR-FE engine, super clean automatic transmission, original silver paint, ice cold AC, power windows. Plate Code B2-A... registered in Addis. Ready for immediate ownership transfer.",
    price: 1350000,
    condition: "USED",
    category: "Vehicles",
    images: [
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 1,
    location: "Sarbet, Addis Ababa",
    rating: 4.5,
    isApproved: true,
    isFeatured: true,
    vendorId: "user-vendor-4",
    vendorName: "Sheger Auto & Real Estate (Robel)",
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    id: "p27",
    title: "Toyota Corolla 2018 Clean Body Automatic (Plate Code 2)",
    description: "Toyota Corolla 1.6L Dual VVT-i engine, pearl white exterior, beige cloth interior, rear camera, steering controls, low mileage. Inspected and approved with zero mechanical issues.",
    price: 2850000,
    condition: "USED",
    category: "Vehicles",
    images: [
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 1,
    location: "Bole, Addis Ababa",
    rating: 4.8,
    isApproved: true,
    isFeatured: true,
    vendorId: "user-vendor-4",
    vendorName: "Sheger Auto & Real Estate (Robel)",
    createdAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString()
  },
  {
    id: "p28",
    title: "TVS King Deluxe 4-Stroke Bajaj (Three-Wheeler Taxi)",
    description: "Brand new 200cc 4-stroke TVS King Bajaj. Low fuel consumption, rugged chassis for urban transport, waterproof canopy, durable spare parts readily available. Great investment for transport businesses.",
    price: 290000,
    condition: "NEW",
    category: "Vehicles",
    images: [
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 3,
    location: "Hawassa, Ethiopia",
    rating: 4.7,
    isApproved: true,
    isFeatured: false,
    vendorId: "user-vendor-4",
    vendorName: "Sheger Auto & Real Estate (Robel)",
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString()
  },
  {
    id: "p29",
    title: "Suzuki Dzire 2020 Manual Transmission (Low Mileage)",
    description: "Ultra fuel efficient 1.2L engine (over 22 km/L), metallic grey, dual airbags, ABS with EBD, touchscreen audio system. Well maintained with regular service history.",
    price: 1680000,
    condition: "USED",
    category: "Vehicles",
    images: [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 1,
    location: "Addis Ababa",
    rating: 4.6,
    isApproved: true,
    isFeatured: false,
    vendorId: "user-vendor-4",
    vendorName: "Sheger Auto & Real Estate (Robel)",
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString()
  },
  {
    id: "p30",
    title: "Hyundai Tucson 2021 All-Wheel Drive (Panoramic Sunroof)",
    description: "SmartSense active safety features, leather heated seats, digital instrument cluster, power tailgate, 19-inch alloy wheels. Elegant phantom black color.",
    price: 4200000,
    condition: "USED",
    category: "Vehicles",
    images: [
      "https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 1,
    location: "Bole Atlas, Addis Ababa",
    rating: 4.9,
    isApproved: true,
    isFeatured: true,
    vendorId: "user-vendor-4",
    vendorName: "Sheger Auto & Real Estate (Robel)",
    createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString()
  },

  // --- REAL ESTATE ---
  {
    id: "p7",
    title: "Luxury 3-Bedroom Furnished Apartment in Bole Atlas",
    description: "High-end apartment in Bole with 24/7 backup generator, water reservoir tanks, modern European kitchen, high-speed fiber internet, elevator, and underground reserved parking. Monthly rental rate.",
    price: 45000,
    condition: "NEW",
    category: "Real Estate",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 1,
    location: "Bole, Addis Ababa",
    rating: 4.8,
    isApproved: true,
    isFeatured: true,
    vendorId: "user-vendor-4",
    vendorName: "Sheger Auto & Real Estate (Robel)",
    createdAt: new Date(Date.now() - 3600000 * 24 * 8).toISOString()
  },
  {
    id: "p31",
    title: "Modern 2-Bedroom Condominium in CMC (G+4 Building)",
    description: "Spacious master bedroom with ensuite bath, ceramic tile flooring, kitchen cabinetry installed, separate balcony with panoramic Addis mountain views. Gated community with guard service.",
    price: 22000,
    condition: "NEW",
    category: "Real Estate",
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 1,
    location: "CMC, Addis Ababa",
    rating: 4.7,
    isApproved: true,
    isFeatured: false,
    vendorId: "user-vendor-4",
    vendorName: "Sheger Auto & Real Estate (Robel)",
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
  },
  {
    id: "p32",
    title: "Prime Commercial Retail Shop Space in Merkato Main Plaza",
    description: "45 square meter ground floor storefront with heavy foot traffic in the heart of Merkato. Features shatterproof glass display, roller shutter security doors, and private electrical sub-meter.",
    price: 35000,
    condition: "NEW",
    category: "Real Estate",
    images: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 1,
    location: "Merkato, Addis Ababa",
    rating: 4.6,
    isApproved: true,
    isFeatured: false,
    vendorId: "user-vendor-4",
    vendorName: "Sheger Auto & Real Estate (Robel)",
    createdAt: new Date(Date.now() - 3600000 * 24 * 12).toISOString()
  },
  {
    id: "p33",
    title: "Luxury 4-Bedroom G+2 Villa Compound with Garden in Ayat",
    description: "Exquisite residential villa on a 350 sqm plot. Features 4 spacious bedrooms, maid quarter, landscaped garden, parking for 4 vehicles, high perimeter fence with electric razor wire, and guard house.",
    price: 75000,
    condition: "NEW",
    category: "Real Estate",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 1,
    location: "Ayat, Addis Ababa",
    rating: 5.0,
    isApproved: true,
    isFeatured: true,
    vendorId: "user-vendor-4",
    vendorName: "Sheger Auto & Real Estate (Robel)",
    createdAt: new Date(Date.now() - 3600000 * 24 * 15).toISOString()
  },

  // --- ETHIOPIAN AGRO, COFFEE & SPICES ---
  {
    id: "p8",
    title: "Organic Sidama Specialty Grade-1 Washed Coffee Beans (1kg)",
    description: "Award-winning Arabica coffee beans directly from Sidama smallholder farmer cooperatives. Medium roast profile with vibrant jasmine aroma, peach sweetness, and silky body. Freshly roasted upon order.",
    price: 850,
    condition: "NEW",
    category: "Agro & Coffee",
    images: [
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 45,
    location: "Sidama, Ethiopia",
    rating: 5.0,
    isApproved: true,
    isFeatured: true,
    vendorId: "user-vendor-3",
    vendorName: "Merkato Spices & Agro (Kedir)",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: "p35",
    title: "Single-Origin Yirgacheffe Natural Grade-1 Whole Beans (1kg)",
    description: "Sun-dried natural coffee from the birthplace of Arabica in Yirgacheffe. Complex notes of ripe blueberry, bergamot citrus, and honey sweetness. World renowned Ethiopian heritage.",
    price: 950,
    condition: "NEW",
    category: "Agro & Coffee",
    images: [
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 35,
    location: "Bole, Addis Ababa",
    rating: 4.9,
    isApproved: true,
    isFeatured: true,
    vendorId: "user-vendor-3",
    vendorName: "Merkato Spices & Agro (Kedir)",
    createdAt: new Date(Date.now() - 3600000 * 32).toISOString()
  },
  {
    id: "p34",
    title: "Pure White Magna Teff Grain (First Quality, Gojjam) - 50kg Sack",
    description: "Direct harvest premium Magna Teff from fertile Gojjam soil. Cleaned, destoned, and packaged in a reinforced 50kg grain sack. Makes fluffy, sour, authentic Ethiopian Injera.",
    price: 6200,
    condition: "NEW",
    category: "Agro & Coffee",
    images: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 50,
    location: "Merkato, Addis Ababa",
    rating: 5.0,
    isApproved: true,
    isFeatured: false,
    vendorId: "user-vendor-3",
    vendorName: "Merkato Spices & Agro (Kedir)",
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: "p36",
    title: "Authentic Clay Jebena with 6 Sini Cups & Wood Rekebot Set",
    description: "Handmade fired terracotta Ethiopian Jebena for traditional coffee ceremonies. Bundled with 6 gold-rimmed ceramic Sini cups and a carved wooden Rekebot serving table. Preserving Ethiopian cultural warmth.",
    price: 1850,
    condition: "NEW",
    category: "Agro & Coffee",
    images: [
      "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 15,
    location: "Piassa, Addis Ababa",
    rating: 4.8,
    isApproved: true,
    isFeatured: false,
    vendorId: "user-vendor-3",
    vendorName: "Merkato Spices & Agro (Kedir)",
    createdAt: new Date(Date.now() - 3600000 * 55).toISOString()
  },
  {
    id: "p37",
    title: "Amharic-English Tech Dictionary & History of Ethiopia Book Set",
    description: "Hardcover collector edition covering Ethiopian history, Geez linguistic roots, and modern computing terms translated into Amharic. Ideal for scholars, students, and diaspora readers.",
    price: 1200,
    condition: "NEW",
    category: "Books",
    images: [
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 25,
    location: "Arat Kilo, Addis Ababa",
    rating: 4.9,
    isApproved: true,
    isFeatured: false,
    vendorId: "user-vendor-2",
    vendorName: "Habesha Hand-Weavers",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: "p40",
    title: "Oromia & Ethiopian History: Cultural Heritage & Folklore Anthology",
    description: "Illustrated hardcover collection chronicling ancient trade routes, Gadaa democratic systems, and traditional Ethiopian literature in English and Afaan Oromoo.",
    price: 950,
    condition: "NEW",
    category: "Books",
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 20,
    location: "Arat Kilo, Addis Ababa",
    rating: 4.9,
    isApproved: true,
    isFeatured: false,
    vendorId: "user-vendor-2",
    vendorName: "Habesha Hand-Weavers",
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },

  // --- SERVICES ---
  {
    id: "p38",
    title: "Professional Cross-Country Freight & Cargo Truck Logistics",
    description: "Licensed freight service connecting Addis Ababa, Hawassa, Dire Dawa, Bahir Dar, and Mekelle. Safe cargo handling, real-time GPS tracking, and delivery confirmation right to your warehouse.",
    price: 4500,
    condition: "NEW",
    category: "Services",
    images: [
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80"
    ],
    stock: 10,
    location: "Merkato, Addis Ababa",
    rating: 4.9,
    isApproved: true,
    isFeatured: true,
    vendorId: "user-vendor-3",
    vendorName: "Merkato Spices & Agro (Kedir)",
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
  }
];

export const SEED_REVIEWS: Review[] = [
  {
    id: "r1",
    productId: "p1",
    reviewerId: "user-buyer",
    reviewerName: "Almaz Kebede",
    rating: 5,
    comment: "Exceptional service from Dawit! The iPhone is absolutely brand new and original. Quick transaction using Telebirr.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    id: "r2",
    productId: "p4",
    reviewerId: "user-buyer",
    reviewerName: "Almaz Kebede",
    rating: 5,
    comment: "The embroidery and Hand-weaving details are gorgeous. It fits perfectly! Best Habesha Kemis I've ever purchased.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString()
  },
  {
    id: "r3",
    productId: "p8",
    reviewerId: "user-buyer",
    reviewerName: "Yohannes Bekele",
    rating: 5,
    comment: "The Sidama coffee aroma is unbelievable! Rich medium roast, freshly ground in Addis. Highly recommended.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString()
  },
  {
    id: "r4",
    productId: "p6",
    reviewerId: "user-buyer",
    reviewerName: "Ephraim Tadesse",
    rating: 5,
    comment: "Clean Toyota Vitz, honest dealer Robel in Sarbet. The paperwork was verified quickly.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  },
  {
    id: "r5",
    productId: "p2",
    reviewerId: "user-buyer",
    reviewerName: "Sara Hailu",
    rating: 5,
    comment: "MacBook Pro M3 is a powerhouse for my video editing work. 100% authentic Apple device from Bole Electronic Store.",
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
  }
];

export const SEED_MESSAGES: Message[] = [
  {
    id: "m1",
    text: "Meles, is the Toyota Vitz price negotiable? Can I pay part via Chapa bank transfer?",
    senderId: "user-buyer",
    receiverId: "user-vendor-4",
    senderName: "Almaz Kebede",
    receiverName: "Sheger Auto & Real Estate (Robel)",
    productId: "p6",
    productTitle: "Toyota Vitz 2012 (Yaris Hatchback)",
    isRead: true,
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString()
  },
  {
    id: "m2",
    text: "Selam Almaz! Yes, we can negotiate slightly. Bank transfer is highly preferred. When would you like to view the car in Sarbet?",
    senderId: "user-vendor-4",
    receiverId: "user-buyer",
    senderName: "Sheger Auto & Real Estate (Robel)",
    receiverName: "Almaz Kebede",
    productId: "p6",
    productTitle: "Toyota Vitz 2012 (Yaris Hatchback)",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 9).toISOString()
  }
];

export const SEED_ORDERS: Order[] = [
  {
    id: "order-1",
    buyerId: "user-buyer",
    buyerName: "Almaz Kebede",
    items: [
      {
        productId: "p4",
        title: "Royal Menen Traditional Habesha Kemis with Gold Netela",
        price: 14500,
        quantity: 1
      }
    ],
    totalAmount: 14500,
    paymentMethod: "TELEBIRR",
    paymentStatus: "PAID",
    deliveryStatus: "SHIPPED",
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString()
  },
  {
    id: "order-2",
    buyerId: "user-buyer",
    buyerName: "Almaz Kebede",
    items: [
      {
        productId: "p8",
        title: "Organic Sidama Specialty Grade-1 Washed Coffee Beans (1kg)",
        price: 850,
        quantity: 2
      }
    ],
    totalAmount: 1700,
    paymentMethod: "CHAPA",
    paymentStatus: "PAID",
    deliveryStatus: "DELIVERED",
    createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString()
  }
];

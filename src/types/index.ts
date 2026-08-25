export type ProductCategory = "wheat" | "millet" | "pulse" | "multigrain";

export type ProductVariant = {
  size: string;
  sku: string;
  price: number;
  mrp: number;
  weightKg: number;
  inStock: boolean;
};

export type Nutrition = {
  serving: string;
  energyKcal: number;
  protein: number;
  carbs: number;
  fibre: number;
  fat: number;
  iron: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  category: ProductCategory;
  image: string;
  gallery: string[];
  ingredients: string[];
  origin: string;
  badges: string[];
  featured: boolean;
  rating: number;
  reviewCount: number;
  variants: ProductVariant[];
  nutrition: Nutrition;
  related: string[];
  subscribeEligible: boolean;
};

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string }
  | { type: "ul"; items: string[] };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  readMinutes: number;
  author: string;
  content: BlogBlock[];
};

export type Review = {
  id: string;
  productSlug?: string;
  name: string;
  city: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
  photo?: string;
  video?: string;
};

export type Store = {
  id: string;
  name: string;
  type: "mill" | "store" | "pickup";
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  hours: string;
  lat: number;
  lng: number;
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  size: string;
  sku: string;
  price: number;
  mrp: number;
  qty: number;
  subscribe: boolean;
};

export type Order = {
  id: string;
  createdAt: string;
  status: "confirmed" | "packed" | "shipped" | "delivered" | "cancelled";
  paymentMethod: "razorpay" | "cod";
  paymentStatus: "paid" | "pending" | "failed";
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  codFee: number;
  total: number;
  coupon?: string;
  notes?: string;
  trackingNote: string;
};

export type Faq = {
  q: string;
  a: string;
};

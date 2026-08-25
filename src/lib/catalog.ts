import productsData from "@/data/products.json";
import postsData from "@/data/posts.json";
import reviewsData from "@/data/reviews.json";
import storesData from "@/data/stores.json";
import faqsData from "@/data/faqs.json";
import type { BlogPost, Faq, Product, Review, Store } from "@/types";
import { readRuntime } from "@/lib/runtime";

export function getProducts(): Product[] {
  const overlay = readRuntime<Product[] | null>("products.json", null);
  return (overlay ?? (productsData as Product[])).filter(Boolean);
}

export function getProduct(slug: string) {
  return getProducts().find((p) => p.slug === slug);
}

export function getFeaturedProducts() {
  return getProducts().filter((p) => p.featured);
}

export function getRelated(product: Product) {
  const all = getProducts();
  return product.related
    .map((slug) => all.find((p) => p.slug === slug))
    .filter((p): p is Product => Boolean(p));
}

export function getPosts(): BlogPost[] {
  const overlay = readRuntime<BlogPost[] | null>("posts.json", null);
  return overlay ?? (postsData as BlogPost[]);
}

export function getPost(slug: string) {
  return getPosts().find((p) => p.slug === slug);
}

export function getReviews(): Review[] {
  const extra = readRuntime<Review[]>("reviews-extra.json", []);
  return [...extra, ...(reviewsData as Review[])];
}

export function getProductReviews(slug: string) {
  return getReviews().filter((r) => r.productSlug === slug);
}

export function getStores(): Store[] {
  return storesData as Store[];
}

export function getFaqs(): Faq[] {
  return faqsData as Faq[];
}

export function searchProducts(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return getProducts().filter((p) => {
    const hay = [
      p.name,
      p.tagline,
      p.description,
      p.category,
      p.origin,
      ...p.badges,
      ...p.ingredients,
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

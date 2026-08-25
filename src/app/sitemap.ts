import { getPosts, getProducts } from "@/lib/catalog";
import { SITE } from "@/lib/site";

export default function sitemap() {
  const staticRoutes = ["", "/shop", "/about", "/how-its-made", "/blog", "/reviews", "/contact", "/cart", "/track"].map(
    (path) => ({
      url: `${SITE.url}${path}`,
      lastModified: new Date(),
    }),
  );
  const products = getProducts().map((p) => ({
    url: `${SITE.url}/shop/${p.slug}`,
    lastModified: new Date(),
  }));
  const posts = getPosts().map((p) => ({
    url: `${SITE.url}/blog/${p.slug}`,
    lastModified: new Date(p.date),
  }));
  return [...staticRoutes, ...products, ...posts];
}

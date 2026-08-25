import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, getProductReviews, getProducts, getRelated } from "@/lib/catalog";
import { ProductDetail } from "@/components/shop/ProductDetail";
import { JsonLd } from "@/components/JsonLd";
import { productJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Flour" };
  return {
    title: product.name,
    description: product.description,
    openGraph: { images: [product.image] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const related = getRelated(product);
  const reviews = getProductReviews(product.slug);

  return (
    <>
      <JsonLd
        data={productJsonLd({
          name: product.name,
          description: product.description,
          slug: product.slug,
          image: product.image,
          rating: product.rating,
          reviewCount: product.reviewCount,
          price: product.variants[0].price,
        })}
      />
      <ProductDetail product={product} related={related} reviews={reviews} />
    </>
  );
}

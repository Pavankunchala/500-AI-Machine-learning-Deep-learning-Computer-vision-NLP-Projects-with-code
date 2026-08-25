import { SITE } from "@/lib/site";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    foundingDate: String(SITE.founded),
    email: SITE.email,
    telephone: SITE.phone,
    sameAs: [SITE.instagram, SITE.facebook, SITE.youtube],
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address,
      addressCountry: "IN",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: SITE.rating,
      reviewCount: SITE.reviewCount,
    },
  };
}

export function productJsonLd(product: {
  name: string;
  description: string;
  slug: string;
  image: string;
  rating: number;
  reviewCount: number;
  price: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: `${SITE.url}${product.image}`,
    brand: { "@type": "Brand", name: SITE.name },
    sku: product.slug,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability: "https://schema.org/InStock",
      url: `${SITE.url}/shop/${product.slug}`,
    },
  };
}

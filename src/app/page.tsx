import { Hero } from "@/components/home/Hero";
import { ValueProps } from "@/components/home/ValueProps";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { StoryTeaser } from "@/components/home/StoryTeaser";
import { Testimonials } from "@/components/home/Testimonials";
import { TrustBadges } from "@/components/home/TrustBadges";
import { Newsletter } from "@/components/home/Newsletter";
import { Instagram } from "@/components/home/Instagram";
import { getFeaturedProducts, getReviews } from "@/lib/catalog";

export default function HomePage() {
  const featured = getFeaturedProducts();
  const reviews = getReviews();

  return (
    <>
      <Hero />
      <ValueProps />
      <FeaturedProducts products={featured} />
      <StoryTeaser />
      <Testimonials reviews={reviews} />
      <TrustBadges />
      <Newsletter />
      <Instagram />
    </>
  );
}

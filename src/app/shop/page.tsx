import type { Metadata } from "next";
import { getProducts } from "@/lib/catalog";
import { ShopGrid } from "@/components/shop/ShopGrid";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Shop stone-ground flours",
  description: "Chakki atta, organic wheat, multigrain, besan, jowar, bajra, ragi and dalia — packed the week they are ground.",
};

export default function ShopPage() {
  return <ShopGrid products={getProducts()} />;
}

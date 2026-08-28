import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProduct, type Product } from "@/lib/api";
import { ProductDetailClient } from "./ProductDetailClient";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const product = await fetchProduct(slug);
    return {
      title: `Buy ${product.name} Perfume Online in Pakistan | Scentra Ryv`,
      description: `${product.name} by Scentra Ryv — ${product.short_description} Order online with Cash on Delivery across Pakistan.`,
    };
  } catch {
    return { title: "Product | Scentra Ryv" };
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  let product: Product;
  try {
    product = await fetchProduct(slug);
  } catch {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}

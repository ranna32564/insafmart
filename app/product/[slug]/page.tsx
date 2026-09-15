import { ProductView } from "@/components/product-view";

export default function ProductPage({ params }: { params: { slug: string } }) {
  return <ProductView slug={params.slug} />;
}

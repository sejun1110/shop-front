"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductModal from "@/modal/ProductModal";

export default function ProductEditPage() {
  const params = useParams();
  const productId = Number(params.id);
  const router = useRouter();
  const [showModal, setShowModal] = useState(true);

  if (isNaN(productId)) return <div>잘못된 상품 ID입니다.</div>;

  return (
    <ProductModal
      show={showModal}
      onClose={() => router.push("/")}
      onSaved={() => router.push("/")}
      productId={productId}
      mode="edit"
    />
  );
}

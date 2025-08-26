"use client";

import { Suspense } from "react";
import ProductsPage from "./ProductsPage"; // pindahin logika ke file terpisah kalau mau

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsPage />
    </Suspense>
  );
}

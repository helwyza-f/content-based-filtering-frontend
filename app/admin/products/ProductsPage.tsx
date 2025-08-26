"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

type Product = {
  id: number;
  product_display_name: string | null;
  gender: string | null;
  master_category: string | null;
  sub_category: string | null;
  article_type: string | null;
  base_colour: string | null;
  season: string | null;
  year: number | null;
  usage: string | null;
  image_link: string | null;
};

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // query state
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const limit = 10; // items per page

  // fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      const params = new URLSearchParams({
        q: search,
        page: page.toString(),
        limit: limit.toString(),
      });

      const res = await fetch(`/api/products?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      setProducts(data.products);
      setTotal(data.total);
    };

    fetchProducts();
  }, [search, page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Products</h1>

      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={() => setPage(1)}>Search</Button>
      </div>

      {/* Products List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="border rounded-2xl shadow-md hover:shadow-xl transition-shadow p-4 flex flex-col items-center bg-white"
          >
            <Link
              href={`/admin/products/${product.id}`}
              className="flex flex-col items-center w-full"
            >
              {product.image_link ? (
                <Image
                  src={product.image_link}
                  alt={product.product_display_name || ""}
                  width={200}
                  height={200}
                  className="object-cover rounded-xl mb-3"
                />
              ) : (
                <div className="w-48 h-48 bg-gray-200 rounded-xl mb-3 flex items-center justify-center">
                  No Image
                </div>
              )}

              <h2 className="mt-1 font-semibold text-center text-lg line-clamp-2">
                {product.product_display_name}
              </h2>
            </Link>

            {/* Metadata Grid */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-700 w-full">
              {product.gender && (
                <p>
                  <strong>Gender:</strong> {product.gender}
                </p>
              )}
              {/* {product.master_category && <p><strong>Category:</strong> {product.master_category}</p>} */}
              {/* {product.sub_category && <p><strong>Sub:</strong> {product.sub_category}</p>} */}
              {product.article_type && (
                <p>
                  <strong>Type:</strong> {product.article_type}
                </p>
              )}
              {product.base_colour && (
                <p>
                  <strong>Color:</strong> {product.base_colour}
                </p>
              )}
              {/* {product.season && <p><strong>Season:</strong> {product.season}</p>} */}
              {/* {product.year && <p><strong>Year:</strong> {product.year}</p>} */}
              {product.usage && (
                <p>
                  <strong>Usage:</strong> {product.usage}
                </p>
              )}
            </div>

            <Button
              className="mt-4 w-full"
              variant="outline"
              onClick={() => router.push(`/admin/products/${product.id}`)}
            >
              View Details
            </Button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-6">
        <Button
          variant="outline"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

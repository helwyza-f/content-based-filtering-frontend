"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import FilterBar from "./filterBar";
import { Skeleton } from "@/components/ui/skeleton";

type Item = {
  id: number;
  productDisplayName: string;
  baseColour: string;
  articleType: string;
  link: string | null;
};

type Props = {
  gender: string;
  skinTone: string;
};

const ITEMS_PER_PAGE = 12;

export default function CatalogClient({ gender, skinTone }: Props) {
  const [catalog, setCatalog] = useState<Item[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const fetchFilteredCatalog = async (
    activeFilters: Record<string, string>,
    currentPage = 1
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...activeFilters,
        limit: ITEMS_PER_PAGE.toString(),
        page: currentPage.toString(),
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/catalog?${params.toString()}`
      );

      const json = await res.json();
      setCatalog(json.catalog);
      setTotalPages(Math.ceil(json.totalItems / ITEMS_PER_PAGE));
    } catch (err) {
      console.error("Failed to fetch catalog:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredCatalog(filters, page);
  }, [filters, page]);

  const handleSelect = (id: number) => {
    router.push(`/recommend?id=${id}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Outfit Catalog</h1>
      <p className="text-center text-muted-foreground mb-6">
        Gender: <strong>{gender}</strong> | Skin Tone:{" "}
        <strong>{skinTone}</strong>
      </p>

      <FilterBar
        onChange={(f) => {
          setPage(1); // reset to page 1 on filter change
          setFilters(f);
        }}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="w-full h-60 rounded-xl" />
                <Skeleton className="w-3/4 h-5" />
                <Skeleton className="w-1/2 h-4" />
                <Skeleton className="w-full h-10" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {catalog.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer hover:shadow-lg transition"
              >
                <CardContent className="p-4 flex flex-col items-center gap-3">
                  {item.link && (
                    <Image
                      src={item.link}
                      alt={item.productDisplayName}
                      width={300}
                      height={300}
                      className="rounded-xl object-cover w-full h-60"
                    />
                  )}
                  <h3 className="font-semibold text-center">
                    {item.productDisplayName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {item.baseColour} - {item.articleType}
                  </p>
                  <Button onClick={() => handleSelect(item.id)}>
                    Use as Reference
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* === Pagination with Input === */}
          <div className="mt-8 flex justify-center items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              ← Previous
            </Button>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = (
                  e.currentTarget.elements.namedItem("page") as HTMLInputElement
                )?.value;
                const newPage = parseInt(input);
                if (!isNaN(newPage)) {
                  handlePageChange(newPage);
                }
              }}
              className="flex items-center gap-2"
            >
              <span className="text-sm text-muted-foreground">Page</span>
              <input
                name="page"
                type="number"
                min={1}
                max={totalPages}
                defaultValue={page}
                className="w-20 px-2 py-1 text-center text-sm border rounded-md bg-background border-border"
              />
              <span className="text-sm text-muted-foreground">
                of {totalPages}
              </span>
            </form>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              Next →
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

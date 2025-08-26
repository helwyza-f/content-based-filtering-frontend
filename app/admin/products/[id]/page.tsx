"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

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

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Produk berhasil dihapus");
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error("Gagal menghapus produk!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat menghapus produk.");
    }
  };

  if (loading) return <p className="text-center py-8">Loading...</p>;
  if (!product) return <p className="text-center py-8">Produk tidak ditemukan.</p>;

  return (
    <div className="max-w-5xl mx-auto">
      <Card className="overflow-hidden shadow-xl rounded-2xl">
        {product.image_link && (
          <div className="relative w-full h-[420px] bg-gray-100 flex items-center justify-center">
            <img
              src={product.image_link}
              alt={product.product_display_name || "Product"}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )}
        <CardContent className="p-8 space-y-8">
          {/* Title + Actions */}
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
              {product.product_display_name}
            </h1>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push(`/admin/products/${id}/edit`)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Edit
              </Button>

              {/* Delete pakai AlertDialog */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Yakin hapus produk ini?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Aksi ini tidak bisa dibatalkan. Produk akan dihapus permanen dari database.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Ya, Hapus
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 text-base leading-relaxed">
            <div>
              <p className="text-gray-500 font-medium">Gender</p>
              <p className="text-gray-900 font-semibold">
                {product.gender || "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Master Category</p>
              <p className="text-gray-900 font-semibold">
                {product.master_category || "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Sub Category</p>
              <p className="text-gray-900 font-semibold">
                {product.sub_category || "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Article Type</p>
              <p className="text-gray-900 font-semibold">
                {product.article_type || "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Base Colour</p>
              <p className="text-gray-900 font-semibold">
                {product.base_colour || "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Season</p>
              <p className="text-gray-900 font-semibold">
                {product.season || "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Year</p>
              <p className="text-gray-900 font-semibold">
                {product.year || "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Usage</p>
              <p className="text-gray-900 font-semibold">
                {product.usage || "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

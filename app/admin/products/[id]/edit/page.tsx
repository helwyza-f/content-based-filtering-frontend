// app/admin/products/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

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

export default function EditProductPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>({});

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
      } else {
        setProduct(data);
        setForm(data);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id, supabase]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // ketika submit edit
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!id) return;

  // Buat salinan form tanpa id
  const { id: _, ...updateData } = form;

  const { error } = await supabase
    .from("products")
    .update(updateData) // ⬅️ id sudah tidak ada
    .eq("id", id);

  if (error) {
    console.error("Update error:", error);
  } else {
    router.push("/admin/products/" + id);
  }
};


  if (loading) return <p className="p-4">Loading...</p>;
  if (!product) return <p className="p-4">Product not found.</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Edit Product</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="product_display_name"
              value={form.product_display_name || ""}
              onChange={handleChange}
              placeholder="Product Display Name"
            />
            <Input
              name="gender"
              value={form.gender || ""}
              onChange={handleChange}
              placeholder="Gender"
            />
            <Input
              name="master_category"
              value={form.master_category || ""}
              onChange={handleChange}
              placeholder="Master Category"
            />
            <Input
              name="sub_category"
              value={form.sub_category || ""}
              onChange={handleChange}
              placeholder="Sub Category"
            />
            <Input
              name="article_type"
              value={form.article_type || ""}
              onChange={handleChange}
              placeholder="Article Type"
            />
            <Input
              name="base_colour"
              value={form.base_colour || ""}
              onChange={handleChange}
              placeholder="Base Colour"
            />
            <Input
              name="season"
              value={form.season || ""}
              onChange={handleChange}
              placeholder="Season"
            />
            <Input
              type="number"
              name="year"
              value={form.year || ""}
              onChange={handleChange}
              placeholder="Year"
            />
            <Input
              name="usage"
              value={form.usage || ""}
              onChange={handleChange}
              placeholder="Usage"
            />
            <Input
              name="image_link"
              value={form.image_link || ""}
              onChange={handleChange}
              placeholder="Image Link"
              disabled
            />

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/admin/products")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

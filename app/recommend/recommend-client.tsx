"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  userId: string;
  skinTone: string;
  userGender: string;
};

type Product = {
  id: number;
  product_display_name: string;
  base_colour: string;
  article_type: string;
  sub_category: string;
  mapped_category: string;
  image_link: string;
};

type RecommendationResponse = {
  recommendations: {
    [style: string]: {
      [category: string]: Product[];
    };
  };
};

type TryOnResult = {
  image: string;
  products: Product[];
};

export default function RecommendClient({
  userId,
  skinTone,
  userGender,
}: Props) {
  const [tab, setTab] = useState("formal");
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  // Tambahkan state baru untuk komentar try-on
  const [tryOnComment, setTryOnComment] = useState("");
  const [submittingTryOn, setSubmittingTryOn] = useState(false);
  const router = useRouter();

  // 🔹 state untuk pilihan user
  const [selected, setSelected] = useState<{
    [category: string]: Product | null;
  }>({});

  // 🔹 state hasil try-on
  const [tryOnResult, setTryOnResult] = useState<TryOnResult | null>(null);
  // 🔹 state loading try-on
  const [loadingTryOn, setLoadingTryOn] = useState(false);

  const supabase = createClient();

  // 💡 Fungsi utilitas untuk memetakan kategori dari sub_category
  const getPrimaryCategory = (product: Product): string | null => {
    const subCategory = product.sub_category || product.mapped_category;

    if (subCategory === "Topwear") {
      return "Topwear";
    }
    if (subCategory === "Bottomwear") {
      return "Bottomwear";
    }
    if (subCategory === "Footwear") {
      // Berdasarkan data Anda, Footwear -> Shoes
      return "Footwear";
    }
    if (
      subCategory === "Bags" ||
      subCategory === "Watches" ||
      subCategory === "Headwear" ||
      subCategory === "Water Bottle"
    ) {
      return "Accessories";
    }

    // Tambahkan kondisi lain jika ada kategori baru di masa depan
    return null;
  };

  // 🔹 Fetch rekomendasi
  useEffect(() => {
    async function fetchRecommendations() {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/recommend`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gender: userGender, skin_tone: skinTone }),
          }
        );
        const json = await res.json();
        setData(json);
        // console.log("Fetched recommendations:", json);
      } catch (err) {
        console.error("Failed to fetch recommendations", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [userGender, skinTone]);

  // 🔹 Fetch produk terbaru dari Supabase
  useEffect(() => {
    async function fetchRecent() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        // 💡 Filter berdasarkan gender yang sesuai dengan user
        .eq("gender", userGender)
        // 💡 Filter untuk sub_category "Topwear" ATAU "Bottomwear"
        .in("sub_category", ["Topwear", "Bottomwear"])
        .order("created_at", { ascending: false, nullsFirst: false })
        .limit(4);

      if (!error && data) {
        setRecentProducts(data as Product[]);
      }
      // console.log("Recent products fetched:", data); // Anda bisa aktifkan ini untuk debugging
    }
    fetchRecent();
  }, [supabase, userGender]);
  // 🔹 Subscribe realtime ke Supabase
  useEffect(() => {
    const channel = supabase
      .channel("realtime:products")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "products" },
        (payload) => {
          setRecentProducts((prev) =>
            [payload.new as Product, ...prev].slice(0, 4)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  useEffect(() => {
    console.log("Recent products updated:", recentProducts);
  }, [recentProducts]);

  // 🔹 handle pilih produk per kategori
  const toggleSelect = (product: Product) => {
    // console.log("Toggling select for product:", product);
    const category = getPrimaryCategory(product);
    if (category) {
      setSelected((prev) => ({
        ...prev,
        [category]: prev[category]?.id === product.id ? null : product,
      }));
    } else {
      toast.warning("Kategori produk ini tidak dikenal.");
    }
  };

  // Fungsi baru untuk menyimpan hasil try-on
  const handleSaveTryOn = async () => {
    if (!tryOnResult) {
      toast.warning("Tidak ada hasil try-on untuk disimpan.");
      return;
    }

    setSubmittingTryOn(true);

    try {
      const res = await fetch("/api/save-tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          style: tab,
          resultImage: tryOnResult.image,
          products: tryOnResult.products,
          comment: tryOnComment,
        }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan hasil try-on");

      toast.success("Hasil try-on berhasil disimpan!");
      setTryOnComment(""); // Reset komentar
    } catch (err) {
      console.error("Error saving try-on:", err);
      toast.error("Gagal menyimpan hasil try-on");
    } finally {
      router.push("/history"); // Redirect ke halaman riwayat
      setSubmittingTryOn(false);
    }
  };

  // 🔹 kirim ke /api/tryon
  const handleGenerate = async () => {
    if (!selected["Topwear"] || !selected["Bottomwear"]) {
      toast.warning("Pilih minimal Topwear dan Bottomwear");
      return;
    }

    setLoadingTryOn(true);
    setTryOnResult(null);

    try {
      const res = await fetch("/api/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          topwear: selected["Topwear"]?.id,
          bottomwear: selected["Bottomwear"]?.id,
          footwear: selected["Footwear"]?.id || null,
          accessories: selected["Accessories"]?.id || null,
          style: tab,
        }),
      });

      const json = await res.json();
      console.log("Generated try-on:", json);

      if (json.error) throw new Error(json.error);

      setTryOnResult(json);
      toast.success("Try-on berhasil dibuat!");
    } catch (err) {
      console.error("Error generate try-on:", err);
      toast.error("Gagal generate try-on");
    } finally {
      setLoadingTryOn(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!data)
    return <p className="text-center mt-10">No recommendations found.</p>;

  const styles = Object.keys(data.recommendations);

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4">
      {/* Info user */}
      <div className="p-4 border rounded-lg shadow-sm">
        <p>
          <span className="font-semibold">Gender:</span> {userGender}
        </p>
        <p>
          <span className="font-semibold">Skin Tone:</span> {skinTone}
        </p>
      </div>

      {/* Recent Products Section */}
      {recentProducts.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Recent Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {recentProducts.map((item) => {
              const category = getPrimaryCategory(item); // Gunakan fungsi pemetaan yang baru
              const isSelected = category && selected[category]?.id === item.id;

              return (
                <Card
                  key={item.id}
                  onClick={() => toggleSelect(item)} // Panggil toggleSelect dengan item
                  className={`cursor-pointer transition border-2 ${
                    isSelected ? "border-blue-500" : "border-transparent"
                  }`}
                >
                  <CardContent className="p-2 flex flex-col items-center">
                    {/* Gunakan tag <img> untuk menghindari masalah timeout */}
                    <img
                      src={item.image_link}
                      alt={item.product_display_name}
                      width={120}
                      height={120}
                      className="rounded-md object-cover"
                    />
                    <p className="mt-2 text-sm text-center">
                      {item.product_display_name}
                    </p>
                    <span className="text-xs text-gray-500">
                      {item.base_colour}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs Rekomendasi */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-3 w-full">
          {styles.map((style) => (
            <TabsTrigger key={style} value={style}>
              {style.charAt(0).toUpperCase() + style.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        {styles.map((style) => (
          <TabsContent key={style} value={style}>
            <div className="space-y-6">
              {Object.entries(data.recommendations[style]).map(
                ([category, items]) =>
                  items.length > 0 ? (
                    <section key={category}>
                      <h3 className="text-lg font-semibold mb-3">{category}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {items.map((item) => {
                          const isSelected = selected[category]?.id === item.id;
                          return (
                            <Card
                              key={item.id}
                              onClick={() => toggleSelect(item)}
                              className={`cursor-pointer transition border-2 ${
                                isSelected
                                  ? "border-blue-500"
                                  : "border-transparent"
                              }`}
                            >
                              <CardContent className="p-2 flex flex-col items-center">
                                <Image
                                  src={item.image_link}
                                  alt={item.product_display_name}
                                  width={120}
                                  height={120}
                                  className="rounded-md object-cover"
                                />
                                <p className="mt-2 text-sm text-center">
                                  {item.product_display_name}
                                </p>
                                <span className="text-xs text-gray-500">
                                  {item.base_colour}
                                </span>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </section>
                  ) : null
              )}

              {/* Tombol generate try-on */}
              <div className="flex justify-end mt-4">
                <Button onClick={handleGenerate} disabled={loadingTryOn}>
                  {loadingTryOn ? "Generating..." : "Generate Try-On"}
                </Button>
              </div>

              {/* 🔹 Hasil Try-On */}
              {loadingTryOn ? (
                <div className="text-center mt-6 p-10 border rounded-lg animate-pulse">
                  <p>Membuat gambar try-on, harap tunggu...</p>
                </div>
              ) : tryOnResult ? (
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Hasil Try-On</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Gambar */}
                    <Card className="flex items-center justify-center p-4">
                      <CardContent>
                        <Image
                          src={tryOnResult.image}
                          alt="Try-On Result"
                          width={400}
                          height={600}
                          className="rounded-xl object-contain"
                        />
                      </CardContent>
                    </Card>

                    {/* Produk */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">Produk yang dipakai</h4>
                      {tryOnResult.products.map((p) => (
                        <Card
                          key={p.id}
                          className="p-4 flex items-center gap-4"
                        >
                          <Image
                            src={p.image_link}
                            alt={p.product_display_name}
                            width={80}
                            height={100}
                            className="rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium">
                              {p.product_display_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {p.article_type}
                            </p>
                            <p className="text-sm text-gray-500">
                              {p.base_colour}
                            </p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                  {/* Form untuk simpan try-on */}
                  <div className="mt-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <h4 className="font-semibold mb-2">Simpan Hasil Try-On</h4>
                    <Textarea
                      value={tryOnComment}
                      onChange={(e) => setTryOnComment(e.target.value)}
                      placeholder="Tulis komentar tentang hasil try-on ini..."
                      className="mb-2"
                    />
                    <Button
                      onClick={handleSaveTryOn}
                      disabled={submittingTryOn}
                    >
                      {submittingTryOn ? "Menyimpan..." : "Simpan Try-On"}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

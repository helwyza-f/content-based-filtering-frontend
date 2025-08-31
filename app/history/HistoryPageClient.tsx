"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";
import { ThumbsUp, ThumbsDown } from "lucide-react";

type Product = {
  id: number;
  product_display_name: string;
  image_link: string;
};

type TryOnHistoryItem = {
  id: string;
  result_image: string;
  products: Product[];
  comment: string;
};

type Props = {
  userId: string;
  isSurveyCompleted: boolean;
  history: TryOnHistoryItem[];
};

export default function HistoryPageClient({
  userId,
  isSurveyCompleted,
  history,
}: Props) {
  const [showSurvey, setShowSurvey] = useState(!isSurveyCompleted);
  const [surveyItems, setSurveyItems] = useState<Product[]>([]);
  const [feedback, setFeedback] = useState<{ [key: number]: boolean | null }>(
    {}
  );
  const [loadingItems, setLoadingItems] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (showSurvey) {
      async function fetchSurveyItems() {
        try {
          const res = await fetch("/api/get-survey-items");
          const data = await res.json();
          setSurveyItems(data.items);
          setLoadingItems(false);
        } catch (err) {
          console.error("Failed to fetch survey items:", err);
          toast.error("Gagal memuat item survei.");
          setLoadingItems(false);
        }
      }
      fetchSurveyItems();
    }
  }, [showSurvey]);

  const handleFeedback = (productId: number, isRelevant: boolean) => {
    setFeedback((prev) => ({ ...prev, [productId]: isRelevant }));
  };

  const handleSurveySubmit = async () => {
    const allRated = surveyItems.every(
      (item) => feedback[item.id] !== undefined
    );
    if (!allRated) {
      toast.warning("Mohon nilai semua item terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/save-survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          feedbackData: Object.entries(feedback).map(([id, isRelevant]) => ({
            product_id: parseInt(id),
            is_relevant: isRelevant,
          })),
        }),
      });

      if (!response.ok) throw new Error("Gagal menyimpan survei.");

      toast.success("Terima kasih, survei berhasil disimpan!");
      setShowSurvey(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat menyimpan survei.");
    } finally {
      setSubmitting(false);
    }
  };

  if (showSurvey) {
    if (loadingItems) {
      return <p className="text-center mt-10">Memuat survei...</p>;
    }
    return (
      <div className="max-w-4xl mx-auto p-6 mt-10 space-y-6">
        <h2 className="text-2xl font-bold text-center">
          Bantu Kami Meningkatkan Rekomendasi
        </h2>
        <p className="text-center text-gray-600">
          Silakan nilai seberapa relevan item berikut ini untuk Anda dengan
          memilih suka atau tidak suka.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {surveyItems.map((item) => (
            <Card
              key={item.id}
              className="p-2 flex flex-col items-center text-center"
            >
              <Image
                src={item.image_link}
                alt={item.product_display_name}
                width={120}
                height={120}
                className="rounded-md object-cover"
              />
              <p className="mt-2 text-sm">{item.product_display_name}</p>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={feedback[item.id] === true ? "default" : "outline"}
                  onClick={() => handleFeedback(item.id, true)}
                  className="px-3 py-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                </Button>
                <Button
                  variant={feedback[item.id] === false ? "default" : "outline"}
                  onClick={() => handleFeedback(item.id, false)}
                  className="px-3 py-2"
                >
                  <ThumbsDown className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
        <div className="text-center">
          <Button onClick={handleSurveySubmit} disabled={submitting}>
            {submitting ? "Mengirim..." : "Kirim Jawaban"}
          </Button>
        </div>
      </div>
    );
  }

  // Tampilan Riwayat yang sudah ada
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold text-center">Riwayat Try-On Anda</h2>
      {history.length === 0 ? (
        <p className="text-center text-gray-500">
          Anda belum menyimpan hasil try-on.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-0">
                <Image
                  src={item.result_image}
                  alt="Try-on Result"
                  width={600}
                  height={800}
                  className="w-full h-auto object-cover"
                />
                <div className="p-4">
                  <h4 className="font-semibold mb-2">Produk yang Digunakan:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {item.products.map((p, index) => (
                      <li key={index}>
                        {/* 🔹 Hanya tampilkan nama produk */}
                        {p.product_display_name}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

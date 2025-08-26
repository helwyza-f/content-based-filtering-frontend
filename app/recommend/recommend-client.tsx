"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

type Props = {
  skinTone: string;
  userGender: string;
};

type Product = {
  id: number;
  product_display_name: string;
  base_colour: string;
  article_type: string;
  sub_category: string;
  image_link: string;
};

type RecommendationResponse = {
  recommendations: {
    [style: string]: {
      [category: string]: Product[];
    };
  };
};

export default function RecommendClient({ skinTone, userGender }: Props) {
  const [tab, setTab] = useState("formal");
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);

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
      } catch (err) {
        console.error("Failed to fetch recommendations", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [userGender, skinTone]);

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

      {/* Tabs */}
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
                  items.length > 0 && ( // hanya render kalau ada item
                    <section key={category}>
                      <h3 className="text-lg font-semibold mb-3">{category}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {items.map((item) => (
                          <Card key={item.id}>
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
                        ))}
                      </div>
                    </section>
                  )
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

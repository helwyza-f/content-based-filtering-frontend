"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

type OutfitItem = {
  id: number;
  productDisplayName: string;
  baseColour: string;
  articleType: string;
  usage: string;
  gender: string;
  season: string;
  link: string | null;
};

type Props = {
  referenceId: string;
  skinTone: string;
  userGender: string;
};

export default function RecommendClient({
  referenceId,
  skinTone,
  userGender,
}: Props) {
  const [reference, setReference] = useState<OutfitItem | null>(null);
  const [recommendations, setRecommendations] = useState<OutfitItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [refRes, recRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/catalog/${referenceId}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/recommend`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: referenceId, skin_tone: skinTone }),
        }),
      ]);

      const refData = await refRes.json();
      const recData = await recRes.json();

      setReference({
        ...refData,
        usage: recData.reference.usage,
        gender: recData.reference.gender,
        season: recData.reference.season,
      });

      setRecommendations(recData.recommendations);
      console.log("Recommendations:", recData.recommendations);
    } catch (err) {
      console.error("Error fetching recommendation:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [referenceId]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-4">
        Outfit Recommendations
      </h1>

      {/* === User Info === */}
      <p className="text-center text-muted-foreground mb-6">
        Your Profile: <strong>{userGender}</strong> | Skin Tone:{" "}
        <strong>{skinTone}</strong>
      </p>

      {/* === Reference Outfit === */}
      {reference && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-2 text-center">
            Reference Outfit
          </h2>
          <Card className="max-w-md mx-auto">
            <CardContent className="p-4 flex flex-col items-center gap-3">
              {reference.link && (
                <Image
                  src={reference.link}
                  alt={reference.productDisplayName}
                  width={300}
                  height={300}
                  className="rounded-xl object-cover w-full h-60"
                />
              )}
              <h3 className="font-semibold text-center">
                {reference.productDisplayName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {reference.baseColour} - {reference.articleType}
              </p>
              <p className="text-sm text-muted-foreground">
                Style: <strong>{reference.usage}</strong> | Gender:{" "}
                <strong>{reference.gender}</strong> | Season:{" "}
                <strong>{reference.season}</strong>
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* === Recommendations === */}
      <h2 className="text-xl font-semibold mb-4 text-center">Other Matches</h2>
      {loading ? (
        <p className="text-center text-muted-foreground">Loading...</p>
      ) : recommendations.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No recommendations found.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {recommendations.map((item) => (
            <Card key={item.id}>
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
                <p className="text-sm text-muted-foreground">
                  Style: <strong>{item.usage}</strong> | Gender:{" "}
                  <strong>{item.gender}</strong> | Season:{" "}
                  <strong>{item.season}</strong>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

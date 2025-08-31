import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ambil gender dan skin_tone dari profil user (asumsi Anda menyimpannya di sana)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("gender, skin_tone")
      .eq("id", user.id)
      .single();

    if (profileError) throw new Error(profileError.message);

    // Panggil model rekomendasi (asumsi ini adalah endpoint API Anda)
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gender: profile.gender,
        skin_tone: profile.skin_tone,
      }),
    });

    const recommendations = await res.json();

    // Flatten the array of all recommended items and filter by mapped_category
    const allItems = Object.values(recommendations.recommendations)
      .flatMap((style: any) => Object.values(style).flat())
      .filter(
        (item: any) =>
          item.mapped_category === "Topwear" ||
          item.mapped_category === "Bottomwear"
      );

    // Ambil 5 item unik secara acak
    const shuffledItems = allItems.sort(() => 0.5 - Math.random());
    const surveyItems = shuffledItems.slice(0, 5);

    return NextResponse.json({ items: surveyItems });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

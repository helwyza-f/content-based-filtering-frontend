import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { userId, feedbackData } = await req.json();

    if (!userId || !Array.isArray(feedbackData)) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    // Ubah data untuk Supabase
    const inserts = feedbackData.map((item) => ({
      user_id: userId,
      product_id: item.product_id,
      is_relevant: item.is_relevant,
    }));

    // Simpan semua feedback ke tabel item_relevance_feedback
    const { error: insertError } = await supabase
      .from("item_relevance_feedback")
      .insert(inserts);

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to save feedback" },
        { status: 500 }
      );
    }

    // Tandai user bahwa survei sudah selesai
    const { error: updateError } = await supabase
      .from("profiles") // Ganti dengan tabel profil Anda
      .update({ survey_completed_at: new Date().toISOString() })
      .eq("id", userId);

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update survey status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Feedback saved successfully" });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

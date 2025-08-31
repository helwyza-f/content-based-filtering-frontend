// app/api/save-tryon/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { userId, style, resultImage, products, comment } = await req.json();

    if (!userId || !resultImage || !products || !style) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("tryon_history")
      .insert({
        user_id: userId,
        style: style,
        result_image: resultImage,
        products: products,
        comment: comment,
      })
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to save tryon history" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Tryon history saved successfully",
      data,
    });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { extractGenderAndSkinToneFromPhoto } from "@/lib/gemini/extractGenderAndSkinToneFromPhoto";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const formData = await req.formData();
  const file = formData.get("image") as File;

  if (!file) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Image = buffer.toString("base64");

  try {
    const result = await extractGenderAndSkinToneFromPhoto(
      base64Image,
      file.type
    );

    // Ambil user dari sesi Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (!user || error) {
      return NextResponse.json(
        { error: "Unauthorized or user not found" },
        { status: 401 }
      );
    }

    // Simpan hasil ke tabel `profiles`
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        gender: result.gender,
        skin_tone: result.skin_tone,
      })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      gender: result.gender,
      skin_tone: result.skin_tone,
    });
  } catch (err) {
    console.error("Gemini extraction failed:", err);
    return NextResponse.json(
      { error: "Failed to extract attributes" },
      { status: 500 }
    );
  }
}

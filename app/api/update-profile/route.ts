// app/api/update-profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractGenderAndSkinToneFromPhoto } from "@/lib/gemini/extractGenderAndSkinToneFromPhoto";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const formData = await req.formData();

  const userId = formData.get("userId") as string;
  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;
  const file = formData.get("image") as File | null;

  let gender: string | null = null;
  let skin_tone: string | null = null;
  let avatar_url: string | null = null;

  if (file) {
    // Convert ke base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    // Ekstrak atribut pakai Gemini
    try {
      const result = await extractGenderAndSkinToneFromPhoto(base64, file.type);
      gender = result.gender;
      skin_tone = result.skin_tone;
    } catch {
      return NextResponse.json(
        { error: "Failed to extract attributes" },
        { status: 500 }
      );
    }

    // Upload ke Supabase Storage
    const fileName = `avatars/${userId}-${randomUUID()}.jpeg`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);

    avatar_url = data.publicUrl;
  }

  // Update tabel profiles
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      first_name,
      last_name,
      ...(avatar_url && { avatar_url }),
      ...(gender && { gender }),
      ...(skin_tone && { skin_tone }),
    })
    .eq("id", userId);

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

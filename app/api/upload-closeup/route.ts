import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const formData = await req.formData();
  const file = formData.get("image") as File;

  if (!file) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString("base64");

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
Foto ini adalah wajah dari pengguna aplikasi rekomendasi outfit.

Tugas Anda:
1. Pastikan hanya **satu orang** dalam gambar. Jika lebih dari satu, kembalikan error:
   { "error": "Multiple people detected" }

2. Pastikan gambar adalah manusia. Jika bukan, kembalikan error:
   { "error": "No human detected" }

3. Jika tidak bisa menganalisis, kembalikan error:
   { "error": "Unable to determine attributes" }

Jika valid, analisa gender dan skin tone user di gambar dan kembalikan format JSON seperti ini:
{
  "gender": "Men | Women",
  "skin_tone": "Warm | Cool | Neutral"
}

Jangan sertakan penjelasan tambahan, hanya JSON yang valid atau objek error.
`;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64,
          mimeType: file.type,
        },
      },
    ]);

    const rawText = result.response
      .text()
      .replace(/```json|```/g, "")
      .trim();

    let json: any;
    try {
      json = JSON.parse(rawText);
    } catch (err) {
      console.error("Gagal parsing JSON:", rawText);
      throw new Error("AI response is not valid JSON");
    }

    // Tangani error dari AI
    if (json?.error) {
      return NextResponse.json({ error: json.error }, { status: 400 });
    }
    if (!json.gender || !json.skin_tone) {
      return NextResponse.json(
        { error: "Response tidak lengkap dari AI" },
        { status: 400 }
      );
    }

    // Ambil user dari sesi Supabase
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!user || userError) {
      return NextResponse.json(
        { error: "Unauthorized or user not found" },
        { status: 401 }
      );
    }

    // 🔹 Upload close-up ke Supabase Storage
    const fileName = `closeups/${user.id}-${randomUUID()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("avatars") // bucket name kamu
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Gagal upload close-up" },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl: closeupUrl },
    } = supabase.storage.from("avatars").getPublicUrl(fileName);

    // 🔹 Update profile dengan atribut + close-up url
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        gender: json.gender,
        skin_tone: json.skin_tone,
        closeup_url: closeupUrl, // pastikan kamu ALTER TABLE tambahin kolom ini
      })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Gagal menyimpan data ke profil" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      gender: json.gender,
      skin_tone: json.skin_tone,
      closeup_url: closeupUrl,
    });
  } catch (err) {
    console.error("AI extraction failed:", err);
    return NextResponse.json({ error: "Ekstraksi AI gagal" }, { status: 500 });
  }
}

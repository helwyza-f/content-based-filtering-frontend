import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

// Inisialisasi Gemini
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

Jika valid, kembalikan format JSON seperti ini:
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

    // Tangani kondisi error dari AI
    if (json?.error === "Multiple people detected") {
      return NextResponse.json(
        { error: "Gambar berisi lebih dari satu orang" },
        { status: 400 }
      );
    }
    if (json?.error === "No human detected") {
      return NextResponse.json(
        { error: "Gambar bukan manusia" },
        { status: 400 }
      );
    }
    if (json?.error === "Unable to determine attributes") {
      return NextResponse.json(
        { error: "Atribut tidak dapat dikenali" },
        { status: 400 }
      );
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

    // Simpan hasil ke database
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        gender: json.gender,
        skin_tone: json.skin_tone,
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
    });
  } catch (err) {
    console.error("AI extraction failed:", err);
    return NextResponse.json({ error: "Ekstraksi AI gagal" }, { status: 500 });
  }
}

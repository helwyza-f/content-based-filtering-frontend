import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Inisialisasi Gemini
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString("base64");

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
Foto ini adalah gambar produk fashion (outfit).  
Tugas Anda:
1. Pastikan gambar benar-benar sebuah outfit/fashion item. Jika tidak, kembalikan error:
   { "error": "Not an outfit" }

2. Jika gambar kosong, tidak terbaca, atau tidak bisa dianalisis, kembalikan error:
   { "error": "Unable to analyze image" }

3. Jika valid, ekstrak atribut berikut:
{
  "product_display_name": "string",
  "gender": "Men | Women ",
  "master_category": "Apparel | Accessories | Footwear | ...",
  "sub_category": "Topwear | Bottomwear | ...",
  "article_type": "string",
  "base_colour": "string",
  "season": "Spring | Summer | Fall | Winter | All",
  "usage": "Casual | Formal | Sports | ...",
}

Jangan sertakan penjelasan tambahan, hanya JSON yang valid atau objek error. Pastikan case-sensitive untuk semua atribut di atas.
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
      return NextResponse.json(
        { error: "AI response is not valid JSON" },
        { status: 400 }
      );
    }

    // Tangani kondisi error dari AI
    if (json?.error === "Not an outfit") {
      return NextResponse.json(
        { error: "Gambar bukan outfit" },
        { status: 400 }
      );
    }
    if (json?.error === "Unable to analyze image") {
      return NextResponse.json(
        { error: "Gambar tidak dapat dianalisis" },
        { status: 400 }
      );
    }

    // Validasi minimal atribut wajib
    if (!json.product_display_name || !json.gender || !json.master_category) {
      return NextResponse.json(
        { error: "Response tidak lengkap dari AI" },
        { status: 400 }
      );
    }

    return NextResponse.json({ attributes: json });
  } catch (err) {
    console.error("AI extraction failed:", err);
    return NextResponse.json({ error: "Ekstraksi AI gagal" }, { status: 500 });
  }
}

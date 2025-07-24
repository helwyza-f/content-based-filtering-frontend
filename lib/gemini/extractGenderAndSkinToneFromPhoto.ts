import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function extractGenderAndSkinToneFromPhoto(
  base64: string,
  mimeType: string
): Promise<{
  gender: string;
  skin_tone: string;
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
Foto ini menunjukkan orang yang akan menggunakan aplikasi rekomendasi outfit.

Silakan analisis dan kembalikan hasil dalam format JSON:
{
  "gender": "men | women",
  "skin_tone": "warm | cool | neutral"
}

Kriteria:
- Gender bisa dianalisis berdasarkan wajah atau pakaian umum (gunakan "men" atau "women" saja).
- Skin tone ditentukan berdasarkan warna kulit di foto (warm, cool, atau neutral).
- Jangan kembalikan penjelasan, hanya JSON seperti contoh berikut.

Contoh output:
{
  "gender": "women",
  "skin_tone": "cool"
}
`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: base64,
        mimeType,
      },
    },
  ]);

  const text = result.response.text();
  const cleaned = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Gagal parsing response:", text);
    console.error("Error detail:", err);
    throw new Error("Response dari Gemini tidak dapat diparsing");
  }
}

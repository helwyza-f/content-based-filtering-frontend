import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ hanya di server
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, topwear, bottomwear, footwear, accessories, style } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: "user_id wajib dikirim" },
        { status: 400 }
      );
    }

    if (!topwear || !bottomwear) {
      return NextResponse.json(
        { error: "Minimal topwear & bottomwear harus ada" },
        { status: 400 }
      );
    }

    // 🔹 ambil profile user (tambahkan closeup_url)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(
        "first_name, last_name, gender, skin_tone, avatar_url, closeup_url, tinggi, berat"
      )
      .eq("id", user_id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profil user tidak ditemukan" },
        { status: 404 }
      );
    }

    // 🔹 ambil produk
    const ids = [topwear, bottomwear, footwear, accessories].filter(Boolean);

    const { data: products, error: prodError } = await supabase
      .from("products")
      .select("id, product_display_name, image_link")
      .in("id", ids);

    if (prodError) throw prodError;
    if (!products || products.length === 0) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan" },
        { status: 404 }
      );
    }

    // 🔹 siapkan gambar produk
    const images = products.map((p) => ({
      type: "image_url" as const,
      image_url: { url: p.image_link },
    }));

    // 🔹 pakai closeup_url dulu, fallback ke avatar_url
    const faceRef = profile.closeup_url || profile.avatar_url;
    if (faceRef) {
      images.unshift({
        type: "image_url" as const,
        image_url: { url: faceRef },
      });
    }

    // 🔹 buat prompt dengan atribut dari profiles
    const prompt = `
You are a professional fashion photography AI.
Your task is to generate a **full-body e-commerce fashion photo** that looks like a real product listing on Myntra/Zalando. 

Requirements:
- Use the **first image provided** as the reference for the model’s face (from close-up if available), body shape, and overall appearance.
- Style: ${style}
- Gender: ${profile.gender}
- Skin tone: ${profile.skin_tone}
- Body proportions: height ${profile.tinggi || 170} cm, weight ${
      profile.berat || 60
    } kg
- Apply all other product images (after the face/avatar) as clothing items and combine them realistically on the same model.
- Make sure each product is clearly visible, properly fitted, and aligned.
- Full body, standing pose, straight facing the camera.
- White seamless background, professional studio lighting.
- Ultra sharp, high-resolution, realistic textures.
- Avoid distortion, clipping, or merging errors.
`;
    console.log(images);

    // 🔹 panggil OpenRouter API
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview:free",
          messages: [
            {
              role: "user",
              content: [{ type: "text", text: prompt }, ...images],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const imageUrl =
      data.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;

    if (!imageUrl) {
      throw new Error("No image generated");
    }

    return NextResponse.json({ image: imageUrl, products, profile });
  } catch (err: any) {
    console.error("TryOn error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

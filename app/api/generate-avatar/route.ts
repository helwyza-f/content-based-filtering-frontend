import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge"; // kalau mau lebih cepat

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // pakai SERVICE_ROLE biar bisa update profile
);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;
    const userId = formData.get("userId") as string;
    const gender = formData.get("gender") as string;
    const skinTone = formData.get("skin_tone") as string;
    const tinggi = formData.get("tinggi") as string;
    const berat = formData.get("berat") as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 }
      );
    }

    // 🔹 Validasi basic
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File harus berupa gambar" },
        { status: 400 }
      );
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ukuran maksimal 5MB" },
        { status: 400 }
      );
    }

    // 🔹 Upload dulu foto user ke Supabase (sementara untuk reference AI)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(`source/${userId}-${Date.now()}.png`, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrl } = supabase.storage
      .from("avatars")
      .getPublicUrl(uploadData.path);

    const userCloseUpUrl = publicUrl.publicUrl;

    // 🔹 Tentukan default outfit berdasarkan gender
    let outfit = "plain t-shirt and jeans";
    if (gender?.toLowerCase() === "women") {
      outfit = "plain blouse or top with neutral trousers or skirt";
    } else if (gender?.toLowerCase() === "neutral" || !gender) {
      outfit = "plain polo shirt and neutral pants";
    }

    // 🔹 Prompt untuk AI
    const prompt = `
Generate a full-body realistic avatar based on the user's attributes.

Attributes:
- Gender: ${gender}
- Skin tone: ${skinTone}
- Height: ${tinggi} cm
- Weight: ${berat} kg

Requirements:
- The avatar should look proportional to height and weight.
- Outfit: ${outfit}.
- The style must be neutral, simple, and not fashion-forward.
- Full body, white seamless background, professional studio lighting.
- Professional, e-commerce ready avatar.
- Keep the face consistent with the uploaded close-up photo.
`;

    // 🔹 Panggil OpenRouter
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
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: userCloseUpUrl } },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenRouter failed: ${err}`);
    }

    const data = await response.json();
    // console.log(result);
    const imageUrl =
      data.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;
    // const imageUrl = result.choices[0]?.message?.content?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error("No image generated from AI");
    }

    // 🔹 Ambil hasil image base64 / URL lalu simpan ke Supabase storage
    const aiResp = await fetch(imageUrl);
    const aiBuffer = Buffer.from(await aiResp.arrayBuffer());

    const { data: avatarUpload, error: avatarError } = await supabase.storage
      .from("avatars")
      .upload(`generated/${userId}-${Date.now()}.png`, aiBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (avatarError) throw avatarError;

    const { data: avatarPublicUrl } = supabase.storage
      .from("avatars")
      .getPublicUrl(avatarUpload.path);

    // 🔹 Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarPublicUrl.publicUrl })
      .eq("id", userId);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      avatar_url: avatarPublicUrl.publicUrl,
    });
  } catch (err: any) {
    console.error("Error generate avatar:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

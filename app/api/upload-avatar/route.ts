import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  console.log(formData);
  const file = formData.get("image") as File;
  const userId = formData.get("userId") as string;

  if (!file || !userId) {
    return NextResponse.json(
      { error: "Missing file or userId" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const fileExt = file.name.split(".").pop();
  const fileName = `avatars/${userId}-${randomUUID()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("avatars")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const { data: urlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(fileName);

  return NextResponse.json({ url: urlData.publicUrl });
}

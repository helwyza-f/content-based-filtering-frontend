import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import RecommendClient from "./recommend-client";

export default async function RecommendPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("skin_tone, gender")
    .eq("id", user.id)
    .single();

  // 🚩 kalau belum ada profile, redirect ke setup
  if (!profile || !profile.skin_tone || !profile.gender) {
    redirect("/profile");
  }

  return (
    <RecommendClient
      userId={user.id}
      skinTone={profile.skin_tone}
      userGender={profile.gender}
    />
  );
}

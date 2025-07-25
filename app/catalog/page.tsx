import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CatalogClient from "./catalog-client";

export default async function CatalogPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("gender, skin_tone")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return <p className="text-center mt-10">Profile not found.</p>;
  }

  // 👉 Cek jika data gender atau skin_tone kosong/null
  if (!profile.gender || !profile.skin_tone) {
    redirect("/profile/edit"); // arahkan ke halaman edit profil
  }

  return <CatalogClient gender={profile.gender} skinTone={profile.skin_tone} />;
}

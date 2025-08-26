import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileClient from "./profile-client";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "first_name, last_name, gender, skin_tone, avatar_url, role, tinggi, berat"
    )
    .eq("id", user.id)
    .single();

  if (!profile) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Data profil tidak ditemukan.
      </div>
    );
  }

  return (
    <ProfileClient
      id={user.id}
      profile={{
        first_name: profile.first_name ?? null,
        last_name: profile.last_name ?? null,
        gender: profile.gender ?? null,
        skin_tone: profile.skin_tone ?? null,
        // role: profile.role ?? "user",
        tinggi: profile.tinggi ?? 160,
        berat: profile.berat ?? 55,
      }}
      avatarUrl={profile.avatar_url ?? null}
    />
  );
}

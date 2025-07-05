// app/profile/edit/page.tsx
import { createClient } from "@/lib/supabase/server";
import EditProfileClient from "./edit-profile-client";
import { redirect } from "next/navigation";

export default async function EditProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, gender, skin_tone")
    .eq("id", user.id)
    .single();

  return <EditProfileClient userId={user.id} profile={profile ?? null} />;
}

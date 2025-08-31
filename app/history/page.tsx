// app/history/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HistoryPageClient from "./HistoryPageClient";

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 🔹 Ambil profil user
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("gender, skin_tone, survey_completed_at")
    .eq("id", user.id)
    .single();

  if (profileError || !profileData) {
    // 🚩 Kalau profil belum ada sama sekali → redirect ke /profile
    redirect("/profile");
  }

  // 🔹 Validasi wajib: gender & skin_tone harus ada
  if (!profileData.gender || !profileData.skin_tone) {
    redirect("/profile");
  }

  const isSurveyCompleted = !!profileData.survey_completed_at;

  // 🔹 Ambil data riwayat
  const { data: history, error: historyError } = await supabase
    .from("tryon_history")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (historyError) {
    console.error("Error fetching tryon history:", historyError);
  }

  return (
    <HistoryPageClient
      userId={user.id}
      isSurveyCompleted={isSurveyCompleted}
      history={history || []}
    />
  );
}

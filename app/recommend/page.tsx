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

  const params = await searchParams;
  const id = params.id;
  if (!id) {
    return <p className="text-center mt-10">No reference item selected.</p>;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("skin_tone, gender")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return <p className="text-center mt-10">Profile not found.</p>;
  }

  return (
    <RecommendClient
      referenceId={id}
      skinTone={profile.skin_tone}
      userGender={profile.gender}
    />
  );
}

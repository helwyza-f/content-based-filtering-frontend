import { createClient } from "@/lib/supabase/server";
import SurveyClient from "./survey-client";

type Product = {
  id: number;
  product_display_name: string;
  image_link: string | null;
};

type Feedback = {
  id: string;
  is_relevant: boolean;
  created_at: string;
  product_id: number | string | null;
  product: Product | null;
};

type UserSurvey = {
  id: string;
  first_name: string;
  last_name: string;
  survey_completed_at: string;
  feedback: Feedback[];
};

export default async function SurveysPage() {
  const supabase = await createClient();

  // 1. Ambil semua profiles yang sudah isi survey
  const { data: profiles, error: err1 } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, survey_completed_at")
    .not("survey_completed_at", "is", null);

  if (err1) {
    console.error("Error fetching profiles:", err1);
    return <div>Error loading surveys</div>;
  }

  // 2. Ambil feedback
  const { data: feedback, error: err2 } = await supabase
    .from("item_relevance_feedback")
    .select("id, user_id, is_relevant, product_id, created_at");

  if (err2) {
    console.error("Error fetching feedback:", err2);
    return <div>Error loading surveys</div>;
  }

  // 3. Ambil semua product_id unik dari feedback
  const productIds = Array.from(
    new Set((feedback || []).map((f) => f.product_id).filter(Boolean))
  ) as number[];

  let productMap: Record<number, Product> = {};

  if (productIds.length > 0) {
    // 4. Query products hanya berdasarkan product_id yang muncul
    const { data: products, error: err3 } = await supabase
      .from("products")
      .select("id, product_display_name, image_link")
      .in("id", productIds);

    if (err3) {
      console.error("Error fetching products:", err3);
      return <div>Error loading surveys</div>;
    }

    // 5. Mapping biar gampang lookup
    (products || []).forEach((p) => {
      productMap[p.id] = {
        id: p.id,
        product_display_name: p.product_display_name,
        image_link: p.image_link,
      };
    });
  }

  // 6. Gabungkan profiles + feedback + products
  const surveys: UserSurvey[] = (profiles || []).map((p) => ({
    id: p.id,
    first_name: p.first_name ?? "",
    last_name: p.last_name ?? "",
    survey_completed_at: p.survey_completed_at,
    feedback: (feedback || [])
      .filter((f) => f.user_id === p.id)
      .map((f) => ({
        id: f.id,
        is_relevant: f.is_relevant,
        created_at: f.created_at,
        product_id: f.product_id,
        product: productMap[f.product_id as number] ?? null,
      })),
  }));

  return <SurveyClient surveys={surveys} />;
}

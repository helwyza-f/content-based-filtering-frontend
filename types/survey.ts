export type Product = {
  id: number;
  product_display_name: string;
  image_link: string;
};

export type FeedbackItem = {
  id: string;
  is_relevant: boolean;
  created_at: string;
  product: Product | null;
};

export type UserSurvey = {
  id: string;
  first_name: string | null; // dari DB bisa null
  last_name: string | null;
  survey_completed_at: string;
  feedback: FeedbackItem[];
};

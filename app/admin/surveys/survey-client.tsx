"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

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

export default function SurveyClient({ surveys }: { surveys: UserSurvey[] }) {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">📊 User Surveys</h1>

      {surveys.length === 0 && (
        <p className="text-gray-500 italic">No surveys found.</p>
      )}

      <div className="grid gap-6">
        {surveys.map((survey) => (
          <Card
            key={survey.id}
            className="shadow-md border border-gray-200 hover:shadow-lg transition rounded-2xl"
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  {survey.first_name} {survey.last_name}
                </span>
                <span className="text-xs text-gray-500 font-normal">
                  {new Date(survey.survey_completed_at).toLocaleString()}
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <h3 className="font-medium text-gray-700">Feedback</h3>

              {survey.feedback.length === 0 && (
                <p className="text-sm text-gray-400 italic">No feedback yet.</p>
              )}

              <div className="space-y-2">
                {survey.feedback.map((fb) => (
                  <div
                    key={fb.id}
                    className="border p-3 rounded-lg flex items-center gap-4 hover:bg-gray-50 transition"
                  >
                    {fb.product?.image_link && (
                      <div className="relative w-16 h-16 rounded-md overflow-hidden border">
                        <Image
                          src={fb.product.image_link}
                          alt={fb.product.product_display_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {fb.product?.product_display_name ?? "Unknown Product"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(fb.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge
                      variant={fb.is_relevant ? "default" : "destructive"}
                      className="whitespace-nowrap"
                    >
                      {fb.is_relevant ? "Relevant ✅" : "Not Relevant ❌"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

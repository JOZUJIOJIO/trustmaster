import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";
import { calculateConstitution } from "@/lib/constitution";
import type { QuizAnswer } from "@/lib/types";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { answers, baziChartHash } = await request.json();

  if (!Array.isArray(answers) || answers.length !== 18) {
    return NextResponse.json({ error: "Expected 18 answers" }, { status: 400 });
  }

  for (const a of answers) {
    if (typeof a !== "number" || a < 1 || a > 5) {
      return NextResponse.json({ error: "Each answer must be 1-5" }, { status: 400 });
    }
  }

  const result = calculateConstitution(answers as QuizAnswer[]);

  const { data, error } = await supabase
    .from("health_assessments")
    .insert({
      user_id: user.id,
      answers,
      constitution_type: result.elementType,
      constitution_subtype: result.constitutionType,
      secondary_type: result.secondaryType,
      five_elements_score: result.fiveElements,
      nine_constitutions_score: result.nineScores,
      bazi_chart_hash: baziChartHash ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("saveAssessment error:", error);
    return NextResponse.json({ error: "Failed to save assessment" }, { status: 500 });
  }

  return NextResponse.json({
    assessmentId: data.id,
    preview: {
      elementType: result.elementType,
      constitutionType: result.constitutionType,
      secondaryType: result.secondaryType,
    },
  });
}

import { NextResponse } from "next/server";
import { TEMPLATES, CATEGORIES } from "@/lib/templates/template-library";

// GET /api/goals/templates?category=STUDY&age=6-10&difficulty=EASY
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const age = searchParams.get("age");
  const difficulty = searchParams.get("difficulty");
  const search = searchParams.get("q");

  let filtered = [...TEMPLATES];

  if (category) {
    filtered = filtered.filter((t) => t.category === category);
  }
  if (age) {
    filtered = filtered.filter((t) => t.ageRange === age || t.ageRange === "6-15");
  }
  if (difficulty) {
    filtered = filtered.filter((t) => t.difficulty === difficulty);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  return NextResponse.json({
    categories: CATEGORIES,
    templates: filtered,
    total: filtered.length,
  });
}

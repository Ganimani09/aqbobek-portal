import { NextResponse } from "next/server";

type RiskSubject = {
  subject: string;
  riskPercent: number;
  reason: string;
};

type Recommendation = {
  subject: string;
  action: string;
  resources: string[];
};

type AiTutorResponse = {
  riskSubjects: RiskSubject[];
  strengths: string[];
  recommendations: Recommendation[];
  weeklyPlan: string;
  motivationMessage: string;
};

type AiTutorRequest = {
  grades: unknown;
  studentName: string;
};

function extractTextFromGeminiPayload(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  const candidates = (payload as { candidates?: unknown[] }).candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) return null;

  const firstCandidate = candidates[0] as {
    content?: { parts?: Array<{ text?: string }> };
  };
  const parts = firstCandidate?.content?.parts;
  if (!Array.isArray(parts) || parts.length === 0) return null;

  const text = parts.find((part) => typeof part?.text === "string")?.text;
  return text ?? null;
}

function parseJsonFromModelText(text: string): AiTutorResponse {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const parsed = JSON.parse(cleaned) as Partial<AiTutorResponse>;

  if (
    !Array.isArray(parsed.riskSubjects) ||
    !Array.isArray(parsed.strengths) ||
    !Array.isArray(parsed.recommendations) ||
    typeof parsed.weeklyPlan !== "string" ||
    typeof parsed.motivationMessage !== "string"
  ) {
    throw new Error("Model returned JSON with invalid schema.");
  }

  return parsed as AiTutorResponse;
}

export async function POST(request: Request) {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    return NextResponse.json(
      { error: "Missing GEMINI_API_KEY environment variable." },
      { status: 500 }
    );
  }

  let payload: AiTutorRequest;

  try {
    payload = (await request.json()) as AiTutorRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!payload?.studentName || !payload?.grades) {
    return NextResponse.json(
      { error: "Body must include 'studentName' and 'grades'." },
      { status: 400 }
    );
  }

  const prompt = `Ты школьный AI-тьютор. Ученик ${payload.studentName} имеет следующие оценки: ${JSON.stringify(
    payload.grades
  )}.
Проанализируй и дай ответ СТРОГО в формате JSON:
{
  riskSubjects: [{subject: string, riskPercent: number, reason: string}],
  strengths: [string],
  recommendations: [{subject: string, action: string, resources: [string]}],
  weeklyPlan: string,
  motivationMessage: string
}
Отвечай только на русском языке.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: "Gemini API request failed.",
          details: errorText,
        },
        { status: 502 }
      );
    }

    const geminiPayload = (await response.json()) as unknown;
    const modelText = extractTextFromGeminiPayload(geminiPayload);

    if (!modelText) {
      return NextResponse.json(
        { error: "Gemini response does not contain text output." },
        { status: 502 }
      );
    }

    const parsed = parseJsonFromModelText(modelText);
    return NextResponse.json(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error.";
    return NextResponse.json(
      {
        error: "Failed to process AI tutor request.",
        details: message,
      },
      { status: 500 }
    );
  }
}

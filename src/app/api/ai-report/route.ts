import { NextResponse } from "next/server";

type AiReportRequest = {
  className: string;
  gradesData?: unknown[];
  students?: unknown[];
};

type GeminiResponsePayload = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

function extractReportText(payload: GeminiResponsePayload): string | null {
  const text = payload.candidates?.[0]?.content?.parts?.find(
    (part) => typeof part.text === "string"
  )?.text;

  if (!text) {
    return null;
  }

  return text.trim();
}

export async function POST(request: Request) {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    return NextResponse.json(
      { error: "Missing GEMINI_API_KEY environment variable." },
      { status: 500 }
    );
  }

  let body: AiReportRequest;

  try {
    body = (await request.json()) as AiReportRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const className = body?.className?.trim();
  const gradesData = Array.isArray(body?.gradesData)
    ? body.gradesData
    : Array.isArray(body?.students)
      ? body.students
      : null;

  if (!className || !gradesData) {
    return NextResponse.json(
      {
        error: "Body must include 'className' and 'gradesData' array.",
      },
      { status: 400 }
    );
  }

  const prompt = `Ты помощник классного руководителя. Сгенерируй официальный отчёт об успеваемости класса ${className} за текущую четверть на основе данных: ${JSON.stringify(
    gradesData
  )}.

Отчёт должен содержать:
1. Общая характеристика класса
2. Топ-3 отличника
3. Ученики, требующие внимания
4. Рекомендации для родительского собрания
5. Выводы

Пиши официально, на русском языке, 300-400 слов.`;

  try {
    const geminiResponse = await fetch(
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

    if (!geminiResponse.ok) {
      const details = await geminiResponse.text();
      return NextResponse.json(
        { error: "Gemini API request failed.", details },
        { status: 502 }
      );
    }

    const payload = (await geminiResponse.json()) as GeminiResponsePayload;
    const report = extractReportText(payload);

    if (!report) {
      return NextResponse.json(
        { error: "Gemini response did not contain report text." },
        { status: 502 }
      );
    }

    return NextResponse.json({ report });
  } catch (error) {
    const details = error instanceof Error ? error.message : "Unknown server error.";
    return NextResponse.json(
      { error: "Failed to generate class report.", details },
      { status: 500 }
    );
  }
}

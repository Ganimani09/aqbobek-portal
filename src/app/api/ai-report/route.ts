import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const apiKey = process.env.GEMINI_API_KEY

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Сгенерируй официальный отчёт об успеваемости класса 10А (150 слов, русский язык).
Данные учеников:
- Дильназ Муратова: 4.8 (отличница)
- Максат Ким: 4.6 (хорошист)  
- Алибек Сейтов: 4.2 (хорошист)
- Аружан Сапарова: 3.8 (требует внимания)
- Ерасыл Нурланов: 2.8 (зона риска)

Напиши: общая характеристика класса, топ ученики, кто требует внимания, рекомендации.
Официальный стиль классного руководителя.`
            }]
          }]
        })
      }
    )

    const data = await res.json()
    const report = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Не удалось сгенерировать отчёт'
    return NextResponse.json({ report })
  } catch {
    return NextResponse.json({ report: 'Ошибка подключения к AI' })
  }
}
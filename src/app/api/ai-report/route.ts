import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ report: 'GEMINI_API_KEY не настроен в .env.local' }, { status: 500 })
    }

    // Accept optional className from body, or default to 10А
    let className = '10А'
    try {
      const body = await req.json()
      if (body.className) className = body.className
    } catch {
      // No body provided, use default
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Сгенерируй официальный отчёт об успеваемости класса ${className} (200 слов, русский язык).
Данные учеников:
- Дильназ Муратова: 4.8 (отличница)
- Максат Ким: 4.6 (хорошист)  
- Алибек Сейтов: 4.2 (хорошист)
- Аружан Сапарова: 3.8 (требует внимания)
- Ерасыл Нурланов: 2.8 (зона риска)
- Зарина Омарова: 2.6 (зона риска)
- Нуржан Каримов: 3.4 (требует внимания)
- Айдана Искакова: 5.0 (отличница)
- Тимур Ахметов: 3.6 (требует внимания)
- Дария Оспанова: 4.0 (хорошистка)

Напиши:
1. Общая характеристика класса
2. Топ ученики и их достижения
3. Ученики, требующие особого внимания
4. Рекомендации для родительского собрания
5. Выводы и план действий

Официальный стиль классного руководителя. Будь конкретным.`
            }]
          }]
        })
      }
    )

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Gemini API error:', errorText)
      return NextResponse.json({ report: 'Ошибка API Gemini: ' + res.statusText }, { status: 500 })
    }

    const data = await res.json()
    const report = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Не удалось сгенерировать отчёт'
    return NextResponse.json({ report })
  } catch (err) {
    console.error('AI report error:', err)
    return NextResponse.json({ report: 'Ошибка подключения к AI' }, { status: 500 })
  }
}
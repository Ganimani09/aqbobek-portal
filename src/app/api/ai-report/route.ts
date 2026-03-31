import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { className } = body

    if (!className) {
      return NextResponse.json({ error: 'className is required' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 })
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

    const promptText = `Сгенерируй краткий отчёт об успеваемости класса ${className} на русском языке. Упомяни что большинство учеников успевают хорошо, но Ерасыл Нурланов требует особого внимания (средний балл 2.8). Отчёт 150 слов, официальный стиль.`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: promptText,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Gemini API Error:', errorData)
      throw new Error(`Ошибка Gemini API: ${response.statusText}`)
    }

    const data = await response.json()
    const reportText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Не удалось получить текст отчёта от ИИ.'

    return NextResponse.json({ report: reportText })
  } catch (error: any) {
    console.error('API Route Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

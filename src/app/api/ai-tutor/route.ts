import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY не настроен' }, { status: 500 })
    }

    // Accept optional student data from body
    let studentName = 'Алибек Сейтов'
    let grades = 'Математика [4,5,4,3,5] среднее 4.2, Физика [3,3,4,3,2] среднее 3.0, История [5,5,4,5,4] среднее 4.6, Химия [4,3,4,4,3] среднее 3.6, Биология [5,5,5,4,5] среднее 4.8'
    
    try {
      const body = await req.json()
      if (body.student) studentName = body.student
    } catch {
      // No body, use defaults
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Ты школьный AI-тьютор. Ученик ${studentName}, 10А класс.
              Оценки: ${grades}.
              
              Дай анализ на русском языке в формате:
              1. Сильные предметы (1-2 предложения)
              2. Предметы риска (1-2 предложения) 
              3. Конкретные рекомендации (3 пункта)
              4. Мотивационное сообщение (1 предложение)
              
              Максимум 150 слов. Будь конкретным и добрым.`
            }]
          }]
        })
      }
    )

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Gemini API error:', errorText)
      return NextResponse.json({ error: 'Ошибка API Gemini' }, { status: 500 })
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      return NextResponse.json({ error: 'Пустой ответ от Gemini' }, { status: 500 })
    }

    return NextResponse.json({ analysis: text })
  } catch (err) {
    console.error('AI tutor error:', err)
    return NextResponse.json({ error: 'Ошибка подключения к AI' }, { status: 500 })
  }
}

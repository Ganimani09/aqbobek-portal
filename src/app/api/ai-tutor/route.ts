import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({ error: 'No API key' }, { status: 500 })
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Ты школьный AI-тьютор. Ученик Алибек Сейтов, 10А класс.
              Оценки: Математика [4,5,4,3,5] среднее 4.2, Физика [3,3,4,3,2] среднее 3.0, 
              История [5,5,4,5,4] среднее 4.6, Химия [4,3,4,4,3] среднее 3.6, Биология [5,5,5,4,5] среднее 4.8.
              
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

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      return NextResponse.json({ error: 'Empty response from Gemini' }, { status: 500 })
    }

    return NextResponse.json({ analysis: text })
  } catch (err) {
    console.error('AI tutor error:', err)
    return NextResponse.json({ error: 'Failed to get analysis' }, { status: 500 })
  }
}

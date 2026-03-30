'use client'

import { useMemo, useState, useEffect } from 'react'
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { AlertTriangle, Sparkles, UserRoundX } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type WeekDay = 'Пн' | 'Вт' | 'Ср' | 'Чт' | 'Пт'

type Teacher = {
  id: string
  full_name: string
  subject: string
  email?: string
}

type Subject = {
  name: string
}

type Lesson = {
  id: string
  day: WeekDay
  time: string
  className: string
  subject: string
  teacherId: string
  teacherName: string
  room: string
}

const DAYS: WeekDay[] = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт']
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']
const DEFAULT_CLASSES = ['10А', '10Б', '11А']
const ROOMS = ['101', '102', '201', '202', '301', '302']

const fallbackTeachers: Teacher[] = [
  { id: 't1', full_name: 'Айжан Нуртаева', subject: 'Математика', email: 'a.nurtayeva@aqbobek.uz' },
  { id: 't2', full_name: 'Руслан Ким', subject: 'Физика', email: 'r.kim@aqbobek.uz' },
  { id: 't3', full_name: 'Мадина Турсунова', subject: 'Химия', email: 'm.tursunova@aqbobek.uz' },
  { id: 't4', full_name: 'Диас Юсупов', subject: 'История', email: 'd.yusupov@aqbobek.uz' },
  { id: 't5', full_name: 'Ольга Пак', subject: 'Русский язык', email: 'o.pak@aqbobek.uz' },
  { id: 't6', full_name: 'Зарина Иманова', subject: 'Биология', email: 'z.imanova@aqbobek.uz' },
]

const fallbackSubjects: Subject[] = [
  { name: 'Математика' },
  { name: 'Физика' },
  { name: 'Химия' },
  { name: 'История' },
  { name: 'Русский язык' },
  { name: 'Биология' },
]

function DraggableLesson({
  lesson,
  conflict,
  sick,
}: {
  lesson: Lesson
  conflict: boolean
  sick: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lesson.id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`rounded-md border px-2 py-1 text-xs shadow-sm transition ${
        conflict ? 'border-red-300 bg-red-100 text-red-900' : sick ? 'border-rose-300 bg-rose-100 text-rose-900' : 'border-blue-200 bg-blue-100 text-blue-900'
      } ${isDragging ? 'opacity-60' : ''}`}
    >
      <p className="font-semibold">{lesson.subject}</p>
      <p>{lesson.teacherName}</p>
      <p>Каб. {lesson.room}</p>
    </div>
  )
}

function DroppableCell({
  id,
  children,
}: {
  id: string
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div ref={setNodeRef} className={`min-h-20 rounded-md border p-1 ${isOver ? 'border-blue-400 bg-blue-50' : 'border-slate-200'}`}>
      {children}
    </div>
  )
}

function buildAutoSchedule(classes: string[], subjects: Subject[], teachers: Teacher[]) {
  const lessons: Lesson[] = []
  const teacherBusy = new Set<string>()
  const roomBusy = new Set<string>()
  const subjectPool = subjects.map((subject) => subject.name)
  let sequence = 0

  for (const day of DAYS) {
    for (const time of TIME_SLOTS) {
      teacherBusy.clear()
      roomBusy.clear()

      for (const className of classes) {
        const subject = subjectPool[(sequence + className.length) % subjectPool.length]
        const candidates = teachers.filter((teacher) => teacher.subject === subject && !teacherBusy.has(teacher.id))
        const teacher = candidates[0] ?? teachers.find((t) => !teacherBusy.has(t.id))
        if (!teacher) continue

        const room = ROOMS.find((r) => !roomBusy.has(r))
        if (!room) continue

        teacherBusy.add(teacher.id)
        roomBusy.add(room)
        sequence += 1

        lessons.push({
          id: `${day}-${time}-${className}-${sequence}`,
          day,
          time,
          className,
          subject,
          teacherId: teacher.id,
          teacherName: teacher.full_name,
          room,
        })
      }
    }
  }

  return lessons
}

export default function AdminSchedulePage() {
  const [classes, setClasses] = useState<string[]>(DEFAULT_CLASSES)
  const [teachers, setTeachers] = useState<Teacher[]>(fallbackTeachers)
  const [subjects, setSubjects] = useState<Subject[]>(fallbackSubjects)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [showSickDialog, setShowSickDialog] = useState(false)
  const [sickTeacherId, setSickTeacherId] = useState<string>('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadInitial = async () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (!url || !key) {
        setLessons(buildAutoSchedule(DEFAULT_CLASSES, fallbackSubjects, fallbackTeachers))
        setLoading(false)
        return
      }

      const supabase = createClient(url, key)
      try {
        const [teachersRes, subjectsRes, scheduleRes] = await Promise.all([
          supabase.from('teachers').select('id, full_name, subject, email'),
          supabase.from('subjects').select('name'),
          supabase.from('schedule').select('id, day, time, class_name, subject, teacher_id, teacher_name, room'),
        ])

        if (!active) return

        const loadedTeachers = (teachersRes.data as Teacher[])?.filter(Boolean)
        const loadedSubjects = (subjectsRes.data as Subject[])?.filter(Boolean)
        const loadedSchedule = (scheduleRes.data as Array<Record<string, unknown>>) ?? []

        if (loadedTeachers?.length) setTeachers(loadedTeachers)
        if (loadedSubjects?.length) setSubjects(loadedSubjects)

        if (loadedSchedule.length > 0) {
          const parsed = loadedSchedule
            .map((item) => ({
              id: String(item.id),
              day: item.day as WeekDay,
              time: String(item.time),
              className: String(item.class_name),
              subject: String(item.subject),
              teacherId: String(item.teacher_id),
              teacherName: String(item.teacher_name),
              room: String(item.room),
            }))
            .filter((item) => DAYS.includes(item.day) && TIME_SLOTS.includes(item.time))

          setLessons(parsed)
          const classNames = Array.from(new Set(parsed.map((l) => l.className)))
          if (classNames.length) setClasses(classNames)
        } else {
          setLessons(buildAutoSchedule(DEFAULT_CLASSES, loadedSubjects?.length ? loadedSubjects : fallbackSubjects, loadedTeachers?.length ? loadedTeachers : fallbackTeachers))
        }
      } catch {
        if (active) {
          setError('Не удалось загрузить данные из Supabase. Используется локальное расписание.')
          setLessons(buildAutoSchedule(DEFAULT_CLASSES, fallbackSubjects, fallbackTeachers))
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadInitial()
    return () => {
      active = false
    }
  }, [])

  const conflictIds = useMemo(() => {
    const set = new Set<string>()
    const groups = new Map<string, Lesson[]>()
    for (const lesson of lessons) {
      const key = `${lesson.day}|${lesson.time}`
      const group = groups.get(key) ?? []
      group.push(lesson)
      groups.set(key, group)
    }

    for (const group of groups.values()) {
      const teacherMap = new Map<string, Lesson[]>()
      const roomMap = new Map<string, Lesson[]>()
      group.forEach((lesson) => {
        teacherMap.set(lesson.teacherId, [...(teacherMap.get(lesson.teacherId) ?? []), lesson])
        roomMap.set(lesson.room, [...(roomMap.get(lesson.room) ?? []), lesson])
      })
      teacherMap.forEach((items) => {
        if (items.length > 1) items.forEach((item) => set.add(item.id))
      })
      roomMap.forEach((items) => {
        if (items.length > 1) items.forEach((item) => set.add(item.id))
      })
    }

    return set
  }, [lessons])

  const unavailableTeacher = teachers.find((teacher) => teacher.id === sickTeacherId)

  const replacements = useMemo(() => {
    if (!unavailableTeacher) return []
    return teachers.filter((teacher) => teacher.id !== unavailableTeacher.id && teacher.subject === unavailableTeacher.subject)
  }, [teachers, unavailableTeacher])

  const handleAutoGenerate = () => {
    setLessons(buildAutoSchedule(classes, subjects, teachers))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)
    const [day, time, className] = overId.split('|')
    if (!day || !time || !className) return

    setLessons((prev) =>
      prev.map((lesson) =>
        lesson.id === activeId
          ? {
              ...lesson,
              day: day as WeekDay,
              time,
              className,
            }
          : lesson
      )
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl">Умное расписание</CardTitle>
              <CardDescription>Пн-Пт, слоты 08:00-17:00, контроль конфликтов учителей и кабинетов</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleAutoGenerate} className="bg-blue-700 hover:bg-blue-800">
                <Sparkles className="mr-2 h-4 w-4" />
                Автогенерация расписания
              </Button>
              <Button variant="destructive" onClick={() => setShowSickDialog(true)}>
                <UserRoundX className="mr-2 h-4 w-4" />
                Учитель заболел
              </Button>
            </div>
          </CardHeader>
        </Card>

        {conflictIds.size > 0 ? (
          <Card className="border-red-300 bg-red-50">
            <CardContent className="flex items-center gap-2 p-4 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4" />
              Обнаружены конфликты в расписании: {conflictIds.size} урок(ов).
            </CardContent>
          </Card>
        ) : null}

        {error ? (
          <Card className="border-yellow-300 bg-yellow-50">
            <CardContent className="p-4 text-sm text-yellow-800">{error}</CardContent>
          </Card>
        ) : null}

        <Card>
          <CardContent className="p-4">
            <DndContext onDragEnd={handleDragEnd}>
              <div className="overflow-auto">
                <div className="grid min-w-[1100px] grid-cols-[120px_120px_repeat(3,minmax(220px,1fr))] gap-2">
                  <div className="rounded-md bg-slate-100 p-2 text-xs font-semibold text-slate-600">День</div>
                  <div className="rounded-md bg-slate-100 p-2 text-xs font-semibold text-slate-600">Время</div>
                  {classes.map((className) => (
                    <div key={className} className="rounded-md bg-slate-100 p-2 text-xs font-semibold text-slate-600">
                      {className}
                    </div>
                  ))}

                  {DAYS.flatMap((day) =>
                    TIME_SLOTS.map((time) => (
                      <div key={`${day}-${time}`} className="contents">
                        <div className="rounded-md border p-2 text-sm font-medium text-slate-700">{day}</div>
                        <div className="rounded-md border p-2 text-sm text-slate-700">{time}</div>
                        {classes.map((className) => {
                          const cellId = `${day}|${time}|${className}`
                          const cellLesson = lessons.find(
                            (lesson) => lesson.day === day && lesson.time === time && lesson.className === className
                          )
                          return (
                            <DroppableCell key={cellId} id={cellId}>
                              {cellLesson ? (
                                <DraggableLesson
                                  lesson={cellLesson}
                                  conflict={conflictIds.has(cellLesson.id)}
                                  sick={Boolean(sickTeacherId && cellLesson.teacherId === sickTeacherId)}
                                />
                              ) : (
                                <div className="p-2 text-xs text-slate-400">Свободно</div>
                              )}
                            </DroppableCell>
                          )
                        })}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </DndContext>
          </CardContent>
        </Card>

        {showSickDialog ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle>Учитель заболел</CardTitle>
                <CardDescription>Выберите преподавателя, чтобы подсветить его уроки и подобрать замену</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Учитель</Label>
                  <Select value={sickTeacherId} onValueChange={setSickTeacherId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите учителя" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.full_name} — {teacher.subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border bg-slate-50 p-3 text-sm">
                  <p className="font-medium text-slate-900">Доступные замены:</p>
                  {replacements.length ? (
                    <ul className="mt-2 space-y-1 text-slate-700">
                      {replacements.map((teacher) => (
                        <li key={teacher.id}>
                          • {teacher.full_name} ({teacher.subject}){teacher.email ? ` — ${teacher.email}` : ''}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-slate-500">Нет доступных замен по этому предмету.</p>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowSickDialog(false)}>
                    Закрыть
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {loading ? (
          <div className="fixed bottom-4 right-4 rounded-md bg-slate-900 px-3 py-2 text-xs text-white shadow-lg">
            Загружаем расписание...
          </div>
        ) : null}
      </div>
    </main>
  )
}

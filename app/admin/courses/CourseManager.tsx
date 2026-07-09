"use client";

// app/admin/courses/CourseManager.tsx
// Eğitim yönetimi: kurslar (oluştur/düzenle/sil) + her kursun dersleri (oluştur/düzenle/sil).

import { useActionState, useEffect, useState, useTransition } from "react";
import { Plus, Pencil, Trash2, X, Save, EyeOff, ChevronDown, PlayCircle, GripVertical } from "lucide-react";
import { saveCourse, deleteCourse, saveLesson, deleteLesson, type AdminResult } from "../ceyhun-actions";
import MultiLangField from "../_components/MultiLangField";
import RichTextField from "../_components/RichTextField";
import ImageUpload from "../_components/ImageUpload";

type Lang = { tr: string; en: string; de: string };
export type LessonDTO = { id: string; title: Lang; description: Lang; provider: string; videoRef: string; durationSec: number; isFreePreview: boolean; order: number };
export type CourseDTO = { id: string; slug: string; title: Lang; description: Lang; body: Lang; coverUrl: string | null; priceCents: number; currency: string; level: string; featured: boolean; published: boolean; order: number; lessons: LessonDTO[] };

const initial: AdminResult = { ok: false };
const emptyCourse: CourseDTO = { id: "", slug: "", title: { tr: "", en: "", de: "" }, description: { tr: "", en: "", de: "" }, body: { tr: "", en: "", de: "" }, coverUrl: null, priceCents: 0, currency: "EUR", level: "", featured: false, published: true, order: 0, lessons: [] };

export default function CourseManager({ items }: { items: CourseDTO[] }) {
  const [editing, setEditing] = useState<CourseDTO | null>(null);
  const [state, formAction, pending] = useActionState(saveCourse, initial);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [delPending, startDel] = useTransition();

  useEffect(() => { if (state.ok) setEditing(null); }, [state]);
  const inp = "w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-ceyhun-gold";

  return (
    <div>
      <div className="mb-5">
        <button onClick={() => setEditing(emptyCourse)} className="inline-flex items-center gap-2 rounded-full bg-ceyhun-ink px-4 py-2.5 text-sm font-medium text-white hover:bg-ceyhun-gold-deep">
          <Plus className="h-4 w-4" /> Yeni eğitim
        </button>
      </div>

      <div className="space-y-3">
        {items.map((course) => (
          <div key={course.id} className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
            <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
              <button onClick={() => setExpanded((v) => (v === course.id ? null : course.id))} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <ChevronDown className={`h-4 w-4 shrink-0 text-ink/40 transition-transform ${expanded === course.id ? "rotate-180" : ""}`} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{course.title.tr || course.title.en || "—"}</p>
                  <p className="truncate text-xs text-ink/40">/{course.slug} · {course.lessons.length} ders · {course.priceCents === 0 ? "ücretsiz" : `${(course.priceCents / 100).toFixed(0)} ${course.currency}`}</p>
                </div>
              </button>
              {!course.published && <EyeOff className="h-4 w-4 shrink-0 text-ink/30" />}
              <button onClick={() => setEditing(course)} className="rounded-lg p-2 text-ink/50 hover:bg-gray-100"><Pencil className="h-4 w-4" /></button>
              <button disabled={delPending} onClick={() => { if (confirm("Eğitim ve tüm dersleri silinsin mi?")) startDel(() => void deleteCourse(course.id)); }} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
            </div>

            {expanded === course.id && <LessonPanel course={course} />}
          </div>
        ))}
        {items.length === 0 && <p className="rounded-2xl border border-dashed border-black/10 px-5 py-12 text-center text-sm text-ink/40">Henüz eğitim yok.</p>}
      </div>

      {/* Kurs modalı */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
          <form action={formAction} className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-syne text-xl font-bold">{editing.id ? "Eğitimi düzenle" : "Yeni eğitim"}</h3>
              <button type="button" onClick={() => setEditing(null)} className="text-ink/40 hover:text-ink"><X className="h-5 w-5" /></button>
            </div>
            {editing.id && <input type="hidden" name="id" value={editing.id} />}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <label className="col-span-2 block"><span className="mb-1 block text-xs font-medium text-ink/50">Slug (boşsa otomatik)</span><input name="slug" defaultValue={editing.slug} className={inp} /></label>
              <label className="block"><span className="mb-1 block text-xs font-medium text-ink/50">Fiyat (0=ücretsiz)</span><input name="price" type="number" min={0} defaultValue={String(editing.priceCents / 100)} className={inp} /></label>
              <label className="block"><span className="mb-1 block text-xs font-medium text-ink/50">Sıra</span><input name="order" type="number" defaultValue={String(editing.order)} className={inp} /></label>
            </div>
            <input type="hidden" name="currency" value="EUR" />
            <MultiLangField base="title" label="Başlık" value={editing.title} required />
            <MultiLangField base="description" label="Kısa açıklama" value={editing.description} textarea rows={2} />
            <RichTextField base="body" label="Detaylı içerik" value={editing.body} />
            <div className="mt-4"><ImageUpload name="coverUrl" defaultValue={editing.coverUrl ?? ""} label="Kapak" folder="courses" /></div>
            <div className="mt-4 flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={editing.featured} className="h-4 w-4" /> Öne çıkar</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={editing.published} className="h-4 w-4" /> Yayında</label>
            </div>
            {state.message && !state.ok && <p className="mt-3 text-sm text-red-600">{state.message}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(null)} className="rounded-full px-5 py-2.5 text-sm font-medium text-ink/60 hover:bg-gray-100">Vazgeç</button>
              <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-full bg-ceyhun-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-ceyhun-gold-deep disabled:opacity-60"><Save className="h-4 w-4" /> {pending ? "…" : "Kaydet"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ─── Bir kursun dersleri ───
function LessonPanel({ course }: { course: CourseDTO }) {
  const [editing, setEditing] = useState<LessonDTO | null>(null);
  const [state, formAction, pending] = useActionState(saveLesson, initial);
  const [delPending, startDel] = useTransition();
  useEffect(() => { if (state.ok) setEditing(null); }, [state]);
  const emptyLesson: LessonDTO = { id: "", title: { tr: "", en: "", de: "" }, description: { tr: "", en: "", de: "" }, provider: "youtube", videoRef: "", durationSec: 0, isFreePreview: false, order: course.lessons.length };
  const inp = "w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-ceyhun-gold";

  return (
    <div className="border-t border-black/5 bg-gray-50/60 px-4 py-4 sm:px-5">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-ink/70">Dersler</h4>
        <button onClick={() => setEditing(emptyLesson)} className="inline-flex items-center gap-1.5 rounded-full bg-ceyhun-ink px-3 py-1.5 text-xs font-medium text-white hover:bg-ceyhun-gold-deep"><Plus className="h-3.5 w-3.5" /> Ders ekle</button>
      </div>
      <div className="space-y-1.5">
        {course.lessons.map((l, i) => (
          <div key={l.id} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm shadow-sm">
            <GripVertical className="h-4 w-4 text-ink/20" />
            <PlayCircle className="h-4 w-4 text-ceyhun-gold-deep" />
            <span className="min-w-0 flex-1 truncate">{i + 1}. {l.title.tr || l.title.en || "—"}</span>
            {l.isFreePreview && <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] text-green-700">önizleme</span>}
            <button onClick={() => setEditing(l)} className="rounded p-1.5 text-ink/50 hover:bg-gray-100"><Pencil className="h-3.5 w-3.5" /></button>
            <button disabled={delPending} onClick={() => { if (confirm("Ders silinsin mi?")) startDel(() => void deleteLesson(l.id)); }} className="rounded p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
        {course.lessons.length === 0 && <p className="py-3 text-center text-xs text-ink/40">Henüz ders yok.</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
          <form action={formAction} className="my-8 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-syne text-lg font-bold">{editing.id ? "Dersi düzenle" : "Yeni ders"}</h3>
              <button type="button" onClick={() => setEditing(null)} className="text-ink/40 hover:text-ink"><X className="h-5 w-5" /></button>
            </div>
            <input type="hidden" name="courseId" value={course.id} />
            {editing.id && <input type="hidden" name="id" value={editing.id} />}
            <div className="grid grid-cols-2 gap-4">
              <label className="block"><span className="mb-1 block text-xs font-medium text-ink/50">Kaynak</span>
                <select name="provider" defaultValue={editing.provider} className={inp}><option value="youtube">YouTube</option><option value="vimeo">Vimeo</option><option value="cloudinary">Cloudinary / MP4</option></select></label>
              <label className="block"><span className="mb-1 block text-xs font-medium text-ink/50">Sıra</span><input name="order" type="number" defaultValue={String(editing.order)} className={inp} /></label>
            </div>
            <label className="mt-4 block"><span className="mb-1 block text-xs font-medium text-ink/50">Video bağlantısı / kimliği *</span><input name="videoRef" defaultValue={editing.videoRef} placeholder="https://youtu.be/…" className={inp} /></label>
            <MultiLangField base="title" label="Ders başlığı" value={editing.title} required />
            <MultiLangField base="description" label="Açıklama" value={editing.description} textarea rows={2} />
            <div className="mt-4 grid grid-cols-2 gap-4">
              <label className="block"><span className="mb-1 block text-xs font-medium text-ink/50">Süre (sn)</span><input name="durationSec" type="number" defaultValue={String(editing.durationSec)} className={inp} /></label>
              <label className="flex items-end gap-2 pb-2 text-sm"><input type="checkbox" name="isFreePreview" defaultChecked={editing.isFreePreview} className="h-4 w-4" /> Ücretsiz önizleme</label>
            </div>
            {state.message && !state.ok && <p className="mt-3 text-sm text-red-600">{state.message}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(null)} className="rounded-full px-5 py-2.5 text-sm font-medium text-ink/60 hover:bg-gray-100">Vazgeç</button>
              <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-full bg-ceyhun-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-ceyhun-gold-deep disabled:opacity-60"><Save className="h-4 w-4" /> {pending ? "…" : "Kaydet"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

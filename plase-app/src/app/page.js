"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LANGUAGES, t } from "@/lib/translations";

const SCALE_VALUES = [1, 2, 3, 4, 5];

export default function SurveyPage() {
  const router = useRouter();
  const [lang, setLang] = useState("it");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const tr = t[lang];

  const [form, setForm] = useState({
    age: "",
    sex: "",
    nationality: "",
    location: "",
    d1: "",
    d2: "",
    d3: "",
    d4: "",
    d5: "",
    d6_scale: null,
    d6_text: "",
  });

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: false }));
  };

  const countWords = (str) => str.trim().split(/\s+/).filter(w => w.length > 0).length;

  const validate = () => {
    const newErrors = {};
    const basicFields = ["age", "sex", "nationality", "location"];
    for (const f of basicFields) {
      if (!form[f] || String(form[f]).trim() === "") newErrors[f] = true;
    }
    const openFields = ["d1", "d2", "d3", "d4", "d5"];
    for (const f of openFields) {
      if (!form[f] || String(form[f]).trim() === "") newErrors[f] = "required";
      else if (countWords(String(form[f])) < 5) newErrors[f] = "minWords";
    }
    if (!form.d6_scale) newErrors.d6_scale = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      document.querySelector("[data-error='true']")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, language: lang }),
      });
      if (!res.ok) throw new Error("Submit failed");
      router.push("/success?lang=" + lang);
    } catch {
      setSubmitting(false);
      alert("Errore durante l'invio. Riprova.");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-stone-800 text-white px-4 py-5">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-bold tracking-tight">{tr.title}</h1>
          <p className="text-xs text-stone-400 mt-0.5">{tr.subtitle}</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">

        {/* Language selector */}
        <div className="mb-8 bg-white rounded-xl border border-stone-200 p-4">
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
            {tr.langLabel}
          </label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLang(l.code)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  lang === l.code
                    ? "bg-stone-800 text-white border-stone-800"
                    : "bg-white text-stone-700 border-stone-300 hover:border-stone-500"
                }`}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          {/* Privacy notice */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-medium mb-1">🔒 {tr.privacy}</p>
            <p className="text-xs text-blue-600">{tr.intro}</p>
          </div>

          {/* Demographics */}
          <section className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
            <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wide mb-5">
              {tr.section_demographics}
            </h2>

            {/* Age */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-stone-700 mb-1">{tr.age}</label>
              <input
                type="number"
                min={10}
                max={120}
                value={form.age}
                onChange={(e) => set("age", e.target.value)}
                placeholder={tr.agePlaceholder}
                data-error={errors.age ? "true" : undefined}
                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${
                  errors.age ? "border-red-400 bg-red-50" : "border-stone-300 focus:border-stone-600"
                }`}
              />
              {errors.age && <p className="text-xs text-red-500 mt-1">{tr.required}</p>}
            </div>

            {/* Sex */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-stone-700 mb-1">{tr.sex}</label>
              <div className="grid grid-cols-2 gap-2" data-error={errors.sex ? "true" : undefined}>
                {tr.sexOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => set("sex", opt)}
                    className={`px-3 py-2 rounded-lg text-sm border text-left transition-all ${
                      form.sex === opt
                        ? "bg-stone-800 text-white border-stone-800"
                        : "bg-white text-stone-700 border-stone-300 hover:border-stone-500"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {errors.sex && <p className="text-xs text-red-500 mt-1">{tr.required}</p>}
            </div>

            {/* Nationality */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-stone-700 mb-1">{tr.nationality}</label>
              <input
                type="text"
                value={form.nationality}
                onChange={(e) => set("nationality", e.target.value)}
                placeholder={tr.nationalityPlaceholder}
                data-error={errors.nationality ? "true" : undefined}
                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${
                  errors.nationality ? "border-red-400 bg-red-50" : "border-stone-300 focus:border-stone-600"
                }`}
              />
              {errors.nationality && <p className="text-xs text-red-500 mt-1">{tr.required}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">{tr.location}</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder={tr.locationPlaceholder}
                data-error={errors.location ? "true" : undefined}
                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${
                  errors.location ? "border-red-400 bg-red-50" : "border-stone-300 focus:border-stone-600"
                }`}
              />
              {errors.location && <p className="text-xs text-red-500 mt-1">{tr.required}</p>}
            </div>
          </section>

          {/* Questions D1–D5 */}
          <section className="space-y-5 mb-6">
            <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wide">
              {tr.section_questions}
            </h2>

            {tr.questions.slice(0, 5).map((q, i) => {
              const field = `d${i + 1}`;
              return (
                <div
                  key={field}
                  className={`bg-white rounded-xl border p-5 transition-colors ${
                    errors[field] ? "border-red-400" : "border-stone-200"
                  }`}
                  data-error={errors[field] ? "true" : undefined}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-stone-800 text-white text-xs font-bold flex items-center justify-center">
                      {q.label}
                    </span>
                    <p className="text-sm text-stone-700 leading-relaxed">{q.text}</p>
                  </div>
                  <textarea
                    value={form[field]}
                    onChange={(e) => set(field, e.target.value)}
                    placeholder={tr.placeholder}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm outline-none resize-none focus:border-stone-500 transition-colors"
                  />
                  {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field] === "minWords" ? tr.minWords : tr.required}</p>}
                </div>
              );
            })}
          </section>

          {/* Question D6 — Scale + text */}
          {(() => {
            const q = tr.questions[5];
            return (
              <div
                className={`bg-white rounded-xl border p-5 mb-8 ${errors.d6_scale ? "border-red-400" : "border-stone-200"}`}
                data-error={errors.d6_scale ? "true" : undefined}
              >
                <div className="flex items-start gap-3 mb-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-stone-800 text-white text-xs font-bold flex items-center justify-center">
                    {q.label}
                  </span>
                  <p className="text-sm text-stone-700 leading-relaxed">{q.text}</p>
                </div>

                <div className="mb-2 flex justify-between text-xs text-stone-500">
                  <span>{q.scale_1}</span>
                  <span>{q.scale_5}</span>
                </div>
                <div className="flex gap-2 mb-4">
                  {SCALE_VALUES.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => { set("d6_scale", v); }}
                      className={`flex-1 py-3 rounded-xl text-lg font-bold border transition-all ${
                        form.d6_scale === v
                          ? "bg-stone-800 text-white border-stone-800 scale-105"
                          : "bg-stone-50 text-stone-700 border-stone-300 hover:border-stone-600"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                {errors.d6_scale && <p className="text-xs text-red-500 mb-3">{tr.required}</p>}

                <label className="block text-sm font-medium text-stone-600 mb-1">{q.why}</label>
                <textarea
                  value={form.d6_text}
                  onChange={(e) => set("d6_text", e.target.value)}
                  placeholder={tr.placeholder}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm outline-none resize-none focus:border-stone-500 transition-colors"
                />
              </div>
            );
          })()}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-stone-800 text-white rounded-xl font-semibold text-base hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? tr.submitting : tr.submit}
          </button>

          <p className="text-center text-xs text-stone-400 mt-4">
            © Bidoc S.r.l. — Ricerca PLASE
          </p>
        </form>
      </main>
    </div>
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { t } from "@/lib/translations";

function SuccessContent() {
  const params = useSearchParams();
  const lang = params.get("lang") || "it";
  const tr = t[lang] || t.it;

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-stone-800 mb-3">{tr.successTitle}</h1>
        <p className="text-stone-600 leading-relaxed">{tr.successText}</p>
        <p className="text-xs text-stone-400 mt-8">© Bidoc S.r.l. — Ricerca PLASE</p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">...</div>}>
      <SuccessContent />
    </Suspense>
  );
}

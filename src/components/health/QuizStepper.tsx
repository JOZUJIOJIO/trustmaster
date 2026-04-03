"use client";

import { useState, useCallback } from "react";
import { useLocale } from "@/lib/LocaleContext";
import { QUESTIONS, SCALE_LABELS, STAGE_LABELS } from "@/lib/constitution-questions";
import type { QuizAnswer } from "@/lib/types";

interface QuizStepperProps {
  onComplete: (answers: QuizAnswer[]) => void;
}

export default function QuizStepper({ onComplete }: QuizStepperProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(QuizAnswer | null)[]>(
    Array(QUESTIONS.length).fill(null)
  );
  const { locale, t } = useLocale();

  const question = QUESTIONS[currentIndex];
  const stage = question.stage;
  const scaleLabels = SCALE_LABELS[locale];
  const stageLabel = STAGE_LABELS[locale][stage - 1];
  const isLast = currentIndex === QUESTIONS.length - 1;

  const handleAnswer = useCallback((value: QuizAnswer) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = value;
      return next;
    });
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (answers[currentIndex] === null) return;
    if (isLast) {
      onComplete(answers as QuizAnswer[]);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, answers, isLast, onComplete]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }, [currentIndex]);

  const progressText = t("health.quiz.progress")
    .replace("{current}", String(currentIndex + 1))
    .replace("{total}", String(QUESTIONS.length));

  return (
    <div className="max-w-lg mx-auto px-4">
      <div className="text-center mb-2">
        <span className="text-[10px] tracking-[0.3em] text-amber-400/40 uppercase">
          {t("health.quiz.stage").replace("{n}", String(stage))} — {stageLabel}
        </span>
      </div>

      <div className="w-full h-1 bg-white/[0.06] rounded-full mb-8">
        <div
          className="h-full bg-amber-500/60 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / QUESTIONS.length) * 100}%` }}
        />
      </div>

      <p className="text-xs text-amber-200/30 text-center mb-6">{progressText}</p>

      <h2 className="text-lg font-semibold text-amber-100 text-center mb-8 min-h-[3.5em] leading-relaxed">
        {question.text[locale]}
      </h2>

      <div className="flex flex-col gap-2">
        {([1, 2, 3, 4, 5] as QuizAnswer[]).map((value) => (
          <button
            key={value}
            onClick={() => handleAnswer(value)}
            className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition-all cursor-pointer
              ${answers[currentIndex] === value
                ? "bg-amber-600/30 border-amber-400/40 text-amber-100"
                : "bg-white/[0.03] border-white/[0.06] text-amber-200/50 hover:bg-white/[0.06]"
              } border`}
          >
            {scaleLabels[value - 1]}
          </button>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-6 py-2 text-sm text-amber-200/40 disabled:opacity-20 cursor-pointer"
        >
          {t("health.quiz.prev")}
        </button>
        <button
          onClick={handleNext}
          disabled={answers[currentIndex] === null}
          className="px-8 py-3 rounded-full text-sm font-semibold cursor-pointer
                     bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white
                     border border-amber-500/30 disabled:opacity-30 disabled:cursor-not-allowed
                     hover:shadow-[0_0_30px_rgba(217,119,6,0.25)] transition-all"
        >
          {isLast ? t("health.quiz.submit") : t("health.quiz.next")}
        </button>
      </div>
    </div>
  );
}

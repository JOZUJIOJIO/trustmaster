"use client";

import { useState, useRef, useCallback } from "react";
import { useLocale } from "@/lib/LocaleContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface HealthChatProps {
  assessmentId: string;
  usedCount: number;
  maxFree: number;
}

const QUICK_ASKS_ZH = ["失眠怎么调？", "适合什么运动？", "喝什么茶好？"];
const QUICK_ASKS_EN = ["Tips for insomnia?", "Best exercise for me?", "What tea suits me?"];

export default function HealthChat({ assessmentId, usedCount: initialUsed, maxFree }: HealthChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [usedCount, setUsedCount] = useState(initialUsed);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { locale, t } = useLocale();

  const quickAsks = locale === "zh" ? QUICK_ASKS_ZH : QUICK_ASKS_EN;
  const isLocked = usedCount >= maxFree;

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading || isLocked) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/health/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId, message: text }),
      });

      if (!res.ok) throw new Error("Chat failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantText += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { role: "assistant", content: assistantText };
            return next;
          });
        }
      }
      setUsedCount((c) => c + 1);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: locale === "zh" ? "抱歉，请稍后再试。" : "Sorry, please try again." },
      ]);
    } finally {
      setLoading(false);
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [assessmentId, loading, isLocked, locale]);

  return (
    <div>
      <h3 className="text-sm font-semibold text-amber-100 mb-4">
        🤖 {t("health.report.chat")}
      </h3>

      {messages.length > 0 && (
        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`text-xs leading-relaxed ${
              msg.role === "user" ? "text-amber-200/70 text-right" : "text-amber-200/50"
            }`}>
              <span className={`inline-block px-3 py-2 rounded-xl max-w-[80%] ${
                msg.role === "user"
                  ? "bg-amber-600/20 border border-amber-500/20"
                  : "bg-white/[0.03] border border-white/[0.06]"
              }`}>
                {msg.content || (loading ? "..." : "")}
              </span>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      )}

      <p className="text-[10px] text-amber-200/25 text-center mb-2">
        {t("health.report.chatLimit").replace("{used}", String(usedCount))}
      </p>

      {isLocked ? (
        <div className="text-center">
          <button className="px-4 py-2 rounded-full text-xs font-medium cursor-pointer
                             bg-amber-600/20 border border-amber-500/20 text-amber-200
                             hover:bg-amber-600/30 transition-all">
            {t("health.report.chatBuyMore")}
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder={t("health.report.chatPlaceholder")}
              className="flex-1 px-4 py-3 rounded-xl bg-white/[0.04] border border-amber-400/15
                         text-sm text-amber-100 placeholder-amber-200/25
                         focus:outline-none focus:border-amber-400/30 transition-all"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="px-4 py-3 rounded-xl text-xs font-semibold cursor-pointer
                         bg-amber-600/30 text-amber-200 disabled:opacity-30
                         hover:bg-amber-600/40 transition-all"
            >
              {t("health.report.chatSend")}
            </button>
          </div>

          {messages.length === 0 && (
            <div className="flex gap-2 mt-3 justify-center flex-wrap">
              {quickAsks.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-[10px] px-3 py-1.5 rounded-full cursor-pointer
                             bg-white/[0.03] border border-amber-400/10 text-amber-200/35
                             hover:text-amber-200/60 hover:border-amber-400/20 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

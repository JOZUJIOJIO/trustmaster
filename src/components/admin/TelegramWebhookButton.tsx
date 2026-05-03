"use client";

import { useState } from "react";

export function TelegramWebhookButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function configureWebhook() {
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/telegram/webhook/configure", { method: "POST" });
      const data = await res.json();
      if (!res.ok || data.result?.ok === false) {
        throw new Error(data.error || data.result?.description || "Webhook configuration failed");
      }
      setStatus("success");
      setMessage(`Webhook 已配置：${data.webhookUrl}`);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Webhook configuration failed");
    }
  }

  return (
    <div className="rounded-lg border border-cyan-200 bg-cyan-50/70 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-cyan-950">Telegram Stars Webhook</p>
          <p className="mt-1 text-xs text-cyan-800/70">用于确认 Stars 支付和写入订单。部署后点一次即可。</p>
        </div>
        <button
          type="button"
          onClick={configureWebhook}
          disabled={status === "loading"}
          className="rounded-md bg-cyan-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-cyan-800 disabled:opacity-50"
        >
          {status === "loading" ? "配置中..." : "配置 Webhook"}
        </button>
      </div>
      {message && (
        <p className={`mt-3 text-xs ${status === "error" ? "text-red-700" : "text-cyan-900"}`}>
          {message}
        </p>
      )}
    </div>
  );
}

export function isTelegramMiniAppPreviewRuntime() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  const isExplicitPreview = params.get("tg_preview") === "1";
  const isLocalPreview = window.location.hostname === "localhost" && window.location.port === "3002";
  return isExplicitPreview || isLocalPreview;
}

export function isTelegramMiniAppRuntime() {
  if (typeof window === "undefined") return false;
  const hasTelegramInitData = Boolean(window.Telegram?.WebApp?.initData);
  return hasTelegramInitData || isTelegramMiniAppPreviewRuntime();
}

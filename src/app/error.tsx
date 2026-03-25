"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0814] px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🔮</div>
        <h1 className="text-2xl font-bold text-amber-100 mb-2">Something went wrong</h1>
        <p className="text-amber-200/40 text-sm mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-block px-6 py-2.5 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-white px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🔮</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-gray-500 text-sm mb-6">
          The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

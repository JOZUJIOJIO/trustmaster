export interface ReadingCardProps {
  icon: string;
  title: string;
  content: string;
  delay?: number;
}

export function ReadingCard({ icon, title, content, delay = 0 }: ReadingCardProps) {
  return (
    <div
      className="relative bg-white/[0.03] border border-amber-400/10 rounded-2xl p-5 overflow-hidden group hover:border-amber-400/20 transition-all duration-500"
      style={{ animation: `slideUp 0.6s ease-out ${delay}ms both` }}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{icon}</span>
          <h3 className="text-amber-300 font-semibold">{title}</h3>
        </div>
        <p className="text-amber-100/70 text-sm leading-relaxed whitespace-pre-line">{content}</p>
      </div>
    </div>
  );
}

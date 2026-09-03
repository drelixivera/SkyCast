// src/components/common/SkeletonCard.jsx
// ============================================
// SKELETON CARD - WITH SHIMMER EFFECT
// ============================================

export default function SkeletonCard() {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10 animate-pulse">
      <div className="text-center">
        <div className="h-8 bg-white/20 rounded w-48 mx-auto mb-2"></div>
        <div className="h-4 bg-white/20 rounded w-32 mx-auto"></div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 bg-white/20 rounded-full"></div>
          <div>
            <div className="h-12 bg-white/20 rounded w-24 mb-2"></div>
            <div className="h-4 bg-white/20 rounded w-20"></div>
          </div>
        </div>
        <div>
          <div className="h-4 bg-white/20 rounded w-32 mb-1"></div>
          <div className="h-4 bg-white/20 rounded w-32"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="text-center p-3">
            <div className="h-5 w-5 bg-white/20 rounded mx-auto mb-1"></div>
            <div className="h-3 bg-white/20 rounded w-12 mx-auto mb-1"></div>
            <div className="h-5 bg-white/20 rounded w-16 mx-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
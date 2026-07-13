// Loading skeletons for LevelUp

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center pb-4 border-b border-white/5">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-neutral-800 rounded"></div>
          <div className="h-4 w-64 bg-neutral-800 rounded"></div>
        </div>
        <div className="h-10 w-10 bg-neutral-800 rounded-full"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-neutral-900 border border-white/5 rounded-2xl p-4 space-y-4">
            <div className="h-4 w-20 bg-neutral-800 rounded"></div>
            <div className="h-8 w-28 bg-neutral-800 rounded"></div>
            <div className="h-3 w-16 bg-neutral-800 rounded"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-80 lg:col-span-2 bg-neutral-900 border border-white/5 rounded-2xl p-6"></div>
        <div className="h-80 bg-neutral-900 border border-white/5 rounded-2xl p-6"></div>
      </div>
    </div>
  );
}

export function WorkoutSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-40 bg-neutral-800 rounded"></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-48 bg-neutral-900 border border-white/5 rounded-2xl p-6"></div>
          <div className="h-64 bg-neutral-900 border border-white/5 rounded-2xl p-6"></div>
        </div>
        <div className="h-96 bg-neutral-900 border border-white/5 rounded-2xl p-6"></div>
      </div>
    </div>
  );
}

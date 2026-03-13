export const WeatherSkeleton = () => (
  <div aria-busy="true" aria-label="Loading weather data" className="glass-card animate-pulse rounded-3xl p-6">
    <div className="flex items-start justify-between">
      <div className="space-y-2.5">
        <div className="h-8 w-44 rounded-xl bg-white/10" />
        <div className="h-4 w-20 rounded-lg bg-white/10" />
        <div className="h-4 w-32 rounded-lg bg-white/10" />
      </div>
      <div className="h-20 w-20 rounded-2xl bg-white/10" />
    </div>
    <div className="mt-5 h-16 w-40 rounded-xl bg-white/10" />
    <div className="mt-3 h-4 w-72 rounded-lg bg-white/10" />
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-[72px] rounded-2xl bg-white/10" />
      ))}
    </div>
  </div>
)

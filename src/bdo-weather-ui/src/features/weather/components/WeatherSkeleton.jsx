export const WeatherSkeleton = () => (
  <div aria-busy="true" aria-label="Loading weather data" className="animate-pulse space-y-3">
    <div className="h-8 w-1/2 rounded bg-gray-200" />
    <div className="h-16 w-1/3 rounded bg-gray-200" />
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-10 rounded bg-gray-200" />
      ))}
    </div>
  </div>
)

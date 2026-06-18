export default function RecipeCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-card animate-pulse">
      <div className="aspect-video bg-stone-200" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 bg-stone-200 rounded" />
          <div className="h-4 w-12 bg-stone-200 rounded" />
        </div>
        <div className="h-5 w-3/4 bg-stone-200 rounded" />
        <div className="space-y-1">
          <div className="h-4 w-full bg-stone-200 rounded" />
          <div className="h-4 w-2/3 bg-stone-200 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-3 w-20 bg-stone-200 rounded" />
          <div className="h-3 w-16 bg-stone-200 rounded" />
          <div className="h-3 w-14 bg-stone-200 rounded" />
        </div>
      </div>
    </div>
  )
}

/**
 * @file loading.tsx
 * @description Loading skeleton screen for the Weekly Meal Planner.
 * Mimics title headings, toolbar controls, and calendar rows/columns structure.
 */

import Header from "@/components/Header"

export default function MealPlannerLoading() {
  return (
    <>
      <Header />
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-8">
        {/* Title and Controls Header Skeletons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="space-y-2">
            <div className="h-9 w-52 bg-stone-200 rounded-lg animate-pulse" />
            <div className="h-5 w-72 bg-stone-100 rounded-lg animate-pulse" />
          </div>
          <div className="flex gap-2 self-stretch sm:self-auto">
            <div className="h-10 w-24 bg-stone-200 rounded-xl animate-pulse" />
            <div className="h-10 w-28 bg-stone-200 rounded-xl animate-pulse" />
            <div className="h-10 w-24 bg-stone-600/40 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Calendar Weekly Grid Skeleton (Desktop Style) */}
        <div className="hidden md:block bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          {/* Grid Headers */}
          <div className="grid grid-cols-8 border-b border-stone-200 bg-stone-50/75 p-3 text-center">
            <div className="h-5 w-12 bg-stone-200 rounded mx-auto animate-pulse" />
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-5 w-16 bg-stone-200 rounded mx-auto animate-pulse" />
            ))}
          </div>

          {/* Grid Rows (Meals: Breakfast, Lunch, Dinner, Snacks) */}
          <div className="divide-y divide-stone-150">
            {Array.from({ length: 4 }).map((_, rIdx) => (
              <div key={rIdx} className="grid grid-cols-8 min-h-[100px] items-center p-3 gap-2">
                {/* Row Header Label Skeleton */}
                <div className="h-6 w-16 bg-stone-200 rounded mx-auto animate-pulse" />
                
                {/* Day Slots Skeletons */}
                {Array.from({ length: 7 }).map((_, cIdx) => (
                  <div
                    key={cIdx}
                    className="h-[76px] w-full border border-dashed border-stone-200 bg-stone-50/50 rounded-xl animate-pulse flex items-center justify-center"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile View Placeholder Skeletons */}
        <div className="block md:hidden space-y-4">
          <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-stone-200">
            <div className="w-8 h-8 bg-stone-100 rounded-full animate-pulse" />
            <div className="h-6 w-24 bg-stone-200 rounded animate-pulse" />
            <div className="w-8 h-8 bg-stone-100 rounded-full animate-pulse" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-xl border border-stone-200 h-24 animate-pulse flex flex-col justify-between"
              >
                <div className="h-4 w-20 bg-stone-200 rounded" />
                <div className="h-8 w-full bg-stone-100 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}

/**
 * @file loading.tsx
 * @description Loading skeleton screen for the recipes catalog list.
 * Mimics title headers, search filters bar, and the catalog grid list layouts.
 */

import Header from "@/components/Header"

export default function RecipesLoading() {
  return (
    <>
      <Header />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8">
        {/* Title and Subtitle Skeletons */}
        <div className="mb-8 space-y-2">
          <div className="h-9 w-60 bg-stone-200 rounded-lg animate-pulse" />
          <div className="h-5 w-80 bg-stone-100 rounded-lg animate-pulse" />
        </div>

        {/* Search & Filter Bar Skeletons */}
        <div className="mb-8 p-4 bg-white rounded-xl border border-stone-200/80 space-y-4">
          <div className="h-10 w-full bg-stone-100 rounded-lg animate-pulse" />
          <div className="flex flex-wrap gap-2 pt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 w-24 bg-stone-100 rounded-full animate-pulse" />
            ))}
          </div>
        </div>

        {/* Counter and Grid Loader */}
        <div className="h-5 w-32 bg-stone-100 rounded-lg animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-card flex flex-col h-full"
            >
              {/* Media Thumbnail Skeleton */}
              <div className="aspect-video bg-stone-100 animate-pulse relative" />
              
              {/* Card Footer Details Skeletons */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex gap-2">
                    <div className="h-5 w-16 bg-stone-200 rounded animate-pulse" />
                    <div className="h-5 w-12 bg-stone-100 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-3/4 bg-stone-200 rounded-md animate-pulse" />
                  <div className="space-y-1 pt-1">
                    <div className="h-4 w-full bg-stone-100 rounded animate-pulse" />
                    <div className="h-4 w-5/6 bg-stone-100 rounded animate-pulse" />
                  </div>
                </div>

                {/* Footer Badges */}
                <div className="flex items-center gap-3 pt-3 border-t border-stone-100">
                  <div className="h-4 w-20 bg-stone-100 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-stone-100 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}

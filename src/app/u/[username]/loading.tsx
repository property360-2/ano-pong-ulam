/**
 * @file loading.tsx
 * @description Loading skeleton screen for the user profile page.
 * Mimics avatar header blocks, follow statistics, tabs, and layout grids.
 */

import Header from "@/components/Header"

export default function ProfileLoading() {
  return (
    <>
      <Header />
      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-8">
        {/* Profile Card Header Skeleton */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 mb-8 shadow-sm flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6">
          {/* Avatar Placeholder */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-stone-200 animate-pulse shrink-0" />
          
          {/* Profile text lines */}
          <div className="flex-1 space-y-4 py-2 w-full">
            <div className="space-y-2 flex flex-col items-center md:items-start">
              <div className="h-7 w-48 bg-stone-200 rounded animate-pulse" />
              <div className="h-4 w-32 bg-stone-100 rounded animate-pulse" />
            </div>
            
            <div className="h-4.5 w-5/6 bg-stone-150 rounded animate-pulse mx-auto md:mx-0" />
            
            {/* Follow stats counter */}
            <div className="flex gap-4 justify-center md:justify-start pt-2">
              <div className="h-5 w-24 bg-stone-100 rounded animate-pulse" />
              <div className="h-5 w-24 bg-stone-100 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Tab Selector Skeleton */}
        <div className="flex border-b border-stone-200 mb-6">
          <div className="h-10 w-28 bg-stone-200/60 rounded-t-lg animate-pulse mr-2" />
          <div className="h-10 w-28 bg-stone-100/50 rounded-t-lg animate-pulse" />
        </div>

        {/* User Content Recipes Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-card flex flex-col h-full"
            >
              <div className="aspect-video bg-stone-100 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-3/4 bg-stone-200 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-stone-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}

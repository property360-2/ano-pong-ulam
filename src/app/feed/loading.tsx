/**
 * @file loading.tsx
 * @description Loading skeleton screen for the social activity feed page.
 * Mimics feed layout tabs, posting triggers, user avatars, and text body.
 */

import Header from "@/components/Header"

export default function FeedLoading() {
  return (
    <>
      <Header />
      <main className="flex-1 mx-auto max-w-2xl w-full px-4 py-8">
        {/* Title and Tab Selector Skeletons */}
        <div className="mb-6 space-y-4">
          <div className="h-8 w-44 bg-stone-200 rounded-lg animate-pulse" />
          <div className="flex border-b border-stone-200">
            <div className="h-10 w-28 bg-stone-200/60 rounded-t-lg animate-pulse mr-2" />
            <div className="h-10 w-28 bg-stone-100/50 rounded-t-lg animate-pulse" />
          </div>
        </div>

        {/* Activity Feed Post Skeletons */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-stone-200/80 p-5 shadow-sm space-y-4"
            >
              {/* Header: User Avatar, Name, Time */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-200 animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4.5 w-32 bg-stone-200 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-stone-100 rounded animate-pulse" />
                </div>
              </div>

              {/* Body: Action Title and Recipe Preview Card */}
              <div className="space-y-3">
                <div className="h-5 w-4/5 bg-stone-200 rounded animate-pulse" />
                
                {/* Embedded Mini-Card */}
                <div className="border border-stone-100 rounded-xl p-3 bg-stone-50/50 flex gap-4">
                  <div className="w-20 h-20 bg-stone-200 rounded-lg animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-5 w-2/3 bg-stone-200 rounded animate-pulse" />
                    <div className="h-4 w-1/3 bg-stone-100 rounded animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Footer Actions: Likes and Comments */}
              <div className="flex gap-4 pt-2 border-t border-stone-100">
                <div className="h-5 w-14 bg-stone-100 rounded-full animate-pulse" />
                <div className="h-5 w-14 bg-stone-100 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}

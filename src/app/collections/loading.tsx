/**
 * @file loading.tsx
 * @description Loading skeleton screen for the user collections page.
 * Mimics collection cards (folder albums), headers, and create buttons.
 */

import Header from "@/components/Header"

export default function CollectionsLoading() {
  return (
    <>
      <Header />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8">
        {/* Header Skeletons */}
        <div className="flex justify-between items-center mb-8 gap-4">
          <div className="space-y-2">
            <div className="h-9 w-48 bg-stone-200 rounded-lg animate-pulse" />
            <div className="h-5 w-72 bg-stone-100 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-36 bg-red-600/40 rounded-xl animate-pulse shrink-0" />
        </div>

        {/* Collections Folders Grid Loader */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm h-64 flex flex-col justify-between p-5 space-y-4"
            >
              <div className="space-y-3">
                {/* Folder Icon Placeholder */}
                <div className="w-12 h-10 bg-stone-200 rounded-lg animate-pulse" />
                
                {/* Title and Descriptions */}
                <div className="space-y-2">
                  <div className="h-6 w-3/4 bg-stone-200 rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-stone-100 rounded animate-pulse" />
                </div>
              </div>

              {/* Card Footer Recipe Count Placeholder */}
              <div className="flex justify-between items-center pt-3 border-t border-stone-100">
                <div className="h-4.5 w-24 bg-stone-100 rounded animate-pulse" />
                <div className="h-4.5 w-12 bg-stone-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}

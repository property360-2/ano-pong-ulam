import Link from "next/link"
import { MdSearchOff, MdHome } from "react-icons/md"
import Header from "@/components/Header"

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MdSearchOff className="text-3xl text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Page not found</h1>
          <p className="text-stone-500 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 bg-red-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-red-700 transition-colors"
          >
            <MdHome /> Go Home
          </Link>
        </div>
      </main>
    </>
  )
}

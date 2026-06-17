import Link from "next/link"
import { auth } from "@/lib/auth"
import Header from "@/components/Header"
import { MdFastfood, MdEmojiFoodBeverage, MdWbSunny, MdCelebration, MdEco, MdCake } from "react-icons/md"

export const dynamic = "force-dynamic"

const CATEGORIES = [
  { name: "Ulam", slug: "ulam", desc: "Main dishes", icon: <MdFastfood /> },
  { name: "Merienda", slug: "merienda", desc: "Snacks & treats", icon: <MdEmojiFoodBeverage /> },
  { name: "Pang-almusal", slug: "breakfast", desc: "Morning meals", icon: <MdWbSunny /> },
  { name: "Pampasko", slug: "fiesta", desc: "Festive dishes", icon: <MdCelebration /> },
  { name: "Lutong Gulay", slug: "vegetable", desc: "Veggie dishes", icon: <MdEco /> },
  { name: "Dessert", slug: "dessert", desc: "Matatamis", icon: <MdCake /> },
]

export default async function HomePage() {
  const session = await auth()

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-red-50 to-stone-50 py-20 px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Ano pong{" "}
              <span className="text-red-600">ulam?</span>
            </h1>
            <p className="text-lg text-stone-600 mb-8 max-w-xl mx-auto">
              Filipino family recipes — shared by lolas, titas, and home cooks. Discover, cook, and share the dishes that bring us together.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/recipes"
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Browse Recipes
              </Link>
              <Link
                href="/recipes/new"
                className="bg-white text-stone-800 px-6 py-3 rounded-lg font-medium border border-stone-300 hover:bg-stone-50 transition-colors"
              >
                Share Your Recipe
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold mb-8">Discover by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/recipes?category=${cat.slug}`}
                  className="bg-white rounded-xl p-6 border border-stone-200 hover:border-red-300 hover:shadow-sm transition-all"
                >
                  <span className="text-3xl block mb-2">{cat.icon}</span>
                  <h3 className="font-semibold text-stone-900">{cat.name}</h3>
                  <p className="text-sm text-stone-500">{cat.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-white">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-bold mb-4">Latest Recipes</h2>
            <p className="text-stone-500 mb-8">
              No recipes yet — be the first to share!
            </p>
            {session?.user ? (
              <Link
                href="/recipes/new"
                className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Share Your First Recipe
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Sign In to Share
              </Link>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-stone-900 text-stone-400 py-8 px-4 text-sm text-center">
        <p>Mga recipe ng pamilya, pinagbabahagi ng bayan.</p>
      </footer>
    </>
  )
}

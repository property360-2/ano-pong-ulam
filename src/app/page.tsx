/**
 * @file page.tsx
 * @description Root application homepage component. Renders site introduction, recipe search prompts,
 * categories selection grid, and lists recently published heirloom and community recipe cards.
 * Designed with a warm amber theme, responsive grid layouts, and clean routing links.
 */

import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import Header from "@/components/Header"
import RecipeCard from "@/components/RecipeCard"
import { MdFastfood, MdEmojiFoodBeverage, MdWbSunny, MdCelebration, MdEco, MdCake } from "react-icons/md"

export const dynamic = "force-dynamic"

const CATEGORIES = [
  { name: "Ulam", slug: "ulam", desc: "The star of every meal. Kung walang ulam, hindi buo ang kainan.", icon: <MdFastfood /> },
  { name: "Merienda", slug: "merienda", desc: "Mga panghapong cravings na hitik sa sarap — turon, puto, atbp.", icon: <MdEmojiFoodBeverage /> },
  { name: "Pang-almusal", slug: "breakfast", desc: "Simulan ang araw nang busog. Tosino, sinangag, itlog — name it.", icon: <MdWbSunny /> },
  { name: "Pampasko", slug: "fiesta", desc: "The dishes that only come out during handaan, sa binyag, kasal, at Pasko.", icon: <MdCelebration /> },
  { name: "Lutong Gulay", slug: "vegetable", desc: "Pinoy gulay dishes na kahit ang bata, uulit.", icon: <MdEco /> },
  { name: "Matatamis", slug: "dessert", desc: "Handa na ang panghimagas? Leche flan, ube halaya, at iba pa.", icon: <MdCake /> },
]

/**
 * HomePage component.
 * Main dashboard server component that queries and presents the categories list and recent luto recipes.
 * Handles different CTA routes depending on active session state.
 * 
 * @returns {JSX.Element} The rendered homepage structure.
 */
export default async function HomePage() {
  const session = await auth()

  const latestRecipes = await prisma.recipe.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take: 4,
    include: {
      author: { select: { username: true } },
      _count: { select: { likes: true, comments: true } },
    },
  })

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-red-50 to-stone-50 py-12 md:py-20 px-4">
          <div className="mx-auto max-w-screen-xl">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Ang recipe ng {" "}
                <span className="text-amber-600">lola</span>
                {" "}mo, deserve niyang ma-share sa mundo.
              </h1>
              <p className="text-base sm:text-lg text-stone-600 mb-8 max-w-xl mx-auto leading-relaxed">
                <span className="font-semibold">Ano Pong Ulam?</span> is where Filipino heirloom recipes live forever. Isulat mo ang kuwento ng inyong kusina — the secret adobo ng nanay mo, ang pancit na laging hinihingi sa fiesta, ang dessert na namimiss mo tuwing uuwi ka. Mula sa ating mga kusina, patungo sa bawat mesa.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href={session?.user ? "/recipes" : "/login"}
                  className="bg-red-600 text-white px-6 py-3 rounded-full font-medium hover:bg-red-700 transition-colors"
                >
                  Halungkat ng Recipes
                </Link>
                <Link
                  href={session?.user ? "/recipes/new" : "/login"}
                  className="bg-white text-red-600 px-6 py-3 rounded-full font-medium border border-red-300 hover:bg-red-50 transition-colors"
                >
                  Ibahagi ang Recipe Mo
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 px-4">
          <div className="mx-auto max-w-screen-xl">
            <h2 className="text-2xl font-bold mb-2">Ano ang hanap mo ngayon?</h2>
            <p className="text-stone-500 mb-8">Pumili ng kategorya at tuklasin ang sarap ng tunay na lutong Pinoy.</p>
            <div className="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-5">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={session?.user ? `/recipes?category=${cat.slug}` : "/login"}
                  className="bg-white rounded-xl p-5 md:p-6 border border-stone-200 hover:border-red-300 hover:shadow-sm transition-all"
                >
                  <span className="text-3xl block mb-2">{cat.icon}</span>
                  <h3 className="font-semibold text-stone-900">{cat.name}</h3>
                  <p className="text-sm text-stone-500 mt-1 leading-snug">{cat.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>


        <section className="py-12 md:py-16 px-4 bg-white">
          <div className="mx-auto max-w-screen-xl">
            <h2 className="text-2xl font-bold mb-4">Mga Bagong Luto</h2>

            {latestRecipes.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {latestRecipes.map((recipe) => (
                    session?.user ? (
                      <RecipeCard key={recipe.id} recipe={recipe} />
                    ) : (
                      <Link
                        key={recipe.id}
                        href="/login"
                        className="block bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-card hover:shadow-card-hover hover:border-amber-200 transition-all duration-200"
                      >
                        <div className="aspect-video bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center text-4xl">
                          <MdFastfood />
                        </div>
                        <div className="p-4">
                          <p className="font-semibold text-stone-900">{recipe.title}</p>
                          <p className="text-xs text-stone-400 mt-2">Sign in to view recipe</p>
                        </div>
                      </Link>
                    )
                  ))}
                </div>
                <div className="text-center">
                  <Link
                    href={session?.user ? "/recipes" : "/login"}
                    className="inline-block text-red-600 font-medium hover:text-red-700 transition-colors border border-red-300 px-8 py-3 rounded-full hover:bg-red-50"
                  >
                    Tingnan ang Iba Pa
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-stone-600 mb-2 max-w-xl leading-relaxed">
                  Wala pang laman ang ating kusina digitally... Pero nandito ka na. Baka ikaw na ang mag-umpisa?
                </p>
                <p className="text-stone-500 mb-8 max-w-xl">
                  Yung recipe ng pamilya niyo na hanggang ngayon, sa isip mo lang itinatago — it&apos;s time to write it down. Maging unang mag-ambag ng inyong pamana.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  {session?.user ? (
                    <Link
                      href="/recipes/new"
                      className="inline-block bg-red-600 text-white px-6 py-3 rounded-full font-medium hover:bg-red-700 transition-colors"
                    >
                      Isulat ang Unang Recipe
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="inline-block bg-red-600 text-white px-6 py-3 rounded-full font-medium hover:bg-red-700 transition-colors"
                      >
                        Sumali at Mag-ambag
                      </Link>
                      <Link
                        href="/recipes"
                        className="inline-block text-red-600 font-medium hover:text-red-700 transition-colors border border-red-300 px-6 py-3 rounded-full hover:bg-red-50"
                      >
                        Mag-browse Muna
                      </Link>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-stone-900 text-stone-400 py-8 px-4 text-sm text-center">
        <div className="mx-auto max-w-screen-xl">
          <p>Bawat recipe ay may kuwento. Bawat kusina ay may pamana.</p>
        </div>
      </footer>
    </>
  )
}

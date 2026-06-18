import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import Header from "@/components/Header"
import RecipeCard from "@/components/RecipeCard"
import { MdLocationOn } from "react-icons/md"

export const dynamic = "force-dynamic"

type Params = Promise<{ username: string }>

export default async function UserProfilePage(props: { params: Params }) {
  const { username } = await props.params

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      recipes: {
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        include: { author: { select: { username: true } } },
      },
      followers: { select: { followerId: true } },
      following: { select: { followingId: true } },
    },
  })

  if (!user) notFound()

  return (
    <>
      <Header />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8">
        <div className="bg-white rounded-xl border border-stone-200 p-6 md:p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-2xl font-bold text-amber-600 flex-shrink-0">
              {user.displayName?.[0]?.toUpperCase() || user.username[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {user.displayName || user.username}
              </h1>
              <p className="text-stone-500 text-sm">@{user.username}</p>
              {user.bio && <p className="text-stone-600 mt-2">{user.bio}</p>}
              <div className="flex gap-4 mt-3 text-sm text-stone-500">
                <span><strong className="text-stone-900">{user.recipes.length}</strong> recipes</span>
                <span><strong className="text-stone-900">{user.followers.length}</strong> followers</span>
                <span><strong className="text-stone-900">{user.following.length}</strong> following</span>
                {user.region && <span className="inline-flex items-center gap-0.5"><MdLocationOn /> {user.region}</span>}
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-6">Recipes</h2>
        {user.recipes.length === 0 ? (
          <p className="text-stone-400">No recipes shared yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}

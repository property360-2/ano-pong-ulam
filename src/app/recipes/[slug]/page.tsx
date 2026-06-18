import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import Header from "@/components/Header"
import LikeButton from "@/components/LikeButton"
import SaveButton from "@/components/SaveButton"
import FollowButton from "@/components/FollowButton"
import AddToCollectionButton from "@/components/AddToCollectionButton"
import ShareButton from "@/components/ShareButton"
import CommentForm from "@/components/CommentForm"
import { auth } from "@/lib/auth"
import { MdRestaurant, MdLocationOn, MdLightbulb, MdEdit } from "react-icons/md"
import Link from "next/link"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

type Params = Promise<{ slug: string }>

function minutesToIso(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `PT${h > 0 ? `${h}H` : ""}${m > 0 ? `${m}M` : ""}`
}

export async function generateMetadata(props: { params: Params }): Promise<Metadata> {
  const { slug } = await props.params

  const recipe = await prisma.recipe.findUnique({
    where: { slug },
    select: {
      title: true,
      description: true,
      heroImage: true,
      category: true,
      author: { select: { username: true } },
    },
  })

  if (!recipe) return {}

  const title = `${recipe.title} — Ano Pong Ulam?`
  const description = recipe.description || `A ${recipe.category} recipe by @${recipe.author?.username || "anonymous"}`
  const image = recipe.heroImage || undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  }
}

export default async function RecipeDetailPage(props: { params: Params }) {
  const { slug } = await props.params
  const session = await auth()

  const recipe = await prisma.recipe.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, username: true, avatarUrl: true } },
      comments: {
        include: { user: { select: { username: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { likes: true } },
    },
  })

  if (!recipe || !recipe.isPublished) notFound()

  const userLiked = session?.user?.id
    ? !!(await prisma.recipeLike.findUnique({
        where: { userId_recipeId: { userId: session.user.id, recipeId: recipe.id } },
      }))
    : false

  const userSaved = session?.user?.id
    ? !!(await prisma.recipeSave.findUnique({
        where: { userId_recipeId: { userId: session.user.id, recipeId: recipe.id } },
      }))
    : false

  const isFollowingAuthor =
    session?.user?.id && recipe.author?.id
      ? !!(await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: session.user.id,
              followingId: recipe.author.id,
            },
          },
        }))
      : false

  const ingredients = recipe.ingredients as Array<{
    name: string
    amount: string
    unit: string
    notes?: string
    section?: string
  }>
  const steps = recipe.steps as Array<{ number: number; instruction: string; tips?: string }>
  const tips = recipe.tips as Record<string, string> | null

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    ...(recipe.description ? { description: recipe.description } : {}),
    ...(recipe.heroImage ? { image: recipe.heroImage } : {}),
    ...(recipe.author?.username
      ? { author: { "@type": "Person", name: recipe.author.username } }
      : {}),
    datePublished: recipe.createdAt.toISOString(),
    ...(recipe.prepTime ? { prepTime: minutesToIso(recipe.prepTime) } : {}),
    ...(recipe.cookTime ? { cookTime: minutesToIso(recipe.cookTime) } : {}),
    ...(recipe.prepTime || recipe.cookTime
      ? { totalTime: minutesToIso((recipe.prepTime || 0) + (recipe.cookTime || 0)) }
      : {}),
    recipeYield: `${recipe.servings} servings`,
    recipeCategory: recipe.category,
    recipeCuisine: "Filipino",
    recipeIngredient: ingredients.map((i) => `${i.amount} ${i.unit} ${i.name}${i.notes ? ` (${i.notes})` : ""}`),
    recipeInstructions: steps.map((s) => ({
      "@type": "HowToStep",
      name: `Step ${s.number}`,
      text: s.instruction,
      ...(tips?.[`step_${s.number}`] ? { tip: tips[`step_${s.number}`] } : {}),
    })),
    ...(recipe.tags.length > 0 ? { keywords: recipe.tags.join(", ") } : {}),
  }

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-8">
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          {recipe.heroImage ? (
            <img
              src={recipe.heroImage}
              alt={recipe.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          ) : (
            <div className="w-full h-64 md:h-96 bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center text-6xl">
              <MdRestaurant />
            </div>
          )}

          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded capitalize">
                {recipe.category}
              </span>
              {recipe.region && (
                <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded inline-flex items-center gap-0.5">
                  <MdLocationOn /> {recipe.region}
                </span>
              )}
              {recipe.difficulty && (
                <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded capitalize">
                  {recipe.difficulty}
                </span>
              )}
              {recipe.sourceType !== "community" && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded capitalize">
                  {recipe.sourceType}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-2">{recipe.title}</h1>
            {recipe.description && (
              <p className="text-stone-600 mb-4">{recipe.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500 mb-6">
              {recipe.author && (
                <span className="flex items-center gap-2">
                  By @{recipe.author.username}
                  {session?.user?.id && recipe.author.id !== session.user.id && (
                    <FollowButton targetUserId={recipe.author.id} initialFollowing={isFollowingAuthor} username={recipe.author.username} />
                  )}
                </span>
              )}
              {recipe.prepTime && <span>Prep: {recipe.prepTime}min</span>}
              {recipe.cookTime && <span>Cook: {recipe.cookTime}min</span>}
              <span>Serves: {recipe.servings}</span>
            </div>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-stone-200">
              <LikeButton recipeId={recipe.id} initialCount={recipe._count.likes} initialLiked={userLiked} />
              <SaveButton recipeId={recipe.id} initialSaved={userSaved} />
              <AddToCollectionButton recipeId={recipe.id} />
              <ShareButton slug={recipe.slug} title={recipe.title} />
              {session?.user?.id === recipe.author?.id && (
                <Link
                  href={`/recipes/${recipe.slug}/edit`}
                  className="ml-auto flex items-center gap-1 text-sm text-stone-500 hover:text-amber-600 transition-colors"
                >
                  <MdEdit /> Edit
                </Link>
              )}
            </div>

            {recipe.story && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-amber-800 italic">&ldquo;{recipe.story}&rdquo;</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold mb-4">Ingredients</h2>
                <ul className="space-y-2">
                  {ingredients.map((ing, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>
                        <strong>{ing.amount} {ing.unit}</strong> {ing.name}
                        {ing.notes && <span className="text-stone-400"> — {ing.notes}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-4">Instructions</h2>
                <ol className="space-y-4">
                  {steps.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {step.number}
                      </span>
                      <div>
                        <p className="text-sm">{step.instruction}</p>
                        {tips?.[`step_${step.number}`] && (
                          <p className="text-xs text-amber-700 mt-1 inline-flex items-center gap-0.5">
                            <MdLightbulb /> {tips[`step_${step.number}`]}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8">
                {recipe.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-bold mb-4">
            Comments ({recipe.comments.length})
          </h2>

          <div className="mb-6">
            <CommentForm recipeId={recipe.id} />
          </div>

          {recipe.comments.length === 0 ? (
            <p className="text-stone-400 text-sm">No comments yet.</p>
          ) : (
            <div className="space-y-4">
              {recipe.comments.map((comment) => (
                <div key={comment.id} className="bg-white rounded-lg border border-stone-200 p-4">
                  <p className="text-sm font-medium">@{comment.user.username}</p>
                  <p className="text-sm mt-1">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  )
}

/**
 * @file page.tsx
 * @description Recipe details page displaying a single recipe, its author, story, ingredients,
 * instructions, likes, saves, collections, and comments. Supports both slug-based and ID-based URLs
 * (redirecting IDs to canonical slugs) and handles BigInt serialization boundaries safely.
 */

import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import Image from "next/image"
import Header from "@/components/Header"
import LikeButton from "@/components/LikeButton"
import SaveButton from "@/components/SaveButton"
import FollowButton from "@/components/FollowButton"
import AddToCollectionButton from "@/components/AddToCollectionButton"
import ShareButton from "@/components/ShareButton"
import CommentForm from "@/components/CommentForm"
import { auth } from "@/lib/auth"
import { MdRestaurant, MdLocationOn, MdLightbulb, MdEdit, MdAccessTime, MdPeople } from "react-icons/md"
import Link from "next/link"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

type Params = Promise<{ slug: string }>

/**
 * Converts cooking/prep minutes into ISO 8601 duration format (e.g., PT45M).
 * 
 * @param {number} minutes The duration in minutes.
 * @returns {string} The ISO 8601 formatted duration string.
 */
function minutesToIso(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `PT${h > 0 ? `${h}H` : ""}${m > 0 ? `${m}M` : ""}`
}

/**
 * Generates OpenGraph and page metadata dynamically for SEO, supporting both ID and slug search.
 * 
 * @param {Object} props Next.js page props containing the params promise.
 * @returns {Promise<Metadata>} Metadata configuration for Next.js.
 */
export async function generateMetadata(props: { params: Params }): Promise<Metadata> {
  const { slug } = await props.params

  const isNumeric = /^\d+$/.test(slug)
  const recipe = await prisma.recipe.findUnique({
    where: isNumeric ? { id: BigInt(slug) } : { slug },
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

/**
 * Server component that renders the full recipe details layout.
 * Resolves both slug-based search and numeric ID-based search (from notifications),
 * handles authorization checks, loads user interactions, and renders metadata structures.
 * 
 * @param {Object} props Next.js page props containing params.
 */
export default async function RecipeDetailPage(props: { params: Params }) {
  const { slug } = await props.params
  const session = await auth()

  const isNumeric = /^\d+$/.test(slug)
  const recipe = await prisma.recipe.findUnique({
    where: isNumeric ? { id: BigInt(slug) } : { slug },
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

  // Fire-and-forget viewCount increment (no await — doesn't block render)
  prisma.recipe.update({
    where: { id: recipe.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {})

  // Redirect to canonical slug-based URL if page is loaded using database ID
  if (isNumeric) {
    redirect(`/recipes/${recipe.slug}`)
  }

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
            <div className="w-full h-64 md:h-96 relative">
              <Image
                src={recipe.heroImage}
                alt={recipe.title}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="w-full h-64 md:h-96 bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center text-6xl">
              <MdRestaurant />
            </div>
          )}

          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg capitalize border border-amber-200/50">
                {recipe.category}
              </span>
              {recipe.region && (
                <span className="text-xs bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg inline-flex items-center gap-1 border border-stone-200/55 capitalize">
                  <MdLocationOn className="text-stone-500" /> {recipe.region}
                </span>
              )}
              {recipe.difficulty && (
                <span className="text-xs bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg capitalize border border-stone-200/55">
                  {recipe.difficulty}
                </span>
              )}
              {recipe.sourceType !== "community" && (
                <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg capitalize border border-amber-200/40">
                  {recipe.sourceType}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-stone-900 tracking-tight">{recipe.title}</h1>
            {recipe.description && (
              <p className="text-stone-600 text-sm md:text-base mb-5 leading-relaxed">{recipe.description}</p>
            )}

            {/* Author Information Row */}
            {recipe.author && (
              <div className="flex items-center justify-between py-3 border-y border-stone-100 mb-4 gap-4">
                <div className="flex items-center gap-3">
                  {recipe.author.avatarUrl ? (
                    <Image
                      src={recipe.author.avatarUrl}
                      alt={recipe.author.username}
                      width={36}
                      height={36}
                      className="rounded-full object-cover border border-stone-200"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-600 text-xs font-semibold uppercase">
                      {recipe.author.username.slice(0, 2)}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">Recipe by</span>
                    <span className="text-sm font-bold text-stone-850">@{recipe.author.username}</span>
                  </div>
                </div>
                {session?.user?.id && recipe.author.id !== session.user.id && (
                  <div className="flex-shrink-0">
                    <FollowButton
                      targetUserId={recipe.author.id}
                      initialFollowing={isFollowingAuthor}
                      username={recipe.author.username}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Structured Stats Grid (Prep, Cook, Servings) */}
            <div className="grid grid-cols-3 gap-2 border border-stone-200/80 rounded-xl bg-stone-50/50 py-3 mb-6 text-center text-stone-700">
              <div className="flex flex-col items-center justify-center">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">Prep Time</span>
                <span className="text-sm font-semibold text-stone-800 mt-1 inline-flex items-center gap-1">
                  <MdAccessTime className="text-stone-500 text-base" /> {recipe.prepTime || 0}m
                </span>
              </div>
              <div className="flex flex-col items-center justify-center border-x border-stone-200/80">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">Cook Time</span>
                <span className="text-sm font-semibold text-stone-800 mt-1 inline-flex items-center gap-1">
                  <MdRestaurant className="text-stone-500 text-base" /> {recipe.cookTime || 0}m
                </span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">Servings</span>
                <span className="text-sm font-semibold text-stone-800 mt-1 inline-flex items-center gap-1">
                  <MdPeople className="text-stone-500 text-base" /> {recipe.servings}
                </span>
              </div>
            </div>

            {/* Actions Bar (Liking, Saving, Collecting, Sharing) */}
            <div className="flex items-center gap-1.5 md:gap-4 mb-6 pb-4 border-b border-stone-200">
              <LikeButton recipeId={Number(recipe.id)} initialCount={recipe._count.likes} initialLiked={userLiked} />
              <SaveButton recipeId={Number(recipe.id)} initialSaved={userSaved} />
              <AddToCollectionButton recipeId={Number(recipe.id)} />
              <ShareButton slug={recipe.slug} title={recipe.title} />
              {session?.user?.id === recipe.author?.id && (
                <Link
                  href={`/recipes/${recipe.slug}/edit`}
                  className="ml-auto flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-amber-600 transition-colors min-h-[44px] px-2.5 rounded-xl hover:bg-stone-50"
                >
                  <MdEdit className="text-lg" /> <span className="hidden sm:inline">Edit</span>
                </Link>
              )}
            </div>

            {/* Blockquote Story Section */}
            {recipe.story && (
              <div className="bg-amber-50/60 border-l-4 border-amber-500 rounded-r-xl p-4 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 text-amber-200/30 text-7xl font-serif pointer-events-none -mt-4 -mr-2 select-none">
                  &ldquo;
                </div>
                <p className="text-sm text-amber-950 italic relative z-10 leading-relaxed font-medium">
                  &ldquo;{recipe.story}&rdquo;
                </p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold mb-4 text-stone-900 tracking-tight">Ingredients</h2>
                <ul className="space-y-2">
                  {ingredients.map((ing, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-stone-800">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>
                        <strong>{ing.amount} {ing.unit}</strong> {ing.name}
                        {ing.notes && <span className="text-stone-600 font-medium"> — {ing.notes}</span>}
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
                    className="text-xs bg-stone-50 text-stone-700 border border-stone-200/60 px-2.5 py-1.5 rounded-lg font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-bold mb-4 text-stone-900 tracking-tight">
            Comments ({recipe.comments.length})
          </h2>

          <div className="mb-6">
            <CommentForm recipeId={Number(recipe.id)} />
          </div>

          {recipe.comments.length === 0 ? (
            <p className="text-stone-400 text-sm italic">No comments yet.</p>
          ) : (
            <div className="space-y-4">
              {recipe.comments.map((comment) => (
                <div key={comment.id.toString()} className="bg-stone-50/50 rounded-xl border border-stone-200/60 p-4 transition-all hover:bg-stone-50">
                  <div className="flex items-center gap-2.5">
                    {comment.user.avatarUrl ? (
                      <Image
                        src={comment.user.avatarUrl}
                        alt={comment.user.username}
                        width={24}
                        height={24}
                        className="rounded-full object-cover border border-stone-200"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 text-[10px] font-semibold uppercase">
                        {comment.user.username.slice(0, 2)}
                      </div>
                    )}
                    <p className="text-xs font-semibold text-stone-800">@{comment.user.username}</p>
                  </div>
                  <p className="text-sm mt-2 text-stone-700 pl-8 leading-relaxed">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  )
}

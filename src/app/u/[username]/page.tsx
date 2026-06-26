/**
 * @file page.tsx
 * @description User profile details page rendering user display name, avatar, bio,
 * cooking stats (recipes count, followers, following), location region, and a list of published recipes.
 * Fits into the user profiles routing area.
 */

import { notFound } from "next/navigation"
import Image from "next/image"
import { prisma } from "@/lib/db"
import Header from "@/components/Header"
import RecipeCard from "@/components/RecipeCard"
import FollowButton from "@/components/FollowButton"
import { auth } from "@/lib/auth"
import { MdLocationOn } from "react-icons/md"

export const dynamic = "force-dynamic"

type Params = Promise<{ username: string }>

/**
 * UserProfilePage server component.
 * Fetches user profile data including published recipes, followers, and following relations,
 * gets the logged-in user session, checks follow status, and renders a mobile-friendly profile card
 * with custom stats, a follow/unfollow toggle button (if viewing another cook's profile), and a recipe grid.
 * 
 * @param {Object} props Component props.
 * @param {Params} props.params Route parameters containing username.
 * @returns {Promise<JSX.Element>} Rendered user profile page.
 */
export default async function UserProfilePage(props: { params: Params }) {
  const { username } = await props.params
  const session = await auth()

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

  const isFollowingUser = session?.user?.id
    ? !!(await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: user.id,
          },
        },
      }))
    : false

  const showFollowButton = !session?.user?.id || session.user.id !== user.id

  return (
    <>
      <Header />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8">
        <div className="bg-white rounded-xl border border-stone-200 p-6 md:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-3xl font-bold text-amber-600 flex-shrink-0 overflow-hidden relative border border-stone-100">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.username}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                user.displayName?.[0]?.toUpperCase() || user.username[0].toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-stone-900 truncate">
                {user.displayName || user.username}
              </h1>
              <p className="text-stone-500 text-sm">@{user.username}</p>
              {user.bio && <p className="text-stone-600 mt-2 text-sm leading-relaxed max-w-xl">{user.bio}</p>}
              
              {/* Region location tag if present */}
              {user.region && (
                <span className="inline-flex items-center gap-1 text-xs bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg mt-3 capitalize border border-stone-200/50">
                  <MdLocationOn className="text-stone-500" /> {user.region}
                </span>
              )}
            </div>
            
            {showFollowButton && (
              <div className="flex-shrink-0">
                <FollowButton
                  targetUserId={user.id}
                  initialFollowing={isFollowingUser}
                  username={user.displayName || user.username}
                />
              </div>
            )}
          </div>

          {/* Dedicated Stats Row: horizontal grid spanning full card width on mobile to avoid cutoffs */}
          <div className="grid grid-cols-3 gap-2 border-t border-stone-100 mt-6 pt-5 text-center text-stone-600">
            <div className="flex flex-col items-center justify-center">
              <span className="text-base font-bold text-stone-900">{user.recipes.length}</span>
              <span className="text-xs text-stone-500 font-medium mt-0.5">recipes</span>
            </div>
            <div className="flex flex-col items-center justify-center border-x border-stone-100">
              <span className="text-base font-bold text-stone-900">{user.followers.length}</span>
              <span className="text-xs text-stone-500 font-medium mt-0.5">followers</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-base font-bold text-stone-900">{user.following.length}</span>
              <span className="text-xs text-stone-500 font-medium mt-0.5">following</span>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-6 text-stone-900">Recipes</h2>
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

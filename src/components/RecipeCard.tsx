/**
 * @file RecipeCard.tsx
 * @description Reusable recipe card component displaying a thumbnail, category badge, title,
 * description, author, cook time, and region. Supports an optional priority flag for LCP optimization.
 */

import Link from "next/link"
import Image from "next/image"
import { MdRestaurant, MdTimer, MdLocationOn } from "react-icons/md"

type Recipe = {
  id: bigint | number
  slug: string
  title: string
  description: string | null
  heroImage: string | null
  category: string
  region: string | null
  difficulty: string | null
  cookTime: number | null
  tags: string[]
  author: { username: string } | null
  _count?: { likes: number; comments: number }
}

export default function RecipeCard({ recipe, priority = false }: { recipe: Recipe; priority?: boolean }) {
  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-card hover:shadow-card-hover hover:border-amber-200 transition-all duration-200"
    >
      {recipe.heroImage ? (
        <div className="aspect-video bg-stone-100 overflow-hidden relative">
          <Image
            src={recipe.heroImage}
            alt={recipe.title}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform"
          />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center text-4xl">
          <MdRestaurant />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded capitalize">
            {recipe.category}
          </span>
          {recipe.difficulty && (
            <span className="text-xs text-stone-400 capitalize">{recipe.difficulty}</span>
          )}
        </div>
        <h3 className="font-semibold text-stone-900 group-hover:text-amber-700 transition-colors">
          {recipe.title}
        </h3>
        {recipe.description && (
          <p className="text-sm text-stone-500 mt-1 line-clamp-2">{recipe.description}</p>
        )}
        <div className="flex items-center gap-3 mt-3 text-xs text-stone-400">
          {recipe.author && <span>by @{recipe.author.username}</span>}
          {recipe.cookTime && <span className="inline-flex items-center gap-0.5"><MdTimer /> {recipe.cookTime}min</span>}
          {recipe.region && <span className="inline-flex items-center gap-0.5"><MdLocationOn /> {recipe.region}</span>}
        </div>
      </div>
    </Link>
  )
}

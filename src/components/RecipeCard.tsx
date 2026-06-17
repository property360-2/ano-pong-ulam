import Link from "next/link"

type Recipe = {
  id: bigint
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

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className="group bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-md hover:border-red-200 transition-all"
    >
      {recipe.heroImage ? (
        <div className="aspect-video bg-stone-100 overflow-hidden">
          <img
            src={recipe.heroImage}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center text-4xl">
          🍲
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium bg-red-50 text-red-700 px-2 py-0.5 rounded capitalize">
            {recipe.category}
          </span>
          {recipe.difficulty && (
            <span className="text-xs text-stone-400 capitalize">{recipe.difficulty}</span>
          )}
        </div>
        <h3 className="font-semibold text-stone-900 group-hover:text-red-600 transition-colors">
          {recipe.title}
        </h3>
        {recipe.description && (
          <p className="text-sm text-stone-500 mt-1 line-clamp-2">{recipe.description}</p>
        )}
        <div className="flex items-center gap-3 mt-3 text-xs text-stone-400">
          {recipe.author && <span>by @{recipe.author.username}</span>}
          {recipe.cookTime && <span>⏱ {recipe.cookTime}min</span>}
          {recipe.region && <span>📍 {recipe.region}</span>}
        </div>
      </div>
    </Link>
  )
}

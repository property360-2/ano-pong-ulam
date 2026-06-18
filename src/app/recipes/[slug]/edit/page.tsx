import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import Header from "@/components/Header"
import RecipeForm from "@/components/RecipeForm"

export const dynamic = "force-dynamic"

type Params = Promise<{ slug: string }>

export default async function EditRecipePage(props: { params: Params }) {
  const { slug } = await props.params
  const session = await auth()

  const recipe = await prisma.recipe.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true } },
    },
  })

  if (!recipe || !recipe.isPublished) notFound()
  if (!session?.user?.id || recipe.author?.id !== session.user.id) redirect(`/recipes/${slug}`)

  const ingredients = recipe.ingredients as Array<{ name: string; amount: string; unit: string; notes?: string }>
  const steps = recipe.steps as Array<{ number: number; instruction: string; tips?: string }>

  return (
    <>
      <Header />
      <RecipeForm
        mode="edit"
        recipeSlug={slug}
        initialData={{
          title: recipe.title,
          description: recipe.description,
          story: recipe.story,
          category: recipe.category,
          region: recipe.region,
          difficulty: recipe.difficulty,
          prepTime: recipe.prepTime ?? 0,
          cookTime: recipe.cookTime ?? 0,
          servings: recipe.servings,
          heroImage: recipe.heroImage,
          ingredients: ingredients.map((i) => ({ ...i, notes: i.notes || "" })),
          steps: steps.map((s) => ({ instruction: s.instruction, tips: s.tips || "" })),
          tags: recipe.tags,
        }}
      />
    </>
  )
}

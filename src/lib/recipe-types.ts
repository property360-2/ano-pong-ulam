export interface Ingredient {
  name: string
  amount: string
  unit: string
  notes: string
}

export interface Step {
  instruction: string
  tips: string
}

export interface RecipeFormData {
  title: string
  description: string | null
  story: string | null
  category: string
  region: string | null
  difficulty: string | null
  prepTime: number
  cookTime: number
  servings: number
  heroImage: string | null
  ingredients: Ingredient[]
  steps: Step[]
  tags: string[]
}

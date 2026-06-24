import * as fs from "fs"
import * as path from "path"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import * as dotenv from "dotenv"

dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Configuration
const AUTHOR_UUID = "d5491d9b-21d2-4811-a5bc-ddca6a9c1ebc"
const DOCS_DIR = path.join(__dirname, "../recipe/docs")
const PROMPTS_FILE = path.join(__dirname, "../recipe/all_prompts.md")
const MAPPING_FILE = path.join(__dirname, "../recipe/image_mapping.json")

// Load prompts to build title-to-key mapping
function loadTitleToKeyMap() {
  const map: Record<string, string> = {}
  if (!fs.existsSync(PROMPTS_FILE)) {
    console.error("Prompts file not found at:", PROMPTS_FILE)
    return map
  }

  const content = fs.readFileSync(PROMPTS_FILE, "utf8")
  const lines = content.split("\n")

  for (const line of lines) {
    if (line.startsWith("|") && !line.includes("Target Filename") && !line.includes("---")) {
      const parts = line.split("|").map((p) => p.trim())
      if (parts.length >= 4) {
        const dishName = parts[1] // e.g. "Adobong Baboy"
        const targetFileMatch = parts[2].match(/`([^`]+)\.png`/)
        if (targetFileMatch) {
          const key = targetFileMatch[1]
          map[dishName.toLowerCase()] = key
        }
      }
    }
  }

  console.log(`Loaded ${Object.keys(map).length} title-to-key mapping entries from all_prompts.md`)
  return map
}

// Load image mapping JSON
function loadImageMapping(): Record<string, any> {
  if (!fs.existsSync(MAPPING_FILE)) {
    console.error("Mapping file not found at:", MAPPING_FILE)
    return {}
  }
  try {
    const content = fs.readFileSync(MAPPING_FILE, "utf8")
    return JSON.parse(content)
  } catch (e) {
    console.error("Failed to parse image_mapping.json:", e)
    return {}
  }
}

// Helper to convert time string (e.g. "10 minutes", "1 hour", "1 hour 30 minutes") to minutes integer
function parseTimeToMinutes(timeStr: string | null) {
  if (!timeStr) return null
  const cleaned = timeStr.toLowerCase().trim()
  
  let totalMinutes = 0
  const hourMatch = cleaned.match(/(\d+)\s*hour/)
  const minuteMatch = cleaned.match(/(\d+)\s*minute/)
  
  if (hourMatch) {
    totalMinutes += parseInt(hourMatch[1]) * 60
  }
  if (minuteMatch) {
    totalMinutes += parseInt(minuteMatch[1])
  }
  
  if (totalMinutes === 0) {
    // Fallback try to find just a number
    const numOnly = cleaned.match(/(\d+)/)
    if (numOnly) {
      return parseInt(numOnly[1])
    }
    return null
  }
  
  return totalMinutes
}

interface IngredientInput {
  name: string
  amount: string
  unit: string
  notes: string
}

interface StepInput {
  number: number
  instruction: string
}

// Parse a single recipe block from markdown
function parseRecipeBlock(block: string, titleToKey: Record<string, string>, imageMapping: Record<string, any>) {
  const lines = block.split("\n")
  if (lines.length < 3) return null

  // 1. Title is on the first line
  const rawTitle = lines[0].replace("#", "").trim()
  if (!rawTitle) return null

  // Clean title for mapping check (remove parens like "(Pork Adobo)")
  const cleanTitleForLookup = rawTitle.split("(")[0].trim().toLowerCase()
  let key = titleToKey[cleanTitleForLookup]

  // Fallback slugify if not found in prompts map
  if (!key) {
    key = rawTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/[\s-]+/g, "_")
      .trim()
  }

  // Look up image path and prompt
  let heroImage = null
  if (imageMapping[key]) {
    heroImage = imageMapping[key].localPath || null
  }

  // 2. Parse quote
  let quote = null
  const quoteLineIndex = lines.findIndex(l => l.trim().startsWith(">"))
  if (quoteLineIndex !== -1) {
    quote = lines[quoteLineIndex].trim().replace(/^>\s*"/, "").replace(/"\s*$/, "").replace(/^>\s*/, "")
  }

  // 3. Parse Metadata fields
  let category = "ulam"
  let region: string | null = null
  let difficulty: "easy" | "medium" | "hard" = "easy"
  let servings = 4
  let prepTimeStr: string | null = null
  let cookTimeStr: string | null = null
  let tags: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith("**Category:**")) {
      category = trimmed.replace("**Category:**", "").trim().toLowerCase()
    } else if (trimmed.startsWith("**Region:**")) {
      region = trimmed.replace("**Region:**", "").trim()
    } else if (trimmed.startsWith("**Difficulty:**")) {
      const diffStr = trimmed.replace("**Difficulty:**", "").trim().toLowerCase()
      if (["easy", "medium", "hard"].includes(diffStr)) {
        difficulty = diffStr as any
      }
    } else if (trimmed.startsWith("**Servings:**")) {
      servings = parseInt(trimmed.replace("**Servings:**", "").trim()) || 4
    } else if (trimmed.startsWith("**Prep Time:**")) {
      prepTimeStr = trimmed.replace("**Prep Time:**", "").trim()
    } else if (trimmed.startsWith("**Cook Time:**")) {
      cookTimeStr = trimmed.replace("**Cook Time:**", "").trim()
    } else if (trimmed.startsWith("**Tags:**")) {
      tags = trimmed.replace("**Tags:**", "").split(",").map(t => t.trim())
    }
  }

  const prepTime = parseTimeToMinutes(prepTimeStr)
  const cookTime = parseTimeToMinutes(cookTimeStr)

  // 4. Parse Description/Story
  let story = ""
  let inStory = false
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith("## About This Dish")) {
      inStory = true
      continue
    }
    if (inStory) {
      if (trimmed.startsWith("##") || trimmed.startsWith("---") || trimmed.startsWith("**Category:**")) {
        inStory = false
      } else {
        if (trimmed) story += trimmed + "\n\n"
      }
    }
  }
  story = story.trim()

  // 5. Parse Ingredients table
  const ingredients: IngredientInput[] = []
  let inIngredients = false
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith("## Ingredients")) {
      inIngredients = true
      continue
    }
    if (inIngredients) {
      if (trimmed.startsWith("##") || (trimmed.startsWith("---") && line !== "---")) {
        inIngredients = false
      } else if (trimmed.startsWith("|") && !trimmed.includes("Ingredient") && !trimmed.includes("---")) {
        const cols = trimmed.split("|").map(c => c.trim())
        if (cols.length >= 5) {
          ingredients.push({
            name: cols[1],
            amount: cols[2],
            unit: cols[3] || "",
            notes: cols[4] || ""
          })
        }
      }
    }
  }

  // 6. Parse Steps/Instructions
  const steps: StepInput[] = []
  let inInstructions = false
  let stepNumber = 1
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith("## Instructions")) {
      inInstructions = true
      continue
    }
    if (inInstructions) {
      if (trimmed.startsWith("##") || (trimmed.startsWith("---") && line !== "---")) {
        inInstructions = false
      } else if (trimmed.toLowerCase().startsWith("**step")) {
        const match = trimmed.match(/^\*\*step\s+(\d+)\.\*\*(.*)/i)
        if (match) {
          steps.push({
            number: parseInt(match[1]),
            instruction: match[2].trim()
          })
        } else {
          steps.push({
            number: stepNumber++,
            instruction: trimmed.replace(/^\*\*step\s+\d+\.\*\*/i, "").trim()
          })
        }
      }
    }
  }

  return {
    slug: key,
    title: rawTitle,
    description: quote || story.slice(0, 200),
    story: story || quote,
    category,
    region,
    difficulty,
    prepTime,
    cookTime,
    servings,
    ingredients,
    steps,
    tags,
    heroImage,
  }
}

// Main runner function
async function main() {
  console.log("Seeding master recipes from markdown...")

  // 1. Wipe all recipes first to ensure a clean slate
  console.log("Cleaning up all recipes from the database...")
  const deleteResult = await prisma.recipe.deleteMany({})
  console.log(`Deleted ${deleteResult.count} existing recipes from the database.`)

  // 2. Upsert or verify the Community author user in the database User table
  console.log(`Setting up the Community user with UUID "${AUTHOR_UUID}"...`)
  const communityUser = await prisma.user.upsert({
    where: { id: AUTHOR_UUID },
    update: {
      username: "community",
      displayName: "Ano Pong Ulam? Community",
      bio: "Official recipes contributed by the Ano Pong Ulam? Community",
    },
    create: {
      id: AUTHOR_UUID,
      email: "community@anopongulam.com",
      username: "community",
      displayName: "Ano Pong Ulam? Community",
      bio: "Official recipes contributed by the Ano Pong Ulam? Community",
      isOnboarded: true,
    }
  })
  console.log(`Community user record is ready: ${communityUser.displayName} (@${communityUser.username})`)

  const titleToKey = loadTitleToKeyMap()
  const imageMapping = loadImageMapping()

  const files = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith(".md"))
  console.log(`Found ${files.length} markdown documentation files to parse.`)

  let totalParsed = 0
  let totalSeeded = 0
  let totalSkipped = 0

  for (const file of files) {
    const filePath = path.join(DOCS_DIR, file)
    const content = fs.readFileSync(filePath, "utf8")
    
    // Split by "# " at the beginning of lines to divide recipes
    const blocks = content.split(/\n# /)
    
    // The very first block might have frontmatter, handle it
    if (blocks[0].startsWith("# ")) {
      blocks[0] = blocks[0].slice(2)
    }

    for (let block of blocks) {
      if (!block.trim()) continue
      
      if (!block.startsWith("#") && block.trim()) {
        block = "# " + block
      }

      const recipe = parseRecipeBlock(block, titleToKey, imageMapping)
      if (!recipe || !recipe.title) continue

      // Skip markdown headers / batch lines that aren't actual recipes
      const titleLower = recipe.title.toLowerCase().trim()
      if (
        titleLower.startsWith("batch ") ||
        titleLower.startsWith("phase ") ||
        recipe.slug.startsWith("batch_") ||
        recipe.slug.startsWith("phase_") ||
        !recipe.ingredients ||
        recipe.ingredients.length === 0
      ) {
        continue
      }

      totalParsed++

      const existing = await prisma.recipe.findUnique({
        where: { slug: recipe.slug }
      })

      if (existing) {
        await prisma.recipe.update({
          where: { id: existing.id },
          data: {
            heroImage: recipe.heroImage || existing.heroImage,
            authorId: AUTHOR_UUID,
          }
        })
        console.log(`Updated existing recipe: ${recipe.title} (slug: ${recipe.slug})`)
        totalSkipped++
        continue
      }

      try {
        await prisma.recipe.create({
          data: {
            slug: recipe.slug,
            title: recipe.title,
            description: recipe.description,
            story: recipe.story,
            category: recipe.category,
            region: recipe.region,
            difficulty: recipe.difficulty,
            prepTime: recipe.prepTime,
            cookTime: recipe.cookTime,
            servings: recipe.servings,
            ingredients: recipe.ingredients as any,
            steps: recipe.steps as any,
            tags: recipe.tags,
            heroImage: recipe.heroImage,
            authorId: AUTHOR_UUID,
            sourceType: "heirloom",
            isPublished: true,
            isFeatured: false,
          }
        })
        console.log(`Seeded new recipe: ${recipe.title} (slug: ${recipe.slug})`)
        totalSeeded++
      } catch (e: any) {
        console.error(`Failed to insert recipe: ${recipe.title}`, e.message)
      }
    }
  }

  console.log(`\n--- Seeding Complete ---`)
  console.log(`Total parsed from docs: ${totalParsed}`)
  console.log(`Total newly seeded: ${totalSeeded}`)
  console.log(`Total updated/skipped: ${totalSkipped}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

# Ano Pong Ulam? — Project TODO

## Legend
- ✅ Done
- 🔄 In Progress
- ⬜ Not Started
- ❌ Cancelled

---

## ✅ Core Infrastructure

- ✅ Next.js 16 project scaffolded (TypeScript, Tailwind v4, App Router)
- ✅ Prisma v7 with PostgreSQL (Supabase)
- ✅ Prisma schema: 12 models (User, Recipe, Collection, Follow, RecipeLike, RecipeSave, Comment, Activity, Challenge, ChallengeEntry, MealPlan, Notification)
- ✅ Database migration applied (19 tables, 57 SQL statements)
- ✅ `.env` configured (DATABASE_URL + AUTH_SECRET + AUTH_URL)

---

## ✅ Authentication

- ✅ NextAuth v5 with credentials (email/password)
- ✅ Google OAuth (needs env vars to activate: AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET)
- ✅ JWT session strategy
- ✅ Register page (`/register`)
- ✅ Login page (`/login`)
- ✅ Test user: `test@anopongulam.ph` / `test123456`

---

## ✅ Recipe System

- ✅ Structured recipe schema (title, description, story, category, region, difficulty, prep/cook time, servings)
- ✅ Ingredients as JSONB `[{name, amount, unit, notes}]`
- ✅ Steps as JSONB `[{number, instruction, tips}]`
- ✅ Tips as JSONB `{step_1: "...", step_2: "..."}`
- ✅ Create recipe form (`/recipes/new`)
- ✅ Recipe detail page (`/recipes/[slug]`)
- ✅ Browse/discover page (`/recipes`) with search & filters
- ✅ Full-text search (title + description, case-insensitive)
- ✅ Filters: category, region, difficulty
- ✅ Sort: newest, most popular (cookCount), quickest (cookTime)
- ✅ Active filter tags with remove buttons
- ✅ Shareable/filtered URLs (all filters in search params)
- ✅ 21 Filipino heirloom recipes seeded

---

## ✅ Social Features

- ✅ Follow / unfollow API
- ✅ Like / unlike API with count
- ✅ Save / unsave API
- ✅ Comment API (text only, no image comments yet)
- ✅ FollowButton component
- ✅ LikeButton component (with Material SVG icons)
- ✅ SaveButton component (with Material SVG icons)
- ✅ Activity feed API (following + global tabs, cursor pagination)
- ✅ CommentForm component

---

## ✅ Challenges

- ✅ Create challenge API
- ✅ List challenges (`/challenges`)
- ✅ Challenge detail with entries (`/challenges/[id]`)
- ✅ Photo entry submission
- ✅ Vote count
- ✅ Leaderboard (ordered by voteCount)

---

## ✅ Meal Planner

- ✅ Weekly grid UI (Mon–Sun, breakfast/lunch/dinner)
- ✅ Per-meal recipe dropdown
- ✅ Save / load plan API
- ✅ Grocery list API endpoint

---

## ✅ UI / Design

- ✅ Material Design SVG icons (via `react-icons/md`) — replaces all emoji icons
- ✅ Header with navigation + sign in/out
- ✅ Responsive grid layouts (1/2/3 columns)
- ✅ RecipeCard component with category badge, difficulty, cook time, region
- ✅ Hero gradient placeholders for missing images
- ✅ Category icons on homepage (Fastfood, EmojiFoodBeverage, WbSunny, Celebration, Eco, Cake)

---

## ✅ Photo Upload

- ✅ Supabase Storage configured (bucket `recipe-images`, public, 5MB limit)
- ✅ Upload API endpoint (`/api/upload`) with file type/size validation
- ✅ Upload UI on recipe create form (file input in Basic Info section)
- ✅ Recipe card & detail pages display hero images when available
- ⬜ User avatar upload (bucket and folder ready, needs profile settings UI)
- ⬜ Recipe edit page (needs image upload too)

---

## ⬜ PWA Setup

- [ ] Configure `manifest.json` (name, icons, theme color, display mode)
- [ ] Service worker for offline caching
- [ ] Install prompt banner
- [ ] iOS meta tags for add-to-homescreen

---

## ⬜ Recipe Editing & Management

- [ ] Edit recipe page (`/recipes/[slug]/edit`)
- [ ] Delete recipe (with confirmation)
- [ ] User's recipe management page (`/u/[username]/recipes/manage`)

---

## ⬜ Collections

- [ ] Create / rename / delete collections
- [ ] Add/remove recipes from collections
- [ ] Collection detail page
- [ ] User's collections page

---

## ⬜ Notifications

- [ ] Notification schema already exists in Prisma — needs frontend
- [ ] Notification bell in Header
- [ ] Notification dropdown/list
- [ ] Mark as read
- [ ] Real-time? (WebSocket / polling)

---

## ⬜ User Settings & Profile

- [ ] Edit profile page (display name, bio, avatar, region, cooking level)
- [ ] Change password
- [ ] Account deletion

---

## ⬜ Email / Password Reset

- [ ] Forgot password page
- [ ] Email send integration
- [ ] Reset password token flow

---

## ⬜ Deployment

- [ ] Vercel project setup
- [ ] Environment variables configured
- [ ] Supabase production database
- [ ] Domain setup
- [ ] CI/CD (auto-deploy from git)

---

## ⬜ SEO & Social

- [ ] Open Graph meta tags per recipe
- [ ] JSON-LD structured data (Recipe schema)
- [ ] Sitemap generation
- [ ] Robots.txt
- [ ] Social share buttons (FB, Twitter, copy link)

---

## ⬜ UX / Polish

- [ ] Loading skeletons for recipe cards
- [ ] Error boundaries
- [ ] Toast notifications (success/error on actions)
- [ ] Infinite scroll or pagination on browse page
- [ ] Responsive mobile navigation (hamburger menu)

---

## ⬜ Testing

- [ ] Unit tests for utilities
- [ ] Integration tests for API routes
- [ ] E2E tests for critical flows (login, create recipe, comment)

---

## ⬜ Admin & Moderation

- [ ] Admin role / flag in User model
- [ ] Admin dashboard
- [ ] Report recipe / comment
- [ ] Content moderation queue
- [ ] Ban user

---

## ⬜ Advanced Features (Backlog)

- [ ] Recipe version history
- [ ] Nutrition calculator
- [ ] Unit conversion (metric ↔ imperial)
- [ ] Meal plan grocery list export (print / PDF)
- [ ] Dark mode
- [ ] Multi-language support (Filipino + English)
- [ ] Weekly email digest
- [ ] Mobile app (React Native / Expo)

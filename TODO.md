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

## ✅ PWA Setup

- ✅ `manifest.json` configured (name, display: standalone, theme color, orientation, categories)
- ✅ iOS meta tags (`apple-mobile-web-app-capable`, `apple-touch-icon`, status bar style)
- ✅ Service worker (custom `public/sw.js` — CacheFirst for images, NetworkFirst for API, StaleWhileRevalidate for static)
- ✅ Service worker registration component (`ServiceWorkerRegister.tsx`)
- ✅ Install prompt banner (`InstallPrompt.tsx` — Android `beforeinstallprompt` + iOS instructions)
- ⬜ Generate proper PNG icons (192×192, 512×512, apple-touch-icon 180×180 — currently using SVG fallback)
- ⬜ Test on iOS Safari (manual "Add to Home Screen" only)

---

## ✅ Recipe Editing & Management

- ✅ Edit recipe page (`/recipes/[slug]/edit`) with RecipeForm component
- ✅ PUT `/api/recipes/[slug]` API route with author auth check
- ✅ Edit button on recipe detail page (only for recipe author)

---

## ✅ Navigation

- ✅ Active link indicator in Header (`usePathname()` — red highlight + semibold)
- ✅ Share Recipe link hidden when already on create page
- ✅ Settings link in Header navigation

---

## ✅ User Settings

- ✅ Settings page (`/settings`) with profile form
- ✅ Avatar upload (file input → `/api/upload` with `folder: "avatars"`)
- ✅ Profile update API (`GET` + `PUT /api/user/profile`)
- ✅ Fields: display name, bio, region, cooking level

---

## ✅ PWA Setup

- ✅ `manifest.json` configured with SVG + PNG icons
- ✅ iOS meta tags + `apple-touch-icon.png`
- ✅ Service worker (`public/sw.js` — CacheFirst for images, NetworkFirst for API, StaleWhileRevalidate for static)
- ✅ Service worker registration component
- ✅ Install prompt (`InstallPrompt.tsx` — Android `beforeinstallprompt` + iOS instructions)
- ✅ PNG icons generated via sharp (192×192, 512×512, 180×180 apple-touch-icon)
- ⬜ Test on iOS Safari (manual "Add to Home Screen" only)

---

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

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
- ✅ `.env` configured (DATABASE_URL + AUTH_SECRET + AUTH_URL + SUPABASE keys)

---

## ✅ Authentication
- ✅ NextAuth v5 with credentials (email/password)
- ✅ Google OAuth (needs env vars: AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET)
- ✅ JWT session strategy
- ✅ Register (`/register`) + Login (`/login`) pages
- ✅ Test user: `test@anopongulam.ph` / `test123456`

---

## ✅ Recipe System
- ✅ Structured recipe schema (title, description, story, category, region, difficulty, prep/cook time, servings)
- ✅ JSONB fields: ingredients, steps, tips
- ✅ Multi-step recipe wizard (`/recipes/new`) with 5 steps:
  - Ang Kuwento (title, description, story, hero image via DropZone)
  - Detalye (category, region, difficulty, NumberSteppers for servings/time, tags)
  - Mga Sangkap (dynamic ingredient rows with Enter-to-add)
  - Hakbang (numbered instruction steps with tips)
  - Luto Na! (full read-only preview with checkbox ingredients, numbered instructions)
- ✅ Progress bar with clickable step navigation (linear for create, unlocked for edit)
- ✅ localStorage auto-save with draft restore prompt
- ✅ Recipe detail page (`/recipes/[slug]`) with like/save/comment
- ✅ Browse/discover page (`/recipes`) with full-text search + filters (category, region, difficulty, sort)
- ✅ Active filter tags with remove buttons + shareable filtered URLs
- ✅ Recipe editing (`/recipes/[slug]/edit`) with same wizard (unlocked navigation)
- ✅ 21 Filipino heirloom recipes seeded

---

## ✅ Social Features
- ✅ Follow / unfollow API + FollowButton
- ✅ Like / unlike API with count + LikeButton
- ✅ Save / unsave API + SaveButton
- ✅ Comment API + CommentForm
- ✅ Activity feed (following + global tabs, cursor pagination)
- ✅ Notifications created on like, comment, follow actions
- ✅ Notification bell in Header with unread badge + dropdown preview
- ✅ Notifications page (`/notifications`) with All/Unread tabs
- ✅ Mark all as read + single notification read on click
- ✅ 30s polling for unread count

---

## ✅ Challenges
- ✅ Create challenge API
- ✅ List challenges (`/challenges`)
- ✅ Challenge detail with entries (`/challenges/[id]`)
- ✅ Photo entry submission + vote count + leaderboard

---

## ✅ Meal Planner
- ✅ Weekly grid UI (Mon–Sun, breakfast/lunch/dinner)
- ✅ Per-meal recipe dropdown + save/load API
- ✅ Grocery list API endpoint

---

## ✅ Photo Upload
- ✅ Supabase Storage configured (public bucket `recipe-images`, 5MB limit)
- ✅ Upload API (`/api/upload`) with file type/size validation, auth check
- ✅ Hero image upload via DropZone in recipe wizard
- ✅ Avatar upload via clickable avatar circle with camera overlay + preview
- ✅ Upload API uses `folder` parameter for path segregation (avatars vs recipe-images)

---

## ✅ Collections
- ✅ Create / rename / delete collections (API + pages)
- ✅ Add/remove recipes from collections (inline toggle checkboxes)
- ✅ Collection detail page (`/collections/[id]`)
- ✅ User's collections page (`/collections`)
- ✅ Add-to-collection dropdown on recipe detail page

---

## ✅ Notifications
- ✅ Notification creation helper in `src/lib/notifications.ts`
- ✅ Notifications created on like, comment, follow actions
- ✅ Notification bell in Header with unread badge + dropdown
- ✅ Notifications page (`/notifications`) with All/Unread tabs
- ✅ Mark all as read + single notification read on click
- ✅ 30s polling for unread count

---

## ✅ UI Polish
- ✅ Toast notification system (`ToastProvider` + `useToast`)
- ✅ Toasts integrated into LikeButton, SaveButton, FollowButton, CommentForm
- ✅ Infinite scroll on browse page (`/recipes`) via IntersectionObserver + paginated API
- ✅ Responsive mobile hamburger menu with slide-in overlay drawer
- ✅ General responsiveness fixes (grid stacking, bigger tap targets, flex-wrap, overflow-x-auto)

---

## ✅ PWA Setup
- ✅ `manifest.json` (name, display: standalone, theme color, orientation)
- ✅ iOS meta tags + `apple-touch-icon.png`
- ✅ Custom service worker (`public/sw.js`: CacheFirst images, NetworkFirst API, StaleWhileRevalidate static)
- ✅ Service worker registration component
- ✅ InstallPrompt banner (Android `beforeinstallprompt` + iOS instructions)
- ✅ PNG icons generated via sharp (192×192, 512×512, 180×180)
- ⬜ Test on iOS Safari (manual "Add to Home Screen" only)

---

## ✅ UI / Design
- ✅ All emoji icons replaced with Material Design SVGs (`react-icons/md`)
- ✅ Header with navigation, active link indicator, user menu
- ✅ Responsive grid layouts (1/2/3 columns)
- ✅ RecipeCard with category badge, difficulty, cook time, region, hero image
- ✅ Visual personality update:
  - Warm amber accent palette (`text-amber-600`, `bg-amber-50`, `focus:ring-amber-500`)
  - Brand colors as CSS custom properties (`bg-brand`, `bg-brand-dark`)
  - Cards: `rounded-2xl`, `shadow-card`, `hover:shadow-card-hover`, amber hover borders
  - Buttons: `rounded-xl`, `shadow-sm`
  - Selection highlight: amber

---

## ✅ Reusable Components
- ✅ NumberStepper (`+`/`-` buttons for numeric inputs)
- ✅ DropZone (drag-and-drop file upload with preview, type/size validation)
- ✅ ProgressBar (clickable step indicator for wizard)
- ✅ RecipePreview (full recipe detail layout for wizard preview step)
- ✅ RecipeList (infinite scroll client component with IntersectionObserver)
- ✅ AddToCollectionButton (collection dropdown with create inline)
- ✅ NotificationBell (bell icon with unread badge, dropdown, polling)

---

## ✅ Navigation
- ✅ Active link indicator in Header (`usePathname()`)
- ✅ Share Recipe link hidden when on create page
- ✅ Settings link in Header navigation
- ✅ Collections link in Header navigation
- ✅ NotificationBell in Header with unread badge + dropdown
- ✅ Responsive mobile hamburger menu with slide-in overlay drawer

---

## ✅ User Settings & Profile
- ✅ Settings page (`/settings`) with:
  - Locked Username/Email fields with padlock icons and disabled input styling
  - Editable Display Name, Bio, Region, Cooking Level
  - Avatar upload: clickable circle with camera overlay + local file preview
  - Action buttons (Cancel + Save Changes) inside the About You card
- ✅ Profile API (`GET` + `PUT /api/user/profile`)
- ✅ User profile page (`/u/[username]`) with avatar image display

---

## ✅ Bug Fixes
- ✅ BigInt serialization (`BigInt.prototype.toJSON` polyfill in `db.ts`)
- ✅ `e.currentTarget` null in async form handlers (save ref before await)
- ✅ `&apos;` HTML entity rendering in JS string literals
- ✅ `bg-brand` / `text-brand` custom colors not resolving (replaced with `bg-red-600` / `text-red-600` everywhere)
- ✅ Emoji icons → Material SVGs in InstallPrompt and all components
- ✅ `overflow-hidden` clipping card content
- ✅ `completedSteps` being recreated on every render (useRef + useState trigger)
- ✅ Avatar file picker not triggering (label-based approach instead of ref)
- ✅ Avatar preview not showing selected file (URL.createObjectURL)
- ✅ Upload API ignoring `folder` parameter in filename path

---

## 🔴 High Priority — Next

### UX Gaps
- [x] Loading skeletons for recipe cards (during initial server load via SSR + "load more" scroll)

---

## 🟡 Medium Priority

- [x] Social share buttons (Facebook, Twitter, copy link) on recipe detail
- [x] Open Graph meta tags per recipe + JSON-LD structured data
- [x] Sitemap.xml + robots.txt
- [x] Change password (form + API)
- [x] Onboarding page (3-step wizard after registration: welcome, profile, done)

---

## 🟢 Low Priority / Backlog

- [x] Error boundaries (global error.tsx, recipes error.tsx, reusable ErrorBoundary component, not-found.tsx, wrapped RecipeForm)
- [x] Forgot password / reset flow (signed-token approach, no DB migration needed)
- [ ] Account deletion
- [ ] Admin dashboard + moderation tools
- [ ] Dark mode
- [ ] Recipe version history
- [ ] Nutrition calculator
- [ ] Unit conversion (metric ↔ imperial)
- [ ] Meal plan grocery list export (print / PDF)
- [ ] Multi-language support (Filipino + English)
- [ ] Weekly email digest
- [ ] Mobile app (React Native / Expo)
- [ ] Unit / integration / E2E tests

---

## ⬜ Deployment
- [ ] Vercel project setup
- [ ] Environment variables configured for production
- [ ] Supabase production database
- [ ] Domain setup
- [ ] CI/CD (auto-deploy from git)

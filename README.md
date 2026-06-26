<!---
Purpose: Project documentation.
Content: Introduction, features, tech stack, configuration instructions, database setup, and local development runbook.
How it fits: Serves as the primary landing page and developer onboarding guide for the repository.
--->

# Ano Pong Ulam? (Ano'ng Ulam?) 🍲

**Ano Pong Ulam?** is a personal Progressive Web App (PWA) designed as a social recipe-sharing and weekly meal-planning platform, specifically focused on preserving and sharing **Filipino heirloom recipes**. 

---

## 🌟 Key Features

### 1. Recipe Management & Creation Wizard
*   **Structured Recipes**: Fields for regional heritage, difficulty, prep/cook times, and serving sizes.
*   **Drafting & Local Auto-Save**: Multi-step recipe wizard (`/recipes/new`) with auto-save to `localStorage` to prevent draft loss on unexpected page exits.
*   **Category & Region Filtering**: Infinite scroll navigation with search and multi-filtering (category, difficulty, region).

### 2. Social & Community Engine
*   **Visual-First Feed**: Aggregates likes and reviews/comments on the same recipe within a 24-hour window, displaying stacked user avatars and summary tags instead of spamming separate cards.
*   **Real-time Notifications**: Background polling in the header notifies cooks instantly when their recipes are liked or reviewed.
*   **Follow System**: Follow cooks and view their activities in a curated "Following Feed".

### 3. Kitchen Utilities
*   **Weekly Meal Planner**: Drag-and-drop or select recipes into a Monday–Sunday grid for breakfast, lunch, and dinner.
*   **Custom Collections**: Group recipes into personal digital cookbooks.

### 4. Full PWA Capabilities
*   **Offline Access**: Custom service worker (`sw.js`) caching core app assets (static shell, fonts, Supabase images) and falling back to a custom `offline.html` page when network is unavailable.
*   **Native Feel**: App install banners for Android and custom install guides for iOS Safari.

---

## 🛠️ Technology Stack

*   **Framework**: Next.js (App Router, TypeScript)
*   **Styling**: Tailwind CSS v4
*   **Database & ORM**: Prisma ORM with PostgreSQL (hosted on Supabase)
*   **Authentication**: NextAuth.js v5 (Credentials & Google OAuth)
*   **Storage**: Supabase Storage for recipe hero images and avatars

---

## ⚙️ Environment Configuration

Create a `.env` file in the root of the project with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/dbname"

# Auth.js Configuration
AUTH_SECRET="your-next-auth-secret"
AUTH_TRUST_HOST=true

# Google OAuth (Optional)
AUTH_GOOGLE_ID="your-google-oauth-id"
AUTH_GOOGLE_SECRET="your-google-oauth-secret"

# Supabase Storage Configuration
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Prepare Database Schemas
Verify connection configurations, generate the Prisma Client, and sync schemas with Supabase:
```bash
npx prisma generate
npx prisma db push
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

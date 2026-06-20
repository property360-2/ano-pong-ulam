# i18n: English + Taglish Translation System

Client-side language switcher using a React Context + custom `useLanguage()` hook.
No routing changes. No external packages. Fully offline-capable and PWA-friendly.
Follows the exact same architecture as the existing [`toast.tsx`](file:///c:/Users/junal/OneDrive/Desktop/pwa/ano-pong-ulam/src/lib/toast.tsx) library.

---

## Architecture Overview

```
src/
├── locales/
│   ├── en.json              [NEW] — All English UI strings
│   └── taglish.json         [NEW] — All Taglish equivalents
├── lib/
│   └── i18n.tsx             [NEW] — LanguageContext + LanguageProvider + useLanguage()
├── hooks/
│   └── useLanguage.ts       [NEW] — Re-export hook (follows project convention)
└── components/
    ├── Providers.tsx         [MODIFY] — Wrap with <LanguageProvider>
    ├── Header.tsx            [MODIFY] — Add LanguageSwitcher + wrap nav strings
    ├── BottomNav.tsx         [MODIFY] — Wrap tab labels with t()
    ├── HtmlLangSync.tsx      [NEW] — Syncs html[lang] attribute to active language
    └── LanguageSwitcher.tsx  [NEW] — EN | TL toggle atom component

app/
├── layout.tsx               [MODIFY] — Mount <HtmlLangSync />
├── page.tsx                 [MODIFY] — Extract HomeContent.tsx client sub-component
├── feed/page.tsx            [MODIFY] — Wrap all UI text strings
├── meal-planner/page.tsx    [MODIFY] — Wrap all UI text strings
└── settings/page.tsx        [MODIFY] — Wrap strings + add Language section
```

---

## Resolved Design Choices

- **Default Language:** Taglish. When a user first visits the app, the interface will default to Taglish.
- **Toggle Labels:** "Taglish" and "English". The language toggle button will display these full names.

---

## Proposed Changes

---

### 1. Translation Dictionaries

#### [NEW] `src/locales/en.json`

Flat key-value JSON. All UI string keys for every covered page, organized by namespace prefix.

```json
{
  "nav.feed": "Feed",
  "nav.recipes": "Recipes",
  "nav.planner": "Meal Planner",
  "nav.collections": "Collections",
  "nav.share_recipe": "Share Recipe",
  "nav.sign_in": "Sign In",
  "nav.sign_out": "Sign Out",
  "nav.profile": "Profile",
  "nav.settings": "Settings",
  "nav.notifications": "Notifications",
  "nav.home": "Home",

  "home.hero_title": "Your lola's recipe deserves to be shared with the world.",
  "home.hero_subtitle": "Ano Pong Ulam? is where Filipino heirloom recipes live forever. Write down the story of your kitchen.",
  "home.browse_recipes": "Browse Recipes",
  "home.share_recipe": "Share Your Recipe",
  "home.categories_title": "What are you looking for today?",
  "home.categories_subtitle": "Choose a category and discover the flavors of Filipino cooking.",
  "home.latest_title": "Newly Cooked",
  "home.see_more": "See More",
  "home.sign_in_to_view": "Sign in to view recipe",
  "home.empty_state": "No recipes yet in our digital kitchen... Maybe you can start?",
  "home.write_first": "Write the First Recipe",
  "home.join_and_share": "Join and Contribute",
  "home.browse_first": "Browse First",
  "home.footer": "Every recipe has a story. Every kitchen has a legacy.",

  "feed.trending": "Trending Highlights",
  "feed.global_tab": "Global Activity",
  "feed.following_tab": "Following Feed",
  "feed.no_updates": "No updates yet",
  "feed.sign_in_prompt": "Sign in to view your feed",
  "feed.sign_in_desc": "Follow other home cooks, discover trending recipes, and see real-time reviews.",
  "feed.empty_following": "Follow other home cooks or explore recipes to start seeing posts.",
  "feed.empty_global": "No activities yet. Start liking and commenting on recipes!",
  "feed.load_more": "Show More Activities",
  "feed.loading_more": "Loading more stories...",
  "feed.view_recipe": "View Recipe",
  "feed.recommended_this": " recommended this",
  "feed.reviewed_this": " reviewed this",
  "feed.browse_recipes": "Browse Recipes",
  "feed.profile_link": "Profile",

  "meal.title": "Weekly Meal Planner",
  "meal.subtitle": "Plan your week's ulam and organize your kitchen.",
  "meal.quick_fill": "Quick-Fill",
  "meal.save_template": "Save Template",
  "meal.save_plan": "Save Plan",
  "meal.saving": "Saving...",
  "meal.choose_ulam_for": "Choose Ulam for",
  "meal.select_for": "Select a recipe recommendation for",
  "meal.search_placeholder": "Search recipes, categories, or tags...",
  "meal.suggestions_label": "Suggestions:",
  "meal.no_recipes": "No matching recipes found.",
  "meal.select": "Select",
  "meal.tap_to_choose": "Tap to choose ulam...",
  "meal.click_to_choose": "Choose ulam...",
  "meal.scheduled_for": "Scheduled for",
  "meal.view_details": "View Recipe Details",
  "meal.change_recipe": "Change Recipe (Edit)",
  "meal.remove_recipe": "Remove Recipe (Delete)",
  "meal.smart_list_title": "Smart Shopping List",
  "meal.smart_list_desc": "A combined grocery checklist automatically generated from your planned ulam recipes.",
  "meal.empty_grocery": "Schedule recipes in the planner grid above to automatically compile your grocery list.",
  "meal.ingredient_total": "Ingredient ({count} total)",
  "meal.checked_count": "{checked} of {total} checked",
  "meal.menu_suffix": "'s Menu",
  "meal.sign_in_prompt": "Sign in to plan meals",
  "meal.sign_in_desc": "Create weekly menus, export shopping lists, and share luto schedules.",

  "settings.language_section": "Language",
  "settings.language_desc": "Choose your preferred display language for the app.",

  "common.sign_in": "Sign In",
  "common.remove_recipe": "Remove recipe",
  "common.previous_day": "Previous day",
  "common.next_day": "Next day",
  "common.day.monday": "Monday",
  "common.day.tuesday": "Tuesday",
  "common.day.wednesday": "Wednesday",
  "common.day.thursday": "Thursday",
  "common.day.friday": "Friday",
  "common.day.saturday": "Saturday",
  "common.day.sunday": "Sunday",
  "common.meal.breakfast": "Breakfast",
  "common.meal.lunch": "Lunch",
  "common.meal.dinner": "Dinner"
}
```

#### [NEW] `src/locales/taglish.json`

Same keys, Taglish values.

```json
{
  "nav.feed": "Feed",
  "nav.recipes": "Mga Recipe",
  "nav.planner": "Meal Planner",
  "nav.collections": "Koleksyon",
  "nav.share_recipe": "Ibahagi ang Recipe",
  "nav.sign_in": "Mag-sign In",
  "nav.sign_out": "Mag-sign Out",
  "nav.profile": "Profile",
  "nav.settings": "Mga Setting",
  "nav.notifications": "Mga Abiso",
  "nav.home": "Home",

  "home.hero_title": "Ang recipe ng lola mo, deserve niyang ma-share sa mundo.",
  "home.hero_subtitle": "Ang Ano Pong Ulam? ang bahay ng mga heirloom recipe ng Pilipino. Isulat mo ang kuwento ng inyong kusina.",
  "home.browse_recipes": "Halungkat ng Recipes",
  "home.share_recipe": "Ibahagi ang Recipe Mo",
  "home.categories_title": "Ano ang hanap mo ngayon?",
  "home.categories_subtitle": "Pumili ng kategorya at tuklasin ang sarap ng tunay na lutong Pinoy.",
  "home.latest_title": "Mga Bagong Luto",
  "home.see_more": "Tingnan ang Iba Pa",
  "home.sign_in_to_view": "Mag-sign in para makita ang recipe",
  "home.empty_state": "Wala pang laman ang ating kusina digitally... Baka ikaw na ang mag-umpisa?",
  "home.write_first": "Isulat ang Unang Recipe",
  "home.join_and_share": "Sumali at Mag-ambag",
  "home.browse_first": "Mag-browse Muna",
  "home.footer": "Bawat recipe ay may kuwento. Bawat kusina ay may pamana.",

  "feed.trending": "Trending Ngayon",
  "feed.global_tab": "Global Activity",
  "feed.following_tab": "Mga Sinusundan",
  "feed.no_updates": "Wala pang bago",
  "feed.sign_in_prompt": "Mag-sign in para makita ang feed mo",
  "feed.sign_in_desc": "Sundan ang ibang home cooks, tuklasin ang mga trending recipe, at makita ang mga review sa real-time.",
  "feed.empty_following": "Sundan ang ibang home cooks o mag-explore ng recipes para makakita ng posts.",
  "feed.empty_global": "Wala pang aktibidad. Mag-like at mag-comment na sa mga recipe!",
  "feed.load_more": "Ipakita ang Iba Pa",
  "feed.loading_more": "Naglo-load ng mga bagong posts...",
  "feed.view_recipe": "Tingnan ang Recipe",
  "feed.recommended_this": " inirekomenda ito",
  "feed.reviewed_this": " nag-review nito",
  "feed.browse_recipes": "Mag-browse ng Recipes",
  "feed.profile_link": "Profile",

  "meal.title": "Weekly Meal Planner",
  "meal.subtitle": "I-plano ang ulam mo para sa buong linggo.",
  "meal.quick_fill": "Quick-Fill",
  "meal.save_template": "I-save ang Template",
  "meal.save_plan": "I-save ang Plan",
  "meal.saving": "Sine-save...",
  "meal.choose_ulam_for": "Pumili ng Ulam para sa",
  "meal.select_for": "Pumili ng recipe para sa",
  "meal.search_placeholder": "Maghanap ng recipe, kategorya, o tags...",
  "meal.suggestions_label": "Mga Mungkahi:",
  "meal.no_recipes": "Walang nahanap na recipe.",
  "meal.select": "Piliin",
  "meal.tap_to_choose": "I-tap para pumili ng ulam...",
  "meal.click_to_choose": "Pumili ng ulam...",
  "meal.scheduled_for": "Naka-iskedyul para sa",
  "meal.view_details": "Tingnan ang Detalye ng Recipe",
  "meal.change_recipe": "Palitan ang Recipe",
  "meal.remove_recipe": "Alisin ang Recipe",
  "meal.smart_list_title": "Smart Shopping List",
  "meal.smart_list_desc": "Awtomatikong listahan ng mga sangkap mula sa iyong meal plan.",
  "meal.empty_grocery": "Mag-iskedyul ng mga recipe sa planner para makita ang grocery list.",
  "meal.ingredient_total": "Sangkap ({count} lahat)",
  "meal.checked_count": "{checked} sa {total} na naka-check",
  "meal.menu_suffix": "' Menu",
  "meal.sign_in_prompt": "Mag-sign in para mag-plano ng ulam",
  "meal.sign_in_desc": "Gumawa ng weekly menus, i-export ang shopping list, at ibahagi ang iyong luto schedule.",

  "settings.language_section": "Wika",
  "settings.language_desc": "Piliin ang wika na gusto mo para sa app.",

  "common.sign_in": "Mag-sign In",
  "common.remove_recipe": "Alisin ang recipe",
  "common.previous_day": "Nakaraang araw",
  "common.next_day": "Susunod na araw",
  "common.day.monday": "Lunes",
  "common.day.tuesday": "Martes",
  "common.day.wednesday": "Miyerkules",
  "common.day.thursday": "Huwebes",
  "common.day.friday": "Biyernes",
  "common.day.saturday": "Sabado",
  "common.day.sunday": "Linggo",
  "common.meal.breakfast": "Almusal",
  "common.meal.lunch": "Tanghalian",
  "common.meal.dinner": "Hapunan"
}
```

---

### 2. Core i18n Library

#### [NEW] `src/lib/i18n.tsx`

The engine. Follows the exact same Context + Provider + hook pattern as the existing `toast.tsx`.

**Responsibilities:**
- On mount: reads `localStorage.getItem("lang")` (SSR-safe: only on client)
- On `setLanguage()`: saves to `localStorage` and updates state
- `t(key, vars?)`: looks up the key in the active locale dictionary, applies variable interpolation (e.g., `{count}`, `{checked}`, `{total}`), and falls back to the English value if the key is missing in the target locale (prevents blank UI on missing keys)
- Statically imports both locale JSON files at the module level — **zero network requests**, **works fully offline**

**Exported API:**
```ts
type Language = "en" | "taglish"

export function LanguageProvider({ children }: { children: ReactNode }): JSX.Element

export function useLanguage(): {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}
```

---

#### [NEW] `src/hooks/useLanguage.ts`

Thin re-export to honor the project's `src/hooks/` convention.

```ts
export { useLanguage } from "@/lib/i18n"
```

---

### 3. New Components

#### [NEW] `src/components/LanguageSwitcher.tsx`

Atom component. Renders an `EN | TL` toggle pill. Uses `useLanguage()`. Placed in:
- Desktop Header nav (right side, before `UserMenu`)
- Mobile drawer nav (bottom of nav links)
- Settings page Language row

**Design spec:**
- Two short pill-buttons side by side
- Active button: `bg-red-600 text-white`
- Inactive button: `text-stone-500 hover:text-stone-800 bg-stone-100`
- Compact: `text-xs font-bold px-2.5 py-1 rounded-lg`

#### [NEW] `src/components/HtmlLangSync.tsx`

Headless client component. Mounts invisibly in `layout.tsx` and runs:
```ts
useEffect(() => {
  document.documentElement.lang = language === "taglish" ? "fil" : "en"
}, [language])
```
This keeps the HTML `lang` attribute correct for accessibility tools without needing to make `layout.tsx` a client component.

---

### 4. Modified Files

#### [MODIFY] [`Providers.tsx`](file:///c:/Users/junal/OneDrive/Desktop/pwa/ano-pong-ulam/src/components/Providers.tsx)

Add `LanguageProvider` as the outermost wrapper. Order matters — it must be outside `SessionProvider` so even auth components can access language.

```tsx
// Before
<SessionProvider><ToastProvider>{children}</ToastProvider></SessionProvider>

// After
<LanguageProvider>
  <SessionProvider><ToastProvider>{children}</ToastProvider></SessionProvider>
</LanguageProvider>
```

#### [MODIFY] [`Header.tsx`](file:///c:/Users/junal/OneDrive/Desktop/pwa/ano-pong-ulam/src/components/Header.tsx)

- Add `const { t } = useLanguage()` at the top
- Replace: `"Feed"` → `{t("nav.feed")}`, `"Recipes"` → `{t("nav.recipes")}`, `"Meal Planner"` → `{t("nav.planner")}`, `"Collections"` → `{t("nav.collections")}`, `"Share Recipe"` → `{t("nav.share_recipe")}`, `"Sign In"` → `{t("nav.sign_in")}`, `"Sign Out"` → `{t("nav.sign_out")}`, etc.
- Insert `<LanguageSwitcher />` in the desktop right nav (between `Share Recipe` button and `NotificationBell`)
- Insert `<LanguageSwitcher />` in the mobile drawer nav (below the nav links list)

#### [MODIFY] [`BottomNav.tsx`](file:///c:/Users/junal/OneDrive/Desktop/pwa/ano-pong-ulam/src/components/BottomNav.tsx)

The `TABS` array stores `label` as a string. Change to store `labelKey` instead:
```ts
// Before
{ href: "/feed", label: "Feed", icon: MdRssFeed },

// After
{ href: "/feed", labelKey: "nav.feed", icon: MdRssFeed },
```
Then in JSX: `{t(tab.labelKey)}` instead of `{tab.label}`.

#### [MODIFY] [`feed/page.tsx`](file:///c:/Users/junal/OneDrive/Desktop/pwa/ano-pong-ulam/src/app/feed/page.tsx)

Already `"use client"`. Add `const { t } = useLanguage()` and replace ~12 hardcoded strings.

#### [MODIFY] [`meal-planner/page.tsx`](file:///c:/Users/junal/OneDrive/Desktop/pwa/ano-pong-ulam/src/app/meal-planner/page.tsx)

Already `"use client"`. Add `const { t } = useLanguage()` and replace ~25 hardcoded strings.
Day names: `t(`common.day.${day.toLowerCase()}`)` using a template literal.

#### [MODIFY] `settings/page.tsx`

Add a **Language** section card (matching existing settings card UI). Include `<LanguageSwitcher />` in that row. Wrap all existing strings with `t()`.

#### [MODIFY] [`layout.tsx`](file:///c:/Users/junal/OneDrive/Desktop/pwa/ano-pong-ulam/src/app/layout.tsx)

Add `<HtmlLangSync />` inside `<Providers>`. No other changes.

#### [MODIFY] `app/page.tsx`

> [!IMPORTANT]
> This is the **only non-trivial refactor** in the plan. The homepage is a Server Component — it cannot call `useLanguage()` directly.

**Solution (minimal impact):**
1. Keep `HomePage` as an `async` Server Component. It only runs the DB query and passes data as props.
2. Extract a new `"use client"` component: `src/components/HomeContent.tsx`.
3. `HomeContent` receives `{ session, latestRecipes }` as props and handles all the translated rendering.

This is a clean separation anyway — the page was mixing data fetching and rendering in one component.

---

## What Is NOT Translated

| Item | Reason |
|---|---|
| Recipe titles, descriptions, ingredients | User-generated database content |
| `toast.tsx` messages from API calls | System messages; low priority for v1 |
| Auth pages (`/login`, `/reset-password`) | Small scope; safe to do as follow-up |
| API routes | Server-only, no UI |

---

## Execution Order

Steps must be done in this exact sequence to avoid a broken intermediate state:

```
Step 1  — Create src/locales/en.json
Step 2  — Create src/locales/taglish.json
Step 3  — Create src/lib/i18n.tsx
Step 4  — Create src/hooks/useLanguage.ts
Step 5  — Create src/components/LanguageSwitcher.tsx
Step 6  — Create src/components/HtmlLangSync.tsx
Step 7  — Modify Providers.tsx (plug in LanguageProvider)
Step 8  — Modify Header.tsx (add switcher + wrap strings)
Step 9  — Modify BottomNav.tsx (wrap labelKey)
Step 10 — Modify feed/page.tsx
Step 11 — Modify meal-planner/page.tsx
Step 12 — Modify settings/page.tsx (add Language section)
Step 13 — Extract HomeContent.tsx + update app/page.tsx
Step 14 — Modify layout.tsx (add HtmlLangSync)
```

---

## Verification Plan

### Manual Verification
1. Open the app → defaults to **English**
2. Click `TL` in the Header → all UI strings instantly switch to Taglish (no reload)
3. Reload the page → Taglish preference is still active (persisted in `localStorage`)
4. Navigate to Feed → strings in Taglish
5. Navigate to Meal Planner → day names show Lunes/Martes/etc., buttons in Taglish
6. Navigate to Settings → Language section visible; toggling here also works
7. Go offline (DevTools > Network > Offline) → language toggling still works (no network call needed)

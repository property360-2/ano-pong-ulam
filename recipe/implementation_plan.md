# Implementation Plan – Filipino Recipe Documentation
## Phase-by-Phase Generation of All ~241 Dishes

Generate historically accurate, culturally grounded Markdown recipe documentation
for every dish in `recipe/recipes.md`. Each phase covers one category and produces
one output `.md` file inside the `recipe/docs/` folder.

---

## Critical Rule: Historical Accuracy

> [!CAUTION]
> Every story field must be **researched, not invented.**
> Before generating any recipe story, the AI agent must search and reference
> real sources. Stories that cannot be verified must use explicit hedging language.
> Made-up dates, invented historical figures, or fabricated origin stories are
> grounds for rejecting the entire batch.

### Mandatory Research Sources (per recipe)

The agent must consult at least **2 of these per recipe story:**

| Source | URL |
|--------|-----|
| National Commission for Culture and the Arts | https://ncca.gov.ph |
| Official Gazette of the Republic of the Philippines | https://www.officialgazette.gov.ph |
| Philippine Information Agency | https://www.pia.gov.ph |
| Taste Atlas – Filipino Cuisine | https://www.tasteatlas.com/philippine-cuisine |
| Doreen Fernandez's "Tikim: Essays on Philippine Food and Culture" | (book reference) |
| Felice Prudente Sta. Maria's food history writings | (book reference) |
| Kulinarya: A Guidebook to Philippine Cuisine | (book reference) |
| Encyclopaedia Britannica | https://www.britannica.com |
| CNN Travel – Filipino Food | https://edition.cnn.com/travel/food-and-drink |
| Maangchi's documented Filipino recipes | https://www.maangchi.com |
| Kawaling Pinoy | https://www.kawalingpinoy.com |
| Panlasang Pinoy (with source citations) | https://panlasangpinoy.com |

> [!NOTE]
> If a dish has disputed or unknown origins, the story **must acknowledge this
> honestly** using hedging phrases — never fill the gap with invented content.

---

## Output Structure

All generated files go into:

```
recipe/
  docs/
    01-pork-dishes.md
    02-chicken-poultry.md
    03-beef-goat.md
    04-seafood.md
    05-vegetable-dishes.md
    06-noodle-dishes.md
    07-rice-breakfast.md
    08-street-food-snacks.md
    09-bread-pastries.md
    10-sweets-desserts.md
    11-regional-exotic.md
    12-sauces-condiments.md
```

Each file is a **standalone recipe documentation file** using the Markdown structure
defined in the Prompt Template section below.

---

## Prompt Template (use for every batch)

Copy this prompt and fill in the recipe list at the bottom:

```
You are a Filipino culinary historian, recipe developer, and structured content writer.
You have access to web search. Before writing any story, search for real sources.

OUTPUT FORMAT
=============
Return ONLY valid Markdown.
No JSON. No code blocks. No preamble. No closing notes.
Start immediately with the first --- divider.

ACCURACY RULES
==============
- Every story must cite real, verifiable culinary history.
- Do NOT invent dates, people, or origin stories.
- If uncertain, use: "Food historians generally believe...",
  "It is widely accepted that...", "One theory suggests...",
  "Historical records indicate...", "The dish is commonly associated with..."
- Stories must be 180–300 words.
- Written in Filipino-English style.

MARKDOWN STRUCTURE PER RECIPE
==============================

---

# [Recipe Title]

> "[featuredQuote — short, memorable, sounds Filipino]"

## About This Dish

[180–300 word historically grounded story. Explain: origin, cultural significance,
regional significance, why Filipinos still cook it today.]

**Category:** [Ulam | Merienda | Pang-almusal | Pampasko / Fiesta | Lutong Gulay | Dessert | Soup / Sabaw | Rice / Kanin]
**Region:** [Tagalog | Bicol | Ilocano | Kapampangan | Visayas | Mindanao | Diaspora / International]
**Difficulty:** [Easy | Medium | Hard]
**Servings:** [number]
**Prep Time:** [number] minutes
**Cook Time:** [number] minutes
**Tags:** [3–8 lowercase tags, comma-separated]

---

## Ingredients

| Ingredient | Amount | Unit | Notes |
|------------|--------|------|-------|
| [name] | [amount] | [unit] | [notes] |

(8–15 ingredients. Fractions only — 1/4, 1/3, 1/2, 3/4, 1, 2, 3. No decimals.)

---

## Instructions

**Step 1.** [Clear, actionable, for home cooks.]
> 💡 Tip: [optional]

[5–10 steps total.]

---

## Sources

- [Real Source Title](real URL)
- [Real Source Title](real URL)

(Minimum 2. No fake URLs. No invented sources.)

---

GENERATE THESE RECIPES:
=======================
[Insert recipe list here]

Return ONLY the Markdown.
```

---

## Phase Breakdown

### Phase 1 — Pork Dishes
**Output file:** `recipe/docs/01-pork-dishes.md`
**Total recipes:** 26
**Run in 6 batches of 4–5 recipes each**

**Batch 1A (5 recipes)**
1. Adobong Baboy (Pork Adobo)
2. Asado na Baboy (Pork Asado)
3. Bagnet (Ilocano Crispy Pork Belly)
4. Bicol Express (Spicy Pork in Coconut Milk)
5. Bopis (Spicy Pork Lungs and Heart)

**Batch 1B (5 recipes)**
6. Crispy Pata (Deep-Fried Pork Knuckle)
7. Dinuguan (Pork Blood Stew)
8. Embutido (Filipino Pork Meatloaf)
9. Estofadong Baboy (Pork Estofado)
10. Hamonado (Sweet-Cured Pork)

**Batch 1C (5 recipes)**
11. Humba (Visayan Braised Pork Belly)
12. Igado (Ilocano Pork Liver and Tenderloin Stew)
13. Inihaw na Liempo (Grilled Pork Belly)
14. Lechon Baboy (Whole Roasted Pig)
15. Lechon Kawali (Crispy Deep-Fried Pork Belly)

**Batch 1D (5 recipes)**
16. Morcon na Baboy (Stuffed Pork Roll)
17. Paksiw na Baboy (Pork Cooked in Vinegar)
18. Paksiw na Lechon (Leftover Roast Pork Stew)
19. Pata Tim (Braised Pork Hocks)
20. Pork Afritada (Pork in Tomato Stew)

**Batch 1E (4 recipes)**
21. Pork Binagoongan (Pork in Shrimp Paste)
22. Pork Menudo (Diced Pork and Liver Stew)
23. Pork Sinigang (Sinigang na Baboy)
24. Sisig (Sizzling Pork Cheeks) ⭐ Featured

**Batch 1F (2 recipes)**
25. Tokwa't Baboy (Boiled Pork and Tofu)
26. Pork Giniling (Ground Pork Stew)

---

### Phase 2 — Chicken & Poultry
**Output file:** `recipe/docs/02-chicken-poultry.md`
**Total recipes:** 15
**Run in 3 batches of 5 recipes each**

**Batch 2A**
1. Adobong Manok (Chicken Adobo)
2. Chicken Afritada (Chicken Tomato Stew)
3. Chicken Curry (Filipino-Style Coconut Curry)
4. Chicken Inasal (Grilled Annatto Chicken) ⭐ Featured
5. Chicken Mechado

**Batch 2B**
6. Chicken Pastel (Creamy Chicken Pot Pie style)
7. Chicken Sopas (Creamy Macaroni Soup)
8. Chicken Tinola (Tinolang Manok) ⭐ Featured
9. Fried Chicken (Filipino Style)
10. Ginataang Manok (Chicken in Coconut Milk)

**Batch 2C**
11. Inasal na Manok (Grilled Chicken - Bacolod style)
12. Pinaupong Manok (Salt-baked Sitting Chicken)
13. Pyanggang Chicken (Tausug Spiced Grilled Chicken)
14. Rellenong Manok (Stuffed Whole Chicken)
15. Toktok (Chicken Meatballs)

---

### Phase 3 — Beef & Goat
**Output file:** `recipe/docs/03-beef-goat.md`
**Total recipes:** 17
**Run in 4 batches**

**Batch 3A**
1. Asado na Baka (Beef Asado)
2. Beef Caldereta (Spicy Beef Stew)
3. Beef Mechado (Beef Stew with Tomato Sauce and Pork Fat)
4. Beef Morcon (Stuffed Beef Roll)
5. Beef Pares (Braised Beef with Soup)

**Batch 3B**
6. Beef Salpicao (Garlic Beef Stir-fry)
7. Beef Tapa (Cured Beef)
8. Bistek Tagalog (Filipino Beef Steak)
9. Bulalo (Beef Shank Soup) ⭐ Featured
10. Calderetang Kambing (Goat Stew)

**Batch 3C**
11. Crispy Tadyang ng Baka (Deep-Fried Beef Ribs)
12. Kare-Kare (Oxtail and Beef Stew in Peanut Sauce) ⭐ Featured
13. Lengua Estofada (Braised Ox Tongue)
14. Nilagang Baka (Boiled Beef Soup)

**Batch 3D**
15. Papaitan (Bitter Goat/Beef Stew)
16. Sinanglaw (Ilocano Beef Innards Stew)
17. Beef Giniling (Ground Beef)

---

### Phase 4 — Seafood
**Output file:** `recipe/docs/04-seafood.md`
**Total recipes:** 20
**Run in 4 batches of 5**

**Batch 4A**
1. Adobong Pusit (Squid Adobo)
2. Camaron Rebosado (Battered Deep-Fried Shrimp)
3. Curacha Alavar (Spanner Crab in Coconut Sauce)
4. Daing na Bangus (Marinated Milkfish)
5. Escabeche (Filipino Sweet and Sour Fish)

**Batch 4B**
6. Ginataang Alimango (Crabs in Coconut Milk)
7. Ginataang Hipon (Shrimp in Coconut Milk)
8. Ginataang Tilapia
9. Halabos na Hipon (Garlic Butter Shrimp)
10. Inihaw na Pusit (Grilled Squid)

**Batch 4C**
11. Inun-unan (Visayan Fish Cooked in Vinegar)
12. Kinilaw na Tanigue (Fish Ceviche)
13. Paksiw na Bangus (Milkfish Cooked in Vinegar)
14. Pesang Isda (Fish Ginger Soup with Cabbage)
15. Pinaputok na Tilapia (Stuffed Tilapia)

**Batch 4D**
16. Rellenong Bangus (Stuffed Milkfish)
17. Sarciadong Isda (Fish in Tomato and Egg Sauce)
18. Sinigang na Hipon (Shrimp Sour Soup)
19. Sinigang na Isda (Fish Sour Soup) ⭐ Featured
20. Tinolang Isda (Fish Ginger Soup)

---

### Phase 5 — Vegetable Dishes
**Output file:** `recipe/docs/05-vegetable-dishes.md`
**Total recipes:** 13
**Run in 3 batches**

**Batch 5A**
1. Adobong Kangkong (Water Spinach Adobo)
2. Chop Suey (Filipino Style)
3. Diningding (Ilocano Vegetable Soup with Fish Paste)
4. Ginisang Ampalaya (Stir-fried Bitter Melon with Egg)
5. Ginisang Monggo (Mung Bean Stew)

**Batch 5B**
6. Ginataang Kalabasa at Sitaw (Squash and String Beans in Coconut Milk)
7. Laswa (Ilonggo Vegetable Soup)
8. Lumpiang Hubad (Naked Spring Rolls)
9. Lumpiang Sariwa (Fresh Spring Rolls)

**Batch 5C**
10. Pinakbet (Mixed Vegetables in Shrimp Paste) ⭐ Featured
11. Poqui Poqui (Ilocano Eggplant and Egg Dish)
12. Sinantol (Bicolano Santol Fruit Dish)
13. Tortang Talong (Eggplant Omelet)

---

### Phase 6 — Noodle Dishes (Pancit)
**Output file:** `recipe/docs/06-noodle-dishes.md`
**Total recipes:** 18
**Run in 4 batches**

**Batch 6A**
1. Filipino Spaghetti (Sweet Spaghetti with Hotdogs)
2. Misua (Thin Wheat Noodle Soup)
3. Pancit Batil Patong (Tuguegarao Noodles with Poached Egg)
4. Pancit Bato (Bicolano Stir-fried Noodles)
5. Pancit Bihon Guisado (Stir-fried Rice Noodles)

**Batch 6B**
6. Pancit Cabagan (Isabela Style Stir-fried Noodles)
7. Pancit Canton (Stir-fried Egg Noodles) ⭐ Featured
8. Pancit Chami (Lucena Sweet and Spicy Thick Noodles)
9. Pancit Estacion (Cavite Noodle Dish with Sprouted Beans)
10. Pancit Habhab (Lucban Noodles eaten off banana leaf)

**Batch 6C**
11. Pancit Langlang (Cavite Style Glass Noodle Soup)
12. Pancit Lomi (Thick Egg Noodle Soup)
13. Pancit Luglog (Thick Rice Noodles with Orange Sauce)
14. Pancit Malabon (Thick Noodles with Seafood Sauce)

**Batch 6D**
15. Pancit Molo (Wonton Soup)
16. Pancit Palabok (Noodles with Shrimp Sauce and Toppings)
17. Sopas (Creamy Chicken Macaroni Soup)
18. Sotanghon (Glass Noodle Soup)

---

### Phase 7 — Rice Dishes & Breakfast
**Output file:** `recipe/docs/07-rice-breakfast.md`
**Total recipes:** 12
**Run in 3 batches**

**Batch 7A**
1. Arroz a la Valenciana (Sticky Rice with Meat)
2. Arroz Caldo (Chicken Rice Porridge)
3. Binalot (Rice and Viand wrapped in banana leaf)
4. Champorado (Sweet Chocolate Rice Porridge)

**Batch 7B**
5. Goto (Rice Porridge with Ox Tripe)
6. Kiampong (Filipino-Chinese Rice Casserole)
7. Lugaw (Rice Porridge)
8. Paelya (Filipino Style Paella)

**Batch 7C**
9. Pastil (Mindanao Rice Wrapped in Banana Leaf with Shredded Chicken)
10. Puso (Hanging Rice)
11. Sinangag (Garlic Fried Rice)
12. Silog Variants (Tapsilog, Tocilog, Longsilog, Bangsilog, Hotsilog, Dangsilog, Spamsilog)

---

### Phase 8 — Street Food & Snacks
**Output file:** `recipe/docs/08-street-food-snacks.md`
**Total recipes:** 23
**Run in 5 batches**

**Batch 8A**
1. Adidas (Grilled Chicken Feet)
2. Balut (Fertilized Duck Egg) ⭐ Featured
3. Betamax (Grilled Pork/Chicken Blood Cubes)
4. Binatog (Steamed Corn with Shredded Coconut)
5. Calamares (Fried Squid Rings)

**Batch 8B**
6. Chicharon (Pork Rinds / Chicharon Bulaklak)
7. Dynamite Lumpia (Chili Cheese Spring Rolls)
8. Fish Balls
9. Ginabot (Cebuano Chicharon Bulaklak)
10. Helmet (Grilled Chicken Head)

**Batch 8C**
11. Isaw na Baboy (Grilled Pork Intestines)
12. Isaw na Manok (Grilled Chicken Intestines)
13. Iskrambol (Ice Scramble)
14. Kikiam
15. Kwek-Kwek (Deep-fried Batter-coated Quail Eggs)

**Batch 8D**
16. Lumpiang Shanghai (Crispy Fried Spring Rolls) ⭐ Featured
17. Ngohiong (Cebuano Five-spice Spring Roll)
18. Proben (Deep-fried Chicken Proventriculus)
19. Siomai sa Tisa (Cebuano Steamed Siomai)
20. Sorbetes (Dirty Ice Cream)

**Batch 8E**
21. Taho (Soft Tofu with Arnibal and Sago)
22. Tokneneng (Deep-fried Batter-coated Chicken/Duck Eggs)
23. Ukoy (Shrimp Fritters)

---

### Phase 9 — Bread & Pastries
**Output file:** `recipe/docs/09-bread-pastries.md`
**Total recipes:** 15
**Run in 3 batches of 5**

**Batch 9A**
1. Araro (Arrowroot Cookies)
2. Barquillos (Wafer Rolls)
3. Biscocho (Toasted Garlic/Butter Bread)
4. Brazo de Mercedes (Meringue Custard Roll)
5. Ensaymada (Sweet Brioche with Cheese and Butter)

**Batch 9B**
6. Hopia (Hapon, Baboy, Ube, Custard)
7. Kalihim (Pan de Regla)
8. Monay (Sweet Bun)
9. Otap (Flaky Puff Pastry)
10. Pan de Coco (Coconut-filled Bread)

**Batch 9C**
11. Pandesal (Filipino Bread Rolls) ⭐ Featured
12. Pastel de Camiguin (Custard-filled buns)
13. Rosquillos (Ring-shaped Cookies)
14. Sans Rival (Layered Cashew Buttercream Cake)
15. Spanish Bread (Sweet Butter-filled Bread Rolls)

---

### Phase 10 — Sweets & Desserts
**Output file:** `recipe/docs/10-sweets-desserts.md`
**Total recipes:** 50 (largest phase)
**Run in 10 batches of 5**

**Batch 10A**
1. Banana Cue (Deep-fried Sugared Saba Bananas)
2. Baye-baye (Pounded Sticky Rice and Coconut Dessert)
3. Bibingka (Baked Coconut Rice Cake) ⭐ Featured
4. Biko (Sticky Rice Cake with Latik)
5. Binagol (Leyte Sweet Taro Pudding in Coconut Shell)

**Batch 10B**
6. Binignit (Visayan Sweet Soup with Tubers)
7. Bukayo (Sweet Coconut Candy)
8. Buko Pandan (Coconut and Pandan Salad)
9. Buko Pie (Coconut Custard Pie)
10. Buko Salad

**Batch 10C**
11. Camote Cue (Deep-fried Sugared Sweet Potatoes)
12. Carioca (Sweet Rice Balls)
13. Cassava Cake
14. Crema de Fruta
15. Dodol (Mindanao Sticky Rice Toffee)

**Batch 10D**
16. Espasol (Rice Flour Cylinder Cakes)
17. Fruit Salad (Filipino Style)
18. Ginanggang (Grilled Bananas with Margarine and Sugar)
19. Halo-Halo (Shaved Ice Mix) ⭐ Featured
20. Ice Candy (Filipino Popsicles)

**Batch 10E**
21. Kalamay (Bohol, Candon, Indang)
22. Kiping (Leaf-shaped Rice Wafers)
23. Kutsinta (Brown Steamed Rice Cake)
24. Leche Flan (Filipino Caramel Custard) ⭐ Featured
25. Mais con Yelo (Sweet Corn with Shaved Ice)

**Batch 10F**
26. Maja Blanca (Coconut Pudding)
27. Mango Float (Graham Icebox Cake)
28. Maruya (Banana Fritters)
29. Moron (Leyte Chocolate-swirled Rice Cake)
30. Palitaw (Sticky Rice Flat Cakes)

**Batch 10G**
31. Pastillas de Leche (Milk Candies)
32. Pastillas de Ube
33. Pichi-Pichi (Cassava Grated Cakes)
34. Polvoron (Toasted Flour Candy)
35. Puto Bumbong (Purple Steamed Rice Cake) ⭐ Featured

**Batch 10H**
36. Puto Maya (Steamed Sticky Rice with Ginger and Coconut Milk)
37. Puto Seko (Dry Coconut Cookies)
38. Saba con Yelo (Sweetened Saba Bananas with Shaved Ice)
39. Sapin-Sapin (Layered Sticky Rice Cake)
40. Sayongsong (Surigao Glutinous Rice Treat)

**Batch 10I**
41. Shakoy (Twisted Fried Donuts)
42. Silvana (Frozen Cashew Meringue Cookie)
43. Suman (Steamed Sticky Rice in Banana/Palm Leaves)
44. Tibok-tibok (Pampanga Carabao Milk Pudding)
45. Tupig (Ilocano Grilled Sticky Rice Cake)

**Batch 10J**
46. Turon (Sweet Banana Roll)
47. Ube Halaya (Purple Yam Dessert) ⭐ Featured
48. Yema (Sweet Custard Balls)
49. Yema Cake
50. Cay-cay (Peanut-coated Cookies)

---

### Phase 11 — Regional, Rare & Exotic
**Output file:** `recipe/docs/11-regional-exotic.md`
**Total recipes:** 23
**Run in 5 batches**

> [!IMPORTANT]
> This phase requires the most research. Dishes here are the least documented.
> For dishes with very limited written history (e.g., Abuos, Kamaro, Salagubang),
> the story must state this clearly: "Documentation on this dish is scarce. What is
> known comes primarily from oral tradition and regional cultural accounts."
> Never fabricate history for rare dishes.

**Batch 11A**
1. Abuos (Ant Eggs - Ilocos)
2. Bakassi (Cebuano Saltwater Eel)
3. Beef Kulma (Mindanao Beef Curry)
4. Betute (Pampanga Stuffed Frog)
5. Chicken Binakol (Visayan Chicken Soup in Coconut Water)

**Batch 11B**
6. Etag (Cordillera Smoked Cured Meat)
7. Insarabasab (Ilocano Grilled Pork)
8. Kamaro (Pampanga Stir-fried Mole Crickets)
9. Kansi (Western Visayas Sour Beef Soup)
10. KBL (Kadyos, Baboy, Langka - Western Visayas)

**Batch 11C**
11. Kinalas (Bicolano Noodle Soup with Brain Gravy)
12. Kinunot (Bicolano Shredded Stingray/Shark in Coconut Milk)
13. Piaparan (Maranao Meat/Seafood Cooked in Coconut Milk with Turmeric and Palapa)
14. Pinikpikan (Cordillera Chicken Soup)
15. Rendang (Mindanao Style Curry)

**Batch 11D**
16. Salagubang (June Beetle)
17. Sambal (Mindanao version)
18. Satti (Zamboanga Style Skewers)
19. Sinuglaw (Davao Style Grilled Pork + Ceviche)
20. Tamilok (Palawan Woodworm)

**Batch 11E**
21. Tilmok (Bicolano Steamed Coconut, Crab, and Shrimp)
22. Tiyula Itum (Tausug Braised Beef in Roasted Coconut Broth)
23. Diningding (Ilocano) *(full recipe variant)*

---

### Phase 12 — Sauces & Condiments
**Output file:** `recipe/docs/12-sauces-condiments.md`
**Total recipes:** 9
**Run in 2 batches**

**Batch 12A**
1. Atchara (Pickled Papaya)
2. Bagoong Alamang (Shrimp Paste)
3. Bagoong Isda (Fish Paste)
4. Banana Ketchup
5. Lechon Sauce

**Batch 12B**
6. Palapa (Maranao Chili Condiment)
7. Patis (Fish Sauce)
8. Sawsawan (Vinegar, Soy Sauce, Chili, Calamansi)
9. Toyomansi (Soy Sauce + Calamansi)

---

## Summary

| Phase | Category | Dishes | Batches | Output File |
|-------|----------|--------|---------|-------------|
| 1 | Pork Dishes | 26 | 6 | 01-pork-dishes.md |
| 2 | Chicken & Poultry | 15 | 3 | 02-chicken-poultry.md |
| 3 | Beef & Goat | 17 | 4 | 03-beef-goat.md |
| 4 | Seafood | 20 | 4 | 04-seafood.md |
| 5 | Vegetables | 13 | 3 | 05-vegetable-dishes.md |
| 6 | Noodles (Pancit) | 18 | 4 | 06-noodle-dishes.md |
| 7 | Rice & Breakfast | 12 | 3 | 07-rice-breakfast.md |
| 8 | Street Food & Snacks | 23 | 5 | 08-street-food-snacks.md |
| 9 | Bread & Pastries | 15 | 3 | 09-bread-pastries.md |
| 10 | Sweets & Desserts | 50 | 10 | 10-sweets-desserts.md |
| 11 | Regional & Exotic | 23 | 5 | 11-regional-exotic.md |
| 12 | Sauces & Condiments | 9 | 2 | 12-sauces-condiments.md |
| **Total** | | **241** | **52 batches** | 12 files |

---

## Notes

- ⭐ = `isFeatured: true` — world-famous, globally recognized dishes
- Each batch run = one copy-paste of the prompt with 4–5 recipe names at the end
- Append each batch output to the correct phase file
- Do not mix categories across files
- Phase 11 is the hardest — take extra care with accuracy

/**
 * @file top-recipes-data.ts
 * @description Curated static list of the Top 20 most popular Filipino dishes with their slugs,
 * descriptions, categories, default image paths, and mock engagement numbers.
 */

export interface StaticRecipe {
  slug: string
  title: string
  desc: string
  category: string
  image: string
  likes: number
}

export const STATIC_TOP_20: StaticRecipe[] = [
  {
    slug: "pork_adobo",
    title: "Adobong Baboy (Pork Adobo)",
    desc: "The quintessential Filipino dish of pork belly braised in vinegar, soy sauce, garlic, and black peppercorns.",
    category: "ulam",
    image: "/images/recipes/pork_adobo.png",
    likes: 342,
  },
  {
    slug: "pork_sinigang",
    title: "Sinigang na Baboy (Pork Sinigang)",
    desc: "A deeply comforting, sour tamarind-based soup with pork ribs and fresh vegetables.",
    category: "ulam",
    image: "/images/recipes/Filipino_Pork_Sinigang_in_clay_202606232059.jpeg",
    likes: 318,
  },
  {
    slug: "kare_kare",
    title: "Kare-Kare (Oxtail Peanut Stew)",
    desc: "Tender oxtail and beef tripe simmered in a thick, savory peanut sauce, served with shrimp paste.",
    category: "ulam",
    image: "/images/recipes/kare_kare.png",
    likes: 295,
  },
  {
    slug: "lechon_baboy",
    title: "Lechon Baboy (Whole Roasted Pig)",
    desc: "A festive spit-roasted pig famous for its ultra-crispy skin and juicy seasoned meat.",
    category: "ulam",
    image: "/images/recipes/lechon_baboy.png",
    likes: 284,
  },
  {
    slug: "lechon_kawali",
    title: "Lechon Kawali (Crispy Pork Belly)",
    desc: "Pan-roasted pork belly deep-fried until bubbly and golden crisp, served with liver sauce.",
    category: "ulam",
    image: "/images/recipes/lechon_kawali.png",
    likes: 271,
  },
  {
    slug: "chicken_inasal",
    title: "Chicken Inasal (Grilled Annatto Chicken)",
    desc: "Bacolod's famous chargrilled chicken marinated in calamansi, lemongrass, and annatto oil.",
    category: "ulam",
    image: "/images/recipes/chicken_inasal.png",
    likes: 263,
  },
  {
    slug: "chicken_tinola",
    title: "Chicken Tinola (Tinolang Manok)",
    desc: "A ginger-infused chicken soup cooked with green papaya and fresh malunggay leaves.",
    category: "ulam",
    image: "/images/recipes/chicken_tinola.png",
    likes: 251,
  },
  {
    slug: "bicol_express",
    title: "Bicol Express (Spicy Pork in Coconut)",
    desc: "A fiery pork belly stew cooked with lots of fresh green chilies, shrimp paste, and rich coconut cream.",
    category: "ulam",
    image: "/images/recipes/bicol_express.png",
    likes: 240,
  },
  {
    slug: "bulalo",
    title: "Bulalo (Beef Shank Soup)",
    desc: "A rich beef shank soup featuring slow-boiled marrow bones, sweet corn, and cabbage.",
    category: "ulam",
    image: "/images/recipes/bulalo.png",
    likes: 232,
  },
  {
    slug: "bistek_tagalog",
    title: "Bistek Tagalog (Filipino Beef Steak)",
    desc: "Thinly sliced beef marinated and braised in soy sauce, calamansi, and topped with onion rings.",
    category: "ulam",
    image: "/images/recipes/bistek_tagalog.png",
    likes: 219,
  },
  {
    slug: "pancit_bihon",
    title: "Pancit Bihon Guisado",
    desc: "A birthday and fiesta staple of stir-fried thin rice noodles with chicken, shrimp, and vegetables.",
    category: "merienda",
    image: "/images/recipes/Pancit_Bihon_Guisado_stir-fried_…_202606232102.jpeg",
    likes: 208,
  },
  {
    slug: "lumpiang_shanghai",
    title: "Lumpiang Shanghai (Pork Spring Rolls)",
    desc: "Crispy, golden-brown deep-fried spring rolls stuffed with seasoned ground pork.",
    category: "merienda",
    image: "/images/recipes/Lumpiang_Shanghai_pork_spring_rolls_202606232105.jpeg",
    likes: 195,
  },
  {
    slug: "halo_halo",
    title: "Halo-Halo (Shaved Ice Mix)",
    desc: "The ultimate Filipino dessert of layered sweet beans, jellies, fruits, shaved ice, milk, and ube ice cream.",
    category: "dessert",
    image: "/images/recipes/halo_halo.png",
    likes: 188,
  },
  {
    slug: "tortang_talong",
    title: "Tortang Talong (Eggplant Omelet)",
    desc: "Char-grilled long eggplants, peeled, flattened, coated in beaten egg, and pan-fried until crispy.",
    category: "vegetable",
    image: "/images/recipes/tortang_talong.png",
    likes: 179,
  },
  {
    slug: "arroz_caldo",
    title: "Arroz Caldo (Chicken Rice Porridge)",
    desc: "A ginger-heavy rice porridge with chicken, topped with toasted garlic, green onions, and egg.",
    category: "breakfast",
    image: "/images/recipes/arroz_caldo.png",
    likes: 171,
  },
  {
    slug: "pinakbet",
    title: "Pinakbet (Mixed Vegetables)",
    desc: "Mixed local vegetables sautéed in savory shrimp paste, topped with crispy bagnet or chicharon.",
    category: "vegetable",
    image: "/images/recipes/pinakbet.png",
    likes: 165,
  },
  {
    slug: "dinuguan",
    title: "Dinuguan (Pork Blood Stew)",
    desc: "A savory, thick, dark stew of pork belly and offal cooked in pork blood, vinegar, and garlic.",
    category: "ulam",
    image: "/images/recipes/Pork_Blood_Stew_with_Puto_202606232058.jpeg",
    likes: 154,
  },
  {
    slug: "beef_caldereta",
    title: "Beef Caldereta (Spicy Beef Stew)",
    desc: "A rich, spicy beef stew cooked in tomato sauce and liver spread with olives, peppers, and cheese.",
    category: "ulam",
    image: "/images/recipes/Filipino_Beef_Caldereta_in_clay_202606232100.jpeg",
    likes: 148,
  },
  {
    slug: "pork_menudo",
    title: "Pork Menudo (Diced Pork Stew)",
    desc: "A classic stew of diced pork, pork liver, potatoes, carrots, raisins, and hotdogs in tomato sauce.",
    category: "ulam",
    image: "/images/recipes/Filipino_Pork_Menudo_in_bowl_202606232059.jpeg",
    likes: 139,
  },
  {
    slug: "bibingka",
    title: "Bibingka (Baked Rice Cake)",
    desc: "A traditional Christmas rice cake baked in banana leaves, topped with salted egg, cheese, and grated coconut.",
    category: "dessert",
    image: "/images/recipes/Bibingka_baked_coconut_rice_cake_202606241016.jpeg",
    likes: 131,
  },
]

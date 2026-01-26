// Foursquare category to tipocomida (food type) mapping
// Maps Foursquare category IDs to our database food type UUIDs
// 
// Foursquare Categories Reference:
// https://docs.foursquare.com/data-products/docs/categories

// Our 20 food type UUIDs from the database
export const FOOD_TYPE_IDS = {
  AMERICAN: '830db5c8-ecfe-4416-b307-f2c382cd2c39',
  BARBECUE: '18e40ccd-0d29-475c-91c4-67ebca9eb2c6',
  BURGERS: '18425637-89aa-4c00-8e69-6b84de2e12bc',
  CHINESE: '96209165-1bf0-4b82-94c8-c37fa301a55a',
  COSTA_RICAN: '23cb1708-e204-4c2b-9be0-4ebb8cc29dff',
  FRENCH: '1a1b6210-e157-49eb-b495-c3bb5000d616',
  GREEK: 'a6f90cc7-43cf-4cf1-967e-26627e6b102d',
  INDIAN: '2e4be2e5-dd40-425f-94ad-a7b80cd8885b',
  ITALIAN: '209ff5dd-a2a0-44eb-8026-2b6183851f4f',
  JAPANESE: '847f33e5-00ab-4a04-87c2-aed327c44c15',
  MEDITERRANEAN: 'bb12311f-0921-46cc-86af-b88d2336d8aa',
  MEXICAN: '289d3b1e-ffdb-435e-99a3-97f913f537a7',
  MIDDLE_EASTERN: 'b1d3f2c1-f9cb-4fac-aa05-dc2b97539273',
  PIZZA: '601a0791-1cc8-4832-9567-1f5b8746eecf',
  SEAFOOD: 'e659fd7a-f80c-4a68-a42f-8666db007fdb',
  SPANISH: '3f869378-ea11-407f-9cd9-1dcf99a38452',
  SUSHI: 'dd3bf7f1-b986-498b-a994-5aa7c3b60013',
  THAI: '6d678d3e-300a-49f2-a03b-aa0c029191a0',
  VEGAN: 'ececcb64-f1d4-4001-baef-69eaba7700f1',
  VEGETARIAN: 'a2ac5398-3b00-4088-acd3-d0c829189814',
} as const

// Foursquare category ID to our food type UUID mapping
// Category IDs are numbers in Foursquare API responses
export const FOURSQUARE_CATEGORY_MAP: Record<number, string> = {
  // American
  13003: FOOD_TYPE_IDS.AMERICAN, // American Restaurant
  13001: FOOD_TYPE_IDS.AMERICAN, // Diner
  13026: FOOD_TYPE_IDS.AMERICAN, // Comfort Food Restaurant
  
  // Barbecue
  13028: FOOD_TYPE_IDS.BARBECUE, // BBQ Joint
  
  // Burgers
  13031: FOOD_TYPE_IDS.BURGERS, // Burger Joint
  13145: FOOD_TYPE_IDS.BURGERS, // Fast Food Restaurant (secondary)
  
  // Chinese
  13065: FOOD_TYPE_IDS.CHINESE, // Chinese Restaurant
  13072: FOOD_TYPE_IDS.CHINESE, // Dim Sum Restaurant
  13066: FOOD_TYPE_IDS.CHINESE, // Cantonese Restaurant
  13067: FOOD_TYPE_IDS.CHINESE, // Congee Restaurant
  
  // Costa Rican / Latin American
  13105: FOOD_TYPE_IDS.COSTA_RICAN, // Latin American Restaurant
  13064: FOOD_TYPE_IDS.COSTA_RICAN, // Caribbean Restaurant
  13069: FOOD_TYPE_IDS.COSTA_RICAN, // Cuban Restaurant
  13151: FOOD_TYPE_IDS.COSTA_RICAN, // Peruvian Restaurant
  13023: FOOD_TYPE_IDS.COSTA_RICAN, // Arepa Restaurant
  13042: FOOD_TYPE_IDS.COSTA_RICAN, // Central American Restaurant
  
  // French
  13087: FOOD_TYPE_IDS.FRENCH, // French Restaurant
  13029: FOOD_TYPE_IDS.FRENCH, // Bistro
  13030: FOOD_TYPE_IDS.FRENCH, // Brasserie
  13068: FOOD_TYPE_IDS.FRENCH, // Creperie
  
  // Greek
  13092: FOOD_TYPE_IDS.GREEK, // Greek Restaurant
  
  // Indian
  13099: FOOD_TYPE_IDS.INDIAN, // Indian Restaurant
  13142: FOOD_TYPE_IDS.INDIAN, // Pakistani Restaurant
  13025: FOOD_TYPE_IDS.INDIAN, // Biryani Restaurant
  
  // Italian
  13104: FOOD_TYPE_IDS.ITALIAN, // Italian Restaurant
  13144: FOOD_TYPE_IDS.ITALIAN, // Pasta Restaurant
  13178: FOOD_TYPE_IDS.ITALIAN, // Trattoria
  
  // Japanese
  13107: FOOD_TYPE_IDS.JAPANESE, // Japanese Restaurant
  13154: FOOD_TYPE_IDS.JAPANESE, // Ramen Restaurant
  13199: FOOD_TYPE_IDS.JAPANESE, // Udon Restaurant
  13184: FOOD_TYPE_IDS.JAPANESE, // Tempura Restaurant
  13176: FOOD_TYPE_IDS.JAPANESE, // Tonkatsu Restaurant
  13187: FOOD_TYPE_IDS.JAPANESE, // Teppanyaki Restaurant
  13106: FOOD_TYPE_IDS.JAPANESE, // Izakaya
  
  // Mediterranean
  13117: FOOD_TYPE_IDS.MEDITERRANEAN, // Mediterranean Restaurant
  
  // Mexican
  13121: FOOD_TYPE_IDS.MEXICAN, // Mexican Restaurant
  13183: FOOD_TYPE_IDS.MEXICAN, // Taco Restaurant
  13033: FOOD_TYPE_IDS.MEXICAN, // Burrito Restaurant
  13186: FOOD_TYPE_IDS.MEXICAN, // Tex-Mex Restaurant
  
  // Middle Eastern
  13123: FOOD_TYPE_IDS.MIDDLE_EASTERN, // Middle Eastern Restaurant
  13083: FOOD_TYPE_IDS.MIDDLE_EASTERN, // Falafel Restaurant
  13103: FOOD_TYPE_IDS.MIDDLE_EASTERN, // Kebab Restaurant
  13109: FOOD_TYPE_IDS.MIDDLE_EASTERN, // Lebanese Restaurant
  13181: FOOD_TYPE_IDS.MIDDLE_EASTERN, // Turkish Restaurant
  13143: FOOD_TYPE_IDS.MIDDLE_EASTERN, // Persian Restaurant
  
  // Pizza
  13152: FOOD_TYPE_IDS.PIZZA, // Pizza Place
  
  // Seafood
  13159: FOOD_TYPE_IDS.SEAFOOD, // Seafood Restaurant
  13086: FOOD_TYPE_IDS.SEAFOOD, // Fish & Chips Restaurant
  13130: FOOD_TYPE_IDS.SEAFOOD, // New England Restaurant
  13045: FOOD_TYPE_IDS.SEAFOOD, // Ceviche Restaurant
  13141: FOOD_TYPE_IDS.SEAFOOD, // Oyster Bar
  
  // Spanish
  13166: FOOD_TYPE_IDS.SPANISH, // Spanish Restaurant
  13182: FOOD_TYPE_IDS.SPANISH, // Tapas Restaurant
  13024: FOOD_TYPE_IDS.SPANISH, // Basque Restaurant
  13040: FOOD_TYPE_IDS.SPANISH, // Catalan Restaurant
  
  // Sushi
  13174: FOOD_TYPE_IDS.SUSHI, // Sushi Restaurant
  
  // Thai
  13188: FOOD_TYPE_IDS.THAI, // Thai Restaurant
  
  // Vegan
  13377: FOOD_TYPE_IDS.VEGAN, // Vegan Restaurant / Vegan & Vegetarian Restaurant
  
  // Vegetarian
  13379: FOOD_TYPE_IDS.VEGETARIAN, // Vegetarian Restaurant
}

// Additional keyword-based mapping for category names
// Used when category ID is not in the map but name contains keywords
export const CATEGORY_NAME_KEYWORDS: Record<string, string> = {
  'american': FOOD_TYPE_IDS.AMERICAN,
  'bbq': FOOD_TYPE_IDS.BARBECUE,
  'barbecue': FOOD_TYPE_IDS.BARBECUE,
  'burger': FOOD_TYPE_IDS.BURGERS,
  'chinese': FOOD_TYPE_IDS.CHINESE,
  'latin': FOOD_TYPE_IDS.COSTA_RICAN,
  'caribbean': FOOD_TYPE_IDS.COSTA_RICAN,
  'costa rica': FOOD_TYPE_IDS.COSTA_RICAN,
  'french': FOOD_TYPE_IDS.FRENCH,
  'greek': FOOD_TYPE_IDS.GREEK,
  'indian': FOOD_TYPE_IDS.INDIAN,
  'italian': FOOD_TYPE_IDS.ITALIAN,
  'pasta': FOOD_TYPE_IDS.ITALIAN,
  'japanese': FOOD_TYPE_IDS.JAPANESE,
  'ramen': FOOD_TYPE_IDS.JAPANESE,
  'mediterranean': FOOD_TYPE_IDS.MEDITERRANEAN,
  'mexican': FOOD_TYPE_IDS.MEXICAN,
  'taco': FOOD_TYPE_IDS.MEXICAN,
  'middle eastern': FOOD_TYPE_IDS.MIDDLE_EASTERN,
  'kebab': FOOD_TYPE_IDS.MIDDLE_EASTERN,
  'falafel': FOOD_TYPE_IDS.MIDDLE_EASTERN,
  'pizza': FOOD_TYPE_IDS.PIZZA,
  'seafood': FOOD_TYPE_IDS.SEAFOOD,
  'fish': FOOD_TYPE_IDS.SEAFOOD,
  'spanish': FOOD_TYPE_IDS.SPANISH,
  'tapas': FOOD_TYPE_IDS.SPANISH,
  'sushi': FOOD_TYPE_IDS.SUSHI,
  'thai': FOOD_TYPE_IDS.THAI,
  'vegan': FOOD_TYPE_IDS.VEGAN,
  'vegetarian': FOOD_TYPE_IDS.VEGETARIAN,
}

/**
 * Maps a Foursquare category to our food type UUID
 * @param categoryId - Foursquare category ID
 * @param categoryName - Foursquare category name (fallback for keyword matching)
 * @returns Food type UUID or null if no mapping found
 */
export function mapFoursquareCategory(
  categoryId: number,
  categoryName?: string
): string | null {
  // First try direct ID mapping
  if (FOURSQUARE_CATEGORY_MAP[categoryId]) {
    return FOURSQUARE_CATEGORY_MAP[categoryId]
  }
  
  // Fallback to keyword matching in category name
  if (categoryName) {
    const lowerName = categoryName.toLowerCase()
    for (const [keyword, foodTypeId] of Object.entries(CATEGORY_NAME_KEYWORDS)) {
      if (lowerName.includes(keyword)) {
        return foodTypeId
      }
    }
  }
  
  return null
}

/**
 * Maps multiple Foursquare categories to our food type UUIDs
 * @param categories - Array of Foursquare categories
 * @returns Array of unique food type UUIDs
 */
export function mapFoursquareCategories(
  categories: Array<{ id: number; name: string }>
): string[] {
  const foodTypeIds = new Set<string>()
  
  for (const category of categories) {
    const foodTypeId = mapFoursquareCategory(category.id, category.name)
    if (foodTypeId) {
      foodTypeIds.add(foodTypeId)
    }
  }
  
  return Array.from(foodTypeIds)
}

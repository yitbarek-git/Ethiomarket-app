import { Product } from "../types";

export interface ParsedSearchQuery {
  rawQuery: string;
  tokens: string[];
  category?: string;
  condition?: "NEW" | "USED" | "REFURBISHED";
  maxPrice?: number;
  minPrice?: number;
  location?: string;
}

// Category keyword mappings for Ethiopian commerce
const CATEGORY_MAP: Record<string, string> = {
  // Phones
  phone: "Phones",
  phones: "Phones",
  smartphone: "Phones",
  smartphones: "Phones",
  iphone: "Phones",
  iphones: "Phones",
  samsung: "Phones",
  galaxy: "Phones",
  android: "Phones",
  mobile: "Phones",
  tecno: "Phones",
  infinix: "Phones",
  redmi: "Phones",
  xiaomi: "Phones",
  bilbila: "Phones",
  ስልክ: "Phones",
  ስልኮች: "Phones",

  // Laptops
  laptop: "Laptops",
  laptops: "Laptops",
  macbook: "Laptops",
  macbooks: "Laptops",
  thinkpad: "Laptops",
  dell: "Laptops",
  hp: "Laptops",
  lenovo: "Laptops",
  asus: "Laptops",
  acer: "Laptops",
  notebook: "Laptops",
  laaptooppii: "Laptops",
  ላፕቶፕ: "Laptops",
  ላፕቶፖች: "Laptops",

  // PCs
  pc: "PCs",
  pcs: "PCs",
  desktop: "PCs",
  desktops: "PCs",
  computer: "PCs",
  computers: "PCs",
  monitor: "PCs",
  monitors: "PCs",
  workstation: "PCs",
  ኮምፒውተር: "PCs",

  // Cameras
  camera: "Cameras",
  cameras: "Cameras",
  canon: "Cameras",
  nikon: "Cameras",
  sony: "Cameras",
  drone: "Cameras",
  drones: "Cameras",
  ካሜራ: "Cameras",

  // AirPods & Audio
  airpod: "AirPods",
  airpods: "AirPods",
  earbuds: "AirPods",
  headphones: "AirPods",
  headphone: "AirPods",
  speaker: "AirPods",
  speakers: "AirPods",
  ድምጽ: "AirPods",

  // Fashion & Cultural
  fashion: "Fashion",
  kemis: "Fashion",
  habesha: "Fashion",
  dress: "Fashion",
  dresses: "Fashion",
  clothes: "Fashion",
  clothing: "Fashion",
  shirt: "Fashion",
  shoes: "Fashion",
  boots: "Fashion",
  shema: "Fashion",
  netela: "Fashion",
  gabi: "Fashion",
  kuta: "Fashion",
  tilfi: "Fashion",
  leather: "Fashion",
  ልብስ: "Fashion",
  ቀሚስ: "Fashion",
  ጫማ: "Fashion",
  uffata: "Fashion",

  // Vehicles
  car: "Vehicles",
  cars: "Vehicles",
  vehicle: "Vehicles",
  vehicles: "Vehicles",
  toyota: "Vehicles",
  vitz: "Vehicles",
  yaris: "Vehicles",
  corolla: "Vehicles",
  መኪና: "Vehicles",
  konkolaataa: "Vehicles",

  // Real Estate
  house: "Real Estate",
  houses: "Real Estate",
  apartment: "Real Estate",
  apartments: "Real Estate",
  rent: "Real Estate",
  rental: "Real Estate",
  realestate: "Real Estate",
  condo: "Real Estate",
  ቤት: "Real Estate",
  ኪራይ: "Real Estate",
  mana: "Real Estate",

  // Agro & Coffee
  coffee: "Agro & Coffee",
  buna: "Agro & Coffee",
  beans: "Agro & Coffee",
  yirgacheffe: "Agro & Coffee",
  sidama: "Agro & Coffee",
  harar: "Agro & Coffee",
  guji: "Agro & Coffee",
  spices: "Agro & Coffee",
  ቡና: "Agro & Coffee",
  ቅመም: "Agro & Coffee",
};

// Location keywords in Ethiopia
const LOCATION_KEYWORDS: Record<string, string> = {
  bole: "Bole",
  piassa: "Piassa",
  merkato: "Merkato",
  sarbet: "Sarbet",
  megenagna: "Megenagna",
  shiro: "Shiro Meda",
  cmc: "CMC",
  kazanchis: "Kazanchis",
  mexico: "Mexico",
  hawassa: "Hawassa",
  mekelle: "Mekelle",
  bahirdar: "Bahir Dar",
  adama: "Adama",
  diredawa: "Dire Dawa",
  sidama: "Sidama",
};

/**
 * Normalizes a word stem for matching singular/plural and variations
 */
export function getWordStems(word: string): string[] {
  const w = word.toLowerCase();
  const stems = [w];

  if (w.endsWith("ies") && w.length > 4) {
    stems.push(w.slice(0, -3) + "y");
  } else if (w.endsWith("es") && w.length > 4) {
    stems.push(w.slice(0, -2));
  } else if (w.endsWith("s") && w.length > 3) {
    stems.push(w.slice(0, -1));
  }

  return stems;
}

/**
 * Parses user input to extract semantic search intent (category, price limits, condition, keywords)
 */
export function parseSearchIntent(input: string): ParsedSearchQuery {
  const cleanInput = input.trim();
  const lower = cleanInput.toLowerCase();

  const parsed: ParsedSearchQuery = {
    rawQuery: cleanInput,
    tokens: [],
  };

  // 1. Extract Price Constraints (English, Amharic, Oromo)
  // e.g. "under 20000", "below 15k", "under 40,000 ETB", "max 25000", "less than 20,000"
  const underPriceMatch = lower.match(/(?:under|below|less than|max(?:imum)?|upto|up to)\s*([\d,]+)\s*(?:k|thousand)?(?:\s*etb|\s*birr|\s*ብር)?/i)
    || lower.match(/ከ\s*([\d,]+)\s*(?:ብር|etb)?\s*በታች/i)
    || lower.match(/([\d,]+)\s*(?:etb|birr)?\s*gadi/i)
    || lower.match(/ንታሕቲ\s*([\d,]+)/i);

  if (underPriceMatch) {
    let numStr = underPriceMatch[1].replace(/,/g, "");
    let price = parseFloat(numStr);
    if (underPriceMatch[0].includes("k") || underPriceMatch[0].includes("thousand")) {
      price *= 1000;
    }
    if (!isNaN(price) && price > 0) {
      parsed.maxPrice = price;
    }
  }

  const overPriceMatch = lower.match(/(?:over|above|more than|min(?:imum)?|starting from)\s*([\d,]+)\s*(?:k|thousand)?(?:\s*etb|\s*birr|\s*ብር)?/i)
    || lower.match(/ከ\s*([\d,]+)\s*(?:ብር|etb)?\s*በላይ/i)
    || lower.match(/([\d,]+)\s*(?:etb|birr)?\s*ol/i);

  if (overPriceMatch) {
    let numStr = overPriceMatch[1].replace(/,/g, "");
    let price = parseFloat(numStr);
    if (overPriceMatch[0].includes("k") || overPriceMatch[0].includes("thousand")) {
      price *= 1000;
    }
    if (!isNaN(price) && price > 0) {
      parsed.minPrice = price;
    }
  }

  // 2. Extract Condition (NEW, USED, REFURBISHED) across Ethiopian languages
  if (/\b(?:brand\s+new|new|unopened|sealed|አዲስ|haaraa|haarawa|ሓዲሽ|cusub)\b/i.test(lower)) {
    parsed.condition = "NEW";
  } else if (/\b(?:used|second\s*hand|2nd\s*hand|ያገለገለ|moofaa|duraanii|ዝተጠቕመሉ|la\s+isticmaalay)\b/i.test(lower)) {
    parsed.condition = "USED";
  } else if (/\b(?:refurbished|renewed|serviced|የተጠገነ)\b/i.test(lower)) {
    parsed.condition = "REFURBISHED";
  }

  // 3. Extract Tokens & detect categories / locations
  let textForTokens = lower
    .replace(/(?:under|below|less than|max|over|above|more than)\s*[\d,]+(?:\s*k|\s*thousand)?(?:\s*etb|\s*birr|\s*ብር)?/gi, "")
    .replace(/ከ\s*[\d,]+\s*(?:ብር|etb)?\s*(?:በታች|በላይ)/gi, "")
    .replace(/[^a-z0-9\u1200-\u137F\s]/gi, " ");

  const rawTokens = textForTokens.split(/\s+/).filter((t) => t.length > 1);

  // Common stop words to exclude from primary keywords
  const stopWords = new Set([
    "find", "show", "me", "a", "an", "the", "in", "for", "with", "and", "or", 
    "looking", "want", "good", "best", "cheap", "all", "any", "please", "can",
    "you", "give", "get", "need", "about", "at", "to", "from", "on", "is",
    "ፈልግ", "እፈልጋለሁ", "አሳየኝ", "የሚገኝ", "barbaada"
  ]);

  for (const token of rawTokens) {
    // Check if category keyword
    if (CATEGORY_MAP[token] && !parsed.category) {
      parsed.category = CATEGORY_MAP[token];
    }
    // Check if location keyword
    if (LOCATION_KEYWORDS[token] && !parsed.location) {
      parsed.location = LOCATION_KEYWORDS[token];
    }
    if (!stopWords.has(token)) {
      parsed.tokens.push(token);
    }
  }

  return parsed;
}

/**
 * Checks if a target string contains a query token or any of its word stems
 */
function fieldMatchesToken(field: string, token: string): boolean {
  if (field.includes(token)) return true;
  const stems = getWordStems(token);
  for (const s of stems) {
    if (s.length > 2 && field.includes(s)) return true;
  }
  return false;
}

/**
 * Calculates a relevance score for a product given a query and parsed intent.
 * Higher score = more relevant. Returns 0 if product does not match budget or filters.
 */
export function calculateProductRelevance(
  product: Product,
  query: string,
  parsed?: ParsedSearchQuery
): number {
  if (!query || query.trim() === "") return 1;

  const intent = parsed || parseSearchIntent(query);
  const qLower = query.toLowerCase().trim();
  const titleLower = product.title.toLowerCase();
  const descLower = product.description.toLowerCase();
  const catLower = product.category.toLowerCase();
  const locLower = product.location.toLowerCase();
  const condLower = product.condition.toLowerCase();
  const vendorLower = product.vendorName.toLowerCase();

  // Strict Price constraint check: if user asked for "under 20000", exclude anything > 20000
  if (intent.maxPrice !== undefined && product.price > intent.maxPrice) {
    return 0;
  }
  if (intent.minPrice !== undefined && product.price < intent.minPrice) {
    return 0;
  }

  let score = 0;

  // 1. Exact or title phrase matches (highest priority)
  if (titleLower === qLower) {
    score += 150;
  } else if (titleLower.startsWith(qLower)) {
    score += 85;
  } else if (titleLower.includes(qLower)) {
    score += 55;
  }

  // 2. Condition matching
  if (intent.condition) {
    if (product.condition === intent.condition) {
      score += 45;
    } else {
      // Penalty for mismatched condition when explicitly specified
      score -= 35;
    }
  }

  // 3. Category matching
  if (intent.category) {
    if (catLower === intent.category.toLowerCase()) {
      score += 45;
    }
  }

  // 4. Location matching
  if (intent.location) {
    if (locLower.includes(intent.location.toLowerCase())) {
      score += 30;
    }
  }

  // 5. Token & word stem matching across fields
  let matchedTokens = 0;
  for (const token of intent.tokens) {
    let tokenMatched = false;

    if (fieldMatchesToken(titleLower, token)) {
      score += 30;
      tokenMatched = true;
    } else if (fieldMatchesToken(catLower, token)) {
      score += 20;
      tokenMatched = true;
    } else if (fieldMatchesToken(vendorLower, token)) {
      score += 18;
      tokenMatched = true;
    } else if (fieldMatchesToken(locLower, token)) {
      score += 15;
      tokenMatched = true;
    } else if (fieldMatchesToken(condLower, token)) {
      score += 15;
      tokenMatched = true;
    } else if (fieldMatchesToken(descLower, token)) {
      score += 10;
      tokenMatched = true;
    }

    if (tokenMatched) matchedTokens++;
  }

  // Multi-word bonus: if all user keywords were found, award a significant boost
  if (intent.tokens.length > 1 && matchedTokens === intent.tokens.length) {
    score += 40;
  }

  // Price match bonus: if user asked for a price bound and product fits comfortably
  if (intent.maxPrice !== undefined && product.price <= intent.maxPrice) {
    score += 20;
  }

  return score > 0 ? score : 0;
}

/**
 * Searches and ranks products by relevance score
 */
export function searchAndRankProducts(
  products: Product[],
  query: string,
  options?: {
    category?: string;
    condition?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
  }
): Product[] {
  let list = [...products];

  // Base status check
  list = list.filter((p) => p.isApproved);

  // Apply explicit filters if provided
  if (options?.category && options.category !== "All" && options.category.trim() !== "") {
    const filterCat = options.category.toLowerCase().trim();
    list = list.filter((p) => {
      const pCat = (p.category || "").toLowerCase().trim();
      return pCat === filterCat || pCat.includes(filterCat) || filterCat.includes(pCat);
    });
  }
  if (options?.condition && options.condition !== "") {
    list = list.filter((p) => p.condition === options.condition);
  }
  if (options?.location && options.location !== "All" && options.location !== "") {
    const loc = options.location.toLowerCase();
    list = list.filter((p) => p.location.toLowerCase().includes(loc));
  }
  if (options?.minPrice !== undefined && !isNaN(options.minPrice)) {
    list = list.filter((p) => p.price >= options.minPrice!);
  }
  if (options?.maxPrice !== undefined && !isNaN(options.maxPrice)) {
    list = list.filter((p) => p.price <= options.maxPrice!);
  }

  // If no search text, return list
  if (!query || query.trim() === "") {
    return list;
  }

  const intent = parseSearchIntent(query);

  const scored = list
    .map((product) => ({
      product,
      score: calculateProductRelevance(product, query, intent),
    }))
    .filter((item) => item.score > 0);

  // Rank by highest relevance score
  scored.sort((a, b) => b.score - a.score);

  return scored.map((item) => item.product);
}

import { items } from './items';
import { 
  analyzePriceAndRecommend, 
  findGlobalCheapestPrice, 
  predictFuturePrices, 
  findBestTimeToBuy,
  calculateRandomizedPrice,
  calculateShellPrice,
  PriceAnalysis
} from './pricing-algorithms';

export interface ItemWithAnalysis {
  id: string;
  name: string;
  description: string;
  image: string;
  basePrice: number; // This is now the REAL base price (reverse-engineered)
  observedPrice: number; // This is the randomized price we see
  analysis?: PriceAnalysis;
  pricingType: 'randomized' | 'fixed';
  isFixed?: boolean;
}

export interface UserPricing {
  userId: string;
  items: Array<ItemWithAnalysis & {
    currentUserPrice: number;
    bestTimeInNext24h: {
      bestHour: number;
      bestPrice: number;
      timeFromNow: string;
      savingsFromCurrent: number;
    };
  }>;
  prices: Record<string, number>;
  predictions: Record<string, {
    bestPrice: number;
    bestTime: string;
  }>;
  ratings: Record<string, {
    score: number;
    action: string;
    color: string;
  }>;
}

// Default pricing bounds (from the shipwrecked API analysis)
const DEFAULT_MIN_PERCENT = 90;
const DEFAULT_MAX_PERCENT = 110;
const DEFAULT_DOLLARS_PER_HOUR = 10;

// Detect if an item has randomized pricing or fixed pricing
function getItemPricingType(item: typeof items[0]): 'randomized' | 'fixed' {
  // Travel stipend and void donation are fixed
  if (item.isFixed || 
      item.name.toLowerCase().includes('travel stipend') || 
      item.name.toLowerCase().includes('void')) {
    return 'fixed';
  }
  // All other items have randomized pricing based on the API code
  return 'randomized';
}

// Calculate the actual price for an item (either randomized or fixed/calculated)
function calculateActualPrice(userId: string, item: typeof items[0]): { 
  observedPrice: number; 
  basePrice: number;
  pricingType: 'randomized' | 'fixed';
} {
  const pricingType = getItemPricingType(item);
  
  if (pricingType === 'fixed') {
    if (item.name.toLowerCase().includes('travel stipend')) {
      // Travel stipend uses shell calculation
      const shellPrice = calculateShellPrice(10, DEFAULT_DOLLARS_PER_HOUR); // $10 USD
      return { 
        observedPrice: shellPrice, 
        basePrice: shellPrice, 
        pricingType: 'fixed' 
      };
    } else {
      // Void and other fixed items - use the basePrice from our data
      return { 
        observedPrice: item.basePrice, 
        basePrice: item.basePrice, 
        pricingType: 'fixed' 
      };
    }
  } else {
    // For randomized items, calculate the current price using the true base price
    const currentPrice = calculateRandomizedPrice(
      userId, 
      item.id, 
      item.basePrice, // Use the calculated base price
      DEFAULT_MIN_PERCENT, 
      DEFAULT_MAX_PERCENT
    );
    
    return {
      observedPrice: currentPrice,
      basePrice: item.basePrice, // Return the true base price
      pricingType: 'randomized'
    };
  }
}

// Get pricing analysis for all items for a specific user
export function getUserPricingAnalysis(userId: string): UserPricing {
  const prices: Record<string, number> = {};
  const predictions: Record<string, {
    bestPrice: number;
    bestTime: string;
  }> = {};
  const ratings: Record<string, {
    score: number;
    action: string;
    color: string;
  }> = {};
  
  const userItems = items.map(item => {
    const { observedPrice, basePrice, pricingType } = calculateActualPrice(userId, item);
    const currentUserPrice = observedPrice;
    
    // Store in lookup objects
    prices[item.id] = currentUserPrice;
    
    let analysis: PriceAnalysis | undefined;
    let bestTimeInNext24h;
    
    if (pricingType === 'randomized') {
      // Get full analysis and recommendation using the reverse-engineered approach
      analysis = analyzePriceAndRecommend(
        userId,
        item.id,
        observedPrice,
        DEFAULT_MIN_PERCENT,
        DEFAULT_MAX_PERCENT
      );
      
      // Store rating for lookup
      ratings[item.id] = analysis.recommendation;
      
      // Find best time to buy in next 24 hours
      bestTimeInNext24h = findBestTimeToBuy(
        userId,
        item.id,
        observedPrice,
        DEFAULT_MIN_PERCENT,
        DEFAULT_MAX_PERCENT,
        24
      );
      
      // Store prediction data
      predictions[item.id] = {
        bestPrice: bestTimeInNext24h.bestPrice,
        bestTime: bestTimeInNext24h.timeFromNow
      };
    } else {
      // Fixed pricing - no analysis needed
      bestTimeInNext24h = {
        bestHour: Math.floor(Date.now() / (1000 * 60 * 60)),
        bestPrice: basePrice,
        timeFromNow: 'Fixed price',
        savingsFromCurrent: 0
      };
    }
    
    return {
      ...item,
      basePrice, // This is now the REAL base price
      observedPrice, // This is the randomized price we see
      currentUserPrice,
      analysis,
      pricingType,
      bestTimeInNext24h
    };
  });
  
  return {
    userId,
    items: userItems,
    prices,
    predictions,
    ratings
  };
}

// Get global market analysis (cheapest possible prices across all users)
export function getGlobalMarketAnalysis() {
  return items.map(item => {
    const pricingType = getItemPricingType(item);
    
    if (pricingType === 'randomized') {
      // For randomized items, use the true base price
      const estimatedBasePrice = item.basePrice;
      
      const cheapestData = findGlobalCheapestPrice(
        item.id,
        estimatedBasePrice,
        DEFAULT_MIN_PERCENT,
        DEFAULT_MAX_PERCENT,
        500, // Sample 500 users
        168  // Check 1 week of hours
      );
      
      const savingsFromBase = estimatedBasePrice - cheapestData.cheapestPrice;
      const maxSavingsPercent = ((savingsFromBase / estimatedBasePrice) * 100);
      
      return {
        ...item,
        basePrice: estimatedBasePrice,
        pricingType,
        globalCheapest: {
          price: cheapestData.cheapestPrice,
          savingsFromBase,
          maxSavingsPercent,
          priceRange: {
            min: Math.min(...cheapestData.priceDistribution),
            max: Math.max(...cheapestData.priceDistribution),
            median: cheapestData.priceDistribution[Math.floor(cheapestData.priceDistribution.length / 2)]
          }
        }
      };
    }
    
    // Fixed items
    const basePrice = item.name.toLowerCase().includes('travel stipend') 
      ? calculateShellPrice(10, DEFAULT_DOLLARS_PER_HOUR)
      : item.basePrice;
      
    return {
      ...item,
      basePrice,
      pricingType,
      globalCheapest: {
        price: basePrice,
        savingsFromBase: 0,
        maxSavingsPercent: 0,
        priceRange: { min: basePrice, max: basePrice, median: basePrice }
      }
    };
  });
}

// Generate a price prediction report for an item
export function getItemPricePrediction(userId: string, itemId: string, hoursAhead: number = 24) {
  const item = items.find(i => i.id === itemId);
  if (!item) throw new Error(`Item ${itemId} not found`);
  
  const { observedPrice, pricingType } = calculateActualPrice(userId, item);
  
  if (pricingType === 'fixed') {
    return {
      item,
      pricingType,
      currentUserPrice: observedPrice,
      message: 'This item has a fixed price - it does not change over time'
    };
  }
  
  // For randomized items, use the reverse-engineered base price
  const predictions = predictFuturePrices(
    userId,
    itemId,
    observedPrice, // Pass the observed price to reverse-engineer from
    DEFAULT_MIN_PERCENT,
    DEFAULT_MAX_PERCENT,
    hoursAhead
  );
  
  const bestTime = findBestTimeToBuy(
    userId,
    itemId,
    observedPrice,
    DEFAULT_MIN_PERCENT,
    DEFAULT_MAX_PERCENT,
    hoursAhead
  );
  
  const currentAnalysis = analyzePriceAndRecommend(
    userId,
    itemId,
    observedPrice,
    DEFAULT_MIN_PERCENT,
    DEFAULT_MAX_PERCENT
  );
  
  return {
    item,
    pricingType,
    currentUserPrice: observedPrice,
    currentAnalysis,
    predictions,
    bestTime,
    summary: {
      currentPrice: currentAnalysis.currentPrice,
      bestPriceInPeriod: bestTime.bestPrice,
      potentialSavings: bestTime.savingsFromCurrent,
      recommendedAction: currentAnalysis.recommendation.action,
      timeToWait: bestTime.timeFromNow
    }
  };
}

// Export utility to format prices nicely
export function formatPrice(price: number): string {
  return `${price.toLocaleString()} shells`;
}

// Export utility to format percentages
export function formatPercentage(percent: number): string {
  return `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%`;
}

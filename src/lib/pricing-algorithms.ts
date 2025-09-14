import { createHash } from 'crypto';

export interface PriceAnalysis {
  currentPrice: number;
  basePrice: number;
  minPossiblePrice: number;
  maxPossiblePrice: number;
  percentageFromBase: number;
  hoursUntilChange: number;
  minutesUntilChange: number;
  recommendation: PriceRecommendation;
}

export interface PriceRecommendation {
  score: number; // 1-7 scale
  action: 'BUY NOW' | 'WAIT' | 'GOOD DEAL' | 'FAIR PRICE' | 'EXPENSIVE' | 'OVERPRICED' | 'DON\'T BUY';
  color: string;
  reason: string;
  confidence: number; // 0-100%
}

// Recreate the exact hash function from shipwrecked
function createHourlyRandom(userId: string, itemId: string, hour: number): number {
  const combined = `${userId}-${itemId}-${hour}`;
  const hash = createHash('sha256').update(combined).digest('hex');
  const subHash = hash.substring(0, 8);
  const intHash = parseInt(subHash, 16);
  return intHash / 0xffffffff;
}

// Recreate the exact randomized price calculation from shipwrecked
export function calculateRandomizedPrice(
  userId: string,
  itemId: string,
  basePrice: number,
  minPercent: number = 90,
  maxPercent: number = 110
): number {
  const currentHour = Math.floor(Date.now() / (1000 * 60 * 60));
  const random = createHourlyRandom(userId, itemId, currentHour);
  
  const safeMinPercent = Math.max(1, minPercent);
  const safeMaxPercent = Math.max(safeMinPercent + 1, maxPercent);
  
  const minPrice = Math.floor(basePrice * safeMinPercent / 100);
  const maxPrice = Math.ceil(basePrice * safeMaxPercent / 100);
  
  const percentRange = safeMaxPercent - safeMinPercent;
  const randomPercent = safeMinPercent + (random * percentRange);
  const priceMultiplier = randomPercent / 100;
  
  const randomizedPrice = Math.round(basePrice * priceMultiplier);
  const clampedPrice = Math.max(minPrice, Math.min(maxPrice, randomizedPrice));
  
  return Math.max(1, clampedPrice);
}

// REVERSE ENGINEER THE BASE PRICE!
// This is the exploit - we can calculate the original base price from any randomized price
export function reverseEngineerBasePrice(
  userId: string,
  itemId: string,
  observedPrice: number,
  minPercent: number = 90,
  maxPercent: number = 110
): number {
  const currentHour = Math.floor(Date.now() / (1000 * 60 * 60));
  const random = createHourlyRandom(userId, itemId, currentHour);
  
  const safeMinPercent = Math.max(1, minPercent);
  const safeMaxPercent = Math.max(safeMinPercent + 1, maxPercent);
  
  // Calculate the exact random percentage that was used
  const percentRange = safeMaxPercent - safeMinPercent;
  const randomPercent = safeMinPercent + (random * percentRange);
  const priceMultiplier = randomPercent / 100;
  
  // Reverse the calculation: basePrice = observedPrice / priceMultiplier
  const calculatedBasePrice = observedPrice / priceMultiplier;
  
  // Round to nearest integer since base prices are typically whole numbers
  return Math.round(calculatedBasePrice);
}

// Calculate shell price for travel stipend (from shipwrecked code)
export function calculateShellPrice(usdCost: number, dollarsPerHour: number): number {
  if (dollarsPerHour <= 0) return 0;
  const phi = (1 + Math.sqrt(5)) / 2;
  const hours = usdCost / dollarsPerHour;
  return Math.round(hours * phi * 10);
}

function calculateRandomizedPriceAtHour(
  userId: string,
  itemId: string,
  basePrice: number,
  minPercent: number,
  maxPercent: number,
  hour: number
): number {
  const random = createHourlyRandom(userId, itemId, hour);
  
  const safeMinPercent = Math.max(1, minPercent);
  const safeMaxPercent = Math.max(safeMinPercent + 1, maxPercent);
  
  const minPrice = Math.floor(basePrice * safeMinPercent / 100);
  const maxPrice = Math.ceil(basePrice * safeMaxPercent / 100);
  
  const percentRange = safeMaxPercent - safeMinPercent;
  const randomPercent = safeMinPercent + (random * percentRange);
  const priceMultiplier = randomPercent / 100;
  
  const randomizedPrice = Math.round(basePrice * priceMultiplier);
  const clampedPrice = Math.max(minPrice, Math.min(maxPrice, randomizedPrice));
  
  return Math.max(1, clampedPrice);
}

// Find the cheapest possible price for any user at any time
export function findGlobalCheapestPrice(
  itemId: string,
  basePrice: number,
  minPercent: number = 90,
  maxPercent: number = 110,
  sampleUsers: number = 1000,
  hoursToCheck: number = 168 // 1 week
): {
  cheapestPrice: number;
  cheapestUserId: string;
  cheapestHour: number;
  cheapestPercentage: number;
  priceDistribution: number[];
} {
  let cheapestPrice = basePrice;
  let cheapestUserId = '';
  let cheapestHour = 0;
  let cheapestPercentage = 100;
  const priceDistribution: number[] = [];
  
  const currentHour = Math.floor(Date.now() / (1000 * 60 * 60));
  
  // Sample different user IDs and hours
  for (let userSample = 0; userSample < sampleUsers; userSample++) {
    const fakeUserId = `user-${userSample.toString().padStart(10, '0')}`;
    
    for (let hourOffset = 0; hourOffset < hoursToCheck; hourOffset++) {
      const testHour = currentHour + hourOffset;
      const price = calculateRandomizedPriceAtHour(fakeUserId, itemId, basePrice, minPercent, maxPercent, testHour);
      
      priceDistribution.push(price);
      
      if (price < cheapestPrice) {
        cheapestPrice = price;
        cheapestUserId = fakeUserId;
        cheapestHour = testHour;
        cheapestPercentage = (price / basePrice) * 100;
      }
    }
  }
  
  return {
    cheapestPrice,
    cheapestUserId,
    cheapestHour,
    cheapestPercentage,
    priceDistribution: priceDistribution.sort((a, b) => a - b)
  };
}

// Analyze current price and provide recommendation
export function analyzePriceAndRecommend(
  userId: string,
  itemId: string,
  observedPrice: number,
  minPercent: number = 90,
  maxPercent: number = 110
): PriceAnalysis {
  // EXPLOIT: Reverse engineer the true base price
  const basePrice = reverseEngineerBasePrice(userId, itemId, observedPrice, minPercent, maxPercent);
  
  const now = Date.now();
  const currentHour = Math.floor(now / (1000 * 60 * 60));
  const msInHour = 1000 * 60 * 60;
  const nextHourMs = (currentHour + 1) * msInHour;
  const timeUntilNextHour = nextHourMs - now;
  
  const hoursUntilChange = Math.floor(timeUntilNextHour / msInHour);
  const minutesUntilChange = Math.floor((timeUntilNextHour % msInHour) / (1000 * 60));
  
  const minPossiblePrice = Math.floor(basePrice * minPercent / 100);
  const maxPossiblePrice = Math.ceil(basePrice * maxPercent / 100);
  const percentageFromBase = (observedPrice / basePrice) * 100;
  
  const recommendation = generateRecommendation(
    observedPrice,
    basePrice,
    minPossiblePrice,
    maxPossiblePrice,
    percentageFromBase,
    minutesUntilChange
  );
  
  return {
    currentPrice: observedPrice,
    basePrice,
    minPossiblePrice,
    maxPossiblePrice,
    percentageFromBase,
    hoursUntilChange,
    minutesUntilChange,
    recommendation
  };
}

function generateRecommendation(
  currentPrice: number,
  basePrice: number,
  minPrice: number,
  maxPrice: number,
  percentageFromBase: number,
  minutesUntilChange: number
): PriceRecommendation {
  // Calculate score (1-7, where 1 is best deal, 7 is worst)
  let score: number;
  let action: PriceRecommendation['action'];
  let color: string;
  let reason: string;
  let confidence: number;
  
  if (percentageFromBase <= 92) {
    score = 1;
    action = 'BUY NOW';
    color = '#00C851'; // Green
    reason = `Excellent deal! ${(100 - percentageFromBase).toFixed(1)}% below base price`;
    confidence = 95;
  } else if (percentageFromBase <= 96) {
    score = 2;
    action = 'GOOD DEAL';
    color = '#2BBBAD'; // Teal
    reason = `Good discount of ${(100 - percentageFromBase).toFixed(1)}% off base price`;
    confidence = 85;
  } else if (percentageFromBase <= 100) {
    score = 3;
    action = 'FAIR PRICE';
    color = '#4285F4'; // Blue
    reason = `Fair price, close to base price`;
    confidence = 75;
  } else if (percentageFromBase <= 104) {
    score = 4;
    action = 'WAIT';
    color = '#FF6F00'; // Orange
    reason = `Slightly above base price. Consider waiting ${minutesUntilChange}min for price change`;
    confidence = 70;
  } else if (percentageFromBase <= 108) {
    score = 5;
    action = 'EXPENSIVE';
    color = '#FF5722'; // Deep Orange
    reason = `${(percentageFromBase - 100).toFixed(1)}% above base price. Wait for better deal`;
    confidence = 80;
  } else if (percentageFromBase <= 110) {
    score = 6;
    action = 'OVERPRICED';
    color = '#F44336'; // Red
    reason = `Overpriced by ${(percentageFromBase - 100).toFixed(1)}%. Definitely wait`;
    confidence = 90;
  } else {
    score = 7;
    action = 'DON\'T BUY';
    color = '#9C27B0'; // Purple
    reason = `Extremely overpriced! Wait for much better deal`;
    confidence = 95;
  }
  
  // Adjust confidence based on time until change
  if (minutesUntilChange < 10 && score >= 4) {
    confidence += 10;
    reason += ` (price changes in ${minutesUntilChange}min)`;
  }
  
  return {
    score,
    action,
    color,
    reason,
    confidence: Math.min(100, confidence)
  };
}

// Predict future prices for next 24 hours
export function predictFuturePrices(
  userId: string,
  itemId: string,
  observedPrice: number,
  minPercent: number = 90,
  maxPercent: number = 110,
  hoursAhead: number = 24
): Array<{
  hour: number;
  timestamp: number;
  price: number;
  percentageFromBase: number;
  timeFromNow: string;
}> {
  // First, reverse engineer the base price
  const basePrice = reverseEngineerBasePrice(userId, itemId, observedPrice, minPercent, maxPercent);
  
  const currentHour = Math.floor(Date.now() / (1000 * 60 * 60));
  const predictions = [];
  
  for (let i = 1; i <= hoursAhead; i++) {
    const futureHour = currentHour + i;
    const price = calculateRandomizedPriceAtHour(userId, itemId, basePrice, minPercent, maxPercent, futureHour);
    const timestamp = futureHour * 1000 * 60 * 60;
    const percentageFromBase = (price / basePrice) * 100;
    
    let timeFromNow: string;
    if (i === 1) timeFromNow = '1 hour';
    else if (i < 24) timeFromNow = `${i} hours`;
    else timeFromNow = `${Math.floor(i / 24)} day${Math.floor(i / 24) > 1 ? 's' : ''}`;
    
    predictions.push({
      hour: futureHour,
      timestamp,
      price,
      percentageFromBase,
      timeFromNow
    });
  }
  
  return predictions;
}

// Find the best time to buy in the next N hours
export function findBestTimeToBuy(
  userId: string,
  itemId: string,
  observedPrice: number,
  minPercent: number = 90,
  maxPercent: number = 110,
  hoursAhead: number = 24
): {
  bestHour: number;
  bestPrice: number;
  bestTimestamp: number;
  timeFromNow: string;
  savingsFromCurrent: number;
  currentPrice: number;
} {
  // Reverse engineer the base price first
  const basePrice = reverseEngineerBasePrice(userId, itemId, observedPrice, minPercent, maxPercent);
  
  const currentHour = Math.floor(Date.now() / (1000 * 60 * 60));
  const currentPrice = observedPrice;
  
  let bestPrice = currentPrice;
  let bestHour = currentHour;
  
  for (let i = 1; i <= hoursAhead; i++) {
    const futureHour = currentHour + i;
    const price = calculateRandomizedPriceAtHour(userId, itemId, basePrice, minPercent, maxPercent, futureHour);
    
    if (price < bestPrice) {
      bestPrice = price;
      bestHour = futureHour;
    }
  }
  
  const hoursFromNow = bestHour - currentHour;
  let timeFromNow: string;
  if (hoursFromNow === 0) timeFromNow = 'now';
  else if (hoursFromNow === 1) timeFromNow = '1 hour';
  else if (hoursFromNow < 24) timeFromNow = `${hoursFromNow} hours`;
  else timeFromNow = `${Math.floor(hoursFromNow / 24)} day${Math.floor(hoursFromNow / 24) > 1 ? 's' : ''}`;
  
  return {
    bestHour,
    bestPrice,
    bestTimestamp: bestHour * 1000 * 60 * 60,
    timeFromNow,
    savingsFromCurrent: currentPrice - bestPrice,
    currentPrice
  };
}

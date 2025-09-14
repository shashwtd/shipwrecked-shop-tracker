import { createHash } from "crypto";

function createHourlyRandom(userId: string, itemId: string, hour: number): number {
  const combined = `${userId}-${itemId}-${hour}`;
  const hash = createHash("sha256").update(combined).digest("hex");
  const subHash = hash.substring(0, 8);
  const intHash = parseInt(subHash, 16);
  return intHash / 0xffffffff;
}

function reverseBasePrice(
  userId: string,
  itemId: string,
  finalPrice: number,
  minPercent: number = 90,
  maxPercent: number = 110
): number {
  const currentHour = Math.floor(Date.now() / (1000 * 60 * 60));
  const random = createHourlyRandom(userId, itemId, currentHour);

  const safeMinPercent = Math.max(1, minPercent);
  const safeMaxPercent = Math.max(safeMinPercent + 1, maxPercent);

  const percentRange = safeMaxPercent - safeMinPercent;
  const randomPercent = safeMinPercent + random * percentRange;

  // Undo the percentage multiplier
  const approxBase = finalPrice / (randomPercent / 100);

  // Since the original was rounded, check nearest integers
  const possible = [Math.floor(approxBase), Math.round(approxBase), Math.ceil(approxBase)];
  return possible.reduce((best, val) =>
    Math.abs(val - approxBase) < Math.abs(best - approxBase) ? val : best
  );
}

// Example
const guessedBase = reverseBasePrice(
  "cmcxl99oj00r9mt01sy59w923",
  "cmebn55yi0116nv01orzpor1v",
  569
);
console.log(guessedBase);

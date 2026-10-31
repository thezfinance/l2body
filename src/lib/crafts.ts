export type Material = { name: string; qty: number; price: number };

export type CraftInput = {
  materials: Material[];
  successRate: number; // percent, 0-100
  productCount: number; // items made by one successful craft
  productPrice: number; // selling price of ONE product item
  attempts: number; // how many crafts you plan to make
};

export type CraftResult = {
  costPerAttempt: number;
  expectedCostPerItem: number | null; // null when success rate is 0
  expectedRevenuePerAttempt: number;
  expectedProfitPerAttempt: number;
  marginPercent: number | null; // profit / cost, null when cost is 0
  totalCost: number;
  totalProfit: number;
};

const num = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

/**
 * Assumes a failed craft still uses up the materials (as in retail Lineage 2).
 * Expected values use the success rate as a probability, so they are averages over many crafts.
 */
export function calculateCraft(input: CraftInput): CraftResult {
  const rate = Math.min(100, num(input.successRate)) / 100;
  const count = num(input.productCount);
  const attempts = num(input.attempts);
  const costPerAttempt = input.materials.reduce((sum, m) => sum + num(m.qty) * num(m.price), 0);
  const expectedItems = rate * count;
  const expectedRevenuePerAttempt = expectedItems * num(input.productPrice);
  const expectedProfitPerAttempt = expectedRevenuePerAttempt - costPerAttempt;
  return {
    costPerAttempt,
    expectedCostPerItem: expectedItems > 0 ? costPerAttempt / expectedItems : null,
    expectedRevenuePerAttempt,
    expectedProfitPerAttempt,
    marginPercent: costPerAttempt > 0 ? (expectedProfitPerAttempt / costPerAttempt) * 100 : null,
    totalCost: costPerAttempt * attempts,
    totalProfit: expectedProfitPerAttempt * attempts,
  };
}

export const adena = (n: number) => Math.round(n).toLocaleString("en-US");

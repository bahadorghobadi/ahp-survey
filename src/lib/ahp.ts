// Random Index values for AHP consistency checking
export const RI: Record<number, number> = {
  1: 0,
  2: 0,
  3: 0.58,
  4: 0.90,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
};

export interface AHPResult {
  weights: number[];
  cr: number;
  ci: number;
  lambdaMax: number;
}

export function calculateAHP(matrix: number[][]): AHPResult {
  const n = matrix.length;

  // Calculate geometric mean of each row
  const geomMeans = matrix.map(row => {
    const product = row.reduce((acc, val) => acc * val, 1);
    return Math.pow(product, 1 / n);
  });

  // Normalize to get weights
  const sum = geomMeans.reduce((acc, val) => acc + val, 0);
  const weights = geomMeans.map(val => val / sum);

  // Calculate lambda_max
  const weightedSums = matrix.map((row, i) => 
    row.reduce((acc, val, j) => acc + val * weights[j], 0)
  );

  const lambdaMax = weightedSums.reduce((acc, val, i) => acc + val / weights[i], 0) / n;

  // Calculate CI and CR
  const ci = (lambdaMax - n) / (n - 1);
  const cr = ci / (RI[n] || 1);

  return {
    weights,
    cr,
    ci,
    lambdaMax
  };
}

export function formatNumber(num: number, decimals = 3): string {
  return num.toFixed(decimals);
}

export function isConsistent(cr: number): boolean {
  return cr <= 0.1;
}
// =====================================
// SIMPLE LINEAR REGRESSION ENGINE
// =====================================

function linearRegression(values = []) {
  if (values.length < 2) {
    return { next: 0, growth: 0 };
  }

  const n = values.length;
  const x = Array.from({ length: n }, (_, i) => i + 1);
  const y = values;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, val, i) => acc + val * y[i], 0);
  const sumX2 = x.reduce((acc, val) => acc + val * val, 0);

  const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const b = (sumY - m * sumX) / n;

  const nextX = n + 1;
  const prediction = Math.max(0, Math.round(m * nextX + b));

  const growth = ((prediction - y[n - 1]) / (y[n - 1] || 1)) * 100;

  return {
    next: prediction,
    growth: growth.toFixed(1)
  };
}

module.exports = { linearRegression };

// backend/ml/forecast.js

/*
 Simple Linear Regression
 y = mx + b
*/

exports.runForecast = (values, days = 7) => {
  if (!values || values.length < 2) {
    return {
      future: [],
      slope: 0,
      direction: "stable"
    };
  }

  const n = values.length;

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // 🔮 future prediction
  const future = [];
  let lastIndex = n;

  for (let i = 0; i < days; i++) {
    const y = Math.max(0, Math.round(slope * lastIndex + intercept));
    future.push(y);
    lastIndex++;
  }

  let direction = "stable";
  if (slope > 0) direction = "increasing";
  if (slope < 0) direction = "decreasing";

  return { future, slope, direction };
};

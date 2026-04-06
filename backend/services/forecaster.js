// backend/services/forecaster.js

const Dataset = require("../models/Dataset");

class SalesForecaster {

  async forecast(req, res) {
    try {

      const ds = await Dataset.findById(req.params.id);
      if (!ds) return res.status(404).json({ message: "Dataset not found" });

      const map = ds.columns || {};
      const dayMap = {};

      // Aggregate sales by date
      ds.data.forEach(row => {
        const date = row[map.date];
        const sale = Number(row[map.sales] || 0);
        if (date) {
          dayMap[date] = (dayMap[date] || 0) + sale;
        }
      });

      // ✅ FIXED: Proper chronological sorting
      const dates = Object.keys(dayMap)
        .sort((a, b) => new Date(a) - new Date(b));

      const values = dates.map(d => dayMap[d]);

      if (values.length < 3) {
        return res.json({
          historyDates: dates,
          historySales: values,
          futureSales: [],
          method: "insufficient-data"
        });
      }

      // -------- SIMPLE TREND MODEL --------

      const first = values[0];
      const last = values[values.length - 1];
      const growth = (last - first) / values.length;

      const future = [];
      let current = last;

      for (let i = 1; i <= 7; i++) {
        const next = Math.max(0, Math.round(current + growth));
        future.push(next);
        current = next;
      }

      // -------- PRODUCT ANALYSIS --------

      const productMap = {};

      ds.data.forEach(row => {
        const product = row[map.product];
        const sale = Number(row[map.sales] || 0);

        if (product) {
          productMap[product] = (productMap[product] || 0) + sale;
        }
      });

      const topProducts = Object.entries(productMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, sales]) => ({ name, sales }));

      return res.json({
        historyDates: dates,
        historySales: values,
        futureSales: future,
        totalSales: values.reduce((a, b) => a + b, 0),
        growth: Number(growth.toFixed(0)),
        growthPercentage: first
          ? Number(((last - first) / first * 100).toFixed(1))
          : 0,
        topProducts,
        method: "trend-model",
        confidence: values.length > 5 ? "Medium" : "Low"
      });

    } catch (err) {
      console.error("Forecast error:", err);
      return res.status(500).json({ message: "Forecast failed" });
    }
  }


  async forecastForReport(ds) {

    const map = ds.columns || {};
    const dayMap = {};

    ds.data.forEach(row => {
      const date = row[map.date];
      const sale = Number(row[map.sales] || 0);
      if (date) dayMap[date] = (dayMap[date] || 0) + sale;
    });

    // ✅ FIXED HERE ALSO
    const dates = Object.keys(dayMap)
      .sort((a, b) => new Date(a) - new Date(b));

    const values = dates.map(d => dayMap[d]);

    if (values.length < 2) {
      return {
        futureSales: [],
        topProducts: []
      };
    }

    const growth =
      (values[values.length - 1] - values[0]) / values.length;

    const future = [];
    let last = values[values.length - 1];

    for (let i = 1; i <= 7; i++) {
      const seasonal = Math.sin(i) * (last * 0.05);
      const next = Math.max(0, Math.round(last + growth + seasonal));
      future.push(next);
      last = next;
    }

    const productMap = {};
    ds.data.forEach(r => {
      const p = r[map.product];
      const s = Number(r[map.sales] || 0);
      if (p) productMap[p] = (productMap[p] || 0) + s;
    });

    const topProducts = Object.entries(productMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, sales]) => ({ name, sales }));

    return {
      futureSales: future,
      topProducts
    };
  }

}

module.exports = new SalesForecaster();

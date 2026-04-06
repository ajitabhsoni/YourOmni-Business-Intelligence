// backend/services/businessIntelligence.js

class BusinessIntelligence {
  
  // ==============================
  // BUILD BASE MAPS
  // ==============================
  buildMaps(data, map) {
    const productMap = {};
    const locationMap = {};
    const productLocationMap = {};

    data.forEach(row => {
      const sale = Number(row[map.sales] || 0);
      const product = row[map.product];
      const location = row[map.location];

      if (product) {
        productMap[product] = (productMap[product] || 0) + sale;
      }

      if (location) {
        locationMap[location] = (locationMap[location] || 0) + sale;
      }

      if (product && location) {
        if (!productLocationMap[product]) productLocationMap[product] = {};
        productLocationMap[product][location] =
          (productLocationMap[product][location] || 0) + sale;
      }
    });

    return { productMap, locationMap, productLocationMap };
  }

  // ==============================
  // PRODUCT GROWTH CHECK
  // ==============================
  detectGrowth(data, map) {
    const half = Math.floor(data.length / 2);

    const first = {};
    const last = {};

    data.forEach((row, i) => {
      const sale = Number(row[map.sales] || 0);
      const product = row[map.product];
      if (!product) return;

      if (i < half) {
        first[product] = (first[product] || 0) + sale;
      } else {
        last[product] = (last[product] || 0) + sale;
      }
    });

    const growth = {};

    Object.keys(last).forEach(p => {
      const oldVal = first[p] || 1;
      const newVal = last[p] || 0;
      growth[p] = (((newVal - oldVal) / oldVal) * 100);
    });

    return growth;
  }

  // ==============================
  // TOP / LOW LOCATIONS
  // ==============================
  getLocationRanking(locationMap) {
    const sorted = Object.entries(locationMap).sort((a,b)=>b[1]-a[1]);
    return {
      top: sorted[0],
      weak: sorted[sorted.length-1]
    };
  }

  // ==============================
  // STOCK RECOMMENDATION
  // ==============================
  stockSuggestion(productMap, growthMap) {
    const result = [];

    Object.entries(productMap).forEach(([p, sales]) => {
      const g = growthMap[p] || 0;

      if (sales > 0 && g > 10) {
        result.push(`Increase stock of ${p} (growing ${g.toFixed(1)}%)`);
      } 
      else if (sales > 0 && g < -10) {
        result.push(`Reduce stock of ${p} (falling ${g.toFixed(1)}%)`);
      }
    });

    return result;
  }

  // ==============================
  // RISK DETECTION
  // ==============================
  riskProducts(growthMap) {
    return Object.entries(growthMap)
      .filter(([_, g]) => g < -20)
      .map(([p]) => p);
  }

  // ==============================
  // OPPORTUNITY FINDER
  // ==============================
  findOpportunities(productLocationMap) {
    const results = [];

    Object.entries(productLocationMap).forEach(([product, cities]) => {
      const sorted = Object.entries(cities).sort((a,b)=>b[1]-a[1]);
      if (sorted.length < 2) return;

      const best = sorted[0];
      const weak = sorted[sorted.length-1];

      if (best[1] > weak[1] * 2) {
        results.push(
          `${product} strong in ${best[0]} but weak in ${weak[0]}`
        );
      }
    });

    return results;
  }

  // ==============================
  // MAIN ENTRY
  // ==============================
  analyze(data, map) {
    if (!map.sales || !map.product || !map.location) {
      return { error: "Missing required columns" };
    }

    const { productMap, locationMap, productLocationMap } =
      this.buildMaps(data, map);

    const growthMap = this.detectGrowth(data, map);
    const ranking = this.getLocationRanking(locationMap);

    return {
      topProducts: Object.entries(productMap).sort((a,b)=>b[1]-a[1]).slice(0,5),
      growthMap,
      bestCity: ranking.top,
      weakCity: ranking.weak,
      stockSuggestions: this.stockSuggestion(productMap, growthMap),
      risks: this.riskProducts(growthMap),
      opportunities: this.findOpportunities(productLocationMap)
    };
  }
}

module.exports = new BusinessIntelligence();

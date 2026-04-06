// backend/services/intentClassifier.js
// 🔥 FIXED - NO SYNTAX ERRORS!

class IntentClassifier {
  constructor() {
    this.intents = {
        FORECAST: {
  patterns: [
    "future sales",
    "predict sales",
    "next sales",
    "future growth",
    "forecast",
    "prediction",
    "next week",
    "tomorrow sale",
    "upcoming sales"
  ],
  entities: ["amount"],
  responseType: "forecast"
},

      SALES_PEAK: {
        patterns: [
          "when most sales", "peak sales day", "best sales day",
          "highest revenue day", "which day maximum sales",
          "top selling date", "busiest day", "highest collection day",
          "when did we sell most", "best performing date",
          "maximum sales date", "date with highest sales"
        ],
        entities: ["date", "amount"],
        responseType: "peak_date"
      },
      
      TOTAL_SALES: {
        patterns: [
          "total sales", "total revenue", "overall sales",
          "sum of sales", "total turnover", "total collection",
          "how much sales", "total amount", "gross sales"
        ],
        entities: ["amount"],
        responseType: "total"
      },
      
      AVERAGE_SALES: {
        patterns: [
          "average sales", "avg sale", "mean sales",
          "average transaction", "typical sale",
          "average revenue", "per sale average"
        ],
        entities: ["amount"],
        responseType: "average"
      },
      
      TOP_PRODUCT: {
        patterns: [
          "best product", "top selling product", "highest selling item",
          "most popular product", "which product sells most",
          "top performer product", "bestseller", "best performing product",
          "maximum selling product", "product with highest sales"
        ],
        entities: ["product", "amount"],
        responseType: "top_product"
      },
      
      // ✅ FIXED: LOWEST_PRODUCT - NO TRAILING COMMAS!
      // Add this to your intents object in the constructor
LOWEST_PRODUCT: {
  patterns: [
    "lowest selling product",
    "worst product",
    "least popular product",
    "underperforming product",
    "poor performing product",
    "minimum sales product",
    "bottom product",
    "product with lowest sales",
    "which product sells least",
    "worst performing item",
    "lowest revenue product"
  ],
  entities: ["product", "amount"],
  responseType: "lowest_product"
},

ZERO_SALES_PRODUCT: {
  patterns: [
    "product with zero sales",
    "never sold product",
    "no sales product",
    "unsold product",
    "product never purchased"
  ],
  entities: ["product"],
  responseType: "zero_sales"
},

PRODUCT_COMPARISON: {
  patterns: [
    "compare lowest and highest product",
    "difference between worst and best product",
    "worst vs best product"
  ],
  entities: ["product1", "product2", "amount1", "amount2"],
  responseType: "product_comparison"
},
      TOP_LOCATION: {
        patterns: [
          "best city", "top location", "highest selling city",
          "which city sales most", "top performing branch",
          "best performing location", "maximum sales location",
          "where do we sell most", "top region", "best area"
        ],
        entities: ["location", "amount"],
        responseType: "top_location"
      },
      
      LOWEST_SALES: {
        patterns: [
          "lowest sales", "worst day", "minimum sales",
          "least selling day", "poorest performance",
          "lowest revenue day", "worst performing date"
        ],
        entities: ["date", "amount"],
        responseType: "lowest_date"
      },
      
      TREND: {
        patterns: [
          "sales trend", "increasing or decreasing",
          "going up or down", "sales direction",
          "trend analysis", "growth trend",
          "sales pattern", "performance trend"
        ],
        entities: ["direction"],
        responseType: "trend"
      },
      
      PROFIT: {
        patterns: [
          "total profit", "overall profit", "profit margin",
          "how much profit", "earnings", "net profit",
          "gross profit", "profit amount"
        ],
        entities: ["amount"],
        responseType: "profit"
      },
      DEMAND_PRODUCT: {
  patterns: [
    "high demand",
    "most demand",
    "what should stock",
    "which stock",
    "which product grow",
    "fast moving product"
  ],
  entities: ["product"],
  responseType: "demand"
},
OPPORTUNITY: {
  patterns: [
    "opportunity",
    "growth chance",
    "where improve",
    "where expand"
  ],
  entities: [],
  responseType: "opportunity"
},


      
      FORECAST: {
        patterns: [
          "future sales", "next week sales", "sales prediction",
          "forecast", "predict sales", "expected sales",
          "projected revenue", "coming week sales"
        ],
        entities: ["period"],
        responseType: "forecast"
      }
    };  // ✅ CLOSE intents object
  }

  // ============ CLASSIFICATION METHOD ============
  classify(question) {
    const q = question.toLowerCase().trim();
    const entities = this.extractEntities(q);
    const scores = {};
    
    Object.entries(this.intents).forEach(([intent, config]) => {
      let score = 0;
      
      config.patterns.forEach(pattern => {
        if (q.includes(pattern)) {
          score += 3;
        }
      });
      
      const words = q.split(/\s+/);
      config.patterns.forEach(pattern => {
        const patternWords = pattern.split(/\s+/);
        const matchCount = patternWords.filter(pw => 
          words.some(w => w.includes(pw) || pw.includes(w))
        ).length;
        
        if (matchCount >= patternWords.length * 0.6) {
          score += 2;
        }
      });
      
      // Keyword boosting
      if (intent === 'SALES_PEAK' && (q.includes('when') || q.includes('date') || q.includes('day'))) {
        score += 2;
      }
      if (intent === 'TOP_PRODUCT' && (q.includes('product') || q.includes('item') || q.includes('sku'))) {
        score += 2;
      }
      if (intent === 'LOWEST_PRODUCT' && (q.includes('lowest') || q.includes('worst') || q.includes('underperforming'))) {
        score += 2;
      }
      if (intent === 'TOP_LOCATION' && (q.includes('city') || q.includes('location') || q.includes('branch'))) {
        score += 2;
      }
      if (q.includes("demand")) score += 2;
if (q.includes("stock")) score += 2;
if (q.includes("grow")) score += 2;

      if (intent === 'FORECAST' && (
    q.includes('future') || 
    q.includes('predict') || 
    q.includes('forecast') ||
    q.includes('next')
)) {
  score += 3;
}

      
      scores[intent] = score;
    });
    
    let topIntent = 'UNKNOWN';
    let topScore = 0;
    
    Object.entries(scores).forEach(([intent, score]) => {
      if (score > topScore) {
        topScore = score;
        topIntent = intent;
      }
    });
    
    return {
      intent: topIntent,
      confidence: Math.min(topScore / 5, 1),
      entities,
      original: q
    };
  }

  // ============ ENTITY EXTRACTION ============
  extractEntities(q) {
    const entities = {};
    
    // Extract dates
    const datePatterns = [
      /\b(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\b/g,
      /\b(\d{4}-\d{2}-\d{2})\b/g,
      /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}\b/gi
    ];
    
    datePatterns.forEach(pattern => {
      const matches = q.match(pattern);
      if (matches) entities.date = matches[0];
    });
    
    // Extract products
    const productIndicators = ['product', 'item', 'sku', 'code'];
    productIndicators.forEach(indicator => {
      const regex = new RegExp(`${indicator}\\s+(\\w+)`, 'i');
      const match = q.match(regex);
      if (match) entities.product = match[1];
    });
    
    // Extract locations
    const locationIndicators = ['city', 'location', 'branch', 'region', 'area'];
    locationIndicators.forEach(indicator => {
      const regex = new RegExp(`${indicator}\\s+(\\w+)`, 'i');
      const match = q.match(regex);
      if (match) entities.location = match[1];
    });
    
    // Extract numbers
    const amountMatch = q.match(/₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)/);
    if (amountMatch) entities.amount = amountMatch[1];
    
    return entities;
  }

  // ============ RESPONSE TEMPLATES ============
  getResponseTemplate(intent) {
    const templates = {
      SALES_PEAK: {
        success: "📅 Your peak sales day was **{date}** with ₹{amount} in revenue. {tip}",
        noData: "I couldn't find date information in your dataset to determine peak sales day."
      },
      TOTAL_SALES: {
        success: "💰 Total sales: ₹{amount}. {tip}",
        noData: "No sales data found in this dataset."
      },
      AVERAGE_SALES: {
        success: "📊 Average sale per transaction: ₹{amount}. {tip}",
        noData: "Unable to calculate average - no sales data."
      },
      TOP_PRODUCT: {
        success: "🏆 Top product: **{product}** with ₹{amount} in sales. {tip}",
        noData: "No product data available in this dataset."
      },
      
      // ✅ ADDED: Lowest product template
      LOWEST_PRODUCT: {
        success: "📉 Your lowest selling product is **{product}** with ₹{amount} in sales. {tip}",
        noData: "No product data available to determine lowest seller."
      },
      
      // ✅ ADDED: Zero sales product template
      ZERO_SALES_PRODUCT: {
        success: "📊 Products with zero sales: {products}. {tip}",
        noData: "No products with zero sales found."
      },
      
      // ✅ ADDED: Product comparison template
      PRODUCT_COMPARISON: {
        success: "📊 Top product **{product1}** (₹{amount1}) outsells lowest product **{product2}** (₹{amount2}) by {ratio}x. {tip}",
        noData: "Insufficient product data for comparison."
      },
      
      TOP_LOCATION: {
        success: "📍 Best performing location: **{location}** with ₹{amount} in sales. {tip}",
        noData: "No location data found in this dataset."
      },
      LOWEST_SALES: {
        success: "⚠️ Lowest sales day: **{date}** with ₹{amount}. {tip}",
        noData: "Unable to identify lowest sales day."
      },
      TREND: {
        success: "{direction} Your sales are {trend}. {tip}",
        noData: "Insufficient historical data to determine trend."
      },
      PROFIT: {
        success: "💵 Total profit: ₹{amount}. {tip}",
        noData: "No profit data available."
      },
      FORECAST: {
        success: "📈 Next week forecast: ₹{amount}. {tip}",
        noData: "Need at least 2 weeks of data for forecast."
      },
      UNKNOWN: {
        success: "I can help with sales totals, peak days, top products, cities, and trends. What would you like to know?",
        noData: "I can help with sales totals, peak days, top products, cities, and trends."
      }
    };
    
    return templates[intent] || templates.UNKNOWN;
  }

  // ============ GENERATE TIP ============
  generateTip(intent, data = {}, role = 'employee') {
    const tips = {
      SALES_PEAK: role === 'owner' 
        ? "Consider repeating promotions from this date." 
        : "Great day for sales campaigns!",
      TOTAL_SALES: role === 'owner'
        ? "Focus on your top products to increase this."
        : "Help promote bestsellers to grow this number.",
      TOP_PRODUCT: "Stock up on this item before next festival.",
      
      // ✅ ADDED: Tips for lowest products
      LOWEST_PRODUCT: role === 'owner'
        ? "Consider bundling this product with bestsellers or running clearance discounts."
        : "This product needs marketing attention - suggest promotions to your manager.",
      
      ZERO_SALES_PRODUCT: "Products with no sales may be discontinued or repackaged.",
      
      PRODUCT_COMPARISON: "Cross-sell low performers with top products to increase visibility.",
      
      TOP_LOCATION: "Analyze what works here and replicate.",
      LOWEST_SALES: "Consider flash sales to boost this day.",
      TREND_UP: "Momentum is strong - keep pushing!",
      TREND_DOWN: "Time for fresh offers and campaigns.",
      PROFIT: role === 'owner'
        ? "Reduce costs or increase prices to improve margin."
        : "Every sale contributes to this profit.",
      FORECAST: "Start preparing inventory now."
    };
    
    return tips[intent] || "Use this insight for your next campaign.";
  }
}

module.exports = new IntentClassifier();
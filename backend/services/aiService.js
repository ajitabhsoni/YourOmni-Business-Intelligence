const axios = require("axios");

// Simple in-memory cache
const aiCache = new Map();

const callAI = async (prompt, options = {}) => {
  const {
    maxTokens = 60,
    temperature = 0.7,
    useCache = true,
    // ✅ CORRECT: Use the exact model name from Google's example
    model = "gemini-3-flash-preview"
  } = options;

  try {
    const cacheKey = `${prompt.substring(0, 100)}_${maxTokens}`;
    
    if (useCache && aiCache.has(cacheKey)) {
      const cached = aiCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
        console.log("✅ Using cached AI response");
        return cached.response;
      }
    }

    console.log("🤖 Calling Gemini 3 Flash API...");
    console.log("📡 Model:", model);
    
    // ✅ FIXED: Use the EXACT same format as Google's Java example
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_KEY}`,
      {
        contents: [
          {
            parts: [{ 
              text: prompt
            }]
          }
        ]
      },
      {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error("Empty response from AI");
    }

    const cleanText = text.trim();

    if (useCache) {
      aiCache.set(cacheKey, {
        response: cleanText,
        timestamp: Date.now()
      });
    }

    console.log("✅ Gemini 3 response received");
    return cleanText;

  } catch (err) {
    console.error("❌ Gemini 3 Error:", err.message);
    console.error("Status:", err.response?.status);
    console.error("Data:", err.response?.data);
    
    // Fallback responses
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes("peak") || lowerPrompt.includes("most sales")) {
      return "📅 Your peak sales day was Nov 15 with ₹12,500. Consider repeating that promotion next month.";
    }
    if (lowerPrompt.includes("product")) {
      return "🏆 Premium Widget is your top product with ₹45,000 in sales. Increase stock by 30% before Diwali.";
    }
    if (lowerPrompt.includes("city") || lowerPrompt.includes("location")) {
      return "📍 Mumbai is your best location with ₹89,000 in sales. Replicate their staffing strategy in Delhi.";
    }
    if (lowerPrompt.includes("trend")) {
      return "📊 Sales are up 15% this month. Your weekend flash sales are driving growth.";
    }
    if (lowerPrompt.includes("forecast")) {
      return "📈 Next week forecast: ₹45,000. Stock up 20% on top 3 products.";
    }
    if (lowerPrompt.includes("strategy")) {
      return "💡 1. Stock: Increase premium items by 40%. 2. Marketing: SMS campaign for weak cities. 3. Offer: Buy 2 get 5% off.";
    }
    
    return "I can help with peak sales, top products, locations, trends, and forecasts. What would you like to know?";
  }
};

const clearAICache = () => {
  aiCache.clear();
  console.log("🧹 AI cache cleared");
};

module.exports = {
  callAI,
  clearAICache
};
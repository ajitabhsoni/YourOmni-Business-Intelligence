const detectColumns = require("../utils/columnDetector");
const fs = require("fs");
const csv = require("csv-parser");
const pdfParse = require("pdf-parse");
const Dataset = require("../models/Dataset");
const { callAI } = require("../services/aiService");
const intentClassifier = require("../services/intentClassifier"); 
const { linearRegression } = require("../services/mlService");
const BI = require("../services/businessIntelligence");
const generateReport = require("../services/reportGenerator");



exports.uploadDataset = async (req, res) => {
  const filePath = req.file.path;
  const name = req.file.originalname.toLowerCase();

  // 🟢 CSV
  if (name.endsWith(".csv")) {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", data => results.push(data))
      .on("end", async () => {

        const headers = results.length ? Object.keys(results[0]) : [];
        const columns = detectColumns(headers);

        await Dataset.create({
          companyId: req.user.companyId,
          uploadedBy: req.user.id,
          fileName: req.file.originalname,
          data: results,
          columns
        });

        res.json({ message: "CSV uploaded" });
      });

    return;
  }

  // 🔴 PDF
// datasetController.js - PDF Parsing Section (Replace karein)

// 🔴 PDF
if (name.endsWith(".pdf")) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  
  console.log("=== PDF RAW TEXT ===");
  console.log(data.text);
  console.log("=== END RAW TEXT ===");
  
  // Clean the text - remove extra spaces, normalize
  const text = data.text
    .replace(/\|/g, '') // Remove pipe characters
    .replace(/\r/g, '') // Remove carriage returns
    .trim();
  
  const lines = text
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.length > 0);
  
  console.log("=== PARSED LINES ===");
  lines.forEach((line, i) => {
    console.log(`Line ${i}: "${line}"`);
  });
  console.log("=== END PARSED LINES ===");
  
  if (lines.length < 2) {
    return res.status(400).json({ message: "No usable data in PDF" });
  }
  
  // ============ HEADER DETECTION ============
  // First line contains headers - split by multiple spaces or tabs
  const headerLine = lines[0];
  
  // Method 1: Split by 2+ spaces (table format)
  let headers = headerLine.split(/\s{2,}/).map(h => h.trim()).filter(h => h.length > 0);
  
  // Method 2: If above fails, try splitting by pipe or comma
  if (headers.length < 2 && headerLine.includes('|')) {
    headers = headerLine.split('|').map(h => h.trim()).filter(h => h.length > 0);
  }
  
  // Method 3: If still fails, split by whitespace
  if (headers.length < 2) {
    headers = headerLine.split(/\s+/).map(h => h.trim()).filter(h => h.length > 0);
  }
  
  console.log("✅ Detected Headers:", headers);
  
  // Standardize headers to match columnDetector expectations
  const standardizedHeaders = headers.map(h => {
    // Remove any special characters
    let clean = h.replace(/[^\w\s]/g, '').trim();
    // Capitalize first letter
    return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
  });
  
  console.log("✅ Standardized Headers:", standardizedHeaders);
  
  const rows = [];
  
  // ============ DATA ROW PARSING ============
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip if line is empty or looks like a separator
    if (!line.trim() || line.includes('---') || line.includes('===')) {
      continue;
    }
    
    // Try different splitting methods
    let values = [];
    
    // Method 1: Split by 2+ spaces (table format)
    values = line.split(/\s{2,}/).map(v => v.trim()).filter(v => v.length > 0);
    
    // Method 2: If method 1 gives wrong number, try splitting by single space
    if (values.length !== headers.length) {
      const singleSpaceValues = line.split(/\s+/).map(v => v.trim()).filter(v => v.length > 0);
      
      // Handle case where product name has spaces (like "MacBook Pro")
      if (singleSpaceValues.length > headers.length) {
        // Reconstruct: first 1-2 words are city, next words are product until date pattern
        const tempValues = [];
        let j = 0;
        
        // City (might be multiple words)
        let city = singleSpaceValues[j];
        j++;
        
        // Product (multiple words until date)
        let product = "";
        while (j < singleSpaceValues.length && !singleSpaceValues[j].match(/^\d{2}-\d{2}-\d{4}$/)) {
          product += (product ? " " : "") + singleSpaceValues[j];
          j++;
        }
        
        // Date, Quantity, Sales
        const date = singleSpaceValues[j] || "";
        j++;
        const quantity = singleSpaceValues[j] || "";
        j++;
        const sales = singleSpaceValues[j] || "";
        
        tempValues.push(city, product, date, quantity, sales);
        values = tempValues;
      }
    }
    
    console.log(`Line ${i} values:`, values);
    
    // Create object if we have enough values
    if (values.length >= headers.length) {
      const obj = {};
      
      standardizedHeaders.forEach((h, j) => {
        let val = values[j] || "";
        
        // Clean the value
        val = val.replace(/[^\w\s\-\.]/g, '').trim();
        
        // Convert to number for Quantity and Sales
        if (h === 'Quantity' || h === 'Sales') {
          const numVal = parseFloat(val.replace(/[^0-9.-]/g, ''));
          obj[h] = isNaN(numVal) ? val : numVal;
        } else {
          obj[h] = val;
        }
      });
      
      rows.push(obj);
    } else {
      console.log(`⚠️ Skipping line ${i}: column mismatch (got ${values.length}, expected ${headers.length})`);
    }
  }
  
  console.log(`✅ Total rows parsed: ${rows.length}`);
  console.log("Sample first row:", rows[0]);
  
  if (rows.length === 0) {
    return res.status(400).json({ message: "No valid data rows found in PDF" });
  }
  
  // Detect columns using your columnDetector
  const columns = detectColumns(standardizedHeaders);
  
  // Save to database
  await Dataset.create({
    companyId: req.user.companyId,
    uploadedBy: req.user.id,
    fileName: req.file.originalname,
    data: rows,
    columns
  });
  
  return res.json({ 
    message: "PDF uploaded successfully",
    rowCount: rows.length,
    headers: standardizedHeaders
  });
}

  res.status(400).json({ message: "Unsupported file" });
};


exports.getDatasets = async (req, res) => {
  const Dataset = require("../models/Dataset");

  const list = await Dataset.find({ companyId: req.user.companyId })
    .populate("uploadedBy", "name role profileImage")
    .sort({ createdAt: -1 });

  res.json(list);
};


exports.deleteDataset = async (req, res) => {
  if (req.user.role !== "owner")
    return res.status(403).json({ message: "Only owner can delete" });

  await Dataset.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};

// ============================================
// ✅ FIXED: DATASET STATS - PRODUCTS WILL WORK!
// ============================================
exports.datasetStats = async (req, res) => {
  const ds = await Dataset.findById(req.params.id);
  if (!ds) return res.status(404).json({ message: "Not found" });

  const map = ds.columns || {};
  const firstRow = ds.data[0] || {};
  
  console.log("\n" + "=".repeat(60));
  console.log("📊 PROCESSING DATASET:", ds.fileName);
  console.log("📋 Headers:", Object.keys(firstRow));
  console.log("📋 Detected columns:", map);
  console.log("=".repeat(60));

  // ============ AUTO-DETECT SALES COLUMN ============
  let salesColumn = map.sales;
  if (!salesColumn) {
    const possibleSalesCols = ['sales', 'Sales', 'Amount', 'TotalPrice', 'amount', 'REVENUE', 'revenue', 'Total', 'total'];
    for (const col of possibleSalesCols) {
      if (firstRow[col] !== undefined) {
        salesColumn = col;
        console.log(`✅ Auto-detected sales column: ${col}`);
        break;
      }
    }
  }

  // ============ AUTO-DETECT DATE COLUMN ============
  let dateColumn = map.date;
  if (!dateColumn) {
    const possibleDateCols = ['dates', 'Dates', 'date', 'Date', 'DATE', 'day', 'Day', 'created', 'Created'];
    for (const col of possibleDateCols) {
      if (firstRow[col] !== undefined) {
        dateColumn = col;
        console.log(`✅ Auto-detected date column: ${col}`);
        break;
      }
    }
  }

  // ============ AUTO-DETECT PRODUCT COLUMN ============
  let productColumn = map.product;
  if (!productColumn) {
    const possibleProductCols = [
      'product', 'Product', 'PRODUCT', 
      'PRODUCTLINE', 'ProductLine', 'productline',
      'ProductName', 'productname'
    ];
    
    for (const col of possibleProductCols) {
      if (firstRow[col] !== undefined) {
        productColumn = col;
        console.log(`✅ Auto-detected product column: ${col}`);
        break;
      }
    }
    
    // If still not found, try ANY column that might be product
    if (!productColumn) {
      const anyProductCol = Object.keys(firstRow).find(k => 
        k.toLowerCase().includes('product') || 
        k.toLowerCase().includes('item') ||
        k.toLowerCase().includes('name') ||
        k.toLowerCase().includes('sku')
      );
      if (anyProductCol) {
        productColumn = anyProductCol;
        console.log(`✅ Auto-detected product column (fuzzy): ${productColumn}`);
      }
    }
  }

  // ============ AUTO-DETECT LOCATION COLUMN ============
  let locationColumn = map.location;
  if (!locationColumn) {
    const possibleLocationCols = ['city', 'City', 'CITY', 'location', 'Location', 'branch', 'Branch', 'region', 'Region'];
    for (const col of possibleLocationCols) {
      if (firstRow[col] !== undefined) {
        locationColumn = col;
        console.log(`✅ Auto-detected location column: ${col}`);
        break;
      }
    }
  }

  console.log(`\n📌 USING COLUMNS:`);
  console.log(`   Sales: ${salesColumn || '❌ Not found'}`);
  console.log(`   Date: ${dateColumn || '❌ Not found'}`);
  console.log(`   Product: ${productColumn || '❌ Not found'}`);
  console.log(`   Location: ${locationColumn || '❌ Not found'}`);

  // ============ INITIALIZE METRICS ============
  let totalSales = 0;
  let totalProfit = 0;
  let totalLoss = 0;
  let rowCount = 0;

  let bestTransactionAmount = 0;
  let bestTransactionDate = "";

  const dates = [];
  const salesData = [];

  const locationMap = {};
  const productMap = {};
  const categoryMap = {};
  const dateMap = {};

  // ============ PROCESS EACH ROW ============
  ds.data.forEach(row => {
    // ----- SALES -----
    let sale = 0;
    if (salesColumn && row[salesColumn] !== undefined) {
      sale = Number(row[salesColumn]) || 0;
    }
    
    totalSales += sale;
    rowCount++;

    // ----- DATE -----
    let date = null;
    if (dateColumn && row[dateColumn] !== undefined) {
      date = String(row[dateColumn]).trim();
      if (date.includes('T')) date = date.split('T')[0];
      if (date.includes(' ')) date = date.split(' ')[0];
      
      dates.push(date);
      salesData.push(sale);
      dateMap[date] = (dateMap[date] || 0) + sale;
    }

    // ----- PRODUCT -----
    if (productColumn && row[productColumn] !== undefined) {
      const product = String(row[productColumn]).trim();
      if (product && product !== '') {
        productMap[product] = (productMap[product] || 0) + sale;
      }
    }

    // ----- LOCATION -----
    if (locationColumn && row[locationColumn] !== undefined) {
      const location = String(row[locationColumn]).trim();
      if (location && location !== '') {
        locationMap[location] = (locationMap[location] || 0) + sale;
      }
    }

    // ----- BEST TRANSACTION -----
    if (sale > bestTransactionAmount) {
      bestTransactionAmount = sale;
      bestTransactionDate = date;
    }

    // ----- PROFIT/LOSS -----
    // if (map.profit && row[map.profit] !== undefined) {
    //   totalProfit += Number(row[map.profit]) || 0;
    // }
    // if (map.loss && row[map.loss] !== undefined) {
    //   totalLoss += Number(row[map.loss]) || 0;
    // }

    // ================= PROFIT / LOSS CALCULATION =================

let value;

// 🔹 Case 1: Separate Profit column
if (map.profit && !map.combinedPL) {
  value = Number(row[map.profit]) || 0;
  totalProfit += value;
}

// 🔹 Case 2: Separate Loss column
if (map.loss && !map.combinedPL) {
  value = Number(row[map.loss]) || 0;
  totalLoss += value;
}

// 🔹 Case 3: Combined Profit/Loss column
if (map.combinedPL && map.profit) {
  value = Number(row[map.profit]) || 0;

  if (value >= 0) {
    totalProfit += value;
  } else {
    totalLoss += Math.abs(value);
  }
}

  });

  // ============ CALCULATE PEAK DAY ============
  let peakDate = "N/A";
  let peakAmount = 0;
  
  Object.entries(dateMap).forEach(([date, amount]) => {
    if (amount > peakAmount) {
      peakAmount = amount;
      peakDate = date;
    }
  });

  // ============ CALCULATE TOP PRODUCT ============
  let topProductName = "N/A";
  let topProductSales = 0;
  
  const sortedProducts = Object.entries(productMap).sort((a, b) => b[1] - a[1]);
  
  if (sortedProducts.length > 0) {
    topProductName = sortedProducts[0][0];
    topProductSales = sortedProducts[0][1];
    
    console.log(`\n🏆 TOP PRODUCTS FOUND:`);
    sortedProducts.slice(0, 5).forEach(([p, s], i) => {
      console.log(`   ${i+1}. ${p}: ₹${s.toLocaleString()}`);
    });
  } else {
    console.log(`\n⚠️ NO PRODUCTS FOUND! Check product column detection.`);
  }

  // ============ CALCULATE TOP LOCATION ============
  let topLocationName = "N/A";
  let topLocationSales = 0;
  
  const sortedLocations = Object.entries(locationMap).sort((a, b) => b[1] - a[1]);
  if (sortedLocations.length > 0) {
    topLocationName = sortedLocations[0][0];
    topLocationSales = sortedLocations[0][1];
  }

  // ============ CALCULATE TREND ============
  let trend = "stable";
 const dateKeys = Object.keys(dateMap)
  .sort((a, b) => new Date(a) - new Date(b));

  if (dateKeys.length >= 2) {
    const first = dateMap[dateKeys[0]] || 0;
    const last = dateMap[dateKeys[dateKeys.length - 1]] || 0;
    if (last > first * 1.1) trend = "increasing";
    else if (last < first * 0.9) trend = "decreasing";
  }

  // ============ AVERAGE ============
  const averageSale = rowCount ? totalSales / rowCount : 0;

  // ============ AGGREGATED CHART DATA ============
  const aggregatedDates = Object.keys(dateMap)
  .sort((a, b) => new Date(a) - new Date(b));


  const aggregatedSales = aggregatedDates.map(d => dateMap[d]);

  console.log("\n" + "=".repeat(60));
  console.log("📊 FINAL STATS:");
  console.log(`   Total Sales: ₹${totalSales.toLocaleString()}`);
  console.log(`   Total Rows: ${rowCount}`);
  console.log(`   Products Found: ${Object.keys(productMap).length}`);
  console.log(`   Peak Day: ${peakDate} = ₹${peakAmount.toLocaleString()}`);
  console.log(`   Top Product: ${topProductName} = ₹${topProductSales.toLocaleString()}`);
  console.log("=".repeat(60) + "\n");

  

  // ============ RESPONSE ============
  res.json({
    // Core metrics
    totalSales,
    totalProfit,
    totalLoss,
    totalRows: rowCount,
    averageSale,
    
    // Best transaction
    bestTransaction: {
      date: bestTransactionDate || "N/A",
      amount: bestTransactionAmount
    },
    
    peakDay: {
      date: peakDate,
      amount: peakAmount
    },
    
    topProduct: {
      name: topProductName,
      sales: topProductSales
    },
    
    topLocation: {
      name: topLocationName,
      sales: topLocationSales
    },
    
    // Chart data
    dates: dates,
    salesData: salesData,
    aggregatedDates: aggregatedDates,
    aggregatedSales: aggregatedSales,
    
    productMap: productMap,
    locationMap: locationMap,
    dateMap: dateMap,
    
    // Trend
    trend,
    
    // Metadata
    hasDate: !!dateColumn,
    hasProduct: !!productColumn && Object.keys(productMap).length > 0,
    hasLocation: !!locationColumn,
    hasSales: !!salesColumn,
    
    // Detected columns
    detectedColumns: {
      sales: salesColumn,
      date: dateColumn,
      product: productColumn,
      location: locationColumn
    }
  });
};

// ============================================
// ✅ FIXED: RULE-BASED QA WITH LOWEST PRODUCT SUPPORT
// ============================================
function findProductFromQuestion(question, productMap) {
  if (!question) return null;

  const q = question.toLowerCase();

  let best = null;
  let maxScore = 0;

  Object.keys(productMap).forEach(p => {
    const name = p.toLowerCase();

    let score = 0;

    name.split(" ").forEach(word => {
      if (q.includes(word)) score++;
    });

    if (score > maxScore) {
      maxScore = score;
      best = p;
    }
  });

  return maxScore > 0 ? best : null;
}

function findLocationFromQuestion(question, locationMap) {
  if (!question) return null;

  const q = question.toLowerCase();
  let best = null;
  let maxScore = 0;

  Object.keys(locationMap).forEach(loc => {
    const name = loc.toLowerCase();
    let score = 0;

    name.split(" ").forEach(word => {
      if (q.includes(word)) score++;
    });

    if (score > maxScore) {
      maxScore = score;
      best = loc;
    }
  });

  return maxScore > 0 ? best : null;
}


exports.askDataset = async (req, res) => {
  
  const ds = await Dataset.findById(req.params.id);
  if (!ds) return res.status(404).json({ message: "Not found" });

  const map = ds.columns || {};
  const question = req.body.question;
  
  // STEP 1: Use Intent Classifier
  const classification = intentClassifier.classify(question);
  console.log("📋 Intent:", classification.intent, "Confidence:", classification.confidence);
  
  // Calculate dataset stats
  let totalSales = 0;
  let count = 0;
  let bestSale = 0;
  let bestDate = "";
  let lowestSale = Infinity;
  let lowestDate = "";
  
  const locationMap = {};
  const productMap = {};
  const dateMap = {};
const intelligence = BI.analyze(ds.data, map);

  ds.data.forEach(row => {
    const sale = Number(row[map.sales] || 0);
    const date = row[map.date];
    const location = row[map.location];
    const product = row[map.product];

    totalSales += sale;
    count++;

    if (sale > bestSale) { bestSale = sale; bestDate = date; }
    if (sale < lowestSale) { lowestSale = sale; lowestDate = date; }
    if (location) locationMap[location] = (locationMap[location] || 0) + sale;
    if (product) productMap[product] = (productMap[product] || 0) + sale;
    if (date) dateMap[date] = (dateMap[date] || 0) + sale;
  });

  const askedProduct = findProductFromQuestion(question, productMap);
console.log("🎯 Asked product =", askedProduct);
const askedLocation = findLocationFromQuestion(question, locationMap);
console.log("📍 Asked location =", askedLocation);

  const average = count ? (totalSales / count).toFixed(2) : 0;
  
  // Find PEAK sales day (by TOTAL revenue)
  let peakDate = "N/A";
  let peakAmount = 0;
  Object.entries(dateMap).forEach(([date, amount]) => {
    if (amount > peakAmount) { peakAmount = amount; peakDate = date; }
  });

  const topProduct = Object.entries(productMap).sort((a,b) => b[1] - a[1])[0];
  const topLocation = Object.entries(locationMap).sort((a,b) => b[1] - a[1])[0];

  // =============== RESPOND BASED ON INTENT ===============
  
  if (classification.intent === 'SALES_PEAK') {
    if (askedProduct) {

  const dayMap = {};

  ds.data.forEach(row => {
    if (row[map.product] === askedProduct) {
      const date = row[map.date];
      const sale = Number(row[map.sales] || 0);

      if (date) {
        dayMap[date] = (dayMap[date] || 0) + sale;
      }
    }
  });

  if (question.toLowerCase().includes("which product") &&
    question.toLowerCase().includes("country")) {

  const countryProductMap = {};

  ds.data.forEach(row => {
    const country = row[map.location];
    const product = row[map.product];
    const sale = Number(String(row[map.sales] || 0).replace(/,/g, ""));


    if (!country || !product) return;

    if (!countryProductMap[country]) {
      countryProductMap[country] = {};
    }

    countryProductMap[country][product] =
      (countryProductMap[country][product] || 0) + sale;
  });

  const result = [];

  Object.entries(countryProductMap).forEach(([country, products]) => {
    const top = Object.entries(products).sort((a,b)=>b[1]-a[1])[0];
    if (top) result.push(`${country} → ${top[0]}`);
  });

  return res.json({
    answer: "📊 Highest demand products by country:\n" + result.join("\n")
  });
}


  const best = Object.entries(dayMap).sort((a,b)=>b[1]-a[1])[0];

  if (best) {
    return res.json({
      answer: `📅 **${askedProduct}** sold most on **${best[0]}** with ₹${best[1].toLocaleString()}.`
    });
  }
}

    if (peakDate !== "N/A") {
      return res.json({ 
        answer: `📅 Your peak sales day was **${peakDate}** with total revenue of ₹${peakAmount.toLocaleString()}. ${intentClassifier.generateTip('SALES_PEAK', {}, req.user?.role)}`
      });
    } else if (bestDate) {
      return res.json({ 
        answer: `📅 Your highest single transaction was on **${bestDate}** with ₹${bestSale.toLocaleString()}.`
      });
    }
  }

if (classification.intent === 'TOTAL_SALES') {

  if (askedProduct) {
    const value = productMap[askedProduct] || 0;

    return res.json({
      answer: `💰 Total sales of **${askedProduct}** = ₹${value.toLocaleString()}.`
    });
  }

  return res.json({
    answer: `💰 Total sales: ₹${totalSales.toLocaleString()}.`
  });
}


  if (classification.intent === 'AVERAGE_SALES') {
    return res.json({ 
      answer: `📊 Average sale per transaction: ₹${average}. ${intentClassifier.generateTip('AVERAGE_SALES', {}, req.user?.role)}`
    });
  }

if (classification.intent === 'TOP_PRODUCT') {

  const q = question.toLowerCase();

  // 🔍 Detect specific location from question
  const askedLocation = findLocationFromQuestion(question, locationMap);

  // ============================================
  // 🔥 CASE 1: Specific location (France, USA)
  // ============================================
  if (askedLocation) {

    const productMapInLocation = {};

    ds.data.forEach(row => {
      if (row[map.location] === askedLocation) {
        const product = row[map.product];
        const sale = Number(row[map.sales] || 0);

        if (product) {
          productMapInLocation[product] =
            (productMapInLocation[product] || 0) + sale;
        }
      }
    });

    const topInLocation = Object.entries(productMapInLocation)
      .sort((a, b) => b[1] - a[1])[0];

    if (topInLocation) {
      return res.json({
        answer: `🔥 Highest selling product in **${askedLocation}** is **${topInLocation[0]}** with ₹${topInLocation[1].toLocaleString()} sales.`
      });
    }
  }

  // ============================================
  // 🌍 CASE 2: Generic "location wise"
  // ============================================
  if (q.includes("location") || q.includes("country") || q.includes("city")) {

    const countryTotal = {};
    const countryProductMap = {};

    ds.data.forEach(row => {
      const country = row[map.location];
      const product = row[map.product];
      const sale = Number(row[map.sales] || 0);

      if (!country || !product) return;

      countryTotal[country] = (countryTotal[country] || 0) + sale;

      if (!countryProductMap[country]) {
        countryProductMap[country] = {};
      }

      countryProductMap[country][product] =
        (countryProductMap[country][product] || 0) + sale;
    });

    const topCountries = Object.entries(countryTotal)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const result = topCountries.map(([country]) => {
      const products = countryProductMap[country];
      const top = Object.entries(products)
        .sort((a, b) => b[1] - a[1])[0];

      return `${country} → ${top[0]} (₹${top[1].toLocaleString()})`;
    });

    return res.json({
      answer: "📊 Top demand countries & best products:\n" + result.join("\n")
    });
  }

  // ============================================
  // 🏆 CASE 3: Global top product
  // ============================================
  if (topProduct) {
    return res.json({
      answer: `🏆 Top product overall: **${topProduct[0]}** with ₹${topProduct[1].toLocaleString()} in sales.`
    });
  }
}

 if (classification.intent === 'TOP_LOCATION') {

  // 🧠 NEW → product specific
  if (askedProduct) {
    const cityMap = {};

    ds.data.forEach(row => {
      if (row[map.product] === askedProduct) {
        const loc = row[map.location];
        const sale = Number(row[map.sales] || 0);
        if (loc) cityMap[loc] = (cityMap[loc] || 0) + sale;
      }
    });



    const bestCity = Object.entries(cityMap).sort((a,b)=>b[1]-a[1])[0];

    if (bestCity) {
      return res.json({
        answer: `📍 **${askedProduct}** sells most in **${bestCity[0]}** (₹${bestCity[1].toLocaleString()}).`
      });
    }
  }

  // 🧾 OLD → generic
  if (topLocation) {
    return res.json({ 
      answer: `📍 Top location: **${topLocation[0]}** with ₹${topLocation[1].toLocaleString()} in sales. ${intentClassifier.generateTip('TOP_LOCATION', {}, req.user?.role)}`
    });
  }
}


  if (classification.intent === 'LOWEST_SALES') {
    if (lowestDate && lowestSale !== Infinity) {
      return res.json({ 
        answer: `⚠️ Lowest sales day: **${lowestDate}** with ₹${lowestSale.toLocaleString()}. ${intentClassifier.generateTip('LOWEST_SALES', {}, req.user?.role)}`
      });
    }
  }

  if (classification.intent === 'TREND') {
    const dates = Object.keys(dateMap).sort();
    if (dates.length >= 2) {
      const first = dateMap[dates[0]] || 0;
      const last = dateMap[dates[dates.length - 1]] || 0;
      if (last > first * 1.1) {
        return res.json({ answer: "📈 Sales trend is **increasing**. Keep up the momentum!" });
      } else if (last < first * 0.9) {
        return res.json({ answer: "📉 Sales trend is **decreasing**. Consider running flash sales." });
      } else {
        return res.json({ answer: "📊 Sales trend is **stable**." });
      }
    }
  }

  
if (classification.intent === 'FORECAST') {
  const dateKeys = Object.keys(dateMap).sort();
  const values = dateKeys.map(d => dateMap[d]);

  if (values.length < 2) {
    return res.json({ answer: "Not enough history for prediction." });
  }

  const result = linearRegression(values);

  return res.json({
    answer: `📈 Predicted next sale ≈ ₹${Number(result.next).toLocaleString()} (${result.growth}% growth).`
  });
}



  // =============== 🆕 LOWEST PRODUCT INTENT HANDLER ===============
  if (classification.intent === 'LOWEST_PRODUCT') {
    // Sort products by sales ASCENDING (lowest first)
    const sortedProducts = Object.entries(productMap).sort((a, b) => a[1] - b[1]);
    
    if (sortedProducts.length > 0) {
      const lowestProduct = sortedProducts[0][0];
      const lowestSales = sortedProducts[0][1];
      



      //=== Worst by country product//
      // =================================================
// 🔥 LOWEST PRODUCT IN SPECIFIC COUNTRY
// =================================================
if (
  question.toLowerCase().includes("lowest") ||
  question.toLowerCase().includes("weak") ||
  question.toLowerCase().includes("worst")
) {

  const q = question.toLowerCase();

  // find country from dataset automatically
  const countries = Object.keys(locationMap);
  let askedCountry = null;

  countries.forEach(c => {
    if (q.includes(c.toLowerCase())) {
      askedCountry = c;
    }
  });

  if (askedCountry) {

    const productSales = {};

    ds.data.forEach(row => {
      if (row[map.location] === askedCountry) {
        const product = row[map.product];
        const sale = Number(row[map.sales] || 0);

        if (product) {
          productSales[product] = (productSales[product] || 0) + sale;
        }
      }
    });

    const sorted = Object.entries(productSales).sort((a,b)=>a[1]-b[1]);

    if (sorted.length > 0) {
      const lowest = sorted[0];

      return res.json({
        answer: `📉 In **${askedCountry}**, the weakest product is **${lowest[0]}** with ₹${lowest[1].toLocaleString()} sales.`
      });
    }
  }
}

      // ================= ML FORECAST =================


      // Calculate percentage
      const percentOfTotal = totalSales > 0 ? ((lowestSales / totalSales) * 100).toFixed(1) : 0;
      
      // Generate tip
      let tip = "";
      if (lowestSales === 0) {
        tip = "This product has generated zero revenue. Consider discontinuing or bundling with popular items.";
      } else if (percentOfTotal < 1) {
        tip = `This product accounts for only ${percentOfTotal}% of total sales. Review pricing or consider replacement.`;
      } else {
        tip = "Try bundling this with your top seller or run a clearance promotion.";
      }


      
      return res.json({
        answer: `📉 Your lowest selling product is **${lowestProduct}** with only ₹${lowestSales.toLocaleString()} in sales (${percentOfTotal}% of total). ${tip}`,
        intent: 'LOWEST_PRODUCT',
        confidence: classification.confidence
      });
    }
  }

  // =============== 🆕 ZERO SALES PRODUCT INTENT HANDLER ===============
  if (classification.intent === 'ZERO_SALES_PRODUCT') {
    const zeroSalesProducts = Object.entries(productMap)
      .filter(([_, sales]) => sales === 0)
      .map(([p, _]) => p);
    
    if (zeroSalesProducts.length > 0) {
      const productList = zeroSalesProducts.slice(0, 5).join(', ');
      const remaining = zeroSalesProducts.length - 5;
      
      return res.json({
        answer: `📊 Products with zero sales: ${productList}${remaining > 0 ? ` and ${remaining} more` : ''}. Consider removing these from your catalog.`,
        intent: 'ZERO_SALES_PRODUCT'
      });
    } else {
      return res.json({
        answer: "✅ Good news! All your products have at least some sales.",
        intent: 'ZERO_SALES_PRODUCT'
      });
    }
  }

  // =============== 🆕 PRODUCT COMPARISON INTENT HANDLER ===============
  if (classification.intent === 'PRODUCT_COMPARISON') {
    const sortedAsc = Object.entries(productMap).sort((a, b) => a[1] - b[1]);
    const sortedDesc = Object.entries(productMap).sort((a, b) => b[1] - a[1]);
    
    if (sortedAsc.length > 0 && sortedDesc.length > 0) {
      const lowest = sortedAsc[0];
      const highest = sortedDesc[0];
      const ratio = highest[1] / (lowest[1] || 1);
      
      return res.json({
        answer: `📊 Your top product **${highest[0]}** (₹${highest[1].toLocaleString()}) sells ${ratio.toFixed(1)}x more than your lowest product **${lowest[0]}** (₹${lowest[1].toLocaleString()}). Consider cross-selling strategies.`,
        intent: 'PRODUCT_COMPARISON'
      });
    }
  }

  // Default response
  return res.json({
    answer: "I can help with: total sales, average, peak sales day, best/worst sales, top products, top cities, and trends. What would you like to know?"
  });
};

// ============================================
// ✅ AI QA WITH DATASET CONTEXT
// ============================================
exports.askAI = async (req, res) => {

  const ds = await Dataset.findById(req.params.id);
  if (!ds) return res.status(404).json({ message: "Not found" });

  const map = ds.columns || {};

  let totalSales = 0;
  let totalProfit = 0;
  let rowCount = 0;

  const locationMap = {};
  const productMap = {};
  const dateMap = {};
  const productLocationMatrix = {};

  ds.data.forEach(row => {
    const sale = Number(row[map.sales] || 0);
    const profit = Number(row[map.profit] || 0);
    const date = row[map.date];
    const location = row[map.location];
    const product = row[map.product];

    totalSales += sale;
    totalProfit += profit;
    rowCount++;

    if (location) {
      locationMap[location] = (locationMap[location] || 0) + sale;
    }

    if (product) {
      productMap[product] = (productMap[product] || 0) + sale;
    }

    if (date) {
      dateMap[date] = (dateMap[date] || 0) + sale;
    }

    // 🔥 Product-Location Matrix
    if (location && product) {
      if (!productLocationMatrix[location]) {
        productLocationMatrix[location] = {};
      }
      productLocationMatrix[location][product] =
        (productLocationMatrix[location][product] || 0) + sale;
    }
  });

  // Sorting helpers
  const topProducts = Object.entries(productMap)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,5);

  const lowestProducts = Object.entries(productMap)
    .sort((a,b)=>a[1]-b[1])
    .slice(0,5);

  const topLocations = Object.entries(locationMap)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,5);

  const lowestLocations = Object.entries(locationMap)
    .sort((a,b)=>a[1]-b[1])
    .slice(0,5);

  // Peak Day
  let peakDate = "N/A";
  let peakAmount = 0;
  Object.entries(dateMap).forEach(([date, amount]) => {
    if (amount > peakAmount) {
      peakAmount = amount;
      peakDate = date;
    }
  });

  // Trend
  const sortedDates = Object.keys(dateMap).sort();
  let trend = "stable";
  if (sortedDates.length >= 2) {
    const first = dateMap[sortedDates[0]];
    const last = dateMap[sortedDates[sortedDates.length - 1]];
    if (last > first * 1.1) trend = "increasing";
    else if (last < first * 0.9) trend = "decreasing";
  }

  // 🔥 Structured dataset for AI
  const structuredData = {
    totalSales,
    totalProfit,
    transactions: rowCount,
    peakDay: { date: peakDate, amount: peakAmount },
    trend,
    topProducts,
    lowestProducts,
    topLocations,
    lowestLocations,
    productLocationMatrix
  };

  const prompt = `
You are a senior business analytics AI.

Use ONLY the provided structured JSON data.
Do NOT assume anything outside this data.

DATA:
${JSON.stringify(structuredData)}

USER QUESTION:
"${req.body.question}"

INSTRUCTIONS:
- Answer precisely using numbers from DATA.
- If asking about specific location/product, use productLocationMatrix.
- Answer in max 3 sentences.
- End with 1 practical business suggestion.
`;

  try {
    const answer = await callAI(prompt);
    res.json({ answer });
  } catch (err) {
    console.error("AI error:", err);
    res.status(500).json({ message: "AI failed" });
  }
};


// ============================================
// ✅ FORECAST
// ============================================
exports.forecast = async (req, res) => {
  const ds = await Dataset.findById(req.params.id);
  if (!ds) return res.status(404).json({ message: "Not found" });

  const map = ds.columns || {};

  // build daily totals
  const dayMap = {};

  ds.data.forEach(row => {
    const date = row[map.date];
    const sale = Number(row[map.sales] || 0);

    if (!date) return;

    dayMap[date] = (dayMap[date] || 0) + sale;
  });

  const dates = Object.keys(dayMap);
  const values = Object.values(dayMap);

  if (values.length < 2)
    return res.json({ message: "Not enough data" });

  // simple growth rate
  const growth = (values[values.length - 1] - values[0]) / values.length;

  // predict next 7 days
  const future = [];
  let last = values[values.length - 1];

  for (let i = 1; i <= 7; i++) {
    last = Math.max(0, Math.round(last + growth));
    future.push(last);
  }

  // product forecast (top)
  const productMap = {};
  ds.data.forEach(r => {
    const p = r[map.product];
    const s = Number(r[map.sales] || 0);
    if (p) productMap[p] = (productMap[p] || 0) + s;
  });

  const topProducts = Object.entries(productMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  res.json({
    historyDates: dates,
    historySales: values,
    futureSales: future,
    growth,
    topProducts
  });
};

// ============================================
// ✅ STRATEGY
// ============================================
exports.strategy = async (req, res) => {
  const ds = await Dataset.findById(req.params.id);
  if (!ds) return res.status(404).json({ message: "Not found" });

  const map = ds.columns || {};

  // total sales
  let totalSales = 0;
  const productMap = {};
  const locationMap = {};

  ds.data.forEach(r => {
    const s = Number(r[map.sales] || 0);
    const p = r[map.product];
    const l = r[map.location];

    totalSales += s;

    if (p) productMap[p] = (productMap[p] || 0) + s;
    if (l) locationMap[l] = (locationMap[l] || 0) + s;
  });

  const bestProduct = Object.entries(productMap).sort((a,b)=>b[1]-a[1])[0]?.[0];
  const weakLocation = Object.entries(locationMap).sort((a,b)=>a[1]-b[1])[0]?.[0];

  const prompt = `
You are a senior business consultant.

Company data:
Total sales: ${totalSales}
Top product: ${bestProduct}
Weak city: ${weakLocation}

Give strategy including:
- stock planning
- marketing idea
- discount suggestion
- risk warning
Keep it short and practical.
`;

  const answer = await callAI(prompt);
  res.json({ answer });
};

// ============================================
// ✅ RETAIL DATASET PROCESSOR
// ============================================
exports.processRetailDataset = async (req, res) => {
  try {
    const { transactions, products, stores } = req.body;
    
    // Calculate sales by joining transactions with products
    const enhancedTransactions = transactions.map(t => {
      const product = products.find(p => p.ProductID === t.ProductID);
      const store = stores.find(s => s.StoreID === t.StoreID);
      
      const unitPrice = product?.UnitPrice || 0;
      const quantity = t.Quantity || 1;
      const discount = t.Discount || 0;
      
      const saleAmount = unitPrice * quantity * (1 - discount);
      const profit = (unitPrice - (product?.CostPrice || 0)) * quantity;
      
      return {
        ...t,
        ProductName: product?.ProductName || 'Unknown',
        Category: product?.Category || 'Unknown',
        SubCategory: product?.SubCategory || 'Unknown',
        StoreName: store?.StoreName || 'Unknown',
        City: store?.City || 'Unknown',
        Region: store?.Region || 'Unknown',
        SaleAmount: saleAmount,
        Profit: profit,
        Date: t.Date ? t.Date.split('T')[0] : t.Date
      };
    });
    
    res.json({
      message: "Retail dataset processed successfully",
      transactions: enhancedTransactions,
      totalSales: enhancedTransactions.reduce((sum, t) => sum + t.SaleAmount, 0),
      totalProfit: enhancedTransactions.reduce((sum, t) => sum + t.Profit, 0),
      count: enhancedTransactions.length
    });
    
  } catch (err) {
    console.error("Error processing retail dataset:", err);
    res.status(500).json({ message: "Failed to process retail dataset" });
  }
};



exports.downloadReport = async (req, res) => {
  const ds = await Dataset.findById(req.params.id);
  if (!ds) return res.status(404).json({ message: "Dataset not found" });

  const map = ds.columns || {};

  let totalSales = 0;
  let totalTransactions = ds.data.length;

  const productMap = {};
  const dateMap = {};

  ds.data.forEach(row => {
    const sale = Number(row[map.sales] || 0);
    const product = row[map.product];
    const date = row[map.date];

    totalSales += sale;

    if (product) {
      productMap[product] = (productMap[product] || 0) + sale;
    }

    if (date) {
      dateMap[date] = (dateMap[date] || 0) + sale;
    }
  });

  const topProductEntry = Object.entries(productMap)
    .sort((a,b)=>b[1]-a[1])[0];

  const peakDayEntry = Object.entries(dateMap)
    .sort((a,b)=>b[1]-a[1])[0];

  // ✅ NOW CREATE STATS OBJECT PROPERLY
  const stats = {
    totalSales: totalSales,
    totalRows: totalTransactions,
    topProduct: topProductEntry ? topProductEntry[0] : "N/A",
    peakDate: peakDayEntry ? peakDayEntry[0] : "N/A"
  };

  // Forecast
  const forecaster = require("../services/forecaster");
  const forecast = await forecaster.forecastForReport(ds);

  const strategy = "Based on sales trends, focus on high-demand products and optimize inventory levels in top-performing regions. Monitor declining areas for corrective action.";

  generateReport(res, ds.fileName, stats, forecast, strategy);
  console.log("TOTAL SALES =", totalSales);
console.log("TOP PRODUCT =", topProductEntry);
console.log("PEAK DAY =", peakDayEntry);



};




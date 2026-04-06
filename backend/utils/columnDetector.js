const detectColumns = (headers) => {
  const map = {
    date: null,
    sales: null,
    profit: null,
    loss: null,
    combinedPL: false,
    location: null,
    product: null,
    customer: null,
    quantity: null,
    category: null,
    discount: null,
    rating: null,
    payment: null,
    season: null
  };

  console.log("🔍 Detecting columns from headers:", headers);

  const cleaned = headers.map(h => ({
    original: h,
    key: h?.toLowerCase().trim().replace(/[\s_\-]/g, "")
  }));

  // ================= FIRST PASS (EXACT MATCH PRIORITY) =================

  cleaned.forEach(({ original, key }) => {

    if (!map.date && key === "date") map.date = original;

    if (!map.sales && (
      key === "sales" ||
      key === "sale" ||
      key === "totalprice" ||
      key === "totalsales" ||
      key === "amount" ||
      key === "revenue"
    )) map.sales = original;

    if (!map.location && (
      key === "city" ||
      key === "state" ||
      key === "country" ||
      key === "region" ||
      key === "location"
    )) map.location = original;

    if (!map.product && key === "product") map.product = original;

    if (!map.quantity && key === "quantity") map.quantity = original;
  });

  // ================= SECOND PASS (SMART MATCH) =================

  cleaned.forEach(({ original, key }) => {

    // DATE
    if (!map.date && (
      key.includes("orderdate") ||
      key.includes("deliverydate") ||
      key.includes("salesdate") ||
      key.includes("transactiondate")
    )) {
      map.date = original;
    }

    // SALES
    if (!map.sales && (
      key.includes("price") ||
      key.includes("total") ||
      key.includes("salesamount")
    )) {
      map.sales = original;
    }

    // PROFIT
    if (!map.profit && (
      key.includes("profit") ||
      key.includes("margin") ||
      key.includes("gain") ||
      key.includes("income")
    )) {
      map.profit = original;
    }

    // LOSS
    if (!map.loss && (
      key.includes("loss") ||
      key.includes("expense") ||
      key.includes("cost")
    )) {
      map.loss = original;
    }

    // COMBINED P/L
    if (
      key.includes("profitloss") ||
      key.includes("p&l") ||
      key === "net"
    ) {
      map.profit = original;
      map.combinedPL = true;
    }

    // LOCATION (avoid manager)
    if (!map.location && (
      key.includes("branch") ||
      key.includes("territory")
    )) {
      map.location = original;
    }

    // PRODUCT
    if (!map.product && (
      key.includes("productname") ||
      key.includes("item")
    )) {
      map.product = original;
    }

    // CUSTOMER
    if (!map.customer && (
      key.includes("customer") ||
      key.includes("client")
    )) {
      map.customer = original;
    }

    // QUANTITY
    if (!map.quantity && (
      key.includes("qty") ||
      key.includes("units")
    )) {
      map.quantity = original;
    }

    // DISCOUNT
    if (!map.discount && key.includes("discount")) {
      map.discount = original;
    }

    // PAYMENT
    if (!map.payment && key.includes("payment")) {
      map.payment = original;
    }

    // SEASON
    if (!map.season && (
      key.includes("quarter") ||
      key.includes("qtr") ||
      key.includes("season")
    )) {
      map.season = original;
    }
  });

  console.log("✅ Final Detected columns:", map);
  return map;
};

module.exports = detectColumns;

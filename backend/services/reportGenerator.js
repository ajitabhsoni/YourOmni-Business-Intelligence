const PDFDocument = require("pdfkit");

const generateReport = (res, datasetName, stats, forecast, strategy) => {
  const doc = new PDFDocument({ margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${datasetName}-report.pdf`
  );

  doc.pipe(res);

  // ===== Title =====
  doc.fontSize(20).text("YourOmni AI - Business Report", { align: "center" });
  doc.moveDown();
  doc.fontSize(14).text(`Dataset: ${datasetName}`);
  doc.text(`Generated On: ${new Date().toLocaleString()}`);
  doc.moveDown();

  // ===== Summary Section =====
  doc.fontSize(16).text("1. Summary", { underline: true });
  doc.moveDown(0.5);

  doc.fontSize(12)
    .text(`Total Sales: ₹${stats.totalSales.toLocaleString()}`)

    .text(`Total Transactions: ${stats.totalRows}`)
    .text(`Top Product: ${stats.topProduct}`)
    .text(`Peak Sales Day: ${stats.peakDate}`);
  doc.moveDown();

  // ===== Forecast Section =====
  doc.fontSize(16).text("2. Forecast (Next 7 Days)", { underline: true });
  doc.moveDown(0.5);

  forecast.futureSales.forEach((val, i) => {
    doc.text(`Day ${i + 1}: ₹${val.toLocaleString()}`);
  });

  doc.moveDown();

  // ===== High Demand Products =====
  doc.fontSize(16).text("3. High Demand Products", { underline: true });
  doc.moveDown(0.5);

  forecast.topProducts.forEach(p => {
    doc.text(`${p.name} → ₹${p.sales.toLocaleString()}`);
  });

  doc.moveDown();

  // ===== AI Strategy Section =====
  doc.fontSize(16).text("4. AI Strategy Recommendation", { underline: true });
  doc.moveDown(0.5);

  doc.fontSize(12).text(strategy);

  doc.end();
};

module.exports = generateReport;

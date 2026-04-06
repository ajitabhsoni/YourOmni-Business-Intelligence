import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";
import { motion, AnimatePresence } from "framer-motion";

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  Title,
  Filler
} from "chart.js";

import { Line, Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  Title,
  Filler
);

export default function Analytics() {
  const { id } = useParams();
  const chatEndRef = useRef(null);

  const [stats, setStats] = useState(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [mode, setMode] = useState("rule");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  // eslint-disable-next-line no-unused-vars
  const userName = localStorage.getItem("name");

  useEffect(() => {
    
    api.get("/api/datasets/stats/" + id, {
      headers: { authorization: token }
    }).then(res => setStats(res.data));
  }, [id, token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const suggestions = userRole === "owner" 
    ? [
        "When did we have most sales?",
        "What's our top selling product?",
        "Show me sales trend",
        "Which city performs best?",
        "Forecast next week sales"
      ]
    : [
        "What's our total sales?",
        "Best selling product?",
        "Average sale amount",
        "Sales trend this month",
        // Update your suggestions array to include lowest product questions


      "When did we have most sales?",
      "What's our top selling product?",
      "📉 What's our LOWEST selling product?",  // ADD THIS
      "Which products have zero sales?",        // ADD THIS
      "Show me sales trend",
      "Which city performs best?",
      "Forecast next week sales",

      "What's our total sales?",
      "Best selling product?",
      "Worst selling product?",                // ADD THIS
      "Average sale amount",
      "Sales trend this month"
    
      ];
      

  const ask = async () => {
    if (!question.trim()) return;

    const url = mode === "ai"
      ? "/api/datasets/ask-ai/" + id
      : "/api/datasets/ask/" + id;

    setLoading(true);
    setMessages(prev => [...prev, { type: "user", text: question }]);
    setQuestion("");
    setShowSuggestions(false);

    try {
      const res = await api.post(
        url,
        { question },
        { headers: { authorization: token } }
      );

      setMessages(prev => [...prev, { 
        type: "bot", 
        text: res.data.answer,
        intent: res.data.intent,
        confidence: res.data.confidence
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        type: "bot", 
        text: "❌ Sorry, I couldn't process your question. Try again." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!stats) {
    return (
      <Layout>
        <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" style={{ width: "3rem", height: "3rem" }}></div>
            <h5>Loading dataset analytics...</h5>
          </div>
        </div>
      </Layout>
    );
  }

const salesTrendData = {
  labels: stats.aggregatedDates || stats.dates || [],  // Try aggregated first
  datasets: [
    {
      label: "Daily Sales",
      data: stats.aggregatedSales || stats.salesData || [], // Try aggregated first
      borderColor: "#4e73df",
      backgroundColor: "rgba(78, 115, 223, 0.05)",
      tension: 0.4,
      fill: true,
      pointRadius: 3,
      pointHoverRadius: 6
    }
  ]
};

// ============ FIXED: TOP PRODUCTS CHART ============
// Sort products properly before displaying
const productEntries = Object.entries(stats.productMap || {});
console.log("📦 Raw product entries:", productEntries.slice(0, 3));

// Sort by sales (highest first)
const sortedProductEntries = productEntries.sort((a, b) => b[1] - a[1]);
const top5Products = sortedProductEntries.slice(0, 5);

const productData = {
  labels: top5Products.map(p => {
    const name = p[0];
    // Truncate long names
    return name.length > 20 ? name.substring(0, 18) + '...' : name;
  }),
  datasets: [{
    label: "Sales (₹)",
    data: top5Products.map(p => p[1]),
    backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0", "#9966FF"],
    borderRadius: 6
  }]
};


// ============ FIXED: LOCATION CHART ============
const sortedLocations = Object.entries(stats.locationMap || {})
  .sort((a, b) => b[1] - a[1])  // Sort by sales DESCENDING
  .slice(0, 5);                  // Take top 5

const locationData = {
  labels: sortedLocations.map(l => l[0]),
  datasets: [{
    data: sortedLocations.map(l => l[1]),
    backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
    borderWidth: 0
  }]
};


  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1">📊 Dataset Analytics</h2>
            <p className="text-muted mb-0">
              {stats.totalRows?.toLocaleString() || 0} transactions • 
              ₹{stats.totalSales?.toLocaleString() || 0} total sales
            </p>
          </div>
          <div className="d-flex gap-2">
            <button 
              className={`btn ${mode === "rule" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setMode("rule")}
            >
              ⚡ Quick Stats
            </button>
            <button 
              className={`btn ${mode === "ai" ? "btn-success" : "btn-outline-success"}`}
              onClick={() => setMode("ai")}
            >
              🧠 Youromni AI
            </button>
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <motion.div 
              whileHover={{ y: -5 }}
              className="card shadow-sm border-0 h-100"
            >
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <p className="text-muted small mb-1">Total Sales</p>
                    <h3 className="fw-bold text-success mb-0">
                      ₹{stats.totalSales?.toLocaleString() || 0}
                    </h3>
                  </div>
                  <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                    <span style={{ fontSize: "1.5rem" }}>💰</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="col-md-3">
            <motion.div 
              whileHover={{ y: -5 }}
              className="card shadow-sm border-0 h-100"
            >
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <p className="text-muted small mb-1">Peak Sales Day</p>
                    <h5 className="fw-bold mb-0">{stats.peakDay?.date || "N/A"}</h5>
                    <small className="text-primary">
                      ₹{stats.peakDay?.amount?.toLocaleString() || 0}
                    </small>
                  </div>
                  <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                    <span style={{ fontSize: "1.5rem" }}>📅</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="col-md-3">
            <motion.div 
              whileHover={{ y: -5 }}
              className="card shadow-sm border-0 h-100"
            >
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <p className="text-muted small mb-1">Top Product</p>
                    <h6 className="fw-bold mb-0">{stats.topProduct?.name || "N/A"}</h6>
                    <small className="text-info">
                      ₹{stats.topProduct?.sales?.toLocaleString() || 0}
                    </small>
                  </div>
                  <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                    <span style={{ fontSize: "1.5rem" }}>🏆</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="col-md-3">
            <motion.div 
              whileHover={{ y: -5 }}
              className="card shadow-sm border-0 h-100"
            >
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <p className="text-muted small mb-1">Trend</p>
                    <h5 className="fw-bold mb-0">
                      {stats.trend === "increasing" ? "📈 Rising" : 
                       stats.trend === "decreasing" ? "📉 Falling" : "📊 Stable"}
                    </h5>
                    <small className="text-muted">vs previous period</small>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                    <span style={{ fontSize: "1.5rem" }}>📊</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-7">
            {stats.dates?.length > 0 && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="card shadow-sm border-0 mb-4"
              >
                <div className="card-body">
                  <h5 className="fw-bold mb-3">📈 Sales Trend</h5>
                  <div style={{ height: "300px" }}>
                    <Line 
                      data={salesTrendData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false }
                        }
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {Object.keys(stats.productMap || {}).length > 0 && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="card shadow-sm border-0"
              >
                <div className="card-body">
                  <h5 className="fw-bold mb-3">📦 Top Products</h5>
                  <div style={{ height: "300px" }}>
                    <Bar 
                      data={productData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false }
                        }
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="col-lg-5">
            {Object.keys(stats.locationMap || {}).length > 0 && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="card shadow-sm border-0 mb-4"
              >
                <div className="card-body">
                  <h5 className="fw-bold mb-3">📍 Sales by Location</h5>
                  <div style={{ height: "250px" }}>
                    <Pie 
                      data={locationData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'bottom' }
                        }
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="card shadow-sm border-0"
              style={{ height: "500px", display: "flex", flexDirection: "column" }}
            >
              <div className="card-header bg-white border-0 pt-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0">
                    {mode === "ai" ? "🧠 Business AI Assistant" : "⚡ Quick Insights"}
                  </h5>
                  <span className="badge bg-light text-dark">
                    {mode === "ai" ? "AI Powered" : "Rule Based"}
                  </span>
                </div>
              </div>

              <div 
                className="card-body overflow-auto" 
                style={{ flex: 1, backgroundColor: "#f8f9fc" }}
              >
                {messages.length === 0 && showSuggestions && (
                  <div className="text-center mt-4">
                    <div className="mb-4">
                      <span style={{ fontSize: "3rem" }}>💬</span>
                      <h6 className="mt-3">Ask me anything about your sales</h6>
                      <p className="text-muted small">
                        {mode === "ai" 
                          ? "I'll give you concise, actionable insights" 
                          : "Get instant stats about your data"}
                      </p>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-muted small mb-2">Suggested questions:</p>
                      <div className="d-flex flex-wrap gap-2 justify-content-center">
                        {suggestions.map((s, i) => (
                          <button
                            key={i}
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => {
                              setQuestion(s);
                              setTimeout(() => ask(), 100);
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`d-flex ${msg.type === "user" ? "justify-content-end" : "justify-content-start"} mb-3`}
                    >
                      <div
                        className={`p-3 rounded-3 ${
                          msg.type === "user"
                            ? "bg-primary text-white"
                            : "bg-white border"
                        }`}
                        style={{ maxWidth: "85%", wordBreak: "break-word" }}
                      >
                        {msg.type === "bot" && (
                          <small className="text-muted d-block mb-1">
                            {mode === "ai" ? "🧠 AI" : "⚡ Analytics"}
                          </small>
                        )}
                        <div className={msg.type === "user" ? "text-white" : ""}>
                          {msg.text}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {loading && (
                  <div className="d-flex justify-content-start mb-3">
                    <div className="bg-white border p-3 rounded-3">
                      <div className="d-flex gap-2">
                        <div className="spinner-grow spinner-grow-sm text-primary"></div>
                        <div className="spinner-grow spinner-grow-sm text-primary"></div>
                        <div className="spinner-grow spinner-grow-sm text-primary"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              <div className="card-footer bg-white border-0 pb-3">
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder={mode === "ai" 
                      ? "Ask AI for insights..." 
                      : "Ask about sales, products, cities..."}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && ask()}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-primary px-4"
                    onClick={ask}
                    disabled={loading}
                  >
                    {loading ? "..." : "→"}
                  </motion.button>
                </div>
                <div className="mt-2 d-flex justify-content-between">
                  <small className="text-muted">
                    {mode === "ai" 
                      ? "🧠 Personalized answers in 2 lines" 
                      : "⚡ Instant stats from your data"}
                  </small>
                  {mode === "ai" && (
                    <span className="badge bg-success bg-opacity-10 text-success">
                      Concise Mode
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}
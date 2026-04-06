import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Tooltip,
  Legend
);

export default function Forecast() {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/api/datasets/forecast/" + id, {
      headers: { authorization: token }
    }).then(res => setData(res.data));
  }, [id, token]);

  if (!data) return <Layout>Loading...</Layout>;

  // ===== CLEAN LABELS =====
  const historyLabels = data.historyDates || [];
  const futureLabels = Array.from(
    { length: data.futureSales.length },
    (_, i) => `Future ${i + 1}`
  );

  return (
    <Layout>
      <h2 className="mb-4">📈 Sales Forecast Analysis</h2>

      {/* Trend Card */}
      <div className="card p-3 shadow mb-4">
        <h5>
          Trend:{" "}
          <span className={data.growth >= 0 ? "text-success" : "text-danger"}>
            {data.growth >= 0 ? "Growth 📈" : "Decline 📉"}
          </span>
        </h5>
        <small className="text-muted">
          Model Used: {data.method}
        </small>
      </div>

      {/*summary card */}
      {/* ===== SUMMARY CARDS ===== */}
<div className="row mb-4">
  <div className="col-md-4">
    <div className="card p-3 shadow-sm">
      <h6>💰 Total Sales</h6>
      <h4>₹{data.totalSales?.toLocaleString()}</h4>
    </div>
  </div>

  <div className="col-md-4">
    <div className="card p-3 shadow-sm">
      <h6>📊 Growth %</h6>
      <h4>{data.growthPercentage}%</h4>
    </div>
  </div>

  <div className="col-md-4">
    <div className="card p-3 shadow-sm">
      <h6>🎯 Confidence</h6>
      <h4>{data.confidence}</h4>
    </div>
  </div>
</div>


      {/* ===== PROFESSIONAL FORECAST GRAPH ===== */}
      <div className="card p-4 shadow mb-4">
        <h5>Historical + Forecast Sales</h5>

        <Line
          data={{
            labels: [...historyLabels, ...futureLabels],
            datasets: [
              {
                label: "Historical Sales",
                data: [...data.historySales, ...Array(data.futureSales.length).fill(null)],
                borderColor: "#007bff",
                backgroundColor: "#007bff",
                tension: 0.3
              },
              {
                label: "Forecast Sales",
                data: [...Array(data.historySales.length).fill(null), ...data.futureSales],
                borderColor: "#28a745",
                backgroundColor: "#28a745",
                borderDash: [5, 5],
                tension: 0.3
              }
            ]
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top" }
            }
          }}
        />
      </div>

      {/* ===== HIGH DEMAND PRODUCTS FIXED ===== */}
      <div className="card p-4 shadow">
        <h5>🔥 High Demand Products</h5>

        {data.topProducts && data.topProducts.length > 0 ? (
          <Bar
            data={{
              labels: data.topProducts.map(p => p.name),
              datasets: [
                {
                  label: "Total Sales",
                  data: data.topProducts.map(p => p.sales),
                  backgroundColor: "#ffc107"
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false }
              }
            }}
          />
        ) : (
          <p className="text-muted">No product demand data available.</p>
        )}
      </div>

      {/* ===== STOCK RECOMMENDATION ===== */}
<div className="card p-3 shadow mt-4">
  <h5>📦 Stock Recommendation</h5>

  {data.topProducts && data.topProducts.length > 0 ? (
    <p>
      Increase inventory of <b>{data.topProducts[0].name}</b> as it shows highest demand.
    </p>
  ) : (
    <p className="text-muted">No recommendation available.</p>
  )}
</div>

{/* ===== RISK ALERT ===== */}
<div className="card p-3 shadow mt-4">
  <h5>⚠ Risk Analysis</h5>

  {data.growth < 0 ? (
    <p className="text-danger">
      Sales are declining. Consider promotional offers or discount campaigns.
    </p>
  ) : (
    <p className="text-success">
      Sales trend is positive. Maintain supply levels.
    </p>
  )}
</div>

    </Layout>
  );
}

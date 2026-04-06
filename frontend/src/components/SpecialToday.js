import { useEffect, useState } from "react";
import { getTodaySpecial, getAllUpcomingFestivals } from "../utils/festivalEngine";

export default function SpecialToday() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [boost, setBoost] = useState(0);
  const [upcomingList, setUpcomingList] = useState([]);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    // Generate random boost between 10% and 30%
    setBoost(Math.floor(Math.random() * 21) + 10);
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const [specialData, upcomingFestivals] = await Promise.all([
          getTodaySpecial(),
          getAllUpcomingFestivals(3)
        ]);
        setData(specialData);
        setUpcomingList(upcomingFestivals);
      } catch (error) {
        console.error("Error fetching data:", error);
        setData({
          type: "normal",
          title: "Daily Business Opportunity",
          tip: "Create an offer to attract customers",
          daysLeft: null,
          festivalData: { nextFestivals: [] }
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Refresh data every 6 hours
    const interval = setInterval(fetchData, 6 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div
        className="card mt-3 text-white"
        style={{
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          border: "none",
          borderRadius: "15px"
        }}
      >
        <div className="card-body text-center">
          <div className="spinner-border spinner-border-sm text-light me-2"></div>
          <span>Loading festive opportunities...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Determine background based on type
  const getBackground = () => {
    switch(data.type) {
      case "today":
        return "linear-gradient(135deg, #f093fb, #f5576c)";
      case "upcoming":
        return "linear-gradient(135deg, #4facfe, #00f2fe)";
      default:
        return "linear-gradient(135deg, #667eea, #764ba2)";
    }
  };

  return (
    <div
      className="card mt-3 text-white shadow-lg"
      style={{
        background: getBackground(),
        border: "none",
        borderRadius: "15px",
        transition: "all 0.3s ease"
      }}
    >
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <h5 className="card-title">
            {data.type === "today" ? "🎯 Special Today!" : 
             data.type === "upcoming" ? "📅 Upcoming Festival" : 
             "💼 Business Opportunity"}
          </h5>
          <span className="badge bg-light text-dark">
            {data.type === "today" ? "Festive Day" : 
             data.type === "upcoming" ? "Coming Soon" : "Regular Day"}
          </span>
        </div>

        <div className="mt-3">
          {/* Main Festival Info */}
          {data.type === "today" && (
            <div className="text-center mb-3">
              <h3 className="mb-2">
                {data.title}
              </h3>
              <div className="badge bg-warning text-dark fs-6 p-2 mb-2">
                🎊 Perfect Day for Offers!
              </div>
            </div>
          )}

          {data.type === "upcoming" && (
            <div className="mb-3">
              <h4 className="mb-2">{data.title}</h4>
              <div className="alert alert-info bg-white text-dark d-inline-flex align-items-center p-2 mb-2">
                <i className="bi bi-calendar-event me-2"></i>
                <span className="fw-bold">Starts in: {data.daysLeft} day{data.daysLeft !== 1 ? 's' : ''}</span>
              </div>
            </div>
          )}

          {data.type === "normal" && (
            <h4 className="mb-3">{data.title}</h4>
          )}

          <p className="mb-3">{data.tip}</p>

          {/* Boost Percentage */}
          <div className="mt-3 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="fw-bold">
                <i className="bi bi-graph-up me-1"></i>
                Expected Sales Boost:
              </span>
              <span className="fw-bold fs-5">+{boost}%</span>
            </div>
            <div className="progress" style={{ height: "10px", borderRadius: "5px" }}>
              <div 
                className="progress-bar bg-warning" 
                role="progressbar" 
                style={{ width: `${Math.min(boost, 100)}%` }}
                aria-valuenow={boost} 
                aria-valuemin="10" 
                aria-valuemax="30"
              ></div>
            </div>
            <small className="text-light opacity-75">
              Based on historical festival performance data
            </small>
          </div>

          {/* Upcoming Festivals List */}
          {upcomingList.length > 0 && (
            <div className="mt-4">
              <h6 className="mb-2">
                <i className="bi bi-calendar-week me-1"></i>
                Upcoming Festivals
              </h6>
              <div className="list-group">
                {upcomingList.slice(0, showMore ? upcomingList.length : 3).map((festival, index) => (
                  <div 
                    key={index}
                    className="list-group-item d-flex justify-content-between align-items-center bg-transparent text-white border-light mb-1"
                    style={{ borderRadius: "8px" }}
                  >
                    <div>
                      <span className="fw-bold">{festival.title}</span>
                      <br/>
                      <small>
                        {festival.date.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: festival.year !== new Date().getFullYear() ? 'numeric' : undefined
                        })}
                      </small>
                    </div>
                    <span className="badge bg-light text-dark">
                      {festival.daysDiff} day{festival.daysDiff !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
              
              {upcomingList.length > 3 && (
                <button 
                  className="btn btn-sm btn-outline-light w-100 mt-2"
                  onClick={() => setShowMore(!showMore)}
                >
                  <i className={`bi bi-chevron-${showMore ? 'up' : 'down'} me-1`}></i>
                  {showMore ? 'Show Less' : `Show ${upcomingList.length - 3} More`}
                </button>
              )}
            </div>
          )}

          {/* Action Button */}
          <button
            className="btn btn-light mt-4 w-100 fw-bold d-flex align-items-center justify-content-center"
            onClick={() => window.location = "/offers"}
            style={{
              padding: "12px",
              fontSize: "1.1rem",
              borderRadius: "10px"
            }}
          >
            <i className="bi bi-megaphone me-2"></i>
            {data.type === "today" ? "Launch Festive Offer Now!" : 
             data.type === "upcoming" ? "Plan Early Bird Offer" : 
             "Create Promotional Offer"}
          </button>

         
        </div>
      </div>
    </div>
  );
}
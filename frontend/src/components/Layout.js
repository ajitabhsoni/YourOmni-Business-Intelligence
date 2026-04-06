import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Layout({ children }) {
  const nav = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState({
    name: "",
    role: "",
    profileImage: "",
    email: ""
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const name = localStorage.getItem("name") || "User";
    const role = localStorage.getItem("role") || "";
    const storedImage = localStorage.getItem("profileImage");
    const email = localStorage.getItem("email") || "";
    
    let profileImage = "";
    if (storedImage) {
      if (storedImage.startsWith("http")) {
        profileImage = storedImage;
      } else {
        profileImage = "http://localhost:5000/uploads/" + storedImage;
      }
    }
    
    setUserData({
      name,
      role,
      profileImage,
      email
    });
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [location]);

  const logout = () => {
    localStorage.clear();
    nav("/login");
  };

  const getProfileImage = () => {
    if (userData.profileImage) {
      return userData.profileImage;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=4e73df&color=ffffff&bold=true&size=128`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    if (hour < 21) return "Good Evening";
    return "Good Night";
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    if (isMobile && sidebarOpen) {
      const handleClickOutside = (e) => {
        if (!e.target.closest('.sidebar-main') && !e.target.closest('.menu-toggle-btn')) {
          setSidebarOpen(false);
        }
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMobile, sidebarOpen]);

  // Get current page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard";
    if (path === "/datasets") return "Datasets";
    if (path === "/team") return "Team";
    if (path === "/profile") return "My Profile";
    if (path === "/customers") return "Customers";
    if (path === "/offers") return "Offers";
    if (path.includes("/analytics")) return "Analytics";
    if (path.includes("/forecast")) return "Forecast";
    if (path.includes("/strategy")) return "AI Strategy";
    if (path.includes("/chat")) return "Chat";
    return "Business AI";
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>

      {/* MOBILE MENU TOGGLE BUTTON */}
      {isMobile && (
        <button
          className="menu-toggle-btn"
          onClick={toggleSidebar}
          style={{
            position: "fixed",
            top: "12px",
            left: "12px",
            zIndex: 1001,
            background: "#2c5364",
            border: "none",
            color: "white",
            width: "40px",
            height: "40px",
            borderRadius: "8px",
            fontSize: "20px",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          ☰
        </button>
      )}

      {/* SIDEBAR */}
      <div
        className={`sidebar-main ${isMobile ? (sidebarOpen ? "sidebar-open" : "sidebar-closed") : ""}`}
        style={{
          width: "260px",
          background: "linear-gradient(180deg, #0f2027, #203a43, #2c5364)",
          boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
          position: isMobile ? "fixed" : "relative",
          left: isMobile ? (sidebarOpen ? "0" : "-260px") : "0",
          top: 0,
          height: "100vh",
          zIndex: 1000,
          transition: "left 0.3s ease-in-out",
          overflowY: "auto",
          overflowX: "hidden"
        }}
      >
        {isMobile && sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: "22px",
              cursor: "pointer",
              zIndex: 1002
            }}
          >
            ✕
          </button>
        )}

        <div className="p-3">
          <div className="d-flex align-items-center mb-4 mt-2">
            <div className="bg-primary rounded-circle p-2 me-2">
              <span className="fs-4">📊</span>
            </div>
            <div>
              <h4 className="mb-0 fw-bold" style={{ fontSize: isMobile ? "1rem" : "1.25rem" }}>Youromni AI</h4>
              <small className="opacity-75" style={{ fontSize: "10px" }}>Smart Dashboard</small>
            </div>
          </div>

          <div className="card bg-dark border-light mb-4">
            <div className="card-body p-2 p-md-3">
              <div className="d-flex align-items-center">
                <img
                  src={getProfileImage()}
                  alt={userData.name}
                  className="rounded-circle border border-2 border-primary"
                  style={{ width: "35px", height: "35px", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=4e73df&color=ffffff&bold=true&size=128`;
                  }}
                />
                <div className="ms-2 flex-grow-1" style={{ minWidth: 0 }}>
                  <h6 className="mb-0 fw-bold" style={{ fontSize: "13px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {userData.name || "User"}
                  </h6>
                  <small className="opacity-75" style={{ fontSize: "10px" }}>
                    {userData.role === "owner" ? "👑 Owner" : "👤 Employee"}
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex flex-column gap-1 mb-4">
            <NavItem to="/dashboard" icon="🏠" label="Dashboard" location={location} isMobile={isMobile} setSidebarOpen={setSidebarOpen} />
            <NavItem to="/datasets" icon="📁" label="Datasets" location={location} isMobile={isMobile} setSidebarOpen={setSidebarOpen} />
            <NavItem to="/team" icon="👥" label="Team" location={location} isMobile={isMobile} setSidebarOpen={setSidebarOpen} />
            <NavItem to="/profile" icon="🙂" label="My Profile" location={location} isMobile={isMobile} setSidebarOpen={setSidebarOpen} />
            <NavItem to="/customers" icon="🧾" label="Customers" location={location} isMobile={isMobile} setSidebarOpen={setSidebarOpen} />
            <NavItem to="/offers" icon="🎁" label="Offers" location={location} isMobile={isMobile} setSidebarOpen={setSidebarOpen} />
          </div>

          <div className="mt-auto pt-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-danger w-100 d-flex align-items-center justify-content-center"
              onClick={logout}
              style={{ fontSize: "14px", padding: "8px" }}
            >
              <span className="me-2">🚪</span>
              Logout
            </motion.button>
            <small className="text-center d-block mt-2 opacity-50" style={{ fontSize: "10px" }}>
              v2.0 • {new Date().getFullYear()}
            </small>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div
        className="flex-grow-1"
        style={{
          background: "#f8f9fc",
          overflowY: "auto",
          overflowX: "hidden",
          width: "100%",
          minHeight: "100vh"
        }}
      >
        {/* TOP BAR - FIXED OVERFLOW */}
        <div 
          className="sticky-top bg-white border-bottom"
          style={{ 
            zIndex: 999,
            paddingTop: isMobile ? "12px" : "16px",
            paddingBottom: isMobile ? "12px" : "16px",
            paddingLeft: isMobile ? "60px" : "20px",
            paddingRight: isMobile ? "12px" : "20px"
          }}
        >
          <div className="d-flex justify-content-between align-items-center w-100">
            <div style={{ minWidth: 0, flex: 1 }}>
              <h5 className="mb-0 text-dark fw-bold" style={{ 
                fontSize: isMobile ? "1rem" : "1.25rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>
                {getPageTitle()}
              </h5>
              <small className="text-muted" style={{ 
                fontSize: isMobile ? "10px" : "12px",
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>
                {getGreeting()}, {userData.name?.split(" ")[0] || "User"}
              </small>
            </div>
            
            <div className="dropdown ms-2" style={{ flexShrink: 0 }}>
              <button
                className="btn btn-link text-dark p-0"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ outline: "none", boxShadow: "none" }}
              >
                <img
                  src={getProfileImage()}
                  alt={userData.name}
                  className="rounded-circle border"
                  style={{ width: "38px", height: "38px", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=4e73df&color=ffffff&bold=true&size=128`;
                  }}
                />
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <Link className="dropdown-item" to="/profile">
                    <span className="me-2">👤</span>My Profile
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item text-danger" onClick={logout}>
                    <span className="me-2">🚪</span>Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="p-3 p-md-4" style={{ overflowX: "hidden" }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </div>

      {/* MOBILE OVERLAY */}
      {isMobile && sidebarOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 999
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

// Separate NavItem component
function NavItem({ to, icon, label, location, isMobile, setSidebarOpen }) {
  const active = location.pathname === to || location.pathname.startsWith(to + "/");
  
  return (
    <Link to={to} style={{ textDecoration: "none" }} onClick={() => isMobile && setSidebarOpen(false)}>
      <motion.div
        whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.1)" }}
        whileTap={{ scale: 0.98 }}
        className={`p-2 rounded d-flex align-items-center ${active ? "bg-primary text-white" : "text-white"}`}
        style={{ cursor: "pointer", transition: "all 0.3s ease" }}
      >
        <span className="me-2" style={{ fontSize: "1.1rem" }}>{icon}</span>
        <span style={{ fontSize: "14px" }}>{label}</span>
      </motion.div>
    </Link>
  );
}
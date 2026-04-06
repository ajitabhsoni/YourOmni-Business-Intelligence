// import SpecialToday from "../components/SpecialToday";
// import { useEffect, useState } from "react";
// import api from "../services/api";
// import Layout from "../components/Layout";
// import { motion } from "framer-motion";

// export default function Dashboard() {
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const token = localStorage.getItem("token");
//   const role = localStorage.getItem("role");
//   const name = localStorage.getItem("name");

//   const load = () => {
//     if (role !== "owner") return setLoading(false);

//     api.get("/api/company/pending", {
//       headers: { authorization: token }
//     })
//       .then(res => setEmployees(res.data))
//       .finally(() => setLoading(false));
//   };

//   useEffect(load, []);

//   const approve = async (id) => {
//     await api.put("/api/company/approve/" + id, {}, {
//       headers: { authorization: token }
//     });

//     setEmployees(prev => prev.filter(e => e._id !== id));
//   };

//   return (
//     <Layout>
//       <motion.div
//         initial={{ opacity: 0, y: 15 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.4 }}
//       >

//         {/* WELCOME */}
//         <div
//           className="p-4 mb-4 rounded shadow-sm"
//           style={{
//             background: "linear-gradient(135deg, #4e73df, #224abe)",
//             color: "white"
//           }}
//         >
//           <h3 className="mb-1">Welcome, {name} 👋</h3>
//           <div style={{ opacity: 0.9 }}>
//             Manage analytics, team and customer engagement.
//           </div>
//         </div>

//         {/* SPECIAL */}
//         <SpecialToday />

//         {/* QUICK ACTIONS */}
//         <div className="card shadow border-0 mt-4 p-3">
//           <h5>⚡ Quick Start</h5>

//           <div className="d-flex gap-2 flex-wrap mt-2">
//             <a href="/datasets" className="btn btn-primary">Upload Dataset</a>
//             <a href="/customers" className="btn btn-success">Customers</a>
//             <a href="/offers" className="btn btn-warning">Create Offer</a>
//             <a href="/team" className="btn btn-dark">Team</a>
//           </div>
//         </div>

//         {/* AI HELP */}
//         <div className="card shadow border-0 mt-4 p-3">
//           <h5>🧠 AI Assistant</h5>
//           <p className="text-muted mb-0">
//             Add business data to unlock forecasting, weak areas,
//             product opportunities and automated strategies.
//           </p>
//         </div>

//         {/* OWNER APPROVAL */}
//         {role === "owner" && (
//           <div className="card shadow border-0 mt-4">
//             <div className="card-body">
//               <h5 className="mb-3">Employee Approval Requests</h5>

//               {loading ? (
//                 <p>Loading...</p>
//               ) : employees.length === 0 ? (
//                 <p className="text-muted">No pending requests.</p>
//               ) : (
//                 <table className="table table-hover">
//                   <thead>
//                     <tr>
//                       <th>Name</th>
//                       <th>Email</th>
//                       <th style={{ width: "120px" }}>Action</th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {employees.map(emp => (
//                       <tr key={emp._id}>
//                         <td>{emp.name}</td>
//                         <td>{emp.email}</td>
//                         <td>
//                           <button
//                             className="btn btn-success btn-sm"
//                             onClick={() => approve(emp._id)}
//                           >
//                             Approve
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               )}
//             </div>
//           </div>
//         )}

//         {/* EMPLOYEE VIEW */}
//         {role === "employee" && (
//           <div className="alert alert-info mt-4">
//             You are logged in as Employee. Await instructions from owner.
//           </div>
//         )}

//       </motion.div>
//     </Layout>
//   );
// }

import SpecialToday from "../components/SpecialToday";
import { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamCount, setTeamCount] = useState(0);
  const [offersCount, setOffersCount] = useState(0);
  const [datasetCount, setDatasetCount] = useState(0);

  const [userData, setUserData] = useState({
    name: "",
    role: "",
    profileImage: "",
    greeting: ""
  });

  const token = localStorage.getItem("token");

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    if (hour < 21) return "Good Evening";
    return "Good Night";
  };

  const load = async () => {
    // Get user data from localStorage
    const name = localStorage.getItem("name") || "User";
    const role = localStorage.getItem("role") || "employee";
    const storedImage = localStorage.getItem("profileImage");
    
    setUserData({
      name,
      role,
      profileImage: storedImage,
      greeting: getGreeting()
    });

    // Fetch real team count
    try {
      const teamRes = await api.get("/api/company/team", {
        headers: { authorization: token }
      });
      setTeamCount(teamRes.data.length);
    } catch (error) {
      console.error("Error fetching team count:", error);
      setTeamCount(0);
    }

    // Fetch real offers count
    try {
      const offersRes = await api.get("/api/offers", {
        headers: { authorization: token }
      });
      setOffersCount(offersRes.data.length);
    } catch (error) {
      console.error("Error fetching offers count:", error);
      setOffersCount(0);
    }

    if (role !== "owner") {
      setLoading(false);
      return;
    }

    // Load pending employees for owner
    try {
      const res = await api.get("/api/company/pending", {
        headers: { authorization: token }
      });
      setEmployees(res.data);
    } catch (error) {
      console.error("Error fetching pending employees:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    api.get("/api/datasets", {
  headers: { authorization: token }
}).then(res => {
  setDatasetCount(res.data.length);
});

  }, []);

  
  const approve = async (id) => {
    try {
      await api.put("/api/company/approve/" + id, {}, {
        headers: { authorization: token }
      });
      setEmployees(prev => prev.filter(e => e._id !== id));
      
      // Update team count after approval
      const teamRes = await api.get("/api/company/team", {
        headers: { authorization: token }
      });
      setTeamCount(teamRes.data.length);
    } catch (error) {
      console.error("Error approving employee:", error);
    }
  };

  // Stats cards with REAL data
  const stats = [
    { 
      icon: "👥", 
      label: "Team Members", 
      value: teamCount, 
      color: "primary",
      description: "Active team members"
    },
    { 
      icon: "🎁", 
      label: "Active Offers", 
      value: offersCount, 
      color: "success",
      description: "Running promotions"
    },
    { 
      icon: "📊", 
      label: "Datasets", 
      value: datasetCount, 
      color: "warning",
      description: "Uploaded datasets"
    },
    { 
      icon: "👑", 
      label: userData.role === "owner" ? "Owner" : "Role", 
      value: userData.role === "owner" ? "Admin" : "Employee", 
      color: "info",
      description: userData.role === "owner" ? "Full access" : "Limited access"
    }
  ];

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >

        {/* WELCOME HEADER WITH PROFILE */}
        <div
          className="p-4 mb-4 rounded shadow-sm position-relative"
          style={{
            background: "linear-gradient(135deg, #4e73df, #224abe)",
            color: "white",
            overflow: "hidden"
          }}
        >
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h3 className="mb-1">{userData.greeting}, {userData.name} 👋</h3>
              <div className="d-flex align-items-center gap-2" style={{ opacity: 0.9 }}>
                <span className="badge bg-light text-dark">
                  {userData.role === "owner" ? "👑 Owner" : "👤 Employee"}
                </span>
                <span>Manage your business efficiently</span>
              </div>
            </div>
            
            {/* Profile Image */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="position-relative"
              style={{ marginRight: "20px" }}
            >
              <img
                src={userData.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=4e73df&color=ffffff&bold=true&size=128`}
                alt={userData.name}
                className="rounded-circle border border-4 border-white shadow"
                style={{ width: "80px", height: "80px", objectFit: "cover" }}
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=4e73df&color=ffffff&bold=true&size=128`;
                }}
              />
              <div 
                className="position-absolute bottom-0 end-0 rounded-circle border border-3 border-white"
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: "#28a745"
                }}
              />
            </motion.div>
          </div>
          
          {/* Decorative elements */}
          <div className="position-absolute top-0 end-0 opacity-10">
            <h1 style={{ fontSize: "100px" }}></h1>
          </div>
        </div>

        {/* STATS CARDS - WITH REAL DATA */}
        <div className="row g-3 mb-4">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              className="col-md-3 col-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div 
                      className="rounded-circle p-2 me-3"
                      style={{ 
                        backgroundColor: `var(--bs-${stat.color})20`,
                        width: "50px",
                        height: "50px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <h4 className="mb-0">{stat.icon}</h4>
                    </div>
                    <div>
                      <h6 className="text-muted mb-1">{stat.label}</h6>
                      <h4 className={`mb-0 text-${stat.color} fw-bold`}>{stat.value}</h4>
                      <small className="text-muted">{stat.description}</small>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* SPECIAL TODAY & QUICK ACTIONS ROW */}
        <div className="row g-4">
          {/* Special Today */}
          <div className="col-lg-6">
            <SpecialToday />
          </div>

          {/* Quick Actions */}
          <div className="col-lg-6">
            <div className="card shadow border-0 h-100">
              <div className="card-body">
                <h5 className="d-flex align-items-center">
                  <span className="me-2">⚡</span>
                  Quick Actions
                </h5>
                <p className="text-muted mb-3">Complete these tasks to boost your business</p>
                
                <div className="d-grid gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn btn-outline-primary d-flex align-items-center justify-content-between p-3"
                    onClick={() => window.location.href = "/datasets"}
                  >
                    <div className="d-flex align-items-center">
                      <span className="me-3">📁</span>
                      <div className="text-start">
                        <div className="fw-bold">Upload Dataset</div>
                        <small>Add business data for AI insights</small>
                      </div>
                    </div>
                    <span>→</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn btn-outline-success d-flex align-items-center justify-content-between p-3"
                    onClick={() => window.location.href = "/customers"}
                  >
                    <div className="d-flex align-items-center">
                      <span className="me-3">👥</span>
                      <div className="text-start">
                        <div className="fw-bold">Manage Customers</div>
                        <small>View and analyze customer data</small>
                      </div>
                    </div>
                    <span>→</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn btn-outline-warning d-flex align-items-center justify-content-between p-3"
                    onClick={() => window.location.href = "/offers"}
                  >
                    <div className="d-flex align-items-center">
                      <span className="me-3">🎁</span>
                      <div className="text-start">
                        <div className="fw-bold">Create Offer</div>
                        <small>Launch promotional campaigns</small>
                      </div>
                    </div>
                    <span>→</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn btn-outline-dark d-flex align-items-center justify-content-between p-3"
                    onClick={() => window.location.href = "/team"}
                  >
                    <div className="d-flex align-items-center">
                      <span className="me-3">👨‍💼</span>
                      <div className="text-start">
                        <div className="fw-bold">Team Management</div>
                        <small>Collaborate with your team</small>
                      </div>
                    </div>
                    <span>→</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI HELP & EMPLOYEE APPROVAL ROW */}
        <div className="row g-4 mt-3">
          {/* AI Assistant */}
          <div className={`${userData.role === "owner" && employees.length > 0 ? "col-lg-6" : "col-12"}`}>
            <div className="card shadow border-0 h-100">
              <div className="card-body">
                <h5 className="d-flex align-items-center">
                  <span className="me-2">🧠</span>
                  AI Assistant
                  <span className="badge bg-success ms-2">Beta</span>
                </h5>
                
                <div className="alert alert-info bg-light border-0">
                  <p className="mb-0">
                    Add business data to unlock:
                  </p>
                  <ul className="mb-0 mt-2">
                    <li>📈 Sales forecasting and predictions</li>
                    <li>🎯 Weak area identification</li>
                    <li>💡 Product opportunity suggestions</li>
                    <li>⚡ Automated marketing strategies</li>
                    <li>📊 Real-time analytics dashboard</li>
                  </ul>
                </div>
                
                <div className="d-flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="btn btn-outline-primary"
                    onClick={() => window.location.href = "/datasets"}
                  >
                    Upload Data
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="btn btn-outline-success"
                    onClick={() => window.location.href = "/analytics"}
                  >
                    View Insights
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* OWNER APPROVAL - ONLY SHOW WHEN THERE ARE PENDING REQUESTS */}
          {userData.role === "owner" && employees.length > 0 && (
            <div className="col-lg-6">
              <div className="card shadow border-0 h-100">
                <div className="card-body">
                  <h5 className="d-flex align-items-center mb-3">
                    <span className="me-2">👨‍💼</span>
                    Employee Approval Requests
                    <span className="badge bg-danger ms-2">{employees.length} pending</span>
                  </h5>

                  {loading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary"></div>
                      <p className="mt-2 text-muted">Loading requests...</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {employees.map(emp => (
                            <motion.tr 
                              key={emp._id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="align-middle"
                            >
                              <td>
                                <div className="d-flex align-items-center">
                                  <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=007bff&color=fff&bold=true`}
                                    alt={emp.name}
                                    className="rounded-circle me-2"
                                    style={{ width: "32px", height: "32px" }}
                                  />
                                  {emp.name}
                                </div>
                              </td>
                              <td>{emp.email}</td>
                              <td>
                                <div className="d-flex gap-1">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="btn btn-success btn-sm"
                                    onClick={() => approve(emp._id)}
                                  >
                                    Approve
                                  </motion.button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* EMPLOYEE VIEW */}
        {userData.role === "employee" && (
          <motion.div 
            className="card shadow border-0 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="card-body">
              <h5 className="d-flex align-items-center">
                <span className="me-2">📋</span>
                Your Dashboard
              </h5>
              <div className="alert alert-info d-flex align-items-center">
                <span className="me-3" style={{ fontSize: "2rem" }}>👨‍💻</span>
                <div>
                  <h6 className="mb-1">Welcome, {userData.name}!</h6>
                  <p className="mb-0 small">
                    You are logged in as an Employee. Access your assigned tasks and view company offers.
                  </p>
                </div>
              </div>
              
              <div className="row mt-3">
                <div className="col-md-6">
                  <div className="card bg-light border">
                    <div className="card-body">
                      <h6>🎯 View Offers</h6>
                      <p className="small text-muted">Check current promotional offers</p>
                      <button 
                        className="btn btn-sm btn-outline-success"
                        onClick={() => window.location.href = "/offers"}
                      >
                        View Offers ({offersCount})
                      </button>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card bg-light border">
                    <div className="card-body">
                      <h6>👥 Team</h6>
                      <p className="small text-muted">View team members ({teamCount})</p>
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => window.location.href = "/team"}
                      >
                        View Team
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* FOOTER */}
        <div className="text-center text-muted mt-5 pt-3 border-top">
          <small>
            Business AI Dashboard • {new Date().getFullYear()} • 
            <span className="text-primary mx-1">v2.0.1</span>
          </small>
        </div>

      </motion.div>
    </Layout>
  );
}
import { useState } from "react";
import api from "../services/api";
import { motion } from "framer-motion";

export default function EmployeeRegister() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    secretCode: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const submit = async () => {
    // Validation
    if (!form.name || !form.email || !form.password || !form.secretCode) {
      setError("Name, Email, Password and Secret Code are required");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const res = await api.post("/api/auth/employee-register", form);
      setSuccess(true);
      setTimeout(() => {
        window.location = "/login";
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please check your secret code.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mt-5" style={{ maxWidth: "450px" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card shadow border-0"
        >
          <div className="card-body p-5 text-center">
            <div className="bg-success bg-gradient text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" 
                 style={{ width: "100px", height: "100px" }}>
              <span style={{ fontSize: "3rem" }}>✅</span>
            </div>
            
            <h3 className="fw-bold mb-3">Request Sent!</h3>
            
            <p className="mb-4">
              Your join request has been sent to the company owner.
              <br />
              <span className="fw-bold">You'll be notified once approved.</span>
            </p>
            
            <div className="alert alert-info">
              <small>
                <i className="bi bi-info-circle me-1"></i>
                Redirecting to login page in 3 seconds...
              </small>
            </div>
            
            <div className="d-grid">
              <a href="/login" className="btn btn-primary">
                Go to Login
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="card shadow border-0">
          <div className="card-body p-4">
            
            {/* 🔥 YOUROMNI AI BRANDING */}
            <div className="text-center mb-4">
              <div className="bg-success bg-gradient text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
                   style={{ width: "70px", height: "70px" }}>
                <span style={{ fontSize: "2rem" }}>🧠</span>
              </div>
              <h2 className="fw-bold">Youromni AI</h2>
              <p className="text-muted">Join Your Company</p>
            </div>
            
            {error && (
              <div className="alert alert-danger d-flex align-items-center" role="alert">
                <span className="me-2">❌</span>
                <div>{error}</div>
              </div>
            )}
            
            {/* Employee Information Section */}
            <h6 className="fw-bold mb-3 d-flex align-items-center">
              <span className="bg-success bg-opacity-10 p-1 rounded me-2">👤</span>
              Your Information
            </h6>
            
            <div className="mb-3">
              <label className="form-label small fw-bold">Full Name</label>
              <div className="input-group">
                <span className="input-group-text bg-light">👤</span>
                <input
                  className="form-control"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold">Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-light">📧</span>
                <input
                  className="form-control"
                  placeholder="employee@company.com"
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label small fw-bold">Phone Number</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">📱</span>
                    <input
                      className="form-control"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label small fw-bold">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">🔒</span>
                    <input
                      className="form-control"
                      type="password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                    />
                  </div>
                  <small className="text-muted">Minimum 6 characters</small>
                </div>
              </div>
            </div>
            
            <hr className="my-4" />
            
            {/* Company Access Section */}
            <h6 className="fw-bold mb-3 d-flex align-items-center">
              <span className="bg-success bg-opacity-10 p-1 rounded me-2">🔑</span>
              Company Access
            </h6>
            
            <div className="mb-4">
              <label className="form-label small fw-bold">Company Secret Code</label>
              <div className="input-group">
                <span className="input-group-text bg-light">🔐</span>
                <input
                  className="form-control"
                  placeholder="Enter 6-digit secret code"
                  value={form.secretCode}
                  onChange={e => setForm({ ...form, secretCode: e.target.value })}
                />
              </div>
              <div className="mt-2">
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  Don't have a code? Ask your company owner to provide the secret code.
                </small>
              </div>
            </div>
            
            <div className="alert alert-warning bg-light border-0 d-flex">
              <span className="me-2">⚠️</span>
              <div className="small">
                <strong>Note:</strong> Your request will need approval from the company owner before you can access the dashboard.
              </div>
            </div>
            
            <div className="d-grid gap-2 mt-4">
              <button
                className="btn btn-success btn-lg"
                onClick={submit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Sending Request...
                  </>
                ) : (
                  "Send Join Request"
                )}
              </button>
            </div>
            
            <hr className="my-4" />
            
            <div className="text-center">
              <p className="mb-1">
                Already have an account? <a href="/login" className="fw-bold text-decoration-none">Login</a>
              </p>
              <p className="mb-0 small text-muted">
                New company? <a href="/register-owner" className="text-decoration-none">Register as Owner</a>
              </p>
            </div>

          </div>
        </div>
        
        <div className="text-center mt-3">
          <small className="text-muted">
            © {new Date().getFullYear()} Youromni AI. All rights reserved.
          </small>
        </div>
      </motion.div>
    </div>
  );
}
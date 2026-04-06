import { useState } from "react";
import api from "../services/api";
import { motion } from "framer-motion";

export default function OwnerRegister() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    companyName: "",
    businessType: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [secretCode, setSecretCode] = useState("");

  const submit = async () => {
    // Validation
    if (!form.name || !form.email || !form.password || !form.companyName) {
      setError("Name, Email, Password and Company Name are required");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const res = await api.post("/api/auth/owner-register", form);
      setSecretCode(res.data.secretCode);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mt-5" style={{ maxWidth: "550px" }}>
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
            
            <h3 className="fw-bold mb-3">Company Created Successfully!</h3>
            
            <div className="alert alert-warning text-start mb-4">
              <div className="d-flex align-items-center mb-2">
                <span className="badge bg-danger me-2">⚠️ IMPORTANT</span>
                <span className="fw-bold">Save this Secret Code</span>
              </div>
              <p className="mb-2">Your employees will need this code to join your company:</p>
              <div className="bg-dark text-white p-3 rounded text-center">
                <code style={{ fontSize: "1.5rem", letterSpacing: "4px" }}>{secretCode}</code>
              </div>
              <p className="mt-3 mb-0 small text-muted">
                <i className="bi bi-info-circle me-1"></i>
                This code will not be shown again. Please save it securely.
              </p>
            </div>
            
            <div className="d-grid gap-2">
              <a href="/login" className="btn btn-primary btn-lg">
                Proceed to Login
              </a>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => {
                  navigator.clipboard.writeText(secretCode);
                  alert("Secret code copied to clipboard!");
                }}
              >
                📋 Copy Secret Code
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mt-5" style={{ maxWidth: "550px" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="card shadow border-0">
          <div className="card-body p-4">
            
            {/* 🔥 YOUROMNI AI BRANDING */}
            <div className="text-center mb-4">
              <div className="bg-primary bg-gradient text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
                   style={{ width: "70px", height: "70px" }}>
                <span style={{ fontSize: "2rem" }}>🧠</span>
              </div>
              <h2 className="fw-bold">Youromni AI</h2>
              <p className="text-muted">Create Your Company Account</p>
            </div>
            
            {error && (
              <div className="alert alert-danger d-flex align-items-center" role="alert">
                <span className="me-2">❌</span>
                <div>{error}</div>
              </div>
            )}
            
            {/* Owner Information Section */}
            <h6 className="fw-bold mb-3 d-flex align-items-center">
              <span className="bg-primary bg-opacity-10 p-1 rounded me-2">👤</span>
              Owner Information
            </h6>
            
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label small fw-bold">Full Name</label>
                  <input
                    className="form-control"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label small fw-bold">Email Address</label>
                  <input
                    className="form-control"
                    placeholder="owner@company.com"
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label small fw-bold">Phone Number</label>
                  <input
                    className="form-control"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label small fw-bold">Password</label>
                  <input
                    className="form-control"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                  />
                  <small className="text-muted">Minimum 6 characters</small>
                </div>
              </div>
            </div>
            
            <hr className="my-4" />
            
            {/* Company Information Section */}
            <h6 className="fw-bold mb-3 d-flex align-items-center">
              <span className="bg-primary bg-opacity-10 p-1 rounded me-2">🏢</span>
              Company Information
            </h6>
            
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label small fw-bold">Company Name</label>
                  <input
                    className="form-control"
                    placeholder="Your Business Name"
                    value={form.companyName}
                    onChange={e => setForm({ ...form, companyName: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label small fw-bold">Business Type</label>
                  <select
                    className="form-select"
                    value={form.businessType}
                    onChange={e => setForm({ ...form, businessType: e.target.value })}
                  >
                    <option value="">Select business type</option>
                    <option value="Retail">Retail</option>
                    <option value="Wholesale">Wholesale</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Services">Services</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="alert alert-info bg-light border-0 mt-3">
              <div className="d-flex">
                <span className="me-2">ℹ️</span>
                <div className="small">
                  <strong>Youromni AI</strong> will generate a unique secret code for your company. 
                  Share this code with employees to allow them to join your organization.
                </div>
              </div>
            </div>
            
            <div className="d-grid gap-2 mt-4">
              <button
                className="btn btn-primary btn-lg"
                onClick={submit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Creating Company...
                  </>
                ) : (
                  "Create Company & Generate Secret Code"
                )}
              </button>
            </div>
            
            <hr className="my-4" />
            
            <div className="text-center">
              <p className="mb-1">
                Already have an account? <a href="/login" className="fw-bold text-decoration-none">Login</a>
              </p>
              <p className="mb-0 small text-muted">
                Employee? <a href="/register-employee" className="text-decoration-none">Join existing company</a>
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
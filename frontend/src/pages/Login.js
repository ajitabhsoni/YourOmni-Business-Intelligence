import { useState } from "react";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    // Validation
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      console.log("📡 Sending login request...");
      
      const res = await api.post("/api/auth/login", { 
        email: email.trim(), 
        password: password 
      });
      
      console.log("✅ Login response:", res.data);
      
      // ✅ CHECK: Is user data present?
      if (!res.data.user) {
        throw new Error("No user data received");
      }
      
      // ✅ SAVE ALL USER DATA
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user._id);
      localStorage.setItem("name", res.data.user.name);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("email", res.data.user.email);
      
      // Handle profile image
      if (res.data.user.profileImage) {
        // If it's already a full URL
        if (res.data.user.profileImage.startsWith("http")) {
          localStorage.setItem("profileImage", res.data.user.profileImage);
        } else {
          // If it's just a filename
          localStorage.setItem("profileImage", "https://youromni-backend.onrender.com/uploads/" + res.data.user.profileImage);
        }
      } else {
        localStorage.setItem("profileImage", "");
      }
      
      console.log("✅ Login successful! Redirecting...");
      
      // ✅ REDIRECT
      window.location.href = "/dashboard";
      
    } catch (err) {
      console.error("❌ Login error:", err);
      
      // Show user-friendly error
      if (err.response) {
        // Server responded with error
        setError(err.response.data?.message || "Invalid email or password");
      } else if (err.request) {
        // No response from server
        setError("Cannot connect to server. Please check if backend is running.");
      } else {
        // Other error
        setError(err.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <div className="card shadow border-0">
        <div className="card-body p-4">
          
          <div className="text-center mb-4">
            <h2 className="fw-bold">📊 Youromni AI</h2>
            <p className="text-muted">Login to your account</p>
          </div>
          
          {/* ERROR MESSAGE */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <span className="me-2">❌</span>
              <div>{error}</div>
            </div>
          )}
          
          {/* EMAIL INPUT */}
          <div className="mb-3">
            <label className="form-label fw-bold">Email</label>
            <input
              type="email"
              className="form-control form-control-lg"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* PASSWORD INPUT */}
          <div className="mb-4">
            <label className="form-label fw-bold">Password</label>
            <input
              type="password"
              className="form-control form-control-lg"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              onKeyDown={e => e.key === "Enter" && login()}
            />
          </div>

          {/* LOGIN BUTTON */}
          <button 
            className="btn btn-primary w-100 btn-lg mb-3" 
            onClick={login}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>

          <hr className="my-4" />

          <div className="text-center">
            <p className="mb-2">
              New company?{" "}
              <a href="/register-owner" className="text-primary fw-bold text-decoration-none">
                Register as Owner
              </a>
            </p>
            <p className="mb-0">
              Employee?{" "}
              <a href="/register-employee" className="text-success fw-bold text-decoration-none">
                Join Company
              </a>
            </p>
          </div>

        </div>
      </div>
      
      {/* DEBUG INFO - REMOVE IN PRODUCTION */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mt-3 p-3 bg-light rounded small">
          <details>
            <summary className="fw-bold">🔧 Debug Info</summary>
            <pre className="mt-2 mb-0">
              {`Backend URL: http://localhost:5000
Email: ${email}
Password: ${password ? '✓ entered' : '✗ empty'}`}
            </pre>
          </details>
        </div>
      )}
      
    </div>
  );
}

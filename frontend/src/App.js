import { BrowserRouter, Routes, Route } from "react-router-dom";

// Auth Pages
import Login from "./pages/Login";
import OwnerRegister from "./pages/OwnerRegister";
import EmployeeRegister from "./pages/EmployeeRegister";

// Main Pages
import Dashboard from "./pages/Dashboard";
import Datasets from "./pages/Datasets";
import Analytics from "./pages/Analytics";
import Team from "./pages/Team";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import Customers from "./pages/Customers";
import FailedCustomers from "./pages/FailedCustomers";
import Forecast from "./pages/Forecast";
import Strategy from "./pages/Strategy";
import Offers from "./pages/Offers";

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login";
    return null;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register-owner" element={<OwnerRegister />} />
        <Route path="/register-employee" element={<EmployeeRegister />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/datasets" element={
          <ProtectedRoute>
            <Datasets />
          </ProtectedRoute>
        } />
        
        <Route path="/analytics/:id" element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } />
        
        <Route path="/team" element={
          <ProtectedRoute>
            <Team />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        
        <Route path="/chat/:userId" element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        } />
        
        <Route path="/customers" element={
          <ProtectedRoute>
            <Customers />
          </ProtectedRoute>
        } />
        
        <Route path="/offers" element={
          <ProtectedRoute>
            <Offers />
          </ProtectedRoute>
        } />
        
        <Route path="/offers/failed/:id" element={
          <ProtectedRoute>
            <FailedCustomers />
          </ProtectedRoute>
        } />
        
        <Route path="/forecast/:id" element={
          <ProtectedRoute>
            <Forecast />
          </ProtectedRoute>
        } />
        
        <Route path="/strategy/:id" element={
          <ProtectedRoute>
            <Strategy />
          </ProtectedRoute>
        } />

        {/* 404 Redirect */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
import React from "react";
import { Routes, Route, Navigate, Link, NavLink, useNavigate } from "react-router-dom";
import AuthProvider, { useAuth } from "./AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Subjects from "./pages/Subjects";
import Reports from "./pages/Reports";
import "./App.css"; 

// Private route wrapper

function Private({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

// Sidebar component for navigation
function SideBar() {
  const { logout } = useAuth();
  const nav = useNavigate();
  return (
    <div className="sidebar">
      <div>
        <Link to="/" className="title" style={{ display: 'block', marginBottom: 32 }}>📚 Study Time Tracker</Link>
        <nav className="sidebar-nav">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/subjects">Subjects</NavLink>
          <NavLink to="/reports">Reports</NavLink>
        </nav>
      </div>
      <button className="btn secondary" onClick={() => { logout(); nav("/login"); }}>Logout</button>
    </div>
  );
}

// Main layout for authenticated users
function AppLayout() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return (
    <div className="app-layout">
      <SideBar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Private><Dashboard /></Private>} />
          <Route path="/subjects" element={<Private><Subjects /></Private>} />
          <Route path="/reports" element={<Private><Reports /></Private>} />
        </Routes>
      </main>
    </div>
  );
}

// Root App component with routing logic
export default function App() {
  return (
    <AuthProvider>
      {/* Used only for Login & Registration page */}
      <Routes>
        <Route path="/login" element={<div className="container"><Login /></div>} />
        <Route path="/register" element={<div className="container"><Register /></div>} />
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </AuthProvider>
  );
}

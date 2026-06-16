
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { 
  subscribeToComplaints, 
  addComplaintToFirebase, 
  patchComplaintInFirebase,
  observeAuth,
  getUserProfile
} from "./utils/constants";

// Pages
import Landing from "./components/Landing";
import StudentPortal from "./pages/student/StudentPortal";
import ManagementPanel from "./pages/management/ManagementPanel";
import StudentLogin from "./pages/auth/StudentLogin";
import ManagementLogin from "./pages/auth/ManagementLogin";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole, user }) => {
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Auth Observer
  useEffect(() => {
    const unsubscribe = observeAuth(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        setUser(profile ? { ...firebaseUser, ...profile } : null);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Use Firebase Real-time Subscription
  useEffect(() => {
    const unsubscribe = subscribeToComplaints((list) => {
      setComplaints(list);
    });
    return () => unsubscribe();
  }, []);

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "Pending").length,
    inProgress: complaints.filter((c) => c.status === "In Progress").length,
    resolved: complaints.filter((c) => c.status === "Resolved").length,
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        background: "var(--bg-dark)", 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center",
        color: "var(--text-dark-primary)",
        gap: "16px"
      }}>
        <div style={{
          width: "36px",
          height: "36px",
          border: "3px solid rgba(59, 130, 246, 0.1)",
          borderTopColor: "var(--primary-dark)",
          borderRadius: "50%",
        }} className="animate-spin" />
        <h2 style={{ fontSize: "16px", fontWeight: 500, letterSpacing: "0.5px" }}>Loading HostelDesk...</h2>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing stats={stats} />} />
        
        {/* Auth Routes */}
        <Route path="/login/student" element={<StudentLogin />} />
        <Route path="/login/management" element={<ManagementLogin />} />
        
        {/* Protected Routes */}
        <Route 
          path="/student" 
          element={
            <ProtectedRoute allowedRole="student" user={user}>
              <StudentPortal 
                complaints={complaints} 
                addComplaint={addComplaintToFirebase} 
                patchComplaint={patchComplaintInFirebase} 
              />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/management" 
          element={
            <ProtectedRoute allowedRole="management" user={user}>
              <ManagementPanel 
                complaints={complaints} 
                patchComplaint={patchComplaintInFirebase} 
                stats={stats} 
              />
            </ProtectedRoute>
          } 
        />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

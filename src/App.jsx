
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { 
  subscribeToComplaints, 
  addComplaintToFirebase, 
  patchComplaintInFirebase 
} from "./utils/constants";

// Pages
import Landing from "./components/Landing";
import StudentPortal from "./pages/student/StudentPortal";
import ManagementPanel from "./pages/management/ManagementPanel";
import StudentLogin from "./pages/auth/StudentLogin";
import ManagementLogin from "./pages/auth/ManagementLogin";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }) => {
  const userStr = localStorage.getItem("hosteldesk_user");
  const user = userStr ? JSON.parse(userStr) : null;

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

  // Use Firebase Real-time Subscription
  useEffect(() => {
    const unsubscribe = subscribeToComplaints((list) => {
      setComplaints(list);
      setLoading(false);
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
        background: "#0D1B2A", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        color: "#E0F2FE",
        fontFamily: "'Sora', sans-serif"
      }}>
        <h2>Loading HostelDesk...</h2>
      </div>
    );
  }

  return (
    <Router>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'DM Sans','Segoe UI',sans-serif; }
        input,textarea,select { font-family:inherit; }
      `}</style>
      
      <Routes>
        <Route path="/" element={<Landing stats={stats} />} />
        
        {/* Auth Routes */}
        <Route path="/login/student" element={<StudentLogin />} />
        <Route path="/login/management" element={<ManagementLogin />} />
        
        {/* Protected Routes */}
        <Route 
          path="/student" 
          element={
            <ProtectedRoute allowedRole="student">
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
            <ProtectedRoute allowedRole="management">
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


import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function StudentLogin() {
  const [studentId, setStudentId] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (studentId.trim()) {
      // Mock login: Store user info in localStorage
      localStorage.setItem("hosteldesk_user", JSON.stringify({ role: "student", id: studentId }));
      navigate("/student");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0D1B2A",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        background: "#16263A",
        border: "1px solid #243B55",
        borderRadius: "20px",
        padding: "40px",
        width: "100%",
        maxWidth: "400px",
        textAlign: "center"
      }}>
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>🎓</div>
        <h1 style={{ color: "#E0F2FE", fontFamily: "'Sora', sans-serif", marginBottom: "10px" }}>Student Login</h1>
        <p style={{ color: "#546E7A", marginBottom: "30px" }}>Enter your Student ID to access the portal</p>
        
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <input
            type="text"
            placeholder="Student ID (e.g. STU123)"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            style={{
              padding: "14px",
              borderRadius: "10px",
              border: "1.5px solid #243B55",
              background: "#0D1B2A",
              color: "white",
              outline: "none"
            }}
            required
          />
          <button type="submit" style={{
            padding: "14px",
            background: "linear-gradient(135deg, #1565C0, #0288D1)",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontWeight: 700,
            cursor: "pointer"
          }}>
            Login
          </button>
        </form>
        
        <Link to="/" style={{ color: "#4FC3F7", display: "block", marginTop: "20px", textDecoration: "none", fontSize: "14px" }}>
          ← Back to Selection
        </Link>
      </div>
    </div>
  );
}

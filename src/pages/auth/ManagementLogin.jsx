
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function ManagementLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "admin123") {
      // Mock login: Store user info in localStorage
      localStorage.setItem("hosteldesk_user", JSON.stringify({ role: "management" }));
      navigate("/management");
    } else {
      setError("Invalid admin password!");
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
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>🛠️</div>
        <h1 style={{ color: "#E0F2FE", fontFamily: "'Sora', sans-serif", marginBottom: "10px" }}>Management Login</h1>
        <p style={{ color: "#546E7A", marginBottom: "30px" }}>Enter admin password to access the panel</p>
        
        {error && <div style={{ color: "#F44336", marginBottom: "20px", fontSize: "14px" }}>{error}</div>}
        
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            background: "linear-gradient(135deg, #0288D1, #01579B)",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontWeight: 700,
            cursor: "pointer"
          }}>
            Login as Admin
          </button>
        </form>
        
        <div style={{ marginTop: "20px", color: "#37474F", fontSize: "12px" }}>
          Hint: admin123
        </div>
        
        <Link to="/" style={{ color: "#4FC3F7", display: "block", marginTop: "20px", textDecoration: "none", fontSize: "14px" }}>
          ← Back to Selection
        </Link>
      </div>
    </div>
  );
}

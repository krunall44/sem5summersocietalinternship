import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../utils/constants";
import { auth, db } from "../../utils/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import ThemeToggle from "../../components/ThemeToggle";

const UserIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--primary-color)" }}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export default function StudentLogin() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", res.user.uid), {
          name: studentName,
          id: studentId,
          role: "student",
          email: email
        });
        navigate("/student");
      } else {
        const res = await loginUser(email, password);
        const userDoc = await getDoc(doc(db, "users", res.user.uid));
        if (userDoc.exists() && userDoc.data().role === "student") {
          navigate("/student");
        } else {
          setError("Access denied. This portal is for students only.");
          setLoading(false);
        }
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-radial)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
      transition: "background var(--transition-normal)"
    }}>
      {/* Theme Toggle Positioned Top-Right */}
      <div style={{ position: "absolute", top: "24px", right: "24px", zIndex: 100 }}>
        <ThemeToggle />
      </div>

      {/* Decorative Blob */}
      <div style={{
        position: "absolute",
        top: "25%",
        left: "25%",
        width: "300px",
        height: "300px",
        background: "var(--primary-glow)",
        borderRadius: "50%",
        filter: "blur(90px)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      <div 
        className="glass-panel animate-fade-in"
        style={{
          padding: "44px 36px",
          width: "100%",
          maxWidth: "440px",
          textAlign: "center",
          borderRadius: "var(--radius-lg)",
          position: "relative",
          zIndex: 1
        }}
      >
        <div style={{ 
          display: "inline-flex", 
          padding: "16px", 
          background: "var(--primary-glow)", 
          borderRadius: "var(--radius-md)", 
          marginBottom: "24px",
          border: "1px solid var(--border-color)"
        }}>
          <UserIcon />
        </div>
        
        <h1 style={{ 
          color: "var(--text-primary)", 
          fontSize: "24px", 
          fontWeight: 700,
          letterSpacing: "-0.5px", 
          marginBottom: "8px" 
        }}>
          {isSignUp ? "Student Register" : "Student Login"}
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "32px", opacity: 0.8 }}>
          {isSignUp ? "Create your credentials to submit complaints" : "Enter credentials to access your student desk"}
        </p>
        
        {error && (
          <div style={{ 
            color: "#ef4444", 
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.15)",
            padding: "12px",
            borderRadius: "var(--radius-sm)",
            marginBottom: "24px", 
            fontSize: "13px",
            textAlign: "left"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {isSignUp && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="form-input"
                required
              />
              <input
                type="text"
                placeholder="Student ID (e.g. 21BCE001)"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="form-input"
                required
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            required
          />
          
          <button 
            type="submit" 
            disabled={loading} 
            className="btn-primary"
            style={{
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "8px",
              width: "100%"
            }}
          >
            {loading ? "Processing..." : (isSignUp ? "Register" : "Login")}
          </button>
        </form>
        
        <button 
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError("");
          }}
          style={{ 
            display: "block",
            margin: "24px auto 0",
            background: "none", 
            border: "none", 
            color: "var(--primary-color)", 
            cursor: "pointer", 
            fontSize: "14px",
            fontWeight: 500,
            transition: "color var(--transition-fast)"
          }}
          onMouseOver={(e) => e.target.style.color = "var(--primary-hover)"}
          onMouseOut={(e) => e.target.style.color = "var(--primary-color)"}
        >
          {isSignUp ? "Already have an account? Login" : "Don't have an account? Register"}
        </button>

        <Link 
          to="/" 
          style={{ 
            display: "block",
            margin: "16px auto 0",
            color: "var(--text-secondary)", 
            textDecoration: "none", 
            fontSize: "13px",
            opacity: 0.7,
            width: "fit-content",
            transition: "opacity var(--transition-fast)"
          }}
          onMouseOver={(e) => e.target.style.opacity = "1"}
          onMouseOut={(e) => e.target.style.opacity = "0.7"}
        >
          ← Back to selection
        </Link>
      </div>
    </div>
  );
}

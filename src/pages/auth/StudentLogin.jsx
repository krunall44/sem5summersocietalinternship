
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../utils/constants";
import { auth, db } from "../../utils/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

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
        // Validation for Sign Up
        if (!email.endsWith(".edu") && !email.includes("college")) {
           // Basic check for email - you can customize this!
           // setError("Please use your official email.");
           // setLoading(false);
           // return;
        }

        const res = await createUserWithEmailAndPassword(auth, email, password);
        // Save user profile to Firestore
        await setDoc(doc(db, "users", res.user.uid), {
          name: studentName,
          id: studentId,
          role: "student",
          email: email
        });
        navigate("/student");
      } else {
        const res = await loginUser(email, password);
        // Verify role
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
        maxWidth: "450px",
        textAlign: "center"
      }}>
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>🎓</div>
        <h1 style={{ color: "#E0F2FE", fontFamily: "'Sora', sans-serif", marginBottom: "10px" }}>
          {isSignUp ? "Student Register" : "Student Login"}
        </h1>
        <p style={{ color: "#546E7A", marginBottom: "30px" }}>
          {isSignUp ? "Create an account to submit complaints" : "Enter your credentials to access the portal"}
        </p>
        
        {error && <div style={{ color: "#F44336", marginBottom: "20px", fontSize: "13px" }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {isSignUp && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                style={inputStyle}
                required
              />
              <input
                type="text"
                placeholder="Student ID (e.g. 21BCE001)"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                style={inputStyle}
                required
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
          />
          <button type="submit" disabled={loading} style={{
            ...buttonStyle,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer"
          }}>
            {loading ? "Processing..." : (isSignUp ? "Register" : "Login")}
          </button>
        </form>
        
        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          style={{ background: "none", border: "none", color: "#4FC3F7", marginTop: "20px", cursor: "pointer", fontSize: "14px" }}
        >
          {isSignUp ? "Already have an account? Login" : "Don't have an account? Register"}
        </button>

        <Link to="/" style={{ color: "#78909C", display: "block", marginTop: "15px", textDecoration: "none", fontSize: "13px" }}>
          ← Back to Selection
        </Link>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "14px",
  borderRadius: "10px",
  border: "1.5px solid #243B55",
  background: "#0D1B2A",
  color: "white",
  outline: "none"
};

const buttonStyle = {
  padding: "14px",
  background: "linear-gradient(135deg, #1565C0, #0288D1)",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontWeight: 700,
  marginTop: "10px"
};

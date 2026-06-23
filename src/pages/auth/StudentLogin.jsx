import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, sendVerificationEmail } from "../../utils/constants";
import { auth, db } from "../../utils/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
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
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isSignUp) {
        let res;
        try {
          res = await createUserWithEmailAndPassword(auth, email, password);
        } catch (err) {
          if (err.code === "auth/email-already-in-use") {
            try {
              // Account exists in Firebase Auth. Check if we can sign in with the password
              // to confirm ownership, and recreate the Firestore profile if it is missing.
              const loginRes = await loginUser(email, password);
              const userDoc = await getDoc(doc(db, "users", loginRes.user.uid));
              if (!userDoc.exists()) {
                res = loginRes;
              } else {
                throw err;
              }
            } catch (loginErr) {
              throw err;
            }
          } else {
            throw err;
          }
        }
        // Send verification email before creating Firestore profile
        await sendVerificationEmail(res.user);
        setShowVerify(true);
        setLoading(false);
        return;
      } else {
        const res = await loginUser(email, password);
        const userDoc = await getDoc(doc(db, "users", res.user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role === "student") {
            if (userData.approved) {
              navigate("/student");
            } else {
              setError("Your registration is pending admin approval. Please check back later.");
              setLoading(false);
            }
          } else {
            setError("Access denied. This portal is for students only.");
            setLoading(false);
          }
        } else {
          setError("User profile not found.");
          setLoading(false);
        }
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    setLoading(true);
    setError("");
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        await setDoc(doc(db, "users", auth.currentUser.uid), {
          name: studentName,
          id: studentId,
          role: "student",
          email: email,
          approved: false,
          rejected: false,
          createdAt: new Date().toISOString()
        });
        setShowVerify(false);
        setError("");
        setMessage("Email verified! You can login after admin approval.");
        setEmail("");
        setPassword("");
        setStudentName("");
        setStudentId("");
      } else {
        setError("Email not verified yet. Please check your inbox and click the verification link.");
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleResendVerification = async () => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await sendVerificationEmail(user);
        setMessage("Verification email resent. Please check your inbox.");
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const [statusType, setStatusType] = useState("");

  const handleCheckStatus = async () => {
    setError("");
    setMessage("");
    setStatusType("");
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setLoading(true);
    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        setError("No account found with this email. Please register first.");
      } else {
        const userData = snapshot.docs[0].data();
        if (userData.approved) {
          setMessage("Your account is approved! You can login now.");
          setStatusType("approved");
        } else if (userData.rejected) {
          setMessage("Your registration has been rejected. Please contact admin.");
          setStatusType("rejected");
        } else {
          setMessage("Your registration is pending admin approval. Please check back later.");
          setStatusType("pending");
        }
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
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
          {isSignUp ? "Create your credentials to get started" : "Enter credentials to access your student desk"}
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

        {message && (
          <div style={{ 
            color: statusType === "rejected" ? "#ef4444" : statusType === "pending" ? "#f59e0b" : "#10b981", 
            background: statusType === "rejected" ? "rgba(239, 68, 68, 0.08)" : statusType === "pending" ? "rgba(245, 158, 11, 0.08)" : "rgba(16, 185, 129, 0.08)",
            border: statusType === "rejected" ? "1px solid rgba(239, 68, 68, 0.15)" : statusType === "pending" ? "1px solid rgba(245, 158, 11, 0.15)" : "1px solid rgba(16, 185, 129, 0.15)",
            padding: "12px",
            borderRadius: "var(--radius-sm)",
            marginBottom: "24px", 
            fontSize: "13px",
            textAlign: "left"
          }}>
            {message}
          </div>
        )}

        {showVerify ? (
          <div style={{ textAlign: "center" }}>
            <div style={{
              display: "inline-flex",
              padding: "12px",
              background: "var(--primary-glow)",
              borderRadius: "50%",
              marginBottom: "16px",
              border: "1px solid var(--border-color)"
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <h2 style={{ color: "var(--text-primary)", fontSize: "20px", fontWeight: 600, marginBottom: "12px" }}>
              Verify Your Email
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px", lineHeight: 1.6 }}>
              A verification email has been sent to <strong>{email}</strong>.<br />
              Please check your inbox and click the verification link.
            </p>
            <button 
              onClick={handleVerifyEmail}
              disabled={loading}
              className="btn-primary"
              style={{
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
                width: "100%",
                marginBottom: "12px"
              }}
            >
              {loading ? "Checking..." : "I've verified my email"}
            </button>
            <button 
              onClick={handleResendVerification}
              disabled={loading}
              style={{
                display: "block",
                width: "100%",
                padding: "10px 0",
                background: "none",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-secondary)",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "13px",
                transition: "all var(--transition-fast)"
              }}
              onMouseOver={(e) => { if (!loading) e.target.style.borderColor = "var(--primary-color)"; }}
              onMouseOut={(e) => { if (!loading) e.target.style.borderColor = "var(--border-color)"; }}
            >
              Resend verification email
            </button>
          </div>
        ) : (
          <>
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
            {!isSignUp && (
              <button 
                onClick={handleCheckStatus}
                disabled={loading}
                style={{ 
                  display: "block",
                  margin: "12px auto 0",
                  background: "none", 
                  border: "none", 
                  color: "var(--text-secondary)", 
                  cursor: loading ? "not-allowed" : "pointer", 
                  fontSize: "13px",
                  opacity: 0.7,
                  transition: "opacity var(--transition-fast)"
                }}
                onMouseOver={(e) => { if (!loading) e.target.style.opacity = "1"; }}
                onMouseOut={(e) => { if (!loading) e.target.style.opacity = "0.7"; }}
              >
                Check Approval Status
              </button>
            )}
          </>
        )}

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

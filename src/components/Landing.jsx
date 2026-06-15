
import React from "react";
import { Link } from "react-router-dom";

export default function Landing({ stats }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0D1B2A",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <style>{`
        .lcard { background:#16263A; border:1px solid #243B55; border-radius:20px; padding:36px; width:100%; max-width:300px; cursor:pointer; transition:all .25s; text-align:center; text-decoration: none; }
        .lcard:hover { transform:translateY(-6px); border-color:#4FC3F7; box-shadow:0 20px 50px rgba(79,195,247,.15); }
      `}</style>

      <div style={{ textAlign: "center", marginBottom: "44px" }}>
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>🏠</div>
        <h1
          style={{
            fontFamily: "'Sora',sans-serif",
            color: "#E0F2FE",
            fontSize: "clamp(24px,5vw,38px)",
            fontWeight: 800,
            marginBottom: "8px",
          }}
        >
          HostelDesk
        </h1>
        <p style={{ color: "#546E7A", fontSize: "14px" }}>
          Smart Hostel Complaint & Maintenance System
        </p>
        <div
          style={{
            width: "48px",
            height: "3px",
            background: "linear-gradient(90deg,#4FC3F7,#0288D1)",
            borderRadius: "2px",
            margin: "16px auto 0",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: "44px",
        }}
      >
        {[
          {
            icon: "🎓",
            badge: "STUDENT",
            title: "Student Portal",
            desc: "Submit complaints & track their status in real time.",
            to: "/login/student",
          },
          {
            icon: "🛠️",
            badge: "MANAGEMENT",
            title: "Management Panel",
            desc: "Manage all complaints, assign tasks & post updates.",
            to: "/login/management",
          },
        ].map((p) => (
          <Link key={p.to} to={p.to} className="lcard">
            <div style={{ fontSize: "44px", marginBottom: "14px" }}>
              {p.icon}
            </div>
            <span
              style={{
                background: "#1E3A5F",
                color: "#4FC3F7",
                fontSize: "10px",
                padding: "3px 10px",
                borderRadius: "20px",
                fontWeight: 700,
                letterSpacing: "1px",
              }}
            >
              {p.badge}
            </span>
            <h2
              style={{
                color: "#E0F2FE",
                fontFamily: "'Sora',sans-serif",
                fontSize: "18px",
                margin: "12px 0 8px",
              }}
            >
              {p.title}
            </h2>
            <p
              style={{
                color: "#546E7A",
                fontSize: "13px",
                lineHeight: 1.6,
                marginBottom: "20px",
              }}
            >
              {p.desc}
            </p>
            <div
              style={{
                background: "#1E3A5F",
                color: "#4FC3F7",
                padding: "10px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              Enter →
            </div>
          </Link>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: "28px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {[
          ["📋", stats.total, "Total"],
          ["⏳", stats.pending, "Pending"],
          ["🔧", stats.inProgress, "In Progress"],
          ["✅", stats.resolved, "Resolved"],
        ].map(([icon, val, label]) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "18px" }}>{icon}</div>
            <div
              style={{
                color: "#4FC3F7",
                fontFamily: "'Sora',sans-serif",
                fontSize: "24px",
                fontWeight: 800,
              }}
            >
              {val}
            </div>
            <div
              style={{ color: "#37474F", fontSize: "11px", marginTop: "2px" }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      <p
        style={{
          color: "#1E2D3D",
          marginTop: "36px",
          fontSize: "11px",
          textAlign: "center",
        }}
      >
        Problem #35 · Smart Hostel · Societal Internship 2026 · Powered by
        Claude AI
      </p>
    </div>
  );
}

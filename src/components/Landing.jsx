import React from "react";
import { Link } from "react-router-dom";

// Premium Custom SVG Icons
const LogoIcon = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 9.5L12 4L21 9.5V19.5C21 20.0523 20.5523 20.5 20 20.5H4C3.44772 20.5 3 20.0523 3 19.5V9.5Z" stroke="url(#logo-grad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 20.5V13H15V20.5" stroke="url(#logo-grad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    <defs>
      <linearGradient id="logo-grad" x1="3" y1="4" x2="21" y2="20.5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#60a5fa" />
        <stop offset="1" stopColor="#3b82f6" />
      </linearGradient>
    </defs>
  </svg>
);

const StudentIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
  </svg>
);

const ManagementIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

const TotalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const PendingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const ProgressIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const ResolvedIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

export default function Landing({ stats }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 50% 50%, #0e1626 0%, #030712 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Dynamic Background Blur Blobs */}
      <div style={{
        position: "absolute",
        top: "15%",
        left: "10%",
        width: "350px",
        height: "350px",
        background: "rgba(59, 130, 246, 0.08)",
        borderRadius: "50%",
        filter: "blur(100px)",
        pointerEvents: "none",
        zIndex: 0
      }} />
      <div style={{
        position: "absolute",
        bottom: "15%",
        right: "10%",
        width: "400px",
        height: "400px",
        background: "rgba(99, 102, 241, 0.06)",
        borderRadius: "50%",
        filter: "blur(120px)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      <style>{`
        .portal-card {
          width: 100%;
          max-width: 340px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          text-decoration: none;
          padding: 40px 30px;
          border-radius: var(--radius-lg);
        }
        .portal-card .icon-wrapper {
          padding: 18px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-md);
          color: var(--text-dark-secondary);
          margin-bottom: 24px;
          transition: all var(--transition-normal);
        }
        .portal-card:hover .icon-wrapper {
          color: #60a5fa;
          background: rgba(59, 130, 246, 0.08);
          border-color: rgba(59, 130, 246, 0.2);
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.1);
        }
        .portal-card .card-btn {
          width: 100%;
          padding: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: var(--text-dark-secondary);
          border-radius: var(--radius-md);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.5px;
          transition: all var(--transition-normal);
          margin-top: auto;
        }
        .portal-card:hover .card-btn {
          background: var(--primary-dark);
          border-color: var(--primary-dark);
          color: white;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.25);
        }
        .stat-glow {
          transition: all var(--transition-normal);
        }
        .stat-glow:hover {
          background: rgba(255, 255, 255, 0.02) !important;
          border-color: rgba(255, 255, 255, 0.08) !important;
        }
      `}</style>

      {/* Header Info */}
      <div style={{ textAlign: "center", marginBottom: "48px", position: "relative", zIndex: 1 }} className="animate-fade-in">
        <div style={{ display: "inline-flex", justifyContent: "center", marginBottom: "16px" }}>
          <LogoIcon />
        </div>
        <h1
          style={{
            color: "var(--text-dark-primary)",
            fontSize: "clamp(28px, 6vw, 42px)",
            fontWeight: 800,
            letterSpacing: "-0.5px",
            marginBottom: "12px",
          }}
        >
          HostelDesk
        </h1>
        <p style={{ color: "var(--text-dark-secondary)", fontSize: "14px", fontWeight: 400, opacity: 0.85 }}>
          Smart Hostel Complaint & Maintenance Hub
        </p>
      </div>

      {/* Portal Selection Cards */}
      <div
        style={{
          display: "flex",
          gap: "24px",
          flexWrap: "wrap",
          justifyContent: "center",
          width: "100%",
          maxWidth: "760px",
          marginBottom: "56px",
          position: "relative",
          zIndex: 1
        }}
        className="animate-fade-in"
      >
        {[
          {
            icon: <StudentIcon />,
            badge: "STUDENT PORTAL",
            title: "Student Desk",
            desc: "Log queries, request room repairs, and track real-time issue updates.",
            to: "/login/student",
          },
          {
            icon: <ManagementIcon />,
            badge: "ADMIN PORTAL",
            title: "Management Panel",
            desc: "Monitor incoming items, delegate jobs, and communicate progress details.",
            to: "/login/management",
          },
        ].map((p, idx) => (
          <Link key={p.to} to={p.to} className="portal-card glass-panel glass-panel-hover" style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className="icon-wrapper">
              {p.icon}
            </div>
            <span
              style={{
                background: "rgba(59, 130, 246, 0.08)",
                color: "#60a5fa",
                fontSize: "10px",
                padding: "4px 12px",
                borderRadius: "20px",
                fontWeight: 700,
                letterSpacing: "1px",
              }}
            >
              {p.badge}
            </span>
            <h2
              style={{
                color: "var(--text-dark-primary)",
                fontSize: "20px",
                fontWeight: 700,
                margin: "16px 0 8px",
              }}
            >
              {p.title}
            </h2>
            <p
              style={{
                color: "var(--text-dark-secondary)",
                fontSize: "13.5px",
                lineHeight: 1.6,
                marginBottom: "28px",
                opacity: 0.8
              }}
            >
              {p.desc}
            </p>
            <div className="card-btn">
              Open Portal
            </div>
          </Link>
        ))}
      </div>

      {/* Modern Metric Counter Rows */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "16px",
          width: "100%",
          maxWidth: "680px",
          position: "relative",
          zIndex: 1,
        }}
        className="animate-fade-in"
      >
        {[
          { icon: <TotalIcon />, val: stats.total, label: "Total items", color: "#60a5fa" },
          { icon: <PendingIcon />, val: stats.pending, label: "Pending", color: "#fbbf24" },
          { icon: <ProgressIcon />, val: stats.inProgress, label: "In progress", color: "#3b82f6" },
          { icon: <ResolvedIcon />, val: stats.resolved, label: "Resolved", color: "#10b981" },
        ].map((item, idx) => (
          <div 
            key={item.label} 
            className="stat-glow"
            style={{ 
              textAlign: "center", 
              background: "rgba(255, 255, 255, 0.01)", 
              border: "1px solid rgba(255, 255, 255, 0.03)", 
              borderRadius: "var(--radius-md)", 
              padding: "16px 12px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >
            <div style={{ color: item.color, marginBottom: "8px", opacity: 0.9 }}>{item.icon}</div>
            <div
              style={{
                color: "var(--text-dark-primary)",
                fontSize: "24px",
                fontWeight: 800,
                lineHeight: 1
              }}
            >
              {item.val}
            </div>
            <div
              style={{ color: "var(--text-dark-secondary)", fontSize: "11px", marginTop: "6px", opacity: 0.6 }}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>

      <p
        style={{
          color: "var(--text-dark-muted)",
          marginTop: "64px",
          fontSize: "11px",
          textAlign: "center",
          letterSpacing: "0.2px",
          position: "relative",
          zIndex: 1,
          opacity: 0.5
        }}
      >
        HostelDesk · Societal Internship 2026
      </p>
    </div>
  );
}


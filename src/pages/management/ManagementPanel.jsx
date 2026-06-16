import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  STATUSES, 
  STATUS_META, 
  PRIORITY_COLOR, 
  fmtDate, 
  callClaude,
  logoutUser,
  deleteResolvedComplaints
} from "../../utils/constants";

// SVGs
const BackIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px", verticalAlign: "middle" }}>
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "6px", verticalAlign: "middle" }}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const RobotIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px", verticalAlign: "middle" }}>
    <rect x="3" y="11" width="18" height="10" rx="2"/>
    <circle cx="12" cy="5" r="2"/>
    <path d="M12 7v4M8 16h.01M16 16h.01"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#475569" }}>
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const TotalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const PendingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const ProgressIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const ResolvedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

export default function ManagementPanel({ complaints, patchComplaint, stats }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState(null);
  const [note, setNote] = useState("");
  const [assignTo, setAssignTo] = useState("");
  const [confirmRes, setConfirmRes] = useState(false);
  const [aiWorking, setAiWorking] = useState(false);
  const [aiPanel, setAiPanel] = useState("");

  useEffect(() => {
    deleteResolvedComplaints();
  }, []);

  useEffect(() => {
    if (sel) {
      const fresh = complaints.find((c) => c.id === sel.id);
      if (fresh) setSel(fresh);
    }
  }, [complaints]);

  const list = complaints.filter((c) => {
    const ms = filter === "All" || c.status === filter;
    const q = search.toLowerCase();
    return ms && (
      c.id.toLowerCase().includes(q) ||
      c.studentName.toLowerCase().includes(q) ||
      c.room.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  });

  function changeStatus(id, status) {
    patchComplaint(id, { status });
    setConfirmRes(false);
  }

  function postUpdate() {
    if (!note.trim() || !sel) return;
    const entry = {
      date: new Date().toISOString().slice(0, 10),
      note: note.trim(),
    };
    patchComplaint(sel.id, {
      updates: [...sel.updates, entry],
      assignedTo: assignTo.trim() || sel.assignedTo,
    });
    setNote("");
    setAssignTo("");
    setAiPanel("");
  }

  async function aiDraftReply() {
    if (!sel) return;
    setAiWorking(true);
    setAiPanel("");
    const text = await callClaude(
      "You are a hostel warden. Write a short, professional update message (2-3 sentences) to a student about their complaint.",
      `Complaint: "${sel.title}"\nCategory: ${sel.category}\nStatus: ${sel.status}\nDescription: "${sel.description}"\nAssigned to: ${assignTo || sel.assignedTo || "team"}`,
    );
    const t = text.trim();
    setAiPanel(t);
    if (t) setNote(t);
    setAiWorking(false);
  }

  async function aiActionPlan() {
    if (!sel) return;
    setAiWorking(true);
    setAiPanel("");
    const text = await callClaude(
      "You are a hostel maintenance analyst. Give a 3-bullet action plan for this complaint. Be concise and practical.",
      `Title: "${sel.title}"\nCategory: ${sel.category}\nPriority: ${sel.priority}\nDescription: "${sel.description}"`,
    );
    setAiPanel(text.trim());
    setAiWorking(false);
  }

  return (
    <div
      style={{ minHeight: "100vh", background: "#0B1120", color: "#E5E7EB" }}
      className="animate-fade-in"
    >
      <style>{`
        :root { 
          --border-dark: #1F2937; 
          --bg-dark: #0B1120; 
          --text-dark-primary: #F9FAFB; 
          --text-dark-secondary: #9CA3AF; 
          --text-dark-muted: #6B7280; 
          --primary-dark: #3b82f6; 
          --radius-sm: 6px; 
          --radius-md: 8px; 
          --radius-lg: 12px; 
          --transition-fast: 0.2s; 
          --transition-normal: 0.3s; 
        }
        .form-input-dark { 
          width: 100%; 
          padding: 11px 14px; 
          border: 1px solid var(--border-dark); 
          border-radius: var(--radius-md); 
          font-size: 13px; 
          background: #030712; 
          color: white; 
          outline: none; 
          transition: border .2s; 
          box-sizing: border-box; 
        }
        .form-input-dark:focus { 
          border-color: var(--primary-dark); 
        }
        .btn-primary-dark { 
          background: var(--primary-dark); 
          color: white; 
          border: none; 
          padding: 10px 16px; 
          border-radius: var(--radius-sm); 
          font-size: 13px; 
          font-weight: 600; 
          cursor: pointer; 
          width: 100%;
          transition: background var(--transition-fast);
        }
        .btn-primary-dark:hover {
          background: #2563eb;
        }
        .panel-chip { 
          padding: 8px 16px; 
          border-radius: 20px; 
          font-size: 12px; 
          font-weight: 700; 
          cursor: pointer; 
          border: 1px solid rgba(255, 255, 255, 0.08); 
          transition: all var(--transition-normal); 
          white-space: nowrap; 
        }
        .complaint-row { 
          background: rgba(255, 255, 255, 0.02); 
          border-radius: var(--radius-md); 
          padding: 16px; 
          margin-bottom: 10px; 
          border: 1px solid var(--border-dark); 
          cursor: pointer; 
          transition: all var(--transition-normal); 
        }
        .complaint-row:hover { 
          background: rgba(255, 255, 255, 0.04); 
          border-color: rgba(96, 165, 250, 0.25); 
        }
        .complaint-row.active { 
          border-color: var(--primary-dark); 
          background: rgba(59, 130, 246, 0.08); 
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.1); 
        }
        .panel-label { 
          font-size: 11px; 
          font-weight: 700; 
          color: var(--text-dark-secondary); 
          letter-spacing: 0.8px; 
          text-transform: uppercase; 
          margin-bottom: 6px; 
          display: block; 
          opacity: 0.75; 
        }
        .metric-card { 
          background: rgba(255, 255, 255, 0.015); 
          border: 1px solid var(--border-dark); 
          border-radius: var(--radius-md); 
          padding: 16px 20px; 
          flex: 1 1 120px; 
          display: flex; 
          align-items: center; 
          gap: 16px; 
        }
        .ai-badge-btn { 
          background: rgba(96, 165, 250, 0.08); 
          color: #60a5fa; 
          border: 1px solid rgba(96, 165, 250, 0.15); 
          font-size: 11px; 
          font-weight: 600; 
          padding: 6px 12px; 
          border-radius: var(--radius-sm); 
          cursor: pointer; 
          display: inline-flex; 
          align-items: center; 
          transition: all var(--transition-normal); 
        }
        .ai-badge-btn:hover:not(:disabled) { 
          background: rgba(96, 165, 250, 0.18); 
          border-color: rgba(96, 165, 250, 0.3); 
          transform: translateY(-1px); 
        }
        @media (max-width: 768px) { 
          .hide-on-mobile { display: none !important; } 
          .full-width-mobile { width: 100% !important; flex: 1 1 100% !important; } 
          .metric-card { padding: 12px 14px; gap: 10px; } 
        }
        @media (min-width: 769px) { 
          .show-only-mobile { display: none !important; } 
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          background: "rgba(3, 7, 18, 0.6)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-dark)",
          padding: "18px 24px",
          position: "sticky",
          top: 0,
          zIndex: 10
        }}
      >
        <div
          style={{
            maxWidth: "1160px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "10px",
                color: "var(--text-dark-muted)",
                letterSpacing: "1.2px",
                fontWeight: 700,
                marginBottom: "2px",
              }}
            >
              HOSTELDESK
            </div>
            <h1
              style={{
                fontSize: "18px",
                color: "var(--text-dark-primary)",
                fontWeight: 800,
                letterSpacing: "-0.3px"
              }}
            >
              Management Console
            </h1>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link
              to="/"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                color: "var(--text-dark-secondary)",
                border: "1px solid var(--border-dark)",
                padding: "8px 14px",
                borderRadius: "var(--radius-sm)",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                transition: "all var(--transition-fast)"
              }}
            >
              <BackIcon />
              Back
            </Link>
            <button
              onClick={async () => {
                await logoutUser();
                window.location.href = "/";
              }}
              style={{
                background: "#b91c1c",
                color: "white",
                border: "none",
                padding: "8px 14px",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                transition: "opacity var(--transition-fast)"
              }}
            >
              Logout
              <LogoutIcon />
            </button>
          </div>
        </div>
      </div>

      <div
        style={{ maxWidth: "1160px", margin: "0 auto", padding: "28px 16px" }}
      >
        {/* Statistics Metric Panels */}
        <div
          style={{
            display: "flex",
            gap: "14px",
            marginBottom: "28px",
            flexWrap: "wrap",
          }}
          className={sel ? "hide-on-mobile" : ""}
        >
          {[
            { icon: <TotalIcon />, label: "Total Queries", val: stats.total, color: "#60a5fa" },
            { icon: <PendingIcon />, label: "Pending", val: stats.pending, color: "#fbbf24" },
            { icon: <ProgressIcon />, label: "In Progress", val: stats.inProgress, color: "#3b82f6" },
            { icon: <ResolvedIcon />, label: "Resolved", val: stats.resolved, color: "#10b981" },
          ].map((item) => (
            <div key={item.label} className="metric-card">
              <div style={{ color: item.color, opacity: 0.85, display: "flex" }}>{item.icon}</div>
              <div>
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: 800,
                    lineHeight: 1.1,
                    color: "var(--text-dark-primary)"
                  }}
                >
                  {item.val}
                </div>
                <div style={{ color: "var(--text-dark-secondary)", fontSize: "12px", marginTop: "3px", opacity: 0.7 }}>{item.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard Content split layout */}
        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
          
          {/* LEFT: Complaint Directory */}
          <div 
            className={`full-width-mobile ${sel ? "hide-on-mobile" : ""}`}
            style={{ flex: "1 1 480px" }}
          >
            <div style={{ position: "relative", marginBottom: "16px" }}>
              <input
                className="form-input-dark"
                placeholder="Search database..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: "44px" }}
              />
              <div style={{ position: "absolute", left: "16px", top: "14px" }}>
                <SearchIcon />
              </div>
            </div>

            {/* Filter Pills */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                overflowX: "auto",
                paddingBottom: "12px",
                marginBottom: "16px",
              }}
            >
              {["All", ...STATUSES].map((s) => {
                const active = filter === s;
                return (
                  <button
                    key={s}
                    className="panel-chip"
                    onClick={() => setFilter(s)}
                    style={{
                      background: active ? "#3b82f6" : "rgba(255, 255, 255, 0.02)",
                      color: active ? "white" : "var(--text-dark-secondary)",
                      borderColor: active ? "#3b82f6" : "var(--border-dark)",
                    }}
                  >
                    {s}
                    <span style={{ marginLeft: "5px", opacity: 0.65, fontSize: "11px" }}>
                      {s !== "All"
                        ? complaints.filter((c) => c.status === s).length
                        : complaints.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {list.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  color: "var(--text-dark-muted)",
                  padding: "64px 0",
                  background: "rgba(255,255,255,0.01)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px dashed var(--border-dark)"
                }}
              >
                No database records match this query.
              </div>
            )}
            
            {list.map((c) => {
              const sm = STATUS_META[c.status];
              return (
                <div
                  key={c.id}
                  className={`complaint-row ${sel?.id === c.id ? "active" : ""}`}
                  onClick={() => {
                    setSel(c);
                    setNote("");
                    setAssignTo("");
                    setAiPanel("");
                    setConfirmRes(false);
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          color: "var(--text-dark-primary)",
                          fontSize: "14px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          marginBottom: "4px"
                        }}
                      >
                        {c.title}
                      </div>
                      <div
                        style={{
                          color: "var(--text-dark-secondary)",
                          fontSize: "12px",
                          display: "flex",
                          gap: "8px",
                          opacity: 0.8
                        }}
                      >
                        <span>ID: <strong>{c.id}</strong></span>
                        <span>•</span>
                        <span>Rm {c.room}</span>
                      </div>
                    </div>
                    
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: "6px",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          background: sm.bg,
                          color: sm.text,
                          border: `1px solid ${sm.text}20`,
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "10px",
                          fontWeight: 700,
                        }}
                      >
                        {c.status}
                      </span>
                      <span
                        style={{
                          color: PRIORITY_COLOR[c.priority],
                          fontSize: "11px",
                          fontWeight: 700,
                        }}
                      >
                        ● {c.priority}
                      </span>
                    </div>
                  </div>
                  
                  <div
                    style={{
                      color: "var(--text-dark-muted)",
                      fontSize: "11px",
                      marginTop: "10px",
                      display: "flex",
                      justifyContent: "space-between"
                    }}
                  >
                    <span>{c.category}</span>
                    <span>{fmtDate(c.date)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: Detail Inspector */}
          <div 
            className={`full-width-mobile ${!sel ? "hide-on-mobile" : ""}`}
            style={{ flex: "1 1 540px", position: "sticky", top: "100px" }}
          >
            {!sel ? (
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.01)",
                  border: "1px dashed var(--border-dark)",
                  borderRadius: "var(--radius-lg)",
                  padding: "80px 24px",
                  textAlign: "center",
                }}
              >
                <div style={{ color: "var(--text-dark-muted)", fontSize: "14px" }}>
                  Select a logged ticket from the left panel to inspect details.
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--border-dark)",
                  borderRadius: "var(--radius-lg)",
                  padding: "24px",
                }}
              >
                <button
                  className="show-only-mobile"
                  onClick={() => setSel(null)}
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    color: "var(--text-dark-primary)",
                    border: "1px solid var(--border-dark)",
                    padding: "8px 12px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    marginBottom: "20px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <BackIcon />
                  Back to Directory
                </button>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "20px",
                    gap: "12px"
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontSize: "18px",
                        color: "var(--text-dark-primary)",
                        fontWeight: 700,
                        lineHeight: 1.3,
                      }}
                    >
                      {sel.title}
                    </h2>
                    <div
                      style={{
                        color: "var(--text-dark-muted)",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      Ticket ID: {sel.id}
                    </div>
                  </div>
                  <button
                    onClick={() => setSel(null)}
                    style={{
                      background: "none",
                      color: "var(--text-dark-muted)",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      padding: "4px",
                    }}
                    className="hide-on-mobile"
                  >
                    <CloseIcon />
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
                    gap: "14px",
                    marginBottom: "20px",
                    background: "rgba(255, 255, 255, 0.01)",
                    border: "1px solid var(--border-dark)",
                    borderRadius: "var(--radius-md)",
                    padding: "16px",
                  }}
                >
                  {[
                    ["Student Name", sel.studentName],
                    ["Room", sel.room],
                    ["Category", sel.category],
                    ["Date Filed", fmtDate(sel.date)],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <span className="panel-label" style={{ fontSize: "10px" }}>{k}</span>
                      <div
                        style={{
                          color: "var(--text-dark-primary)",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                      >
                        {v}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <span className="panel-label">Student Statement</span>
                  <div
                    style={{
                      background: "rgba(3, 7, 18, 0.4)",
                      borderRadius: "var(--radius-md)",
                      padding: "14px",
                      color: "var(--text-dark-secondary)",
                      fontSize: "13.5px",
                      lineHeight: 1.6,
                      border: "1px solid var(--border-dark)"
                    }}
                  >
                    {sel.description}
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <span className="panel-label">Update Status</span>
                  <div
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          if (s === "Resolved" && !confirmRes) {
                            setConfirmRes(true);
                            return;
                          }
                          changeStatus(sel.id, s);
                        }}
                        style={{
                          background: sel.status === s ? STATUS_META[s].dot : "rgba(255,255,255,0.02)",
                          color: "white",
                          border: `1px solid ${sel.status === s ? STATUS_META[s].dot : "var(--border-dark)"}`,
                          padding: "8px 14px",
                          borderRadius: "var(--radius-sm)",
                          fontSize: "12.5px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {s === "Resolved" && confirmRes ? "Confirm Resolved?" : s}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <span className="panel-label">Assign Technician</span>
                  <input
                    className="form-input-dark"
                    placeholder="e.g. Electrician, Carpenter, Plumbing Team..."
                    value={assignTo}
                    onChange={(e) => setAssignTo(e.target.value)}
                  />
                  {sel.assignedTo && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#60a5fa",
                        marginTop: "6px",
                      }}
                    >
                      Assigned to: <strong>{sel.assignedTo}</strong>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                      flexWrap: "wrap",
                      gap: "8px"
                    }}
                  >
                    <span className="panel-label" style={{ margin: 0 }}>Progress Update note</span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        className="ai-badge-btn"
                        onClick={aiDraftReply}
                        disabled={aiWorking}
                      >
                        <RobotIcon />
                        {aiWorking ? "..." : "Draft Reply"}
                      </button>
                      <button
                        className="ai-badge-btn"
                        onClick={aiActionPlan}
                        disabled={aiWorking}
                      >
                        <RobotIcon />
                        {aiWorking ? "..." : "Action Plan"}
                      </button>
                    </div>
                  </div>
                  
                  <textarea
                    className="form-input-dark"
                    placeholder="Provide comments or logs for the student..."
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    style={{ resize: "vertical" }}
                  />
                  
                  {aiPanel && (
                    <div
                      style={{
                        background: "rgba(96, 165, 250, 0.03)",
                        border: "1px solid rgba(96, 165, 250, 0.12)",
                        borderRadius: "var(--radius-md)",
                        padding: "14px",
                        marginTop: "12px",
                        fontSize: "13px",
                        color: "#90caf9",
                        lineHeight: 1.6,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "#60a5fa", marginBottom: "4px" }}>
                        AI Generated Suggestion
                      </div>
                      {aiPanel}
                    </div>
                  )}
                  
                  <button
                    className="btn-primary-dark"
                    onClick={postUpdate}
                    style={{
                      marginTop: "12px",
                    }}
                  >
                    Post Progress Log
                  </button>
                </div>

                <div>
                  <span className="panel-label">History Logs ({sel.updates.length})</span>
                  {sel.updates.length === 0 ? (
                    <div style={{ color: "var(--text-dark-muted)", fontSize: "13px" }}>
                      No activity logs created.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
                      {[...sel.updates].reverse().map((u, i) => (
                        <div
                          key={i}
                          style={{
                            background: "rgba(255, 255, 255, 0.01)",
                            borderRadius: "var(--radius-sm)",
                            padding: "10px 14px",
                            fontSize: "13px",
                            border: "1px solid var(--border-dark)",
                            borderLeft: "2.5px solid var(--primary-dark)"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                            <span style={{ color: "#60a5fa", fontWeight: 700 }}>
                              {fmtDate(u.date)}
                            </span>
                          </div>
                          <p style={{ color: "var(--text-dark-secondary)", lineHeight: 1.5 }}>{u.note}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

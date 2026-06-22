import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "../../components/ThemeToggle";
import { 
  STATUSES, 
  STATUS_META, 
  PRIORITY_COLOR, 
  fmtDate, 
  callClaude,
  logoutUser,
  clearAllComplaints,
  subscribeToPendingStudents,
  approveStudent,
  rejectStudent
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

const StudentIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const TicketsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
    <path d="M13 5v2"/>
    <path d="M13 17v2"/>
    <path d="M13 11v2"/>
  </svg>
);

export default function ManagementPanel({ complaints, patchComplaint, stats }) {
  const [activeTab, setActiveTab] = useState("tickets");
  const [pendingStudents, setPendingStudents] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState(null);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [note, setNote] = useState("");
  const [assignTo, setAssignTo] = useState("");
  const [confirmRes, setConfirmRes] = useState(false);
  const [aiWorking, setAiWorking] = useState(false);
  const [aiPanel, setAiPanel] = useState("");
  const [isClosing, setIsClosing] = useState(false);

  const closeDrawer = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSel(null);
      setIsClosing(false);
    }, 350);
  };

  useEffect(() => {
    const unsubscribe = subscribeToPendingStudents((students) => {
      setPendingStudents(students);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (sel) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [sel]);

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
      c.category.toLowerCase().includes(q) ||
      (c.priority || "").toLowerCase().includes(q) ||
      (c.status || "").toLowerCase().includes(q) ||
      (c.date || "").toLowerCase().includes(q) ||
      (c.date ? fmtDate(c.date) : "").toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  }).sort((a, b) => {
    let va, vb;
    if (sortBy === "date") {
      va = a.date ? new Date(a.date).getTime() : 0;
      vb = b.date ? new Date(b.date).getTime() : 0;
      if (isNaN(va)) va = 0;
      if (isNaN(vb)) vb = 0;
    } else if (sortBy === "priority") {
      const rank = { critical: 4, high: 3, medium: 2, low: 1 };
      va = rank[(a.priority || "").toLowerCase()] || 0;
      vb = rank[(b.priority || "").toLowerCase()] || 0;
    } else if (sortBy === "status") {
      const rank = { pending: 1, "in progress": 2, resolved: 3 };
      va = rank[(a.status || "").toLowerCase()] || 0;
      vb = rank[(b.status || "").toLowerCase()] || 0;
    } else {
      va = a[sortBy] || "";
      vb = b[sortBy] || "";
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
    }

    if (va < vb) return sortOrder === "asc" ? -1 : 1;
    if (va > vb) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  function toggleSort(col) {
    if (sortBy === col) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortOrder("asc");
    }
  }

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
      style={{ minHeight: "100vh", background: "var(--bg-secondary)", color: "var(--text-primary)", overflowX: "hidden" }}
      className="animate-fade-in"
    >
      <style>{`
        .panel-chip { 
          padding: 8px 16px; 
          border-radius: 20px; 
          font-size: 12px; 
          font-weight: 700; 
          cursor: pointer; 
          border: 1px solid var(--border-color); 
          transition: all var(--transition-normal); 
          white-space: nowrap; 
          background: var(--card-glass);
          color: var(--text-secondary);
        }
        .complaint-row { 
          background: var(--card-glass); 
          border-radius: var(--radius-md); 
          padding: 16px; 
          margin-bottom: 10px; 
          border: 1px solid var(--border-color); 
          cursor: pointer; 
          transition: all var(--transition-normal); 
          user-select: none;
        }
        .detail-drawer {
          will-change: transform, opacity;
          overscroll-behavior: contain;
        }
        .complaint-row:hover { 
          background: var(--card-glass-hover); 
          border-color: var(--primary-color); 
        }
        .complaint-row.active { 
          border-color: var(--primary-color); 
          background: var(--primary-glow); 
          box-shadow: 0 0 15px var(--primary-glow); 
        }
        .panel-label { 
          font-size: 11px; 
          font-weight: 700; 
          color: var(--text-secondary); 
          letter-spacing: 0.8px; 
          text-transform: uppercase; 
          margin-bottom: 6px; 
          display: block; 
          opacity: 0.75; 
        }
        .metric-card { 
          background: var(--card-glass); 
          border: 1px solid var(--border-color); 
          border-radius: var(--radius-md); 
          padding: 16px 20px; 
          flex: 1 1 120px; 
          display: flex; 
          align-items: center; 
          gap: 16px; 
          transition: all var(--transition-normal);
        }
        .metric-card:hover {
          border-color: var(--primary-color);
          background: var(--card-glass-hover);
        }
        .ai-badge-btn { 
          background: var(--primary-glow); 
          color: var(--primary-color); 
          border: 1px solid var(--border-color); 
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
          border-color: var(--primary-color); 
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
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); }
          to { transform: translateX(100%); }
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          background: "var(--card-bg)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-color)",
          padding: "12px 16px",
          position: "sticky",
          top: 0,
          zIndex: 10,
          transition: "background var(--transition-normal)"
        }}
      >
        <div
          style={{
            maxWidth: "1160px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px"
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "9px", color: "var(--text-muted)", letterSpacing: "1px", fontWeight: 700, textTransform: "uppercase" }}>
              HostelDesk
            </div>
            <h1 style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Management
            </h1>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <ThemeToggle />
            <button
              onClick={async () => {
                if (window.confirm("Are you sure you want to delete ALL complaints?")) {
                  await clearAllComplaints();
                }
              }}
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                color: "#ef4444",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                padding: "6px 10px",
                borderRadius: "var(--radius-sm)",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Clear
            </button>
            <Link
              to="/"
              style={{
                background: "rgba(156, 163, 175, 0.1)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-color)",
                padding: "6px 10px",
                borderRadius: "var(--radius-sm)",
                textDecoration: "none",
                fontSize: "12px",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center"
              }}
            >
              <BackIcon />
              <span className="hide-on-mobile">Back</span>
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
                padding: "6px 10px",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center"
              }}
            >
              <span className="hide-on-mobile">Logout</span>
              <LogoutIcon style={{ margin: "0 !important" }} />
            </button>
          </div>
        </div>
      </div>

      <div
        style={{ maxWidth: "1160px", margin: "0 auto", padding: "28px 16px" }}
      >
        {/* Tab Switcher */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          <button
            onClick={() => setActiveTab("tickets")}
            style={{
              flex: 1,
              padding: "12px",
              background: activeTab === "tickets" ? "var(--primary-color)" : "var(--card-glass)",
              color: activeTab === "tickets" ? "white" : "var(--text-primary)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              transition: "all var(--transition-normal)"
            }}
          >
            <TicketsIcon />
            Complaints & Tickets
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            style={{
              flex: 1,
              padding: "12px",
              background: activeTab === "requests" ? "var(--primary-color)" : "var(--card-glass)",
              color: activeTab === "requests" ? "white" : "var(--text-primary)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              transition: "all var(--transition-normal)",
              position: "relative"
            }}
          >
            <StudentIcon />
            Student Requests
            {pendingStudents.length > 0 && (
              <span style={{
                background: "#ef4444",
                color: "white",
                fontSize: "10px",
                padding: "2px 6px",
                borderRadius: "10px",
                marginLeft: "8px"
              }}>
                {pendingStudents.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "tickets" ? (
          <>
            {/* Statistics Metric Panels */}
            <div
              style={{
                display: "flex",
                gap: "14px",
                marginBottom: "28px",
                flexWrap: "wrap",
              }}
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
                        color: "var(--text-primary)"
                      }}
                    >
                      {item.val}
                    </div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "12px", marginTop: "3px", opacity: 0.7 }}>{item.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dashboard Content split layout */}
            <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap" }}>

              {/* LEFT: Complaint Directory */}
              <div 
                className="full-width-mobile"
                style={{ flex: "1 1 100%", width: "100%" }}
              >
                <div style={{ position: "relative", marginBottom: "16px" }}>
                  <input
                    className="form-input"
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
                          background: active ? "var(--primary-color)" : "var(--card-glass)",
                          color: active ? "white" : "var(--text-secondary)",
                          borderColor: active ? "var(--primary-color)" : "var(--border-color)",
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

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--border-color)", color: "var(--text-secondary)" }}>
                        {[
                          { key: "studentName", label: "Student" },
                          { key: "title", label: "Title" },
                          { key: "room", label: "Room" },
                          { key: "category", label: "Category" },
                          { key: "priority", label: "Priority" },
                          { key: "status", label: "Status" },
                          { key: "date", label: "Date" },
                        ].map((col) => {
                          const active = sortBy === col.key;
                          return (
                            <th
                              key={col.key}
                              onClick={() => toggleSort(col.key)}
                              style={{
                                padding: "10px 8px",
                                textAlign: "left",
                                fontWeight: 700,
                                fontSize: "11px",
                                letterSpacing: "0.5px",
                                textTransform: "uppercase",
                                cursor: "pointer",
                                userSelect: "none",
                                whiteSpace: "nowrap",
                                color: active ? "var(--primary-color)" : "var(--text-secondary)",
                                borderBottom: active ? "2px solid var(--primary-color)" : "2px solid var(--border-color)",
                              }}
                            >
                              {col.label} {active ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {list.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: "center", color: "var(--text-muted)", padding: "64px 0" }}>
                            No database records match this query.
                          </td>
                        </tr>
                      ) : (
                        list.map((c) => {
                          const sm = STATUS_META[c.status];
                          return (
                            <tr
                              key={c.id}
                              onClick={() => {
                                setSel(c);
                                setNote("");
                                setAssignTo("");
                                setAiPanel("");
                                setConfirmRes(false);
                              }}
                              style={{
                                cursor: "pointer",
                                transition: "background var(--transition-normal)",
                                borderBottom: "1px solid var(--border-color)",
                                background: sel?.id === c.id ? "var(--primary-glow)" : "transparent",
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--card-glass-hover)"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = sel?.id === c.id ? "var(--primary-glow)" : "transparent"; }}
                            >
                              <td style={{ padding: "12px 8px", color: "var(--text-primary)", fontWeight: 600 }}>{c.studentName}</td>
                              <td style={{ padding: "12px 8px", color: "var(--text-primary)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</td>
                              <td style={{ padding: "12px 8px", color: "var(--text-secondary)" }}>{c.room}</td>
                              <td style={{ padding: "12px 8px", color: "var(--text-secondary)" }}>{c.category}</td>
                              <td style={{ padding: "12px 8px", color: PRIORITY_COLOR[c.priority], fontWeight: 700, fontSize: "12px" }}>● {c.priority}</td>
                              <td style={{ padding: "12px 8px" }}>
                                <span style={{
                                  background: sm.bg,
                                  color: sm.text,
                                  border: `1px solid ${sm.text}20`,
                                  padding: "2px 8px",
                                  borderRadius: "12px",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  whiteSpace: "nowrap",
                                }}>
                                  {c.status}
                                </span>
                              </td>
                              <td style={{ padding: "12px 8px", color: "var(--text-muted)", fontSize: "12px", whiteSpace: "nowrap" }}>{fmtDate(c.date)}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* RIGHT: Off-canvas Detail Drawer */}
              {sel && (
                <>
                  {/* Backdrop Overlay */}
                  <div 
                    onClick={closeDrawer}
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: "rgba(0, 0, 0, 0.4)",
                      backdropFilter: "blur(4px)",
                      zIndex: 1000,
                      animation: `${isClosing ? "fadeOut" : "fadeIn"} 0.3s ease-out forwards`
                    }}
                  />
                  
                  {/* Drawer Panel */}
                  <div 
                    className="detail-drawer"
                    style={{ 
                      position: "fixed",
                      top: 0,
                      right: 0,
                      bottom: 0,
                      width: "min(650px, 95vw)",
                      background: "var(--bg-primary)",
                      borderLeft: "1px solid var(--border-color)",
                      boxShadow: "-10px 0 30px rgba(0,0,0,0.15)",
                      zIndex: 1001,
                      overflowY: "auto",
                      padding: "32px",
                      animation: `${isClosing ? "slideOutRight 0.35s ease-in" : "slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)"} forwards`
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "24px",
                        gap: "12px"
                      }}
                    >
                      <div>
                        <h2
                          style={{
                            fontSize: "20px",
                            color: "var(--text-primary)",
                            fontWeight: 800,
                            lineHeight: 1.3,
                          }}
                        >
                          {sel.title}
                        </h2>

                      </div>
                      <button
                        onClick={closeDrawer}
                        style={{
                          background: "var(--card-glass)",
                          color: "var(--text-muted)",
                          border: "1px solid var(--border-color)",
                          cursor: "pointer",
                          display: "flex",
                          padding: "8px",
                          borderRadius: "50%",
                        }}
                      >
                        <CloseIcon />
                      </button>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                        gap: "14px",
                        marginBottom: "24px",
                        background: "rgba(156, 163, 175, 0.05)",
                        border: "1px solid var(--border-color)",
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
                              color: "var(--text-primary)",
                              fontSize: "13px",
                              fontWeight: 600,
                            }}
                          >
                            {v}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginBottom: "24px" }}>
                      <span className="panel-label">Student Statement</span>
                      <div
                        style={{
                          background: "var(--input-bg)",
                          borderRadius: "var(--radius-md)",
                          padding: "14px",
                          color: "var(--text-secondary)",
                          fontSize: "13.5px",
                          lineHeight: 1.6,
                          border: "1px solid var(--border-color)"
                        }}
                      >
                        {sel.description}
                      </div>
                    </div>

                    <div style={{ marginBottom: "24px" }}>
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
                              background: sel.status === s ? STATUS_META[s].dot : "var(--card-glass)",
                              color: sel.status === s ? "white" : "var(--text-primary)",
                              border: `1px solid ${sel.status === s ? STATUS_META[s].dot : "var(--border-color)"}`,
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

                    <div style={{ marginBottom: "24px" }}>
                      <span className="panel-label">Assign Technician</span>
                      <input
                        className="form-input"
                        placeholder="e.g. Electrician, Carpenter, Plumbing Team..."
                        value={assignTo}
                        onChange={(e) => setAssignTo(e.target.value)}
                      />
                      {sel.assignedTo && (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--primary-color)",
                            marginTop: "6px",
                          }}
                        >
                          Assigned to: <strong>{sel.assignedTo}</strong>
                        </div>
                      )}
                    </div>

                    <div style={{ marginBottom: "24px" }}>
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
                        className="form-input"
                        placeholder="Provide comments or logs for the student..."
                        rows={3}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        style={{ resize: "vertical" }}
                      />
                      
                      {aiPanel && (
                        <div
                          style={{
                            background: "var(--primary-glow)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "var(--radius-md)",
                            padding: "14px",
                            marginTop: "12px",
                            fontSize: "13px",
                            color: "var(--text-secondary)",
                            lineHeight: 1.6,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "var(--primary-color)", marginBottom: "4px" }}>
                            AI Generated Suggestion
                          </div>
                          {aiPanel}
                        </div>
                      )}
                      
                      <button
                        className="btn-primary"
                        onClick={postUpdate}
                        style={{
                          marginTop: "12px",
                          width: "100%"
                        }}
                      >
                        Post Progress Log
                      </button>
                    </div>

                    <div>
                      <span className="panel-label">History Logs ({sel.updates.length})</span>
                      {sel.updates.length === 0 ? (
                        <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                          No activity logs created.
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
                          {[...sel.updates].reverse().map((u, i) => (
                            <div
                              key={i}
                              style={{
                                background: "rgba(156, 163, 175, 0.05)",
                                borderRadius: "var(--radius-sm)",
                                padding: "10px 14px",
                                fontSize: "13px",
                                border: "1px solid var(--border-color)",
                                borderLeft: "2.5px solid var(--primary-color)"
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                <span style={{ color: "var(--primary-color)", fontWeight: 700 }}>
                                  {fmtDate(u.date)}
                                </span>
                              </div>
                              <p style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>{u.note}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>Pending Student Registrations</h2>
            {pendingStudents.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "80px 24px",
                background: "var(--card-glass)",
                border: "1px dashed var(--border-color)",
                borderRadius: "var(--radius-lg)",
                color: "var(--text-muted)"
              }}>
                No pending registration requests at the moment.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
                {pendingStudents.map(student => (
                  <div key={student.uid} style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-lg)",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px"
                  }}>
                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                      <div style={{
                        width: "48px",
                        height: "48px",
                        background: "var(--primary-glow)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--primary-color)"
                      }}>
                        <StudentIcon />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "16px" }}>{student.name}</div>
                        <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>ID: {student.id}</div>
                      </div>
                    </div>

                    <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                      <strong>Email:</strong> {student.email}
                      <br />
                      <strong>Requested:</strong> {student.createdAt ? fmtDate(student.createdAt) : "N/A"}
                    </div>

                    <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                      <button
                        onClick={() => approveStudent(student.uid)}
                        className="btn-primary"
                        style={{ flex: 1, padding: "10px" }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to reject and delete ${student.name}'s request?`)) {
                            rejectStudent(student.uid);
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: "10px",
                          background: "rgba(239, 68, 68, 0.1)",
                          color: "#ef4444",
                          border: "1px solid rgba(239, 68, 68, 0.2)",
                          borderRadius: "var(--radius-sm)",
                          fontWeight: 600,
                          cursor: "pointer"
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

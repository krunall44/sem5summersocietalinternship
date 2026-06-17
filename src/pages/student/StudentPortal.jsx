
import React, { useState } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "../../components/ThemeToggle";
import { 
  CATEGORIES, 
  PRIORITIES, 
  STATUS_META, 
  PRIORITY_COLOR, 
  genId, 
  fmtDate, 
  callClaude,
  logoutUser
} from "../../utils/constants";

// Styled SVG Icons
const BackIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px", verticalAlign: "middle" }}>
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "6px", verticalAlign: "middle" }}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#94a3b8" }}>
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const RobotIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#2563eb" }}>
    <rect x="3" y="11" width="18" height="10" rx="2"/>
    <circle cx="12" cy="5" r="2"/>
    <path d="M12 7v4M8 16h.01M16 16h.01"/>
  </svg>
);

const EmptyIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#94a3b8" }}>
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);

export default function StudentPortal({ complaints, addComplaint, patchComplaint }) {
  const [tab, setTab] = useState("new");
  const [form, setForm] = useState({
    studentName: "",
    room: "",
    category: "",
    title: "",
    description: "",
    priority: "Medium",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [aiHint, setAiHint] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  function setField(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function onDescBlur(e) {
    const desc = e.target.value;
    if (!desc || desc.length < 20) return;
    setAiLoading(true);
    setAiHint("");
    const raw = await callClaude(
      "You are a hostel maintenance assistant. Respond ONLY with valid JSON, no markdown fences.",
      `Given this complaint description, return JSON: {"suggestedPriority":"Low|Medium|High","suggestedTitle":"5-8 word title","reason":"one sentence"}\nDescription: "${desc}"`,
    );
    try {
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setAiHint(parsed.reason || "");
      setForm((prev) => ({
        ...prev,
        priority: parsed.suggestedPriority || prev.priority,
        title: prev.title || parsed.suggestedTitle || prev.title,
      }));
    } catch {
      setAiHint("Could not auto-suggest. Fill in manually.");
    }
    setAiLoading(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const { studentName, room, category, title, description, priority } = form;
    if (
      !studentName.trim() ||
      !room.trim() ||
      !category ||
      !title.trim() ||
      !description.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setBusy(true);

    const newC = {
      id: genId(),
      studentName: studentName.trim(),
      room: room.trim(),
      category,
      title: title.trim(),
      description: description.trim(),
      priority,
      status: "Pending",
      date: new Date().toISOString().slice(0, 10),
      assignedTo: "",
      updates: [
        {
          date: new Date().toISOString().slice(0, 10),
          note: "Complaint received. Management will review shortly.",
        },
      ],
    };

    addComplaint(newC);
    setSuccess("Complaint submitted! ID: " + newC.id);
    setForm({
      studentName: "",
      room: "",
      category: "",
      title: "",
      description: "",
      priority: "Medium",
    });
    setAiHint("");
    setBusy(false);

    callClaude(
      "You are a helpful hostel warden. Write a warm 2-sentence acknowledgement for a student's complaint. Be reassuring.",
      `Title: "${newC.title}", Category: ${newC.category}, Priority: ${newC.priority}`,
    ).then((aiText) => {
      if (aiText.trim()) {
        patchComplaint(newC.id, {
          updates: [
            ...newC.updates,
            { date: newC.date, note: "AI Response: " + aiText.trim() },
          ],
        });
      }
    });

    setTimeout(() => {
      setSuccess("");
      setTab("my");
    }, 1800);
  }

  const myList = complaints.filter(
    (c) =>
      c.studentName.toLowerCase().includes(search.toLowerCase()) ||
      c.room.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-secondary)" }} className="animate-fade-in">
      <style>{`
        .segment-tab {
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          border: none;
          transition: all var(--transition-normal);
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .segment-tab.active {
          background: var(--card-bg);
          color: var(--text-primary);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .segment-tab:not(.active) {
          background: transparent;
          color: var(--text-secondary);
          opacity: 0.8;
        }
        .segment-tab:not(.active):hover {
          color: var(--text-primary);
          opacity: 1;
        }
        .portal-card-themed {
          background: var(--card-bg);
          border-radius: var(--radius-lg);
          padding: 28px 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
          border: 1px solid var(--border-color);
        }
        .complaint-item {
          background: var(--card-bg);
          border-radius: var(--radius-md);
          padding: 20px;
          margin-bottom: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .complaint-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          border-color: var(--primary-color);
        }
        .input-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-secondary);
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 6px;
          display: block;
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          background: "var(--card-bg)",
          borderBottom: "1px solid var(--border-color)",
          padding: "18px 24px",
          position: "sticky",
          top: 0,
          zIndex: 10
        }}
      >
        <div
          style={{
            maxWidth: "720px",
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
                color: "var(--text-muted)",
                letterSpacing: "1px",
                fontWeight: 700,
                marginBottom: "2px",
              }}
            >
              HOSTELDESK
            </div>
            <h1
              style={{
                fontSize: "18px",
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.3px"
              }}
            >
              Student Portal
            </h1>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <ThemeToggle />
            <Link
              to="/"
              style={{
                background: "rgba(156, 163, 175, 0.1)",
                color: "var(--text-primary)",
                textDecoration: "none",
                padding: "8px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: "13px",
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                transition: "background var(--transition-fast)"
              }}
              onMouseOver={(e) => e.target.style.background = "rgba(156, 163, 175, 0.2)"}
              onMouseOut={(e) => e.target.style.background = "rgba(156, 163, 175, 0.1)"}
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
                background: "#ef4444",
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
              onMouseOver={(e) => e.target.style.opacity = 0.9}
              onMouseOut={(e) => e.target.style.opacity = 1}
            >
              Logout
              <LogoutIcon />
            </button>
          </div>
        </div>
      </div>

      <div
        style={{ maxWidth: "720px", margin: "0 auto", padding: "28px 16px" }}
      >
        {/* Navigation Tabs (iOS Segmented Control style) */}
        <div
          style={{
            display: "flex",
            background: "rgba(156, 163, 175, 0.1)",
            padding: "4px",
            borderRadius: "12px",
            marginBottom: "28px",
          }}
        >
          <button
            className={`segment-tab ${tab === "new" ? "active" : ""}`}
            onClick={() => {
              setTab("new");
              setSuccess("");
              setError("");
            }}
          >
            Submit Query
          </button>
          <button
            className={`segment-tab ${tab === "my" ? "active" : ""}`}
            onClick={() => setTab("my")}
          >
            Track Complaints ({complaints.length})
          </button>
        </div>

        {tab === "new" && (
          <div className="portal-card-themed">
            <h2
              style={{
                margin: "0 0 24px",
                color: "var(--text-primary)",
                fontSize: "18px",
                fontWeight: 700
              }}
            >
              Submit a New Complaint
            </h2>

            {success && (
              <div
                style={{
                  background: "rgba(16, 185, 129, 0.08)",
                  color: "#10b981",
                  border: "1px solid rgba(16, 185, 129, 0.15)",
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "20px",
                  fontWeight: 600,
                  fontSize: "14px"
                }}
              >
                {success}
              </div>
            )}
            {error && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.08)",
                  color: "#ef4444",
                  border: "1px solid rgba(239, 68, 68, 0.15)",
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "20px",
                  fontSize: "14px"
                }}
              >
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* Responsive Grid Row 1 */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "16px",
                }}
              >
                <div>
                  <label className="input-label">Your Name</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Rahul Sharma"
                    value={form.studentName}
                    onChange={(e) => setField("studentName", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Room Number</label>
                  <input
                    className="form-input"
                    placeholder="e.g. A-204"
                    value={form.room}
                    onChange={(e) => setField("room", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Responsive Grid Row 2 */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "16px",
                }}
              >
                <div>
                  <label className="input-label">Category</label>
                  <select
                    className="form-input"
                    value={form.category}
                    onChange={(e) => setField("category", e.target.value)}
                    required
                    style={{ appearance: "auto" }}
                  >
                    <option value="">Select category…</option>
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="input-label">Priority</label>
                  <select
                    className="form-input"
                    value={form.priority}
                    onChange={(e) => setField("priority", e.target.value)}
                    required
                    style={{ appearance: "auto" }}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="input-label">Complaint Title</label>
                <input
                  className="form-input"
                  placeholder="Brief title of the issue"
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="input-label">
                  Description
                </label>
                <textarea
                  className="form-input"
                  placeholder="Describe the problem in detail (minimum 20 characters for AI advice)…"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  onBlur={onDescBlur}
                  style={{ resize: "vertical" }}
                  required
                />
              </div>

              {(aiLoading || aiHint) && (
                <div
                  style={{
                    background: "var(--primary-glow)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-md)",
                    padding: "16px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", shrink: 0, marginTop: "2px" }}>
                    {aiLoading ? (
                      <div style={{
                        width: "18px",
                        height: "18px",
                        border: "2px solid var(--border-color)",
                        borderTopColor: "var(--primary-color)",
                        borderRadius: "50%",
                      }} className="animate-spin" />
                    ) : (
                      <RobotIcon />
                    )}
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        color: "var(--primary-color)",
                        fontSize: "11px",
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                        marginBottom: "4px",
                      }}
                    >
                      AI Assistant advice
                    </div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: 1.5 }}>
                      {aiLoading ? "Analyzing description details..." : aiHint}
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="btn-primary"
                style={{
                  padding: "14px",
                  cursor: busy ? "not-allowed" : "pointer",
                  marginTop: "8px",
                  width: "100%"
                }}
              >
                {busy ? "Submitting..." : "Submit Complaint"}
              </button>
            </form>
          </div>
        )}

        {tab === "my" && (
          <div>
            <div style={{ position: "relative", marginBottom: "20px" }}>
              <input
                className="form-input"
                placeholder="Search by ID, title, room or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: "44px" }}
              />
              <div style={{ position: "absolute", left: "16px", top: "14px" }}>
                <SearchIcon />
              </div>
            </div>

            {myList.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  color: "var(--text-muted)",
                  padding: "64px 0",
                  background: "var(--card-bg)",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "16px"
                }}
              >
                <EmptyIcon />
                <div style={{ fontSize: "14px", fontWeight: 500 }}>No complaints logged yet</div>
              </div>
            )}
            
            {myList.map((c) => {
              const sm = STATUS_META[c.status];
              const isSelected = expanded === c.id;
              return (
                <div
                  key={c.id}
                  className="complaint-item"
                  style={{ borderLeft: `4px solid ${PRIORITY_COLOR[c.priority] || "var(--border-color)"}` }}
                  onClick={() => setExpanded(isSelected ? null : c.id)}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "16px",
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          fontSize: "15px",
                          lineHeight: 1.4,
                          marginBottom: "4px"
                        }}
                      >
                        {c.title}
                      </div>
                      <div
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "12.5px",
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "6px 12px",
                        }}
                      >
                        <span>ID: <strong style={{ color: "var(--text-primary)" }}>{c.id}</strong></span>
                        <span>•</span>
                        <span>{c.category}</span>
                        <span>•</span>
                        <span>Room {c.room}</span>
                      </div>
                      <div
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "11px",
                          marginTop: "6px",
                        }}
                      >
                        {fmtDate(c.date)}
                      </div>
                    </div>
                    
                    <span
                      style={{
                        background: sm.bg,
                        color: sm.text,
                        border: `1px solid ${sm.text}20`,
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: "6px",
                          height: "6px",
                          background: sm.dot,
                          borderRadius: "50%",
                        }}
                      />
                      {c.status}
                    </span>
                  </div>

                  {/* Expandable Panel */}
                  {isSelected && (
                    <div
                      style={{
                        marginTop: "16px",
                        paddingTop: "16px",
                        borderTop: "1px solid var(--border-color)",
                        animation: "fadeIn 0.2s ease forwards"
                      }}
                      onClick={(e) => e.stopPropagation()} // Stop propagation to avoid closing card
                    >
                      <div style={{ marginBottom: "14px" }}>
                        <span className="input-label" style={{ marginBottom: "4px" }}>Detailed Description</span>
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "13.5px",
                            lineHeight: 1.6,
                            whiteSpace: "pre-wrap"
                          }}
                        >
                          {c.description}
                        </p>
                      </div>

                      {c.assignedTo && (
                        <div
                          style={{
                            fontSize: "13px",
                            color: "var(--text-primary)",
                            marginBottom: "16px",
                            padding: "10px 14px",
                            background: "var(--primary-glow)",
                            borderRadius: "var(--radius-sm)",
                            borderLeft: "3px solid var(--primary-color)",
                            display: "inline-block"
                          }}
                        >
                          Assigned specialist: <strong>{c.assignedTo}</strong>
                        </div>
                      )}
                      
                      <div className="input-label" style={{ marginBottom: "8px" }}>Status updates log</div>
                      
                      {c.updates.length === 0 ? (
                        <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                          No updates logged yet.
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {c.updates.map((u, i) => (
                            <div
                              key={i}
                              style={{
                                background: "rgba(156, 163, 175, 0.05)",
                                borderRadius: "var(--radius-sm)",
                                padding: "12px 14px",
                                fontSize: "13px",
                                borderLeft: "3px solid var(--text-muted)",
                              }}
                            >
                              <span style={{ color: "var(--text-primary)", fontWeight: 700, marginRight: "8px" }}>
                                {fmtDate(u.date)}:
                              </span>{" "}
                              <span style={{ color: "var(--text-secondary)" }}>{u.note}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

}

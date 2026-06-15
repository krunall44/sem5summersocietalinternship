import React, { useState, useEffect, useCallback } from "react";

// ── AI helper ─────────────────────────────────────────────────────────────
async function callClaude(systemPrompt, userMessage) {
  try {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.warn("Anthropic API key not found in .env");
      return "AI feature unavailable: Missing API Key.";
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text ?? "";
  } catch (error) {
    console.error("AI Error:", error);
    return "";
  }
}

// ── Storage helpers ───────────────────────────────────────────────────────
const STORAGE_KEY = "hosteldesk-v3";

async function loadComplaints() {
  try {
    // Fallback if window.storage is not available
    if (!window.storage) {
      const local = localStorage.getItem(STORAGE_KEY);
      return local ? JSON.parse(local) : [];
    }
    const result = await window.storage.get(STORAGE_KEY, true);
    return result ? JSON.parse(result.value) : [];
  } catch (err) {
    console.error("Load error:", err);
    return [];
  }
}

async function saveComplaints(list) {
  try {
    // Fallback if window.storage is not available
    if (!window.storage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return;
    }
    await window.storage.set(STORAGE_KEY, JSON.stringify(list), true);
  } catch (e) {
    console.error("Storage error:", e);
  }
}

// ── Constants ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Maintenance",
  "Cleanliness",
  "Electrical",
  "Water Supply",
  "Internet / WiFi",
  "Furniture",
  "Security",
  "Food & Mess",
  "Other",
];
const STATUSES = ["Pending", "In Progress", "Resolved"];
const PRIORITIES = ["Low", "Medium", "High"];
const STATUS_META = {
  Pending: { bg: "#FFF3E0", text: "#E65100", dot: "#FF9800" },
  "In Progress": { bg: "#E3F2FD", text: "#1565C0", dot: "#2196F3" },
  Resolved: { bg: "#E8F5E9", text: "#2E7D32", dot: "#4CAF50" },
};
const PRIORITY_COLOR = { Low: "#4CAF50", Medium: "#FF9800", High: "#F44336" };

function genId() {
  return "CMP-" + Math.floor(100 + Math.random() * 900);
}
function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ═════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═════════════════════════════════════════════════════════════════════════
export default function App() {
  const [view, setView] = useState("landing");
  const [complaints, setComplaints] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadComplaints().then((list) => {
      setComplaints(list);
      setReady(true);
    });
  }, []);

  // save to storage whenever list changes (after first load)
  useEffect(() => {
    if (ready) saveComplaints(complaints);
  }, [complaints, ready]);

  // append one new complaint
  const addComplaint = useCallback((c) => {
    setComplaints((prev) => [c, ...prev]);
  }, []);

  // update one complaint by id
  const patchComplaint = useCallback((id, patch) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  }, []);

  const stats = {
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "Pending").length,
    inProgress: complaints.filter((c) => c.status === "In Progress").length,
    resolved: complaints.filter((c) => c.status === "Resolved").length,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Sora:wght@800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'DM Sans','Segoe UI',sans-serif; }
        input,textarea,select { font-family:inherit; }
      `}</style>
      {view === "landing" && <Landing setView={setView} stats={stats} />}
      {view === "student" && (
        <Student
          setView={setView}
          complaints={complaints}
          addComplaint={addComplaint}
          patchComplaint={patchComplaint}
        />
      )}
      {view === "management" && (
        <Management
          setView={setView}
          complaints={complaints}
          patchComplaint={patchComplaint}
          stats={stats}
        />
      )}
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// LANDING
// ═════════════════════════════════════════════════════════════════════════
function Landing({ setView, stats }) {
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
        .lcard { background:#16263A; border:1px solid #243B55; border-radius:20px; padding:36px; width:100%; max-width:300px; cursor:pointer; transition:all .25s; text-align:center; }
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
            fn: "student",
          },
          {
            icon: "🛠️",
            badge: "MANAGEMENT",
            title: "Management Panel",
            desc: "Manage all complaints, assign tasks & post updates.",
            fn: "management",
          },
        ].map((p) => (
          <div key={p.fn} className="lcard" onClick={() => setView(p.fn)}>
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
          </div>
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

// ═════════════════════════════════════════════════════════════════════════
// STUDENT PORTAL
// ═════════════════════════════════════════════════════════════════════════
function Student({ setView, complaints, addComplaint, patchComplaint }) {
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

  // called when description loses focus
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
          note: "✅ Complaint received. Management will review shortly.",
        },
      ],
    };

    // SAVE IMMEDIATELY — no AI blocking
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

    // AI welcome note — runs after save, updates quietly
    callClaude(
      "You are a helpful hostel warden. Write a warm 2-sentence acknowledgement for a student's complaint. Be reassuring.",
      `Title: "${newC.title}", Category: ${newC.category}, Priority: ${newC.priority}`,
    ).then((aiText) => {
      if (aiText.trim()) {
        patchComplaint(newC.id, {
          updates: [
            ...newC.updates,
            { date: newC.date, note: "🤖 AI: " + aiText.trim() },
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
      c.id.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F0F7FF" }}>
      <style>{`
        .si { width:100%; padding:12px 14px; border:1.5px solid #CFE2FF; border-radius:10px; font-size:14px; background:white; color:#1A237E; outline:none; transition:border .2s; }
        .si:focus { border-color:#1565C0; }
        .stab { padding:10px 0; border-radius:8px; cursor:pointer; font-weight:600; font-size:14px; border:none; transition:all .2s; flex:1; }
        .stab.on { background:#1565C0; color:white; }
        .stab:not(.on) { background:transparent; color:#90A4AE; }
        .cc { background:white; border-radius:14px; padding:18px 20px; margin-bottom:12px; box-shadow:0 2px 10px rgba(0,0,0,.06); border-left:4px solid; cursor:pointer; transition:transform .15s; }
        .cc:hover { transform:translateX(3px); }
        .slbl { font-size:11px; font-weight:700; color:#90A4AE; letter-spacing:.6px; text-transform:uppercase; margin-bottom:4px; }
      `}</style>

      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg,#0D47A1,#1565C0)",
          padding: "16px 20px",
          color: "white",
        }}
      >
        <div
          style={{
            maxWidth: "700px",
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
                opacity: 0.6,
                letterSpacing: "1px",
                marginBottom: "2px",
              }}
            >
              HOSTELDESK
            </div>
            <h1
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "20px",
                fontWeight: 800,
              }}
            >
              🎓 Student Portal
            </h1>
          </div>
          <button
            onClick={() => setView("landing")}
            style={{
              background: "rgba(255,255,255,.15)",
              color: "white",
              border: "none",
              padding: "8px 14px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            ← Home
          </button>
        </div>
      </div>

      <div
        style={{ maxWidth: "700px", margin: "0 auto", padding: "20px 16px" }}
      >
        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            background: "white",
            padding: "5px",
            borderRadius: "12px",
            marginBottom: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,.06)",
          }}
        >
          <button
            className={`stab ${tab === "new" ? "on" : ""}`}
            onClick={() => {
              setTab("new");
              setSuccess("");
              setError("");
            }}
          >
            ➕ New Complaint
          </button>
          <button
            className={`stab ${tab === "my" ? "on" : ""}`}
            onClick={() => setTab("my")}
          >
            📋 Track Complaints ({complaints.length})
          </button>
        </div>

        {/* ── NEW COMPLAINT FORM ── */}
        {tab === "new" && (
          <div
            style={{
              background: "white",
              borderRadius: "18px",
              padding: "26px",
              boxShadow: "0 4px 20px rgba(0,0,0,.08)",
            }}
          >
            <h2
              style={{
                margin: "0 0 20px",
                color: "#0D47A1",
                fontFamily: "'Sora',sans-serif",
                fontSize: "18px",
              }}
            >
              Submit a Complaint
            </h2>

            {success && (
              <div
                style={{
                  background: "#E8F5E9",
                  color: "#2E7D32",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  marginBottom: "16px",
                  fontWeight: 600,
                }}
              >
                ✅ {success}
              </div>
            )}
            {error && (
              <div
                style={{
                  background: "#FFEBEE",
                  color: "#C62828",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  marginBottom: "16px",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <div className="slbl">Your Name</div>
                  <input
                    className="si"
                    placeholder="e.g. Rahul Sharma"
                    value={form.studentName}
                    onChange={(e) => setField("studentName", e.target.value)}
                  />
                </div>
                <div>
                  <div className="slbl">Room Number</div>
                  <input
                    className="si"
                    placeholder="e.g. A-204"
                    value={form.room}
                    onChange={(e) => setField("room", e.target.value)}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <div className="slbl">Category</div>
                  <select
                    className="si"
                    value={form.category}
                    onChange={(e) => setField("category", e.target.value)}
                  >
                    <option value="">Select category…</option>
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="slbl">Priority</div>
                  <select
                    className="si"
                    value={form.priority}
                    onChange={(e) => setField("priority", e.target.value)}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="slbl">Complaint Title</div>
                <input
                  className="si"
                  placeholder="Brief title of the issue"
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                />
              </div>

              <div>
                <div className="slbl">
                  Description (leave field to get AI suggestion)
                </div>
                <textarea
                  className="si"
                  placeholder="Describe the problem in detail…"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  onBlur={onDescBlur}
                  style={{ resize: "vertical" }}
                />
              </div>

              {/* AI hint */}
              {(aiLoading || aiHint) && (
                <div
                  style={{
                    background: "#EEF6FF",
                    border: "1px solid #BBDEFB",
                    borderRadius: "10px",
                    padding: "11px 14px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>
                    {aiLoading ? "⏳" : "🤖"}
                  </span>
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        color: "#1565C0",
                        fontSize: "11px",
                        marginBottom: "2px",
                      }}
                    >
                      AI ASSISTANT
                    </div>
                    <div style={{ color: "#1A237E", fontSize: "13px" }}>
                      {aiLoading ? "Analysing your description…" : aiHint}
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                style={{
                  padding: "14px",
                  background: busy
                    ? "#90CAF9"
                    : "linear-gradient(135deg,#1565C0,#0288D1)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: busy ? "not-allowed" : "pointer",
                  marginTop: "4px",
                }}
              >
                {busy ? "Submitting…" : "🚀 Submit Complaint"}
              </button>
            </form>
          </div>
        )}

        {/* ── TRACK ── */}
        {tab === "my" && (
          <div>
            <input
              className="si"
              placeholder="🔍 Search by name, room or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ marginBottom: "14px" }}
            />
            {myList.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  color: "#90A4AE",
                  padding: "50px 0",
                }}
              >
                <div style={{ fontSize: "34px", marginBottom: "10px" }}>📭</div>
                No complaints found.
              </div>
            )}
            {myList.map((c) => {
              const sm = STATUS_META[c.status];
              return (
                <div
                  key={c.id}
                  className="cc"
                  style={{ borderLeftColor: PRIORITY_COLOR[c.priority] }}
                  onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#1A237E",
                          fontSize: "15px",
                        }}
                      >
                        {c.title}
                      </div>
                      <div
                        style={{
                          color: "#78909C",
                          fontSize: "12px",
                          marginTop: "4px",
                        }}
                      >
                        {c.id} · {c.category} · Room {c.room}
                      </div>
                      <div
                        style={{
                          color: "#90A4AE",
                          fontSize: "11px",
                          marginTop: "2px",
                        }}
                      >
                        {fmtDate(c.date)}
                      </div>
                    </div>
                    <span
                      style={{
                        background: sm.bg,
                        color: sm.text,
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: "6px",
                          height: "6px",
                          background: sm.dot,
                          borderRadius: "50%",
                          marginRight: "5px",
                          verticalAlign: "middle",
                        }}
                      />
                      {c.status}
                    </span>
                  </div>
                  {expanded === c.id && (
                    <div
                      style={{
                        marginTop: "14px",
                        paddingTop: "14px",
                        borderTop: "1px solid #EEF2FF",
                      }}
                    >
                      <p
                        style={{
                          color: "#546E7A",
                          fontSize: "13px",
                          lineHeight: 1.6,
                          marginBottom: "12px",
                        }}
                      >
                        {c.description}
                      </p>
                      {c.assignedTo && (
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#1565C0",
                            marginBottom: "10px",
                          }}
                        >
                          👷 Assigned to: <strong>{c.assignedTo}</strong>
                        </div>
                      )}
                      <div className="slbl">Updates</div>
                      {c.updates.length === 0 ? (
                        <div style={{ color: "#B0BEC5", fontSize: "13px" }}>
                          No updates yet.
                        </div>
                      ) : (
                        c.updates.map((u, i) => (
                          <div
                            key={i}
                            style={{
                              background: "#F0F7FF",
                              borderRadius: "8px",
                              padding: "10px 12px",
                              marginTop: "7px",
                              fontSize: "13px",
                              borderLeft: "3px solid #1565C0",
                            }}
                          >
                            <span style={{ color: "#1565C0", fontWeight: 600 }}>
                              {fmtDate(u.date)}:
                            </span>{" "}
                            {u.note}
                          </div>
                        ))
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

// ═════════════════════════════════════════════════════════════════════════
// MANAGEMENT PANEL
// ═════════════════════════════════════════════════════════════════════════
function Management({ setView, complaints, patchComplaint, stats }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState(null);
  const [note, setNote] = useState("");
  const [assignTo, setAssignTo] = useState("");
  const [confirmRes, setConfirmRes] = useState(false);
  const [aiWorking, setAiWorking] = useState(false);
  const [aiPanel, setAiPanel] = useState("");

  // keep sel in sync when complaints update
  useEffect(() => {
    if (sel) {
      const fresh = complaints.find((c) => c.id === sel.id);
      if (fresh) setSel(fresh);
    }
  }, [complaints]);

  const list = complaints.filter((c) => {
    const ms = filter === "All" || c.status === filter;
    const q = search.toLowerCase();
    const mt =
      c.id.toLowerCase().includes(q) ||
      c.studentName.toLowerCase().includes(q) ||
      c.room.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q);
    return ms && mt;
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
      style={{ minHeight: "100vh", background: "#0F1923", color: "#E0E0E0" }}
    >
      <style>{`
        .mi { width:100%; padding:11px 14px; border:1.5px solid #243B55; border-radius:10px; font-size:13px; background:#16263A; color:#E0E0E0; outline:none; transition:border .2s; }
        .mi:focus { border-color:#4FC3F7; }
        .mb { padding:9px 14px; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; transition:all .2s; }
        .chip { padding:7px 14px; border-radius:20px; font-size:12px; font-weight:700; cursor:pointer; border:1.5px solid; transition:all .2s; white-space:nowrap; }
        .rc { background:#16263A; border-radius:12px; padding:16px 18px; margin-bottom:9px; border:1px solid #243B55; cursor:pointer; transition:all .2s; }
        .rc:hover { border-color:#4FC3F7; }
        .rc.on { border-color:#4FC3F7; background:#1A3450; }
        .mlbl { font-size:11px; font-weight:700; color:#546E7A; letter-spacing:.7px; text-transform:uppercase; margin-bottom:5px; }
      `}</style>

      {/* Header */}
      <div
        style={{
          background: "#0A1520",
          borderBottom: "1px solid #243B55",
          padding: "16px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "1120px",
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
                color: "#37474F",
                letterSpacing: "1px",
                marginBottom: "2px",
              }}
            >
              HOSTELDESK
            </div>
            <h1
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: "19px",
                color: "#E0F2FE",
                fontWeight: 800,
              }}
            >
              🛠️ Management Panel
            </h1>
          </div>
          <button
            onClick={() => setView("landing")}
            style={{
              background: "#16263A",
              color: "#78909C",
              border: "1px solid #243B55",
              padding: "8px 14px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            ← Home
          </button>
        </div>
      </div>

      <div
        style={{ maxWidth: "1120px", margin: "0 auto", padding: "20px 16px" }}
      >
        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          {[
            ["📋", "Total", stats.total, "#4FC3F7"],
            ["⏳", "Pending", stats.pending, "#FF9800"],
            ["🔧", "In Progress", stats.inProgress, "#2196F3"],
            ["✅", "Resolved", stats.resolved, "#4CAF50"],
          ].map(([icon, label, val, color]) => (
            <div
              key={label}
              style={{
                background: "#16263A",
                border: "1px solid #243B55",
                borderRadius: "14px",
                padding: "16px 20px",
                flex: "1 1 100px",
              }}
            >
              <div style={{ fontSize: "20px", marginBottom: "5px" }}>
                {icon}
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color,
                  fontFamily: "'Sora',sans-serif",
                }}
              >
                {val}
              </div>
              <div style={{ color: "#546E7A", fontSize: "12px" }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {/* LEFT */}
          <div style={{ flex: "1 1 340px" }}>
            <input
              className="mi"
              placeholder="🔍 Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ marginBottom: "10px" }}
            />
            <div
              style={{
                display: "flex",
                gap: "7px",
                flexWrap: "wrap",
                marginBottom: "13px",
              }}
            >
              {["All", ...STATUSES].map((s) => {
                const active = filter === s;
                return (
                  <button
                    key={s}
                    className="chip"
                    onClick={() => setFilter(s)}
                    style={{
                      background: active ? "#4FC3F7" : "transparent",
                      color: active ? "#0D1B2A" : "#546E7A",
                      borderColor: active ? "#4FC3F7" : "#243B55",
                    }}
                  >
                    {s}{" "}
                    {s !== "All"
                      ? `(${complaints.filter((c) => c.status === s).length})`
                      : ""}
                  </button>
                );
              })}
            </div>

            {list.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  color: "#37474F",
                  padding: "40px 0",
                }}
              >
                No complaints match.
              </div>
            )}
            {list.map((c) => {
              const sm = STATUS_META[c.status];
              return (
                <div
                  key={c.id}
                  className={`rc ${sel?.id === c.id ? "on" : ""}`}
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
                      gap: "8px",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#E0F2FE",
                          fontSize: "14px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {c.title}
                      </div>
                      <div
                        style={{
                          color: "#37474F",
                          fontSize: "12px",
                          marginTop: "4px",
                        }}
                      >
                        {c.id} · {c.studentName} · Rm {c.room}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: "4px",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          background: sm.bg,
                          color: sm.text,
                          padding: "3px 10px",
                          borderRadius: "20px",
                          fontSize: "11px",
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
                      color: "#243B55",
                      fontSize: "11px",
                      marginTop: "7px",
                    }}
                  >
                    {c.category} · {fmtDate(c.date)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT detail */}
          <div style={{ flex: "1 1 300px" }}>
            {!sel ? (
              <div
                style={{
                  background: "#16263A",
                  border: "1px dashed #243B55",
                  borderRadius: "18px",
                  padding: "60px 20px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>👈</div>
                <div style={{ color: "#37474F", fontSize: "14px" }}>
                  Select a complaint to manage
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: "#16263A",
                  border: "1px solid #243B55",
                  borderRadius: "18px",
                  padding: "20px",
                  position: "sticky",
                  top: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "'Sora',sans-serif",
                        fontSize: "16px",
                        color: "#E0F2FE",
                        fontWeight: 700,
                        lineHeight: 1.3,
                      }}
                    >
                      {sel.title}
                    </div>
                    <div
                      style={{
                        color: "#37474F",
                        fontSize: "12px",
                        marginTop: "3px",
                      }}
                    >
                      {sel.id}
                    </div>
                  </div>
                  <button
                    onClick={() => setSel(null)}
                    style={{
                      background: "none",
                      color: "#37474F",
                      border: "none",
                      fontSize: "18px",
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "11px",
                    marginBottom: "14px",
                  }}
                >
                  {[
                    ["Student", sel.studentName],
                    ["Room", sel.room],
                    ["Category", sel.category],
                    ["Date", fmtDate(sel.date)],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div className="mlbl">{k}</div>
                      <div
                        style={{
                          color: "#90CAF9",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                      >
                        {v}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <div className="mlbl">Description</div>
                  <div
                    style={{
                      background: "#0F1923",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      color: "#78909C",
                      fontSize: "13px",
                      lineHeight: 1.6,
                    }}
                  >
                    {sel.description}
                  </div>
                </div>

                {/* Status */}
                <div style={{ marginBottom: "14px" }}>
                  <div className="mlbl">Change Status</div>
                  <div
                    style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}
                  >
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        className="mb"
                        onClick={() => {
                          if (s === "Resolved" && !confirmRes) {
                            setConfirmRes(true);
                            return;
                          }
                          changeStatus(sel.id, s);
                        }}
                        style={{
                          background:
                            sel.status === s ? STATUS_META[s].dot : "#0F1923",
                          color: sel.status === s ? "white" : "#546E7A",
                          border: `1px solid ${sel.status === s ? STATUS_META[s].dot : "#243B55"}`,
                        }}
                      >
                        {s === "Resolved" && confirmRes ? "✓ Confirm?" : s}
                      </button>
                    ))}
                  </div>
                  {confirmRes && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#FF9800",
                        marginTop: "5px",
                      }}
                    >
                      Click "Confirm?" to mark resolved.
                    </div>
                  )}
                </div>

                {/* Assign */}
                <div style={{ marginBottom: "13px" }}>
                  <div className="mlbl">Assign To</div>
                  <input
                    className="mi"
                    placeholder="e.g. Electrician, Maintenance Team…"
                    value={assignTo}
                    onChange={(e) => setAssignTo(e.target.value)}
                  />
                  {sel.assignedTo && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#4FC3F7",
                        marginTop: "4px",
                      }}
                    >
                      Currently: {sel.assignedTo}
                    </div>
                  )}
                </div>

                {/* Note */}
                <div style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "5px",
                    }}
                  >
                    <div className="mlbl" style={{ margin: 0 }}>
                      Update Note
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        className="mb"
                        onClick={aiDraftReply}
                        disabled={aiWorking}
                        style={{
                          background: "#0A2540",
                          color: "#4FC3F7",
                          border: "1px solid #1E3A5F",
                          fontSize: "12px",
                          padding: "5px 10px",
                        }}
                      >
                        {aiWorking ? "…" : "🤖 Draft Reply"}
                      </button>
                      <button
                        className="mb"
                        onClick={aiActionPlan}
                        disabled={aiWorking}
                        style={{
                          background: "#0A2540",
                          color: "#4FC3F7",
                          border: "1px solid #1E3A5F",
                          fontSize: "12px",
                          padding: "5px 10px",
                        }}
                      >
                        {aiWorking ? "…" : "📋 Action Plan"}
                      </button>
                    </div>
                  </div>
                  <textarea
                    className="mi"
                    placeholder="Write an update for the student…"
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    style={{ resize: "vertical" }}
                  />
                  {aiPanel && (
                    <div
                      style={{
                        background: "#0A1A2A",
                        border: "1px solid #1E3A5F",
                        borderRadius: "8px",
                        padding: "11px 13px",
                        marginTop: "8px",
                        fontSize: "13px",
                        color: "#90CAF9",
                        lineHeight: 1.6,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      🤖 {aiPanel}
                    </div>
                  )}
                  <button
                    className="mb"
                    onClick={postUpdate}
                    style={{
                      marginTop: "8px",
                      background: "#0288D1",
                      color: "white",
                      width: "100%",
                      padding: "11px",
                    }}
                  >
                    📤 Post Update
                  </button>
                </div>

                {/* Update history */}
                <div>
                  <div className="mlbl">History ({sel.updates.length})</div>
                  {sel.updates.length === 0 ? (
                    <div style={{ color: "#243B55", fontSize: "13px" }}>
                      No updates yet.
                    </div>
                  ) : (
                    [...sel.updates].reverse().map((u, i) => (
                      <div
                        key={i}
                        style={{
                          background: "#0F1923",
                          borderRadius: "8px",
                          padding: "9px 12px",
                          marginTop: "7px",
                          fontSize: "13px",
                          borderLeft: "3px solid #0288D1",
                        }}
                      >
                        <span style={{ color: "#4FC3F7", fontWeight: 600 }}>
                          {fmtDate(u.date)}
                        </span>
                        <div
                          style={{
                            color: "#78909C",
                            marginTop: "3px",
                            lineHeight: 1.5,
                          }}
                        >
                          {u.note}
                        </div>
                      </div>
                    ))
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

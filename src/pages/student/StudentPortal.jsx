
import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
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
          note: "✅ Complaint received. Management will review shortly.",
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
          <div style={{ display: "flex", gap: "10px" }}>
            <Link
              to="/"
              style={{
                background: "rgba(255,255,255,.15)",
                color: "white",
                textDecoration: "none",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "13px",
              }}
            >
              ← Home
            </Link>
            <button
              onClick={async () => {
                await logoutUser();
                window.location.href = "/";
              }}
              style={{
                background: "#F44336",
                color: "white",
                border: "none",
                padding: "8px 14px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Logout ⏻
            </button>
          </div>
        </div>
      </div>

      <div
        style={{ maxWidth: "700px", margin: "0 auto", padding: "20px 16px" }}
      >
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

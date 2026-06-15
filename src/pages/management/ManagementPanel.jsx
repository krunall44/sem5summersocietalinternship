
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  STATUSES, 
  STATUS_META, 
  PRIORITY_COLOR, 
  fmtDate, 
  callClaude 
} from "../../utils/constants";

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
          <div style={{ display: "flex", gap: "10px" }}>
            <Link
              to="/"
              style={{
                background: "#16263A",
                color: "#78909C",
                border: "1px solid #243B55",
                padding: "8px 14px",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "13px",
              }}
            >
              ← Home
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem("hosteldesk_user");
                window.location.href = "/";
              }}
              style={{
                background: "#B71C1C",
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

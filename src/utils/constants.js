
// ── Constants ─────────────────────────────────────────────────────────────
export const CATEGORIES = [
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
export const STATUSES = ["Pending", "In Progress", "Resolved"];
export const PRIORITIES = ["Low", "Medium", "High"];
export const STATUS_META = {
  Pending: { bg: "#FFF3E0", text: "#E65100", dot: "#FF9800" },
  "In Progress": { bg: "#E3F2FD", text: "#1565C0", dot: "#2196F3" },
  Resolved: { bg: "#E8F5E9", text: "#2E7D32", dot: "#4CAF50" },
};
export const PRIORITY_COLOR = { Low: "#4CAF50", Medium: "#FF9800", High: "#F44336" };

export function genId() {
  return "CMP-" + Math.floor(100 + Math.random() * 900);
}

export function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

import { db, auth } from "./firebase";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc,
  setDoc,
  onSnapshot, 
  query, 
  orderBy,
  deleteDoc,
  where,
  getDocs,
  writeBatch 
} from "firebase/firestore";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";

// ── Auth Helpers ──────────────────────────────────────────────────────────
export const loginUser = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const logoutUser = () => signOut(auth);
export const observeAuth = (callback) => onAuthStateChanged(auth, callback);

export async function getUserProfile(uid) {
  const docRef = doc(db, "users", uid);
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
}

// ── Firebase Helpers ───────────────────────────────────────────────────────
const COMPLAINTS_COL = "complaints";

export function subscribeToComplaints(callback) {
  const q = query(collection(db, COMPLAINTS_COL), orderBy("date", "desc"));
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(list);
  });
}

export async function addComplaintToFirebase(c) {
  try {
    const { id, ...data } = c; // Firestore generates its own ID, but we can store ours inside or use Firestore's
    await addDoc(collection(db, COMPLAINTS_COL), data);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export async function patchComplaintInFirebase(id, patch) {
  try {
    // Note: This 'id' must be the Firestore Document ID
    const docRef = doc(db, COMPLAINTS_COL, id);
    const finalPatch = { ...patch };
    if (patch.status === "Resolved") {
      finalPatch.resolvedAt = new Date().toISOString();
    }
    await updateDoc(docRef, finalPatch);
  } catch (e) {
    console.error("Error updating document: ", e);
  }
}

export async function deleteResolvedComplaints() {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    // Query all resolved complaints (single-field index only)
    const q = query(
      collection(db, COMPLAINTS_COL),
      where("status", "==", "Resolved")
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    let count = 0;
    snapshot.docs.forEach((d) => {
      const data = d.data();
      // Filter by timestamp client-side to avoid needing a composite index
      if (data.resolvedAt && data.resolvedAt <= twentyFourHoursAgo) {
        batch.delete(d.ref);
        count++;
      }
    });

    if (count > 0) {
      await batch.commit();
      console.log(`Deleted ${count} resolved complaints older than 24h.`);
    }
  } catch (e) {
    console.error("Error deleting resolved complaints: ", e);
  }
}

export async function clearAllComplaints() {
  try {
    const snapshot = await getDocs(collection(db, COMPLAINTS_COL));
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log("All complaints cleared successfully.");
    return true;
  } catch (e) {
    console.error("Error clearing complaints: ", e);
    return false;
  }
}

// ── AI helper ─────────────────────────────────────────────────────────────
export async function callClaude(systemPrompt, userMessage) {
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


// Барлық беттерге ортақ функциялар
import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Пайдаланушының рөлін тексеру: рөлі сәйкес келмесе басты бетке қайтарады
export function requireRole(role) {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) { location.href = "index.html"; return; }
      const snap = await getDoc(doc(db, "users", user.uid));
      const profile = snap.data();
      if (!profile || profile.role !== role) { location.href = "index.html"; return; }
      document.getElementById("userName").textContent = profile.name;
      document.getElementById("logoutBtn").onclick = async () => {
        await signOut(auth);
        location.href = "index.html";
      };
      resolve({ user, profile });
    });
  });
}

// XSS-тен қорғау үшін мәтінді экрандау
export function esc(text) {
  const d = document.createElement("div");
  d.textContent = text ?? "";
  return d.innerHTML;
}

export function formatDate(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("kk-KZ", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function toast(message) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

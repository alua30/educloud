// Студент беті: тапсырмаларды көру, жауап жіберу, бағасын көру
import { db } from "./firebase-config.js";
import { requireRole, esc, toast } from "./common.js";
import {
  collection, doc, setDoc, query, where, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const { user, profile } = await requireRole("student");

let assignments = [];
let mySubmissions = [];

onSnapshot(collection(db, "assignments"), (snap) => {
  assignments = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  render();
});

onSnapshot(query(collection(db, "submissions"), where("studentId", "==", user.uid)), (snap) => {
  mySubmissions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  render();
});

function render() {
  assignments.sort((a, b) => (a.deadline || "").localeCompare(b.deadline || ""));

  // Статистика
  const graded = mySubmissions.filter((s) => typeof s.grade === "number");
  document.getElementById("statTotal").textContent = assignments.length;
  document.getElementById("statDone").textContent = mySubmissions.length;
  document.getElementById("statAvg").textContent = graded.length
    ? Math.round(graded.reduce((sum, s) => sum + s.grade, 0) / graded.length)
    : "—";

  const list = document.getElementById("assignmentsList");
  if (!assignments.length) {
    list.innerHTML = `<p class="muted">Әзірге тапсырма жоқ.</p>`;
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  list.innerHTML = assignments.map((a) => {
    const sub = mySubmissions.find((s) => s.assignmentId === a.id);
    const overdue = !sub && a.deadline < today;
    let status;
    if (sub && typeof sub.grade === "number") status = `<span class="status ok">Бағасы: ${sub.grade}</span>`;
    else if (sub) status = `<span class="status wait">Тексерілуде</span>`;
    else if (overdue) status = `<span class="status late">Мерзімі өтті</span>`;
    else status = `<span class="status new">Жаңа</span>`;

    return `
      <article class="card assignment">
        <div class="row">
          <div>
            <span class="badge">${esc(a.subject)}</span>
            <h3>${esc(a.title)}</h3>
          </div>
          ${status}
        </div>
        <p>${esc(a.description)}</p>
        ${a.link ? `<p><a href="${esc(a.link)}" target="_blank" rel="noopener">📎 Оқу материалы</a></p>` : ""}
        <p class="muted">Мұғалім: ${esc(a.teacherName)} · Мерзімі: ${esc(a.deadline)}</p>
        ${sub
          ? `<div class="my-answer"><b>Менің жауабым:</b> ${esc(sub.answer)}</div>`
          : `<form class="answer-form" data-id="${a.id}" data-teacher="${a.teacherId}">
               <textarea name="answer" rows="2" placeholder="Жауабыңызды немесе жұмыс сілтемесін жазыңыз" required></textarea>
               <button type="submit" class="btn small">Жіберу</button>
             </form>`}
      </article>`;
  }).join("");

  list.querySelectorAll(".answer-form").forEach((form) => {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const assignmentId = form.dataset.id;
      // Құжат ID-і = тапсырма + студент, сондықтан әр тапсырмаға бір рет жауап беріледі
      await setDoc(doc(db, "submissions", `${assignmentId}_${user.uid}`), {
        assignmentId,
        teacherId: form.dataset.teacher,
        studentId: user.uid,
        studentName: profile.name,
        answer: form.answer.value.trim(),
        createdAt: serverTimestamp()
      });
      toast("Жауап бұлтқа жіберілді ✅");
    };
  });
}

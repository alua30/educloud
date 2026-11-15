// Мұғалім беті: тапсырма жариялау, жауаптарды көру және бағалау
import { db } from "./firebase-config.js";
import { requireRole, esc, formatDate, toast } from "./common.js";
import {
  collection, addDoc, deleteDoc, updateDoc, doc, query, where, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const { user, profile } = await requireRole("teacher");

let assignments = [];
let submissions = [];

// Жаңа тапсырманы Firestore-ға жазу
document.getElementById("assignmentForm").onsubmit = async (e) => {
  e.preventDefault();
  const form = e.target;
  const val = (id) => document.getElementById(id).value.trim();
  await addDoc(collection(db, "assignments"), {
    title: val("title"),
    subject: val("subject"),
    description: val("description"),
    link: val("link"),
    deadline: val("deadline"),
    teacherId: user.uid,
    teacherName: profile.name,
    createdAt: serverTimestamp()
  });
  form.reset();
  toast("Тапсырма бұлтқа жарияланды ✅");
};

// onSnapshot — деректер бұлтта өзгерген сәтте бет автоматты жаңарады
onSnapshot(query(collection(db, "assignments"), where("teacherId", "==", user.uid)), (snap) => {
  assignments = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  render();
});

onSnapshot(query(collection(db, "submissions"), where("teacherId", "==", user.uid)), (snap) => {
  submissions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  render();
});

function render() {
  const list = document.getElementById("assignmentsList");
  if (!assignments.length) {
    list.innerHTML = `<p class="muted">Әзірге тапсырма жоқ. Жоғарыдағы формадан қосыңыз.</p>`;
    return;
  }
  assignments.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

  list.innerHTML = assignments.map((a) => {
    const subs = submissions.filter((s) => s.assignmentId === a.id);
    return `
      <article class="card assignment">
        <div class="row">
          <div>
            <span class="badge">${esc(a.subject)}</span>
            <h3>${esc(a.title)}</h3>
          </div>
          <button class="btn small danger" data-delete="${a.id}">Өшіру</button>
        </div>
        <p>${esc(a.description)}</p>
        ${a.link ? `<p><a href="${esc(a.link)}" target="_blank" rel="noopener">📎 Оқу материалы</a></p>` : ""}
        <p class="muted">Мерзімі: ${esc(a.deadline)} · Жауап берген: ${subs.length}</p>
        ${subs.length ? `
          <table class="subs">
            <thead><tr><th>Студент</th><th>Жауабы</th><th>Күні</th><th>Бағасы</th></tr></thead>
            <tbody>
              ${subs.map((s) => `
                <tr>
                  <td>${esc(s.studentName)}</td>
                  <td class="answer">${esc(s.answer)}</td>
                  <td>${formatDate(s.createdAt)}</td>
                  <td>
                    <input type="number" min="0" max="100" value="${s.grade ?? ""}" data-grade="${s.id}" placeholder="0–100">
                  </td>
                </tr>`).join("")}
            </tbody>
          </table>` : ""}
      </article>`;
  }).join("");

  list.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.onclick = async () => {
      if (confirm("Тапсырманы өшіру керек пе?")) await deleteDoc(doc(db, "assignments", btn.dataset.delete));
    };
  });
  list.querySelectorAll("[data-grade]").forEach((input) => {
    input.onchange = async () => {
      await updateDoc(doc(db, "submissions", input.dataset.grade), { grade: Number(input.value) });
      toast("Баға сақталды");
    };
  });
}

// Тіркелу және кіру (Firebase Authentication)
import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const errorEl = document.getElementById("authError");

// Қойындыларды ауыстыру
document.querySelectorAll(".tab").forEach((tab) => {
  tab.onclick = () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    const isLogin = tab.dataset.tab === "login";
    loginForm.classList.toggle("hidden", !isLogin);
    registerForm.classList.toggle("hidden", isLogin);
    errorEl.textContent = "";
  };
});

function goByRole(role) {
  location.href = role === "teacher" ? "teacher.html" : "student.html";
}

function showError(err) {
  const messages = {
    "auth/email-already-in-use": "Бұл email бұрын тіркелген",
    "auth/invalid-credential": "Email немесе құпиясөз қате",
    "auth/invalid-email": "Email дұрыс емес",
    "auth/weak-password": "Құпиясөз кемінде 6 таңба болуы керек"
  };
  errorEl.textContent = messages[err.code] || "Қате: " + err.message;
}

// Тіркелу: Authentication-да аккаунт ашып, Firestore-ға профиль жазамыз
registerForm.onsubmit = async (e) => {
  e.preventDefault();
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;
  const role = document.getElementById("regRole").value;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", cred.user.uid), {
      name, email, role, createdAt: serverTimestamp()
    });
    goByRole(role);
  } catch (err) { showError(err); }
};

// Кіру: рөлін Firestore-дан оқып, тиісті бетке жібереміз
loginForm.onsubmit = async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    goByRole(snap.data()?.role);
  } catch (err) { showError(err); }
};

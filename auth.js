// If already signed in, skip straight to the dashboard.
auth.onAuthStateChanged((user) => {
  const dot = document.getElementById("status-dot");
  if (dot) dot.classList.toggle("status-dot--on", !!user);
  if (user) {
    window.location.href = "app.html";
  }
});

const form = document.getElementById("login-form");
const errorEl = document.getElementById("login-error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.textContent = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const submitBtn = form.querySelector(".btn-primary");

  submitBtn.disabled = true;
  submitBtn.textContent = "Logging in…";

  try {
    await auth.signInWithEmailAndPassword(email, password);
    window.location.href = "app.html";
  } catch (err) {
    errorEl.textContent = describeAuthError(err.code);
    submitBtn.disabled = false;
    submitBtn.textContent = "Login";
  }
});

function describeAuthError(code) {
  switch (code) {
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email or password didn't match.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a moment and try again.";
    default:
      return "Couldn't sign in. Try again.";
  }
}
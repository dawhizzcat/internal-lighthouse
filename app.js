// Auth guard — bounce back to login if not signed in.
auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  const emailEl = document.getElementById("user-email");
  if (emailEl) emailEl.textContent = user.email;
});

document.getElementById("signout-btn").addEventListener("click", async () => {
  await auth.signOut();
  window.location.href = "index.html";
});

// Sidebar tab switching
const tabs = document.querySelectorAll(".nav-tab");
const sections = document.querySelectorAll(".section-view");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.section;

    tabs.forEach((t) => t.classList.toggle("is-active", t === tab));
    sections.forEach((s) =>
      s.classList.toggle("is-active", s.id === `section-${target}`)
    );

    history.replaceState(null, "", `#${target}`);
  });
});

// Restore tab from URL hash on load (so a bookmark/refresh keeps your place)
const initial = window.location.hash.replace("#", "");
if (initial) {
  const match = document.querySelector(`.nav-tab[data-section="${initial}"]`);
  if (match) match.click();
}
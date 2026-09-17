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
const tabArr = Array.from(tabs);

// Orange radiates out from the selected beam and cools with distance.
function applyBeamHeat(activeIndex) {
  tabArr.forEach((t, i) => {
    const dist = Math.min(Math.abs(i - activeIndex), 3);
    t.classList.remove("heat-0", "heat-1", "heat-2", "heat-3");
    t.classList.add(`heat-${dist}`);
  });
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.section;

    tabs.forEach((t) => t.classList.toggle("is-active", t === tab));
    sections.forEach((s) =>
      s.classList.toggle("is-active", s.id === `section-${target}`)
    );
    applyBeamHeat(index);

    history.replaceState(null, "", `#${target}`);
  });
});

// Seed the heat falloff from whichever tab starts active
applyBeamHeat(tabArr.findIndex((t) => t.classList.contains("is-active")));

// Restore tab from URL hash on load (so a bookmark/refresh keeps your place)
const initial = window.location.hash.replace("#", "");
if (initial) {
  const match = document.querySelector(`.nav-tab[data-section="${initial}"]`);
  if (match) match.click();
}
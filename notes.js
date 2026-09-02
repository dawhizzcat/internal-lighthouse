// ---------- Notes tab ----------
// Firestore schema: collection "notes", each doc: { title, body, order, updatedAt }

const notesGrid = document.getElementById("notes-grid");
const notesEmpty = document.getElementById("notes-empty");
const addNoteBtn = document.getElementById("add-note-btn");

const modalOverlay = document.getElementById("note-modal-overlay");
const titleInput = document.getElementById("note-title-input");
const bodyInput = document.getElementById("note-body-input");
const saveBtn = document.getElementById("note-save-btn");
const cancelBtn = document.getElementById("note-cancel-btn");
const deleteBtn = document.getElementById("note-delete-btn");

const notesCol = db.collection("notes");

let notesCache = []; // [{id, title, body, order, updatedAt}]
let activeNoteId = null; // null while creating a new note
let dragSourceId = null;

function renderNotes() {
  notesGrid.innerHTML = "";
  notesEmpty.hidden = notesCache.length > 0;

  notesCache.forEach((note) => {
    const card = document.createElement("div");
    card.className = "note-card";
    card.draggable = true;
    card.dataset.id = note.id;

    const title = document.createElement("h3");
    title.className = "note-card-title";
    title.textContent = note.title || "Untitled";

    const preview = document.createElement("p");
    preview.className = "note-card-preview";
    preview.textContent = note.body || "";

    card.appendChild(title);
    card.appendChild(preview);

    card.addEventListener("click", () => openNote(note.id));

    card.addEventListener("dragstart", () => {
      dragSourceId = note.id;
      card.classList.add("is-dragging");
    });
    card.addEventListener("dragend", () => {
      card.classList.remove("is-dragging");
    });
    card.addEventListener("dragover", (e) => {
      e.preventDefault();
      card.classList.add("is-drop-target");
    });
    card.addEventListener("dragleave", () => {
      card.classList.remove("is-drop-target");
    });
    card.addEventListener("drop", (e) => {
      e.preventDefault();
      card.classList.remove("is-drop-target");
      if (dragSourceId && dragSourceId !== note.id) {
        reorderNotes(dragSourceId, note.id);
      }
    });

    notesGrid.appendChild(card);
  });
}

function loadNotes() {
  notesCol.orderBy("order", "asc").onSnapshot((snapshot) => {
    notesCache = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    renderNotes();
  });
}

async function reorderNotes(sourceId, targetId) {
  const sourceIndex = notesCache.findIndex((n) => n.id === sourceId);
  const targetIndex = notesCache.findIndex((n) => n.id === targetId);
  if (sourceIndex === -1 || targetIndex === -1) return;

  const reordered = [...notesCache];
  const [moved] = reordered.splice(sourceIndex, 1);
  reordered.splice(targetIndex, 0, moved);

  // Optimistically update locally so the UI feels instant
  notesCache = reordered;
  renderNotes();

  const batch = db.batch();
  reordered.forEach((note, index) => {
    batch.update(notesCol.doc(note.id), { order: index });
  });
  await batch.commit();
}

function openNote(id) {
  const note = notesCache.find((n) => n.id === id);
  if (!note) return;
  activeNoteId = id;
  titleInput.value = note.title || "";
  bodyInput.value = note.body || "";
  deleteBtn.hidden = false;
  modalOverlay.hidden = false;
  titleInput.focus();
}

function openNewNote() {
  activeNoteId = null;
  titleInput.value = "";
  bodyInput.value = "";
  deleteBtn.hidden = true;
  modalOverlay.hidden = false;
  titleInput.focus();
}

function closeModal() {
  modalOverlay.hidden = true;
  activeNoteId = null;
}

async function saveNote() {
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title && !body) {
    closeModal();
    return;
  }

  if (activeNoteId) {
    await notesCol.doc(activeNoteId).update({
      title,
      body,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } else {
    const nextOrder = notesCache.length;
    await notesCol.add({
      title,
      body,
      order: nextOrder,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }

  closeModal();
}

async function deleteNote() {
  if (!activeNoteId) return;
  await notesCol.doc(activeNoteId).delete();
  closeModal();
}

addNoteBtn.addEventListener("click", openNewNote);
saveBtn.addEventListener("click", saveNote);
cancelBtn.addEventListener("click", closeModal);
deleteBtn.addEventListener("click", deleteNote);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modalOverlay.hidden) closeModal();
});

auth.onAuthStateChanged((user) => {
  if (user) loadNotes();
});

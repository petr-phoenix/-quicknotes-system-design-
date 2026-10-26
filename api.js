const API_URL = "https://jsonplaceholder.typicode.com/posts";

let localNotes = [];

// DOM Element References
const loadBtn = document.getElementById("load-btn");
const submitBtn = document.getElementById("submit-btn");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const statusEl = document.getElementById("status");
const notesList = document.getElementById("notes-list");

/**
 * Updates UI status message with specified state type.
 */
function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = type ? `status-${type}` : "";
}

/**
 * Toggles interactive button states during network operations.
 */
function setButtonsDisabled(disabled) {
  loadBtn.disabled = disabled;
  submitBtn.disabled = disabled;
  const deleteButtons = notesList.querySelectorAll(".delete-btn");
  deleteButtons.forEach((btn) => (btn.disabled = disabled));
}

/**
 * Reusable fetch wrapper that verifies response.ok and throws errors.
 */
async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
  }
  if (response.status === 204) return true;
  return await response.json();
}

/**
 * Renders local notes array using textContent to prevent XSS.
 */
function renderNotes() {
  notesList.textContent = "";

  if (localNotes.length === 0) {
    const emptyLi = document.createElement("li");
    emptyLi.className = "empty-state";
    emptyLi.textContent = "No notes available. Click 'Load Notes' or submit a new note above.";
    notesList.appendChild(emptyLi);
    return;
  }

  localNotes.forEach((note) => {
    const li = document.createElement("li");
    li.className = "note-card";

    const contentDiv = document.createElement("div");
    contentDiv.className = "note-content";

    const titleH3 = document.createElement("h3");
    titleH3.className = "note-title";
    titleH3.textContent = note.title;

    const bodyP = document.createElement("p");
    bodyP.className = "note-body";
    bodyP.textContent = note.body || "";

    contentDiv.appendChild(titleH3);
    contentDiv.appendChild(bodyP);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => handleDeleteNote(note.id));

    li.appendChild(contentDiv);
    li.appendChild(deleteBtn);

    notesList.appendChild(li);
  });
}
* GET: Fetches 10 notes from API.
 */
async function fetchNotes() {
  setStatus("Loading notes...", "loading");
  setButtonsDisabled(true);

  try {
    const data = await request(`${API_URL}?_limit=10`);
    localNotes = data.map((item) => ({
      id: item.id,
      title: item.title,
      body: item.body,
    }));

    renderNotes();
    setStatus("Successfully loaded 10 notes.", "success");
  } catch (err) {
    setStatus(`Failed to fetch notes: ${err.message}`, "error");
  } finally {
    setButtonsDisabled(false);
  }
}
* POST: Submits new note payload to API.
 */
async function createNote(title, body) {
  setStatus("Creating note...", "loading");
  setButtonsDisabled(true);

  try {
    const newNotePayload = { title, body, userId: 1 };
    await request(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newNotePayload),
    });

    const newNote = {
      id: Date.now(),
      title: title,
      body: body,
    };

    localNotes.unshift(newNote);
    renderNotes();

    titleInput.value = "";
    bodyInput.value = "";
    setStatus("Note created successfully!", "success");
  } catch (err) {
    setStatus(`Failed to create note: ${err.message}`, "error");
  } finally {
    setButtonsDisabled(false);
  }
}
/**
 * DELETE: Removes note by ID.
 */
async function handleDeleteNote(id) {
  setStatus(`Deleting note #${id}...`, "loading");
  setButtonsDisabled(true);

  try {
    await request(`${API_URL}/${id}`, { method: "DELETE" });
    localNotes = localNotes.filter((note) => note.id !== id);
    renderNotes();
    setStatus(`Note #${id} deleted successfully.`, "success");
  } catch (err) {
    setStatus(`Failed to delete note: ${err.message}`, "error");
  } finally {
    setButtonsDisabled(false);
  }
}

// Form Validation & Event Handler
noteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    setStatus("Validation Error: Title is required.", "error");
    return;
  }
  if (title.length > 100) {
    setStatus("Validation Error: Title cannot exceed 100 characters.", "error");
    return;
  }

  createNote(title, body);
});

loadBtn.addEventListener("click", fetchNotes);

renderNotes();
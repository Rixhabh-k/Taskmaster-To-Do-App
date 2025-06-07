// ======= Light/Dark Mode Toggle =======
const toggleBtn = document.getElementById("modeToggle");
const icon = toggleBtn.querySelector("i");
  
  

toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  icon.className = isDark ? "fas fa-sun" : "fas fa-moon";
});

// notes js 

// Selectors
const addNoteBtn = document.getElementById('addNoteBtn');
const modal = document.getElementById('addNoteModal');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const cancelNoteBtn = document.getElementById('cancelNoteBtn');
const notesGrid = document.querySelector('.notes-grid');
const toast = document.getElementById('undoToast');
const undoBtn = document.getElementById('undoDeleteBtn');

// Edit modal selectors
const editNoteModal = document.getElementById('editNoteModal');
const editTitleInput = document.getElementById('editNoteTitleInput');
const editContentInput = document.getElementById('editNoteContentInput');
const updateNoteBtn = document.getElementById('updateNoteBtn');
const cancelEditNoteBtn = document.getElementById('cancelEditNoteBtn');

let currentEditIndex = null;
let recentlyDeletedNote = null;
let recentlyDeletedIndex = null;

// Load notes on page load
window.addEventListener('DOMContentLoaded', loadNotes);

addNoteBtn.addEventListener('click', () => {
  modal.style.display = 'flex';
});

cancelNoteBtn.addEventListener('click', () => {
  modal.style.display = 'none';
  clearModalInputs();
});

saveNoteBtn.addEventListener('click', () => {
  const title = document.getElementById('noteTitleInput').value.trim();
  const content = document.getElementById('noteContentInput').value.trim();

  if (title && content) {
    const now = new Date();
    const timestamp = now.toLocaleString();

    const note = { title, content, timestamp };
    saveNoteToStorage(note);
    addNoteToUI(note);

    modal.style.display = 'none';
    clearModalInputs();
  } else {
    alert("Please enter both title and content.");
  }
});

function clearModalInputs() {
  document.getElementById('noteTitleInput').value = '';
  document.getElementById('noteContentInput').value = '';
}

// Save note to localStorage
function saveNoteToStorage(note) {
  const notes = JSON.parse(localStorage.getItem('notes')) || [];
  notes.push(note);
  localStorage.setItem('notes', JSON.stringify(notes));
}

// Load notes from localStorage
function loadNotes() {
  const notes = JSON.parse(localStorage.getItem('notes')) || [];
  notes.forEach(addNoteToUI);
}

// Add note to the UI
function addNoteToUI(note) {
  const noteCard = document.createElement('div');
  noteCard.className = 'note-card';
  noteCard.style.animation = 'fadeIn 0.3s ease';
  noteCard.innerHTML = `
    <div class="note-title">${note.title}</div>
    <div class="note-footer">
      <span class="note-date">${note.timestamp}</span>
      <div class="note-actions">
        <i class="fas fa-edit edit-icon"></i>
        <i class="fas fa-trash delete-icon"></i>
      </div>
    </div>
  `;

  // Add delete functionality
  const deleteIcon = noteCard.querySelector('.delete-icon');
  deleteIcon.addEventListener('click', () => {
    const index = Array.from(notesGrid.children).indexOf(noteCard);
    recentlyDeletedNote = JSON.parse(localStorage.getItem('notes'))[index];
    recentlyDeletedIndex = index;

    noteCard.style.animation = 'fadeOut 0.4s ease forwards';
    setTimeout(() => {
      noteCard.remove();
      deleteNoteFromStorage(index);
      showUndoToast();
    }, 500);
  });

  notesGrid.appendChild(noteCard);
}

// Delete from localStorage
function deleteNoteFromStorage(index) {
  const notes = JSON.parse(localStorage.getItem('notes')) || [];
  notes.splice(index, 1);
  localStorage.setItem('notes', JSON.stringify(notes));
}

// Undo delete
undoBtn.addEventListener('click', () => {
  if (recentlyDeletedNote !== null && recentlyDeletedIndex !== null) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.splice(recentlyDeletedIndex, 0, recentlyDeletedNote);
    localStorage.setItem('notes', JSON.stringify(notes));
    refreshNotesUI();
    hideUndoToast();
  }
});

function showUndoToast() {
  toast.classList.add('show');
  setTimeout(() => hideUndoToast(), 5000);
}

function hideUndoToast() {
  toast.classList.remove('show');
  recentlyDeletedNote = null;
  recentlyDeletedIndex = null;
}

// Edit Modal
notesGrid.addEventListener('click', function (e) {
  if (e.target.classList.contains('edit-icon')) {
    const noteCard = e.target.closest('.note-card');
    const index = Array.from(notesGrid.children).indexOf(noteCard);
    const notes = JSON.parse(localStorage.getItem('notes')) || [];

    editTitleInput.value = notes[index].title;
    editContentInput.value = notes[index].content;
    currentEditIndex = index;

    editNoteModal.style.display = 'flex';
  }
});

cancelEditNoteBtn.addEventListener('click', () => {
  editNoteModal.style.display = 'none';
  currentEditIndex = null;
});

updateNoteBtn.addEventListener('click', () => {
  const updatedTitle = editTitleInput.value.trim();
  const updatedContent = editContentInput.value.trim();

  if (updatedTitle && updatedContent && currentEditIndex !== null) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes[currentEditIndex].title = updatedTitle;
    notes[currentEditIndex].content = updatedContent;

    localStorage.setItem('notes', JSON.stringify(notes));
    refreshNotesUI();

    editNoteModal.style.display = 'none';
    currentEditIndex = null;
  } else {
    alert("Please enter both title and content.");
  }
});

function refreshNotesUI() {
  notesGrid.innerHTML = '';
  const notes = JSON.parse(localStorage.getItem('notes')) || [];
  notes.forEach(addNoteToUI);
}



// click to view 

// Elements for view note modal
const viewNoteModal = document.getElementById('viewNoteModal');
const viewNoteTitle = document.getElementById('viewNoteTitle');
const viewNoteContent = document.getElementById('viewNoteContent');
const viewNoteTimestamp = document.getElementById('viewNoteTimestamp');
const closeViewNoteBtn = document.getElementById('closeViewNoteBtn');

// Open view modal when note is clicked (excluding action icons)
notesGrid.addEventListener('click', function (e) {
  const noteCard = e.target.closest('.note-card');
  if (!noteCard || e.target.classList.contains('edit-icon') || e.target.classList.contains('delete-icon')) return;

  const index = Array.from(notesGrid.children).indexOf(noteCard);
  const notes = JSON.parse(localStorage.getItem('notes')) || [];

  const note = notes[index];
  viewNoteTitle.textContent = note.title;
  viewNoteContent.textContent = note.content;
  viewNoteTimestamp.textContent = `Created on: ${note.timestamp}`;
  viewNoteModal.style.display = 'flex';
});

// Close view modal
closeViewNoteBtn.addEventListener('click', () => {
  viewNoteModal.style.display = 'none';
});

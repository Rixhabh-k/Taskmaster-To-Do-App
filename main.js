// ======= Light/Dark Mode Toggle =======
const toggleBtn = document.getElementById("modeToggle");
const icon = toggleBtn.querySelector("i");
  
  

toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  icon.className = isDark ? "fas fa-sun" : "fas fa-moon";
});
  
  

// ======= Tabs and Task Logic =======
const tabs = document.querySelectorAll(".tab");
const taskLists = document.querySelectorAll(".task-list");
let activeTab = "today";
  
  

// Create audio element for sound playback
const audio = document.createElement('audio');
audio.src = 'sounds/checked.mp3';
audio.preload = 'auto';
document.body.appendChild(audio);
  
  

function loadTasks() {
  const stored = localStorage.getItem("tasks");
  return stored ? JSON.parse(stored) : { today: [], week: [], month: [], year: [] };
}
  
  

function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}
  
  

function renderTasks() {
  const tasks = loadTasks();
  
  

  taskLists.forEach(list => {
    const tab = list.getAttribute("data-tab");
    list.innerHTML = "";
  
  

    if (tab === activeTab) {
      list.style.display = "flex";
  
  

      tasks[tab].forEach((task, index) => {
        const taskEl = document.createElement("div");
        taskEl.className = "task-item";
  
  

        taskEl.innerHTML = `
          <label class="custom-checkbox">
            <input type="checkbox" class="task-check" ${task.done ? "checked" : ""} />
            <span class="checkmark"></span>
          </label>
          <span class="task-text" style="${task.done ? 'text-decoration: none;' : ''}">${task.text}</span>
          <div class="task-actions">
            <button class="edit-btn"><i class="fas fa-pen"></i></button>
            <button class="delete-btn"><i class="fas fa-trash"></i></button>
          </div>
        `;
  
  

        const checkbox = taskEl.querySelector(".task-check");
  
  

        // Attach event listener to play sound and trigger confetti on check
        checkbox.addEventListener("change", () => {
          task.done = checkbox.checked;
          saveTasks(tasks);
          renderTasks();
  
  

          // Play sound if checked
          if (checkbox.checked) {
            audio.currentTime = 0; // Reset audio to start
            audio.play(); // Play sound
            triggerConfetti(); // Trigger confetti effect
          }
        });
  
  

        taskEl.querySelector(".delete-btn").addEventListener("click", () => {
          deleteTaskWithUndo(tab, index);
        });
  
  

        taskEl.querySelector(".edit-btn").addEventListener("click", () => {
          openEditModal(tab, index, task.text);
        });
  
  

        list.appendChild(taskEl);
      });
  
  

    } else {
      list.style.display = "none";
    }
  });
}
  
  

function updateActiveTab(newTab) {
  tabs.forEach(t => t.classList.remove("active"));
  const tab = Array.from(tabs).find(t => t.dataset.tab === newTab);
  if (tab) tab.classList.add("active");
  activeTab = newTab;
  renderTasks();
}
  
  

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    updateActiveTab(tab.dataset.tab);
  });
});
  
  

// Always add to today tab
const addTaskBtn = document.querySelector(".add-task-btn");
addTaskBtn.addEventListener("click", () => {
  const input = document.querySelector(".task-input");
  const text = input.value.trim();
  if (!text) return;
  
  

  const tasks = loadTasks();
  tasks['today'].push({ text, done: false });
  saveTasks(tasks);
  input.value = "";
  if (activeTab === 'today') renderTasks();
});
  
  

// ======= Add Task Modal =======
const modal = document.getElementById("taskModal");
const modalInput = document.getElementById("modalTaskInput");
const modalSelect = document.getElementById("modalTabSelect");
const modalAddBtn = document.getElementById("modalAddBtn");
const modalCloseBtn = document.querySelector(".close-btn");
const openModalBtn = document.querySelector(".assign-task-btn");
  
  

openModalBtn.addEventListener("click", () => {
  modal.style.display = "flex";
  modalInput.value = "";
  modalSelect.value = "week";
});
  
  

modalCloseBtn.addEventListener("click", () => {
  modal.style.display = "none";
});
  
  

modalAddBtn.addEventListener("click", () => {
  const text = modalInput.value.trim();
  const tab = modalSelect.value;
  if (!text) return;
  
  

  const tasks = loadTasks();
  tasks[tab].push({ text, done: false });
  saveTasks(tasks);
  modal.style.display = "none";
  if (activeTab === tab) renderTasks();
});
  
  

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});
  
  

// ======= Edit Modal =======
const editModal = document.getElementById("editModal");
const editTaskInput = document.getElementById("editTaskInput");
const editSaveBtn = document.getElementById("editSaveBtn");
const editCloseBtn = document.querySelector(".close-edit-btn");
  
  

let editTarget = { tab: null, index: null };
  
  

function openEditModal(tab, index, currentText) {
  editTarget = { tab, index };
  editTaskInput.value = currentText;
  editModal.style.display = "flex";
}
  
  

editSaveBtn.addEventListener("click", () => {
  const newText = editTaskInput.value.trim();
  if (!newText) return;
  
  

  const tasks = loadTasks();
  tasks[editTarget.tab][editTarget.index].text = newText;
  saveTasks(tasks);
  editModal.style.display = "none";
  if (activeTab === editTarget.tab) renderTasks();
});
  
  

editCloseBtn.addEventListener("click", () => {
  editModal.style.display = "none";
});
  
  

window.addEventListener("click", (e) => {
  if (e.target === editModal) {
    editModal.style.display = "none";
  }
});
  
  

// ======= Initial Setup =======
updateActiveTab(activeTab);
  
  

// undo btn script 
const undoToast = document.getElementById('undoToast');
const undoBtn = document.getElementById('undoBtn');
  
  

let deletedTask = null; // to store last deleted task info
let undoTimeout = null;
  
  

// Modify your delete button event listener to this:
function deleteTaskWithUndo(tab, index) {
  const tasks = loadTasks();
  
  

  // Save deleted task for undo
  deletedTask = {
    tab,
    index,
    task: tasks[tab][index]
  };
  
  

  // Remove the task
  tasks[tab].splice(index, 1);
  saveTasks(tasks);
  renderTasks();
  
  

  // Show toast
  undoToast.style.display = 'flex';
  
  

  // Clear any previous timeout
  if (undoTimeout) clearTimeout(undoTimeout);
  
  

  // Hide toast after 5 seconds
  undoTimeout = setTimeout(() => {
    undoToast.style.display = 'none';
    deletedTask = null;
  }, 5000);
}
  
  

// Undo button click handler
undoBtn.addEventListener('click', () => {
  if (deletedTask) {
    const tasks = loadTasks();
  
  

    // Reinsert the deleted task at its original position
    tasks[deletedTask.tab].splice(deletedTask.index, 0, deletedTask.task);
    saveTasks(tasks);
    renderTasks();
  
  

    // Hide the toast and clear undo info & timeout
    undoToast.style.display = 'none';
    deletedTask = null;
    clearTimeout(undoTimeout);
  }
});
  
  

// ======= Confetti Effect =======
function triggerConfetti() {
  const duration = 1000; // 1 seconds
  const animationEnd = Date.now() + duration;
  const defaults = {
    startVelocity: 50,
    spread: 100,
    ticks: 50,
    gravity: 1,
    zIndex: 9999,
    scalar: 1.5,
    colors: ['#ff0000', '#ff8000', '#ffff00', '#00ff00', '#0000ff', '#8000ff'],
    shapes: ['square', 'circle']
  };
  
  

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
  
  

    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }
  
  

    // Keep particle count constant for visibility
    const particleCount = 60;
  
  

    confetti(Object.assign({}, defaults, {
      particleCount,
      origin: { x: Math.random() * 0.3 + 0.1, y: Math.random() - 0.2 }
    }));
  
  

    confetti(Object.assign({}, defaults, {
      particleCount,
      origin: { x: Math.random() * 0.3 + 0.7, y: Math.random() - 0.2 }
    }));
  }, 200);
}
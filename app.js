/* ==========================================================================
   EXPERIMENT 6: BUILDING A WEB APP WITH JAVASCRIPT FUNCTIONS
   Web Technology Lab — Semester 5
   Theme: TechPulse Task Tracker

   Demonstrating:
   - Function declarations, parameters, return values & reusable functions
   - Array methods: map(), filter(), forEach()
   - Callback functions & Event handling
   - localStorage, JSON.stringify() & JSON.parse()
   ========================================================================== */

// Global State
var tasks = [];
var currentFilter = "all";

/**
 * 1. createTask(text)
 * Creates and returns a task object with id, text, and done properties.
 * 
 * @param {string} text - The description of the task.
 * @returns {Object} - The newly created task object.
 */
function createTask(text) {
    return {
        id: Date.now().toString(),
        text: text,
        done: false
    };
}

/**
 * 2. addTask(text)
 * Adds a new task object to the tasks array and persists & redraws UI.
 * 
 * @param {string} text - The description of the task.
 */
function addTask(text) {
    var task = createTask(text);
    tasks.push(task);
    saveAndRender();
}

/**
 * 3. toggleTask(id)
 * Toggles a task between completed and pending states using Array.prototype.map().
 * 
 * @param {string} id - The unique identifier of the task to toggle.
 */
function toggleTask(id) {
    tasks = tasks.map(function (task) {
        if (task.id === id || task.id == id) {
            return {
                id: task.id,
                text: task.text,
                done: !task.done
            };
        }
        return task;
    });
    saveAndRender();
}

/**
 * 4. deleteTask(id)
 * Removes a task from the tasks array using Array.prototype.filter().
 * 
 * @param {string} id - The unique identifier of the task to remove.
 */
function deleteTask(id) {
    tasks = tasks.filter(function (task) {
        return task.id !== id && task.id != id;
    });
    saveAndRender();
}

/**
 * 5. getVisible()
 * Returns tasks according to the currently selected filter: 'All', 'Open', or 'Completed'.
 * 
 * @returns {Array} - Filtered subset of tasks array.
 */
function getVisible() {
    var filter = currentFilter.toLowerCase();
    if (filter === "open") {
        return tasks.filter(function (task) {
            return !task.done;
        });
    } else if (filter === "completed") {
        return tasks.filter(function (task) {
            return task.done;
        });
    }
    return tasks;
}

/**
 * 6. taskItem(t)
 * Creates and returns an individual task list DOM element (<li>).
 * 
 * @param {Object} t - The task object containing id, text, done.
 * @returns {HTMLElement} - The list item element.
 */
function taskItem(t) {
    var li = document.createElement("li");
    li.className = "task-item" + (t.done ? " completed" : "");
    li.setAttribute("data-id", t.id);

    // Left side: Checkbox and Task Description
    var label = document.createElement("label");
    label.className = "task-label";

    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = t.done;
    checkbox.setAttribute("aria-label", "Mark task as " + (t.done ? "pending" : "completed"));
    checkbox.addEventListener("change", function () {
        toggleTask(t.id);
    });

    var span = document.createElement("span");
    span.className = "task-text";
    span.textContent = t.text;

    label.appendChild(checkbox);
    label.appendChild(span);

    // Right side: Delete button
    var deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn-delete";
    deleteBtn.setAttribute("aria-label", "Delete task: " + t.text);
    deleteBtn.textContent = "✕";
    deleteBtn.addEventListener("click", function () {
        deleteTask(t.id);
    });

    li.appendChild(label);
    li.appendChild(deleteBtn);

    return li;
}

/**
 * 7. countOpen()
 * Counts unfinished (pending) tasks using Array.prototype.filter().
 * 
 * @returns {number} - Number of incomplete tasks.
 */
function countOpen() {
    return tasks.filter(function (task) {
        return !task.done;
    }).length;
}

/**
 * 8. renderTasks()
 * Clears and redraws the task list using getVisible(), taskItem(), and countOpen().
 * Iterates across visible tasks using Array.prototype.forEach().
 */
function renderTasks() {
    var taskList = document.getElementById("taskList");
    var emptyState = document.getElementById("emptyState");
    var counter = document.getElementById("taskCounter");

    if (taskList) {
        taskList.innerHTML = "";
        var visibleTasks = getVisible();

        if (visibleTasks.length === 0) {
            if (emptyState) emptyState.style.display = "block";
        } else {
            if (emptyState) emptyState.style.display = "none";
            visibleTasks.forEach(function (t) {
                var item = taskItem(t);
                taskList.appendChild(item);
            });
        }
    }

    if (counter) {
        var openCount = countOpen();
        counter.textContent = openCount === 1 ? "1 task left" : openCount + " tasks left";
    }
}

/**
 * 9. saveAndRender()
 * Saves current tasks array using localStorage and JSON.stringify(),
 * then calls renderTasks() to update the DOM.
 */
function saveAndRender() {
    if (typeof localStorage !== "undefined") {
        try {
            localStorage.setItem("techpulse_tasks", JSON.stringify(tasks));
        } catch (e) {
            console.error("Failed to save tasks to localStorage:", e);
        }
    }
    renderTasks();
}

/**
 * 10. handleSubmit(event)
 * Handles task form submission:
 * - Prevents default browser form submission.
 * - Reads and trims user input.
 * - Calls addTask() if input is non-empty.
 * - Clears input field.
 * 
 * @param {Event} event - The DOM submit event.
 */
function handleSubmit(event) {
    if (event && event.preventDefault) {
        event.preventDefault();
    }
    var input = document.getElementById("taskInput");
    if (!input) return;

    var text = input.value.trim();
    if (text !== "") {
        addTask(text);
        input.value = "";
    }
    input.focus();
}

/**
 * Updates current filter and syncs active button styling.
 * 
 * @param {string} filterName - 'all', 'open', or 'completed'.
 */
function setFilter(filterName) {
    currentFilter = filterName.toLowerCase();
    var buttons = document.querySelectorAll(".filter-btn");
    buttons.forEach(function (btn) {
        if (btn.getAttribute("data-filter").toLowerCase() === currentFilter) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
    renderTasks();
}

/**
 * Loads persisted tasks from localStorage using JSON.parse().
 */
function loadTasks() {
    if (typeof localStorage !== "undefined") {
        try {
            var saved = localStorage.getItem("techpulse_tasks");
            if (saved) {
                var parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    tasks = parsed;
                } else {
                    tasks = [];
                }
            } else {
                tasks = [];
            }
        } catch (e) {
            console.error("Failed to load tasks from localStorage:", e);
            tasks = [];
        }
    }
}

// ==========================================================================
// Initialization & Event Binding
// ==========================================================================
if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", function () {
        // Load saved tasks from localStorage
        loadTasks();

        // Initial task list render
        renderTasks();

        // Bind form submission (handles both Add button click & Enter key press)
        var form = document.getElementById("taskForm");
        if (form) {
            form.addEventListener("submit", handleSubmit);
        }

        // Bind filter button clicks
        var filterButtons = document.querySelectorAll(".filter-btn");
        filterButtons.forEach(function (btn) {
            btn.addEventListener("click", function () {
                var filterValue = btn.getAttribute("data-filter");
                if (filterValue) {
                    setFilter(filterValue);
                }
            });
        });
    });
}

// Export for Node.js automated testing
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        createTask: createTask,
        addTask: addTask,
        toggleTask: toggleTask,
        deleteTask: deleteTask,
        getVisible: getVisible,
        taskItem: taskItem,
        countOpen: countOpen,
        renderTasks: renderTasks,
        saveAndRender: saveAndRender,
        handleSubmit: handleSubmit,
        setFilter: setFilter,
        loadTasks: loadTasks,
        getTasks: function () { return tasks; },
        setTasks: function (t) { tasks = t; },
        getCurrentFilter: function () { return currentFilter; }
    };
}

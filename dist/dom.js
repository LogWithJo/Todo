import { Group } from "./Ddom.js";
import { addTaskToLocalStorage, auth, RemoveType, removeAllCompletedTasks, removeAllTasks, removeTaskLocalStorage, returnRemovedTask, State, saveRemovedTask, searchTasks, stateTaskLocalStorage, renameTask, } from "./data.js";
import { addTaskUI, changeTag, checkedUI, checkTasks, removeUI, renderTasks, showErrors, showUndoBtn, } from "./ui.js";
// dom
export const taskInput = document.getElementById("taskInput");
export const addBtn = document.getElementById("addBtn");
export const taskList = document.getElementById("taskList");
export const errorMsg = document.getElementById("errorMsg");
export const searchInput = document.getElementById("searchInput");
export const deleteAllBtn = document.getElementById("deleteAllBtn");
export const deleteCompletedBtn = document.getElementById("deleteCompletedBtn");
export const undoBtn = document.getElementById("undoBtn");
export const noTasksUI = document.getElementById("noTasksUI");
export const dateInput = document.getElementById("dateInput");
taskInput === null || taskInput === void 0 ? void 0 : taskInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        addBtn === null || addBtn === void 0 ? void 0 : addBtn.setAttribute("disabled", "true");
        const taskName = taskInput.value;
        taskInput.value = "";
        if (taskName.length < 1) {
            showErrors(Show.empty);
            return;
        }
        if (auth(taskName)) {
            showErrors(Show.repeated);
            return;
        }
        addTaskUI(taskName, State.uncompleted, dateInput.value);
        addTaskToLocalStorage(taskName, dateInput.value);
        checkTasks();
        dateInput.value = "";
    }
});
export var Show;
(function (Show) {
    Show["empty"] = "empty";
    Show["repeated"] = "repeated";
})(Show || (Show = {}));
addBtn === null || addBtn === void 0 ? void 0 : addBtn.addEventListener("click", () => {
    var _a;
    taskInput === null || taskInput === void 0 ? void 0 : taskInput.setAttribute("disabled", "true");
    const taskName = (_a = taskInput === null || taskInput === void 0 ? void 0 : taskInput.value) !== null && _a !== void 0 ? _a : "";
    if (taskInput instanceof HTMLInputElement) {
        taskInput.value = "";
        if (taskName.length < 1) {
            showErrors(Show.empty);
            addTaskToLocalStorage(taskName, dateInput.value);
            return;
        }
        if (auth(taskName)) {
            showErrors(Show.repeated);
            return;
        }
        addTaskUI(taskName, State.uncompleted, dateInput.value);
        checkTasks();
        dateInput.value = "";
    }
});
export var Choose;
(function (Choose) {
    Choose["unachieve"] = "unachieve";
    Choose["check"] = "check";
    Choose["remove"] = "remove";
    Choose["edit"] = "edit";
})(Choose || (Choose = {}));
taskList === null || taskList === void 0 ? void 0 : taskList.addEventListener("click", (e) => {
    const target = e.target;
    const taskName = target.getAttribute("data-src") || "";
    const date = target.getAttribute("data-date") || "";
    const state = target.getAttribute("state") === State.uncompleted ? State.uncompleted : target.getAttribute("state") === State.completed ? State.completed : State.uncompleted;
    if (target.id === Choose.check) {
        checkedUI(taskName);
        stateTaskLocalStorage(taskName, State.completed);
    }
    else if (target.id === Choose.remove) {
        removeUI(taskName);
        saveRemovedTask(Group.tasks, taskName);
        removeTaskLocalStorage(taskName);
        undoBtn.setAttribute("data-task-state", Group.tasks);
        undoBtn.setAttribute("data-task-name", taskName);
        showUndoBtn();
        checkTasks();
    }
    else if (target.id === Choose.unachieve) {
        // ui
        removeUI(taskName);
        addTaskUI(taskName, State.uncompleted, date);
        // data
        stateTaskLocalStorage(taskName, State.uncompleted);
    }
    else if (target.id === Choose.edit) {
        // ui
        const parent = target.closest("[name]");
        changeTag(parent);
        addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                // UI
                const textarea = document.querySelector("[textarea]");
                const newTaskName = textarea.value;
                parent.remove();
                // addTaskUI(newTaskName, state, date)
                textarea.removeAttribute("[textarea]");
                // console.log(newTaskName)
                // Data
                taskList.innerHTML = "";
                renameTask(taskName, newTaskName);
                const taskLS = JSON.parse(localStorage.getItem("tasks") || "[]");
                console.log(taskLS);
                renderTasks(taskLS);
            }
        });
        // data
    }
});
searchInput.addEventListener("input", () => {
    searchTasks(searchInput.value);
});
deleteAllBtn.addEventListener("click", () => {
    // UI
    taskList.innerHTML = "";
    // Data
    saveRemovedTask(Group.all);
    removeAllTasks();
    showUndoBtn();
    undoBtn.setAttribute("data-task-state", Group.all);
    checkTasks();
});
deleteCompletedBtn.addEventListener("click", () => {
    // UI
    taskList.innerHTML = "";
    // Data
    saveRemovedTask(Group.completed);
    removeAllCompletedTasks();
    showUndoBtn();
    undoBtn.setAttribute("data-task-state", Group.completed);
    checkTasks();
});
undoBtn.addEventListener("click", () => {
    undoBtn.classList.add("hidden");
    const taskState = undoBtn.getAttribute("data-task-state");
    const taskName = undoBtn.getAttribute("data-task-name");
    if (!taskState)
        return;
    returnRemovedTask(taskState, RemoveType.undo, taskName || undefined);
    checkTasks();
    // const removedTask: [string, State][] = JSON.parse(undoBtn.getAttribute("data-src") || "")
    // const inner = removedTask[0]
    // returnRemovedTask(removedTask)
    // addTaskUI(inner[0], inner[1])
    // undoBtn.removeAttribute("disabled")
    // undoBtn.classList.add("hidden")
});

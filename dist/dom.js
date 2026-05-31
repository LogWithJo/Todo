import { addTaskToLocalStorage, auth, removeAllCompletedTasks, removeAllTasks, removeTaskLocalStorage, renameTask, returnRemovedTask, saveRemovedTask, searchTasks, stateTaskLocalStorage, } from "./data.js";
import { Choose, Group, RemoveType, Show, State } from "./types.js";
import { addTaskUI, changeTag, checkedUI, checkTasks, removeUI, renderTasks, showErrors, showUndoBtn } from "./ui.js";
// dom
export const newTaskInput = document.getElementById("newTaskInput");
export const addTaskButton = document.getElementById("addTaskButton");
export const taskListContainer = document.getElementById("taskListContainer");
export const errorMessage = document.getElementById("errorMessage");
export const searchTaskInput = document.getElementById("searchTaskInput");
export const deleteAllButton = document.getElementById("deleteAllButton");
export const deleteCompletedButton = document.getElementById("deleteCompletedButton");
export const undoButton = document.getElementById("undoButton");
export const emptyTasksMessage = document.getElementById("emptyTasksMessage");
export const dueDateInput = document.getElementById("dueDateInput");
const finishedCount = document.getElementById("finishedCount");
const pendingCount = document.getElementById("pendingCount");
const deletedCount = document.getElementById("deletedCount");
export function updateGridNumbers() {
    if (!finishedCount || !pendingCount || !deletedCount)
        return;
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    const finishedTasks = tasks.filter((task) => task[1] === State.completed).length;
    const pendingTasks = tasks.filter((task) => task[1] === State.uncompleted).length;
    const deletedTasks = JSON.parse(sessionStorage.getItem("all") || "[]").length +
        JSON.parse(sessionStorage.getItem("completed") || "[]").length +
        JSON.parse(sessionStorage.getItem("tasks") || "[]").length;
    finishedCount.textContent = finishedTasks.toString();
    pendingCount.textContent = pendingTasks.toString();
    deletedCount.textContent = deletedTasks.toString();
}
export function initEventListeners() {
    newTaskInput === null || newTaskInput === void 0 ? void 0 : newTaskInput.addEventListener("keydown", (e) => {
        newTaskInputEvent(e);
    });
    addTaskButton === null || addTaskButton === void 0 ? void 0 : addTaskButton.addEventListener("click", addTaskButtonEvent);
    taskListContainer === null || taskListContainer === void 0 ? void 0 : taskListContainer.addEventListener("click", (e) => {
        taskListContainerEvent(e);
    });
    searchTaskInput.addEventListener("input", searchTaskInputEvent);
    deleteAllButton.addEventListener("click", deleteAllButtonEvent);
    deleteCompletedButton.addEventListener("click", deleteCompletedButtonEvent);
    undoButton.addEventListener("click", undoButtonEvent);
    updateGridNumbers();
}
function newTaskInputEvent(e) {
    if (e.key === "Enter") {
        addTaskButton === null || addTaskButton === void 0 ? void 0 : addTaskButton.setAttribute("disabled", "true");
        const taskName = newTaskInput.value;
        newTaskInput.value = "";
        if (taskName.length < 1) {
            showErrors(Show.empty);
            return;
        }
        if (auth(taskName)) {
            showErrors(Show.repeated);
            return;
        }
        addTaskUI(taskName, State.uncompleted, dueDateInput.value);
        addTaskToLocalStorage(taskName, dueDateInput.value);
        checkTasks();
        updateGridNumbers();
        dueDateInput.value = "";
    }
}
function addTaskButtonEvent() {
    var _a;
    newTaskInput === null || newTaskInput === void 0 ? void 0 : newTaskInput.setAttribute("disabled", "true");
    const taskName = (_a = newTaskInput === null || newTaskInput === void 0 ? void 0 : newTaskInput.value) !== null && _a !== void 0 ? _a : "";
    if (newTaskInput instanceof HTMLInputElement) {
        newTaskInput.value = "";
        if (taskName.length < 1) {
            showErrors(Show.empty);
            addTaskToLocalStorage(taskName, dueDateInput.value);
            return;
        }
        if (auth(taskName)) {
            showErrors(Show.repeated);
            return;
        }
        addTaskUI(taskName, State.uncompleted, dueDateInput.value);
        checkTasks();
        updateGridNumbers();
        dueDateInput.value = "";
    }
}
function taskListContainerEvent(e) {
    const target = e.target;
    const taskName = target.getAttribute("data-src") || "";
    const date = target.getAttribute("data-date") || "";
    if (target.id === Choose.check) {
        checkedUI(taskName);
        stateTaskLocalStorage(taskName, State.completed);
        updateGridNumbers();
    }
    else if (target.id === Choose.remove) {
        removeUI(taskName);
        saveRemovedTask(Group.tasks, taskName);
        removeTaskLocalStorage(taskName);
        undoButton.setAttribute("data-task-state", Group.tasks);
        undoButton.setAttribute("data-task-name", taskName);
        showUndoBtn();
        checkTasks();
        updateGridNumbers();
    }
    else if (target.id === Choose.unachieve) {
        removeUI(taskName);
        addTaskUI(taskName, State.uncompleted, date);
        stateTaskLocalStorage(taskName, State.uncompleted);
        updateGridNumbers();
    }
    else if (target.id === Choose.edit) {
        const parent = target.closest("[name]");
        if (!parent)
            return;
        changeTag(parent);
        const textarea = parent.querySelector("textarea[textarea]");
        textarea === null || textarea === void 0 ? void 0 : textarea.focus();
        const onEditKeyDown = (e) => {
            if (e.key !== "Enter" || !textarea)
                return;
            const newTaskName = textarea.value.trim();
            if (newTaskName.length < 1)
                return;
            textarea.removeEventListener("keydown", onEditKeyDown);
            if (newTaskName !== taskName) {
                renameTask(taskName, newTaskName);
            }
            taskListContainer.innerHTML = "";
            const taskLS = JSON.parse(localStorage.getItem("tasks") || "[]");
            renderTasks(taskLS);
            updateGridNumbers();
        };
        textarea === null || textarea === void 0 ? void 0 : textarea.addEventListener("keydown", onEditKeyDown);
    }
}
function searchTaskInputEvent() {
    searchTasks(searchTaskInput.value);
}
function deleteAllButtonEvent() {
    // UI
    taskListContainer.innerHTML = "";
    // Data
    saveRemovedTask(Group.all);
    removeAllTasks();
    showUndoBtn();
    undoButton.setAttribute("data-task-state", Group.all);
    checkTasks();
    updateGridNumbers();
}
function deleteCompletedButtonEvent() {
    // UI
    taskListContainer.innerHTML = "";
    // Data
    saveRemovedTask(Group.completed);
    removeAllCompletedTasks();
    showUndoBtn();
    undoButton.setAttribute("data-task-state", Group.completed);
    checkTasks();
    updateGridNumbers();
}
function undoButtonEvent() {
    undoButton.classList.add("hidden");
    const taskState = undoButton.getAttribute("data-task-state");
    const taskName = undoButton.getAttribute("data-task-name");
    if (!taskState)
        return;
    returnRemovedTask(taskState, RemoveType.undo, taskName || undefined);
    checkTasks();
    updateGridNumbers();
    // const removedTask: [string, State][] = JSON.parse(undoButton.getAttribute("data-src") || "")
    // const inner = removedTask[0]
    // returnRemovedTask(removedTask)
    // addTaskUI(inner[0], inner[1])
    // undoButton.removeAttribute("disabled")
    // undoButton.classList.add("hidden")
}
// export function renderGridNumbers() {
// 	const tasksLs: Array<[string, State, string]> = JSON.parse(localStorage.getItem("tasks") || "[]")
// 	const finishedCount = tasksLs.filter(task => task[1] === State.uncompleted).length
// 	const pendingCount = tasksLs.filter(task => task[1] === State.completed).length
// 	const deletedTasks = tasksLs.filter(task => task[1] === State.uncompleted).length
// }

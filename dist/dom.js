import { Group } from "./Ddom.js";
import { addTaskToLocalStorage, auth, RemoveType, removeAllCompletedTasks, removeAllTasks, removeTaskLocalStorage, returnRemovedTask, State, saveRemovedTask, searchTasks, stateTaskLocalStorage, renameTask, } from "./data.js";
import { addTaskUI, changeTag, checkedUI, checkTasks, removeUI, renderTasks, showErrors, showUndoBtn, } from "./ui.js";
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
newTaskInput === null || newTaskInput === void 0 ? void 0 : newTaskInput.addEventListener("keydown", (e) => {
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
        dueDateInput.value = "";
    }
});
export var Show;
(function (Show) {
    Show["empty"] = "empty";
    Show["repeated"] = "repeated";
})(Show || (Show = {}));
addTaskButton === null || addTaskButton === void 0 ? void 0 : addTaskButton.addEventListener("click", () => {
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
        dueDateInput.value = "";
    }
});
export var Choose;
(function (Choose) {
    Choose["unachieve"] = "unachieve";
    Choose["check"] = "check";
    Choose["remove"] = "remove";
    Choose["edit"] = "edit";
})(Choose || (Choose = {}));
taskListContainer === null || taskListContainer === void 0 ? void 0 : taskListContainer.addEventListener("click", (e) => {
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
        undoButton.setAttribute("data-task-state", Group.tasks);
        undoButton.setAttribute("data-task-name", taskName);
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
                taskListContainer.innerHTML = "";
                renameTask(taskName, newTaskName);
                const taskLS = JSON.parse(localStorage.getItem("tasks") || "[]");
                console.log(taskLS);
                renderTasks(taskLS);
            }
        });
        // data
    }
});
searchTaskInput.addEventListener("input", () => {
    searchTasks(searchTaskInput.value);
});
deleteAllButton.addEventListener("click", () => {
    // UI
    taskListContainer.innerHTML = "";
    // Data
    saveRemovedTask(Group.all);
    removeAllTasks();
    showUndoBtn();
    undoButton.setAttribute("data-task-state", Group.all);
    checkTasks();
});
deleteCompletedButton.addEventListener("click", () => {
    // UI
    taskListContainer.innerHTML = "";
    // Data
    saveRemovedTask(Group.completed);
    removeAllCompletedTasks();
    showUndoBtn();
    undoButton.setAttribute("data-task-state", Group.completed);
    checkTasks();
});
undoButton.addEventListener("click", () => {
    undoButton.classList.add("hidden");
    const taskState = undoButton.getAttribute("data-task-state");
    const taskName = undoButton.getAttribute("data-task-name");
    if (!taskState)
        return;
    returnRemovedTask(taskState, RemoveType.undo, taskName || undefined);
    checkTasks();
    // const removedTask: [string, State][] = JSON.parse(undoButton.getAttribute("data-src") || "")
    // const inner = removedTask[0]
    // returnRemovedTask(removedTask)
    // addTaskUI(inner[0], inner[1])
    // undoButton.removeAttribute("disabled")
    // undoButton.classList.add("hidden")
});

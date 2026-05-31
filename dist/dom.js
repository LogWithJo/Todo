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
        const taskItem = target.closest("[name]");
        if (!taskItem)
            return;
        const currentTaskName = taskItem.getAttribute("name") || "";
        const titleElement = taskItem.querySelector("#taskTitle");
        if (!titleElement || taskItem.querySelector("textarea"))
            return;
        const textarea = document.createElement("textarea");
        textarea.value = currentTaskName;
        textarea.className = titleElement.className;
        textarea.id = "taskTitle";
        textarea.setAttribute("textarea", "true");
        textarea.rows = 1;
        titleElement.replaceWith(textarea);
        textarea.focus();
        textarea.setSelectionRange(currentTaskName.length, currentTaskName.length);
        const commitEdit = (e) => {
            if (e.key !== "Enter")
                return;
            const newTaskName = textarea.value.trim();
            if (newTaskName.length < 1) {
                showErrors(Show.empty);
                return;
            }
            if (newTaskName !== currentTaskName && auth(newTaskName)) {
                showErrors(Show.repeated);
                return;
            }
            renameTask(currentTaskName, newTaskName);
            const updatedTitle = document.createElement("div");
            updatedTitle.className = titleElement.className;
            updatedTitle.id = "taskTitle";
            updatedTitle.textContent = newTaskName;
            if (state === State.completed) {
                updatedTitle.style.textDecoration = "line-through";
            }
            textarea.replaceWith(updatedTitle);
            taskItem.setAttribute("name", newTaskName);
            taskItem.querySelectorAll("[data-src]").forEach((element) => {
                if (element instanceof HTMLElement) {
                    element.setAttribute("data-src", newTaskName);
                }
            });
            textarea.removeEventListener("keydown", commitEdit);
        };
        textarea.addEventListener("keydown", commitEdit);
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

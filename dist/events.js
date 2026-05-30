import { addTaskToLocalStorage, removeAllCompletedTasks, removeAllTasks, removeTaskLocalStorage, returnRemovedTask, State, saveRemovedTask, searchTasks, stateTaskLocalStorage, } from "./data.js";
import { addTaskUI, checkedUI, DeleteType, removeUI, showErrors, showUndoBtn, } from "./ui.js";
taskInput === null || taskInput === void 0 ? void 0 : taskInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        addBtn === null || addBtn === void 0 ? void 0 : addBtn.setAttribute("disabled", "true");
        const taskName = taskInput.value;
        taskInput.value = "";
        if (taskName.length < 1) {
            showErrors();
            return;
        }
        addTaskUI(taskName, State.uncompleted);
        addTaskToLocalStorage(taskName);
    }
});
addBtn === null || addBtn === void 0 ? void 0 : addBtn.addEventListener("click", () => {
    var _a;
    taskInput === null || taskInput === void 0 ? void 0 : taskInput.setAttribute("disabled", "true");
    const taskName = (_a = taskInput === null || taskInput === void 0 ? void 0 : taskInput.value) !== null && _a !== void 0 ? _a : "";
    if (taskInput instanceof HTMLInputElement) {
        taskInput.value = "";
        if (taskName.length < 1) {
            showErrors();
            addTaskToLocalStorage(taskName);
            return;
        }
        addTaskUI(taskName, State.uncompleted);
    }
});
export var Choose;
(function (Choose) {
    Choose["unachieve"] = "unachieve";
    Choose["check"] = "check";
    Choose["remove"] = "remove";
})(Choose || (Choose = {}));
taskList === null || taskList === void 0 ? void 0 : taskList.addEventListener("click", (e) => {
    const target = e.target;
    const taskName = target.getAttribute("data-src") || "";
    if (target.id === Choose.check) {
        checkedUI(taskName);
        stateTaskLocalStorage(taskName, State.completed);
    }
    else if (target.id === Choose.remove) {
        removeUI(taskName);
        saveRemovedTask(DeleteType.deleteTask, taskName);
        removeTaskLocalStorage(taskName);
        undoBtn.setAttribute("data-task-state", DeleteType.deleteTask);
        undoBtn.setAttribute("data-task-name", taskName);
        showUndoBtn();
    }
    else if (target.id === Choose.unachieve) {
        // ui
        removeUI(taskName);
        addTaskUI(taskName, State.uncompleted);
        // data
        stateTaskLocalStorage(taskName, State.uncompleted);
    }
});
searchInput.addEventListener("input", () => {
    searchTasks(searchInput.value);
});
deleteAllBtn.addEventListener("click", () => {
    // UI
    taskList.innerHTML = "";
    // Data
    saveRemovedTask(DeleteType.deleteAll);
    removeAllTasks();
    showUndoBtn();
    undoBtn.setAttribute("data-task-state", DeleteType.deleteAll);
});
deleteCompletedBtn.addEventListener("click", () => {
    // UI
    taskList.innerHTML = "";
    // Data
    saveRemovedTask(DeleteType.deleteCompleted);
    removeAllCompletedTasks();
    showUndoBtn();
    undoBtn.setAttribute("data-task-state", DeleteType.deleteCompleted);
});
undoBtn.addEventListener("click", () => {
    undoBtn.classList.add("hidden");
    const taskState = undoBtn.getAttribute("data-task-state");
    const taskName = undoBtn.getAttribute("data-task-name");
    if (!taskState)
        return;
    returnRemovedTask(taskState, taskName || undefined);
    // const removedTask: [string, State][] = JSON.parse(undoBtn.getAttribute("data-src") || "")
    // const inner = removedTask[0]
    // returnRemovedTask(removedTask)
    // addTaskUI(inner[0], inner[1])
    // undoBtn.removeAttribute("disabled")
    // undoBtn.classList.add("hidden")
});

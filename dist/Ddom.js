import { removeRemovedTask, renderTasksSS, searchDelTasks } from "./Ddata.js";
import Mission, { checkDeletedTasks, removeDUI } from "./Dui.js";
import { RemoveType, returnRemovedTask } from "./data.js";
import { checkTasks } from "./ui.js";
const openDeletedTasksButton = document.getElementById("openDeletedTasksButton");
const deletedTasksPopup = document.getElementById("deletedTasksPopup");
const closeDeletedPopupButton = document.getElementById("closeDeletedPopupButton");
// const deletedPopupBody = document.getElementById("deletedPopupBody") as HTMLDivElement;
export const deletedTasksContainer = document.getElementById("deletedTasksContainer");
export const restoreAllDeletedTasksButton = document.getElementById("restoreAllDeletedTasksButton");
export const deleteAllDeletedTasksButton = document.getElementById("deleteAllDeletedTasksButton");
export const searchDeletedTasksInput = document.getElementById("searchDeletedTasksInput");
export const noDeletedTasksMessage = document.getElementById("noDeletedTasksMessage");
openDeletedTasksButton.addEventListener("click", () => {
    deletedTasksPopup.classList.remove("hidden");
    addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            deletedTasksPopup.classList.add("hidden");
        }
    });
    renderTasksSS();
    checkDeletedTasks();
});
closeDeletedPopupButton.addEventListener("click", () => {
    deletedTasksPopup.classList.add("hidden");
});
export var Group;
(function (Group) {
    Group["all"] = "all";
    Group["completed"] = "completed";
    Group["tasks"] = "tasks";
})(Group || (Group = {}));
deletedTasksPopup.addEventListener("click", (e) => {
    const target = e.target;
    if (target === deletedTasksPopup) {
        deletedTasksPopup.classList.add("hidden");
    }
});
// deletedTasksContainer?.addEventListener("click", (e) => {
// 	const target = e.target as HTMLElement;
// 	const element = target
// })
deletedTasksContainer === null || deletedTasksContainer === void 0 ? void 0 : deletedTasksContainer.addEventListener("click", (e) => {
    const target = e.target;
    const element = target.closest("[data-cardName]");
    const restoreBtn = target.closest(`#${Mission.restore}`);
    const deleteBtn = target.closest(`#${Mission.delete}`);
    const taskName = (element === null || element === void 0 ? void 0 : element.getAttribute("data-cardName")) || "fail";
    const group = (element === null || element === void 0 ? void 0 : element.dataset.group) === Group.all
        ? Group.all
        : (element === null || element === void 0 ? void 0 : element.dataset.group) === Group.completed
            ? Group.completed
            : (element === null || element === void 0 ? void 0 : element.dataset.group) === Group.tasks
                ? Group.tasks
                : Group.all;
    // const state: State =
    // 	element?.dataset.state === State.completed
    // 		? State.completed
    // 		: element.dataset.state === State.uncompleted
    // 			? State.uncompleted
    // 			: State.uncompleted;
    if (restoreBtn) {
        // UI
        removeDUI(taskName);
        // Data
        returnRemovedTask(group, RemoveType.return, taskName);
        checkTasks();
        checkDeletedTasks();
    }
    else if (deleteBtn) {
        removeRemovedTask(taskName, group);
        checkDeletedTasks();
    }
    element.remove();
});
restoreAllDeletedTasksButton.addEventListener("click", () => {
    const tasksSS1 = JSON.parse(sessionStorage.getItem("all") || "[]");
    const tasksSS2 = JSON.parse(sessionStorage.getItem("completed") || "[]");
    const tasksSS3 = JSON.parse(sessionStorage.getItem("tasks") || "[]");
    tasksSS1.forEach((task) => {
        returnRemovedTask(Group.all, RemoveType.return, task[0]);
    });
    tasksSS2.forEach((task) => {
        returnRemovedTask(Group.completed, RemoveType.return, task[0]);
    });
    tasksSS3.forEach((task) => {
        returnRemovedTask(Group.tasks, RemoveType.return, task[0]);
    });
    if (!deletedTasksContainer)
        return;
    deletedTasksContainer.innerHTML = "";
    checkDeletedTasks();
    checkTasks();
});
deleteAllDeletedTasksButton.addEventListener("click", () => {
    sessionStorage.setItem("all", "[]");
    sessionStorage.setItem("completed", "[]");
    sessionStorage.setItem("tasks", "[]");
    if (!deletedTasksContainer)
        return;
    deletedTasksContainer.innerHTML = "";
    checkDeletedTasks();
});
searchDeletedTasksInput.addEventListener("input", () => {
    searchDelTasks(searchDeletedTasksInput.value);
});

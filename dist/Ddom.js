import { removeRemovedTask, renderTasksSS, searchDelTasks } from "./Ddata.js";
import Mission, { checkDeletedTasks, removeDUI } from "./Dui.js";
import { RemoveType, returnRemovedTask } from "./data.js";
import { checkTasks } from "./ui.js";
const openDeletedBtn = document.getElementById("openDeletedBtn");
const deletedPopup = document.getElementById("deletedPopup");
const closeDeletedBtn = document.getElementById("closeDeletedBtn");
// const popupBody = document.getElementById("popupBody") as HTMLDivElement;
export const deletedTasksList = document.getElementById("deletedTasksList");
export const restoreAllRemovedTasks = document.getElementById("restoreAllRemovedTasks");
export const deleteAllRemovedTasks = document.getElementById("deleteAllRemovedTasks");
export const searchDeletedTasks = document.getElementById("searchDeletedTasks");
export const noDeletedTasksUI = document.getElementById("noDeletedTasksUI");
openDeletedBtn.addEventListener("click", () => {
    deletedPopup.classList.remove("hidden");
    addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            deletedPopup.classList.add("hidden");
        }
    });
    renderTasksSS();
    checkDeletedTasks();
});
closeDeletedBtn.addEventListener("click", () => {
    deletedPopup.classList.add("hidden");
});
export var Group;
(function (Group) {
    Group["all"] = "all";
    Group["completed"] = "completed";
    Group["tasks"] = "tasks";
})(Group || (Group = {}));
deletedPopup.addEventListener("click", (e) => {
    const target = e.target;
    if (target === deletedPopup) {
        deletedPopup.classList.add("hidden");
    }
});
// deletedTasksList?.addEventListener("click", (e) => {
// 	const target = e.target as HTMLElement;
// 	const element = target
// })
deletedTasksList === null || deletedTasksList === void 0 ? void 0 : deletedTasksList.addEventListener("click", (e) => {
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
restoreAllRemovedTasks.addEventListener("click", () => {
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
    if (!deletedTasksList)
        return;
    deletedTasksList.innerHTML = "";
    checkDeletedTasks();
    checkTasks();
});
deleteAllRemovedTasks.addEventListener("click", () => {
    sessionStorage.setItem("all", "[]");
    sessionStorage.setItem("completed", "[]");
    sessionStorage.setItem("tasks", "[]");
    if (!deletedTasksList)
        return;
    deletedTasksList.innerHTML = "";
    checkDeletedTasks();
});
searchDeletedTasks.addEventListener("input", () => {
    searchDelTasks(searchDeletedTasks.value);
});

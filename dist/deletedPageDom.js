import { returnRemovedTask } from "./data.js";
import { removeRemovedTask, renderTasksSS, searchDelTasks } from "./deletedPageData.js";
import Mission, { checkDeletedTasks, removeDUI } from "./deletedPageUi.js";
import { Group, RemoveType } from "./types.js";
import { checkTasks } from "./ui.js";
const openDeletedTasksButton = document.getElementById("openDeletedTasksButton");
const deletedTasksPopup = document.getElementById("deletedTasksPopup");
const closeDeletedPopupButton = document.getElementById("closeDeletedPopupButton");
// const deletedPopupBody = document.getElementById("deletedPopupBody") as HTMLDivElement;
export const deletedTasksContainer = document.getElementById("deletedTasksContainer");
export const deletedTasksList = deletedTasksContainer;
export const restoreAllDeletedTasksButton = document.getElementById("restoreAllDeletedTasksButton");
export const deleteAllDeletedTasksButton = document.getElementById("deleteAllDeletedTasksButton");
export const searchDeletedTasksInput = document.getElementById("searchDeletedTasksInput");
export const noDeletedTasksMessage = document.getElementById("noDeletedTasksMessage");
function initDeletedPageEventListeners() {
    closeDeletedPopupButton.addEventListener("click", closeDeletedPopupButtonEvent);
    deletedTasksPopup.addEventListener("click", (e) => {
        deletedTasksPopupEvent(e);
    });
    deletedTasksContainer === null || deletedTasksContainer === void 0 ? void 0 : deletedTasksContainer.addEventListener("click", (e) => {
        deletedTasksContainerEvent(e);
    });
    restoreAllDeletedTasksButton.addEventListener("click", restoreAllDeletedTasksButtonEvent);
    deleteAllDeletedTasksButton.addEventListener("click", deleteAllDeletedTasksButtonEvent);
    searchDeletedTasksInput.addEventListener("input", searchDeletedTasksInputEvent);
}
openDeletedTasksButton.addEventListener("click", () => {
    initDeletedPageEventListeners();
    deletedTasksPopup.classList.remove("hidden");
    addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            deletedTasksPopup.classList.add("hidden");
        }
    });
    renderTasksSS();
    checkDeletedTasks();
});
function closeDeletedPopupButtonEvent() {
    deletedTasksPopup.classList.add("hidden");
}
function deletedTasksPopupEvent(e) {
    const target = e.target;
    if (target === deletedTasksPopup) {
        deletedTasksPopup.classList.add("hidden");
    }
}
// deletedTasksContainer?.addEventListener("click", (e) => {
// 	const target = e.target as HTMLElement;
// 	const element = target
// })
function deletedTasksContainerEvent(e) {
    const target = e.target;
    const element = target.closest("[data-cardName]");
    const restoreBtn = target.closest(`#${Mission.restore}`);
    const deleteBtn = target.closest(`#${Mission.delete}`);
    if (!element)
        return;
    const taskName = element.getAttribute("data-cardName") || "fail";
    const group = element.dataset.group === Group.all
        ? Group.all
        : element.dataset.group === Group.completed
            ? Group.completed
            : element.dataset.group === Group.tasks
                ? Group.tasks
                : Group.all;
    if (restoreBtn) {
        removeDUI(taskName);
        returnRemovedTask(group, RemoveType.return, taskName);
        checkTasks();
        checkDeletedTasks();
        element.remove();
    }
    else if (deleteBtn) {
        removeRemovedTask(taskName, group);
        checkDeletedTasks();
        element.remove();
    }
}
function restoreAllDeletedTasksButtonEvent() {
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
}
function deleteAllDeletedTasksButtonEvent() {
    sessionStorage.setItem("all", "[]");
    sessionStorage.setItem("completed", "[]");
    sessionStorage.setItem("tasks", "[]");
    if (!deletedTasksContainer)
        return;
    deletedTasksContainer.innerHTML = "";
    checkDeletedTasks();
}
function searchDeletedTasksInputEvent() {
    searchDelTasks(searchDeletedTasksInput.value);
}

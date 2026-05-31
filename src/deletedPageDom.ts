import { returnRemovedTask } from "./data.js";
import { removeRemovedTask, renderTasksSS, searchDelTasks } from "./deletedPageData.js";
import Mission, { checkDeletedTasks, removeDUI } from "./deletedPageUi.js";
import { updateGridNumbers } from "./dom.js";
import { Group, RemoveType, type State } from "./types.js";
import { checkTasks } from "./ui.js";

const openDeletedTasksButton = document.getElementById("openDeletedTasksButton") as HTMLButtonElement;
const deletedTasksPopup = document.getElementById("deletedTasksPopup") as HTMLDivElement;
const closeDeletedPopupButton = document.getElementById("closeDeletedPopupButton") as HTMLButtonElement;
// const deletedPopupBody = document.getElementById("deletedPopupBody") as HTMLDivElement;
export const deletedTasksContainer = document.getElementById("deletedTasksContainer");
export const deletedTasksList = deletedTasksContainer;
export const restoreAllDeletedTasksButton = document.getElementById("restoreAllDeletedTasksButton") as HTMLButtonElement;
export const deleteAllDeletedTasksButton = document.getElementById("deleteAllDeletedTasksButton") as HTMLButtonElement;
export const searchDeletedTasksInput = document.getElementById("searchDeletedTasksInput") as HTMLInputElement;
export const noDeletedTasksMessage = document.getElementById("noDeletedTasksMessage") as HTMLElement;

function initDeletedPageEventListeners() {
	closeDeletedPopupButton.addEventListener("click", closeDeletedPopupButtonEvent);
	deletedTasksPopup.addEventListener("click", (e) => {
		deletedTasksPopupEvent(e);
	});
	deletedTasksContainer?.addEventListener("click", (e) => {
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

function deletedTasksPopupEvent(e: MouseEvent) {
	const target = e.target as Node;

	if (target === deletedTasksPopup) {
		deletedTasksPopup.classList.add("hidden");
	}
}

// deletedTasksContainer?.addEventListener("click", (e) => {
// 	const target = e.target as HTMLElement;
// 	const element = target
// })

function deletedTasksContainerEvent(e: MouseEvent) {
	const target = e.target as HTMLElement;
	const element = target.closest("[data-cardName]") as HTMLElement | null;
	const restoreBtn = target.closest(`#${Mission.restore}`) as HTMLElement | null;
	const deleteBtn = target.closest(`#${Mission.delete}`) as HTMLElement | null;
	if (!element) return;

	const taskName: string = element.getAttribute("data-cardName") || "fail";
	const group: Group =
		element.dataset.group === Group.all
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
		updateGridNumbers();
		element.remove();
	} else if (deleteBtn) {
		removeRemovedTask(taskName, group);
		checkDeletedTasks();
		updateGridNumbers();
		element.remove();
	}
}

function restoreAllDeletedTasksButtonEvent() {
	const tasksSS1: [string, State][] = JSON.parse(sessionStorage.getItem("all") || "[]");
	const tasksSS2: [string, State][] = JSON.parse(sessionStorage.getItem("completed") || "[]");
	const tasksSS3: [string, State][] = JSON.parse(sessionStorage.getItem("tasks") || "[]");
	tasksSS1.forEach((task) => {
		returnRemovedTask(Group.all, RemoveType.return, task[0]);
	});
	tasksSS2.forEach((task) => {
		returnRemovedTask(Group.completed, RemoveType.return, task[0]);
	});
	tasksSS3.forEach((task) => {
		returnRemovedTask(Group.tasks, RemoveType.return, task[0]);
	});
	if (!deletedTasksContainer) return;
	deletedTasksContainer.innerHTML = "";
	checkDeletedTasks();
	checkTasks();
	updateGridNumbers();
}

function deleteAllDeletedTasksButtonEvent() {
	sessionStorage.setItem("all", "[]");
	sessionStorage.setItem("completed", "[]");
	sessionStorage.setItem("tasks", "[]");
	if (!deletedTasksContainer) return;
	deletedTasksContainer.innerHTML = "";
	checkDeletedTasks();
	updateGridNumbers();
}

function searchDeletedTasksInputEvent() {
	searchDelTasks(searchDeletedTasksInput.value);
}

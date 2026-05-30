import { returnRemovedTask } from "./data.js";
import {
	removeRemovedTask,
	renderTasksSS,
	searchDelTasks,
} from "./deletedPageData.js";
import Mission, { checkDeletedTasks, removeDUI } from "./deletedPageUi.js";
import { initEventListeners } from "./dom.js";
import { RemoveType, type State, Group } from "./types.js";
import { checkTasks } from "./ui.js";

const openDeletedBtn = document.getElementById(
	"openDeletedBtn",
) as HTMLButtonElement;
const deletedPopup = document.getElementById("deletedPopup") as HTMLDivElement;
const closeDeletedBtn = document.getElementById(
	"closeDeletedBtn",
) as HTMLButtonElement;
// const popupBody = document.getElementById("popupBody") as HTMLDivElement;
export const deletedTasksList = document.getElementById("deletedTasksList");
export const restoreAllRemovedTasks = document.getElementById(
	"restoreAllRemovedTasks",
) as HTMLButtonElement;
export const deleteAllRemovedTasks = document.getElementById(
	"deleteAllRemovedTasks",
) as HTMLButtonElement;
export const searchDeletedTasks = document.getElementById(
	"searchDeletedTasks",
) as HTMLButtonElement;
export const noDeletedTasksUI = document.getElementById(
	"noDeletedTasksUI",
) as HTMLElement;

function initDeletedPageEventListeners() {
	closeDeletedBtn.addEventListener("click", closeDeletedBtnEvent);
	deletedPopup.addEventListener("click", (e) => {
		deletedPopupEvent(e);
	});
	deletedTasksList?.addEventListener("click", (e) => {
		deletedTasksListEvent(e);
	});
	restoreAllRemovedTasks.addEventListener("click", restoreAllRemovedTasksEvent);
	deleteAllRemovedTasks.addEventListener("click", deleteAllRemovedTasksEvent);
	searchDeletedTasks.addEventListener("click", searchDeletedTasksEvent);
}

openDeletedBtn.addEventListener("click", () => {
	initDeletedPageEventListeners();
	deletedPopup.classList.remove("hidden");
	addEventListener("keydown", (e) => {
		if (e.key === "Escape") {
			deletedPopup.classList.add("hidden");
		}
	});
	renderTasksSS();
	checkDeletedTasks();
});

function closeDeletedBtnEvent() {
	deletedPopup.classList.add("hidden");
}

function deletedPopupEvent(e: MouseEvent) {
	const target = e.target as Node;

	if (target === deletedPopup) {
		deletedPopup.classList.add("hidden");
	}
}

// deletedTasksList?.addEventListener("click", (e) => {
// 	const target = e.target as HTMLElement;
// 	const element = target
// })

function deletedTasksListEvent(e: MouseEvent) {
	const target = e.target as HTMLElement;
	const element = target.closest("[data-cardName]") as HTMLElement;
	const restoreBtn = target.closest(`#${Mission.restore}`);
	const deleteBtn = target.closest(`#${Mission.delete}`);

	const taskName: string = element?.getAttribute("data-cardName") || "fail";
	const group: Group =
		element?.dataset.group === Group.all
			? Group.all
			: element?.dataset.group === Group.completed
				? Group.completed
				: element?.dataset.group === Group.tasks
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
	} else if (deleteBtn) {
		removeRemovedTask(taskName, group);
		checkDeletedTasks();
	}
	element.remove();
}

function restoreAllRemovedTasksEvent() {
	const tasksSS1: [string, State][] = JSON.parse(
		sessionStorage.getItem("all") || "[]",
	);
	const tasksSS2: [string, State][] = JSON.parse(
		sessionStorage.getItem("completed") || "[]",
	);
	const tasksSS3: [string, State][] = JSON.parse(
		sessionStorage.getItem("tasks") || "[]",
	);
	tasksSS1.forEach((task) => {
		returnRemovedTask(Group.all, RemoveType.return, task[0]);
	});
	tasksSS2.forEach((task) => {
		returnRemovedTask(Group.completed, RemoveType.return, task[0]);
	});
	tasksSS3.forEach((task) => {
		returnRemovedTask(Group.tasks, RemoveType.return, task[0]);
	});
	if (!deletedTasksList) return;
	deletedTasksList.innerHTML = "";
	checkDeletedTasks();
	checkTasks();
}

function deleteAllRemovedTasksEvent() {
	sessionStorage.setItem("all", "[]");
	sessionStorage.setItem("completed", "[]");
	sessionStorage.setItem("tasks", "[]");
	if (!deletedTasksList) return;
	deletedTasksList.innerHTML = "";
	checkDeletedTasks();
}

function searchDeletedTasksEvent() {
	searchDelTasks(searchDeletedTasks.value);
}

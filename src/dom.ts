import {
	addTaskToLocalStorage,
	auth,
	removeAllCompletedTasks,
	removeAllTasks,
	removeTaskLocalStorage,
	renameTask,
	returnRemovedTask,
	saveRemovedTask,
	searchTasks,
	stateTaskLocalStorage,
} from "./data.js";
import { removeRemovedTask, renderTasksSS, searchDelTasks } from "./deletedPageData.js";
import Mission, { checkDeletedTasks, removeDUI } from "./deletedPageUi.js";
import { Choose, Group, RemoveType, Show, State } from "./types.js";
import { addTaskUI, changeTag, checkedUI, checkTasks, removeUI, renderTasks, showErrors, showUndoBtn } from "./ui.js";

// dom

export const taskInput = document.getElementById("taskInput") as HTMLInputElement;
export const addBtn = document.getElementById("addBtn") as HTMLButtonElement;
export const taskList = document.getElementById("taskList") as HTMLDivElement;
export const errorMsg = document.getElementById("errorMsg") as HTMLDivElement;
export const searchInput = document.getElementById("searchInput") as HTMLInputElement;
export const deleteAllBtn = document.getElementById("deleteAllBtn") as HTMLButtonElement;
export const deleteCompletedBtn = document.getElementById("deleteCompletedBtn") as HTMLButtonElement;
export const undoBtn = document.getElementById("undoBtn") as HTMLButtonElement;
export const noTasksUI = document.getElementById("noTasksUI") as HTMLDivElement;
export const dateInput = document.getElementById("dateInput") as HTMLInputElement;
const finishedNumber = document.getElementById("finishedNumber") as HTMLElement;
const pendingNumber = document.getElementById("pendingNumber") as HTMLElement;
const deletedNumber = document.getElementById("deletedNumber") as HTMLElement;
const openDeletedBtn = document.getElementById("openDeletedBtn") as HTMLButtonElement;
const deletedPopup = document.getElementById("deletedPopup") as HTMLDivElement;
const closeDeletedBtn = document.getElementById("closeDeletedBtn") as HTMLButtonElement;
export const deletedTasksList = document.getElementById("deletedTasksList");
export const restoreAllRemovedTasks = document.getElementById("restoreAllRemovedTasks") as HTMLButtonElement;
export const deleteAllRemovedTasks = document.getElementById("deleteAllRemovedTasks") as HTMLButtonElement;
export const searchDeletedTasks = document.getElementById("searchDeletedTasks") as HTMLButtonElement;
export const noDeletedTasksUI = document.getElementById("noDeletedTasksUI") as HTMLElement;

export function initEventListeners() {
	taskInput?.addEventListener("keydown", (e: KeyboardEvent) => {
		taskInputEvent(e);
	});
	addBtn?.addEventListener("click", addBtnEvent);
	taskList?.addEventListener("click", (e) => {
		taskListEvent(e);
	});
	searchInput.addEventListener("input", searchInputEvent);
	deleteAllBtn.addEventListener("click", deleteAllBtnEvent);
	deleteCompletedBtn.addEventListener("click", deleteCompletedBtnEvent);
	undoBtn.addEventListener("click", undoBtnEvent);
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
	openDeletedBtn.addEventListener("click", openDeletedBtnEvent);
}

function taskInputEvent(e: KeyboardEvent) {
	if (e.key === "Enter") {
		addBtn?.setAttribute("disabled", "true");
		const taskName: string = taskInput.value;
		taskInput.value = "";a
		dateInput.value = "";
		if (taskName.length < 1) {
			showErrors(Show.empty);
			return;
		}
		if (auth(taskName)) {
			showErrors(Show.repeated);
			return;
		}
		addTask(taskName, dateInput.value)
		// addTaskUI(taskName, State.uncompleted, dateInput.value);
		// addTaskToLocalStorage(taskName, dateInput.value);
		// checkTasks();
	}
}

function addBtnEvent() {
	taskInput?.setAttribute("disabled", "true");
	const taskName: string = taskInput?.value ?? "";
	if (taskInput instanceof HTMLInputElement) {
		addTask(taskName)
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
}

function taskListEvent(e: MouseEvent) {
	const target = e.target as HTMLElement;
	const taskName: string = target.getAttribute("data-src") || "";
	const date: string = target.getAttribute("data-date") || "";
	const state: State =
		target.getAttribute("state") === State.uncompleted
			? State.uncompleted
			: target.getAttribute("state") === State.completed
				? State.completed
				: State.uncompleted;
	if (target.id === Choose.check) {
		checkedUI(taskName);
		stateTaskLocalStorage(taskName, State.completed);
	} else if (target.id === Choose.remove) {
		removeUI(taskName);
		saveRemovedTask(Group.tasks, taskName);
		removeTaskLocalStorage(taskName);
		undoBtn.setAttribute("data-task-state", Group.tasks);
		undoBtn.setAttribute("data-task-name", taskName);
		showUndoBtn();
		checkTasks();
	} else if (target.id === Choose.unachieve) {
		// ui
		removeUI(taskName);
		addTaskUI(taskName, State.uncompleted, date);
		// data
		stateTaskLocalStorage(taskName, State.uncompleted);
	} else if (target.id === Choose.edit) {
		// ui
		const parent = target.closest("[name]") as HTMLElement;
		changeTag(parent);
		addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				// UI
				const textarea = document.querySelector("[textarea]") as HTMLTextAreaElement;
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
	}
}

function searchInputEvent() {
	searchTasks(searchInput.value);
}

function deleteAllBtnEvent() {
	// UI
	taskList.innerHTML = "";
	// Data
	saveRemovedTask(Group.all);
	removeAllTasks();
	showUndoBtn();
	undoBtn.setAttribute("data-task-state", Group.all);
	checkTasks();
}

function deleteCompletedBtnEvent() {
	// UI
	taskList.innerHTML = "";
	// Data
	saveRemovedTask(Group.completed);
	removeAllCompletedTasks();
	showUndoBtn();
	undoBtn.setAttribute("data-task-state", Group.completed);
	checkTasks();
}

function undoBtnEvent() {
	undoBtn.classList.add("hidden");
	const taskState = undoBtn.getAttribute("data-task-state");
	const taskName = undoBtn.getAttribute("data-task-name");
	if (!taskState) return;
	returnRemovedTask(taskState as Group, RemoveType.undo, (taskName as string) || undefined);
	checkTasks();
	// const removedTask: [string, State][] = JSON.parse(undoBtn.getAttribute("data-src") || "")
	// const inner = removedTask[0]
	// returnRemovedTask(removedTask)
	// addTaskUI(inner[0], inner[1])
	// undoBtn.removeAttribute("disabled")
	// undoBtn.classList.add("hidden")
}

// export function renderGridNumbers() {
// 	const tasksLs: Array<[string, State, string]> = JSON.parse(localStorage.getItem("tasks") || "[]")
// 	const finishedNumber = tasksLs.filter(task => task[1] === State.uncompleted).length
// 	const pendingNumber = tasksLs.filter(task => task[1] === State.completed).length
// 	const deletedTasks = tasksLs.filter(task => task[1] === State.uncompleted).length
// }
function openDeletedBtnEvent() {
	deletedPopup.classList.remove("hidden");
	addEventListener("keydown", (e) => {
		if (e.key === "Escape") {
			deletedPopup.classList.add("hidden");
		}
	});
	renderTasksSS();
	checkDeletedTasks();
}

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

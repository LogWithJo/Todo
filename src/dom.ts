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
import { Choose, Group, RemoveType, Show, State } from "./types.js";
import { addTaskUI, changeTag, checkedUI, checkTasks, removeUI, renderTasks, showErrors, showUndoBtn } from "./ui.js";

// dom

export const newTaskInput = document.getElementById("newTaskInput") as HTMLInputElement;
export const addTaskButton = document.getElementById("addTaskButton") as HTMLButtonElement;
export const taskListContainer = document.getElementById("taskListContainer") as HTMLDivElement;
export const errorMessage = document.getElementById("errorMessage") as HTMLDivElement;
export const searchTaskInput = document.getElementById("searchTaskInput") as HTMLInputElement;
export const deleteAllButton = document.getElementById("deleteAllButton") as HTMLButtonElement;
export const deleteCompletedButton = document.getElementById("deleteCompletedButton") as HTMLButtonElement;
export const undoButton = document.getElementById("undoButton") as HTMLButtonElement;
export const emptyTasksMessage = document.getElementById("emptyTasksMessage") as HTMLDivElement;
export const dueDateInput = document.getElementById("dueDateInput") as HTMLInputElement;
const finishedCount = document.getElementById("finishedCount") as HTMLElement;
const pendingCount = document.getElementById("pendingCount") as HTMLElement;
const deletedCount = document.getElementById("deletedCount") as HTMLElement;

export function updateGridNumbers() {
	if (!finishedCount || !pendingCount || !deletedCount) return;
	const tasks: Array<[string, State, string]> = JSON.parse(localStorage.getItem("tasks") || "[]");
	const finishedTasks = tasks.filter((task) => task[1] === State.completed).length;
	const pendingTasks = tasks.filter((task) => task[1] === State.uncompleted).length;
	const deletedTasks =
		JSON.parse(sessionStorage.getItem("all") || "[]").length +
		JSON.parse(sessionStorage.getItem("completed") || "[]").length +
		JSON.parse(sessionStorage.getItem("tasks") || "[]").length;

	finishedCount.textContent = finishedTasks.toString();
	pendingCount.textContent = pendingTasks.toString();
	deletedCount.textContent = deletedTasks.toString();
}

export function initEventListeners() {
	newTaskInput?.addEventListener("keydown", (e: KeyboardEvent) => {
		newTaskInputEvent(e);
	});
	addTaskButton?.addEventListener("click", addTaskButtonEvent);
	taskListContainer?.addEventListener("click", (e) => {
		taskListContainerEvent(e);
	});
	searchTaskInput.addEventListener("input", searchTaskInputEvent);
	deleteAllButton.addEventListener("click", deleteAllButtonEvent);
	deleteCompletedButton.addEventListener("click", deleteCompletedButtonEvent);
	undoButton.addEventListener("click", undoButtonEvent);
	updateGridNumbers();
}

function newTaskInputEvent(e: KeyboardEvent) {
	if (e.key === "Enter") {
		addTaskButton?.setAttribute("disabled", "true");
		const taskName: string = newTaskInput.value;
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
	newTaskInput?.setAttribute("disabled", "true");
	const taskName: string = newTaskInput?.value ?? "";
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

function taskListContainerEvent(e: MouseEvent) {
	const target = e.target as HTMLElement;
	const taskName: string = target.getAttribute("data-src") || "";
	const date: string = target.getAttribute("data-date") || "";
	if (target.id === Choose.check) {
		checkedUI(taskName);
		stateTaskLocalStorage(taskName, State.completed);
		updateGridNumbers();
	} else if (target.id === Choose.remove) {
		removeUI(taskName);
		saveRemovedTask(Group.tasks, taskName);
		removeTaskLocalStorage(taskName);
		undoButton.setAttribute("data-task-state", Group.tasks);
		undoButton.setAttribute("data-task-name", taskName);
		showUndoBtn();
		checkTasks();
		updateGridNumbers();
	} else if (target.id === Choose.unachieve) {
		removeUI(taskName);
		addTaskUI(taskName, State.uncompleted, date);
		stateTaskLocalStorage(taskName, State.uncompleted);
		updateGridNumbers();
	} else if (target.id === Choose.edit) {
		const parent = target.closest("[name]") as HTMLElement;
		if (!parent) return;
		changeTag(parent);
		const textarea = parent.querySelector("textarea[textarea]") as HTMLTextAreaElement | null;
		textarea?.focus();
		const onEditKeyDown = (e: KeyboardEvent) => {
			if (e.key !== "Enter" || !textarea) return;
			const newTaskName = textarea.value.trim();
			if (newTaskName.length < 1) return;
			textarea.removeEventListener("keydown", onEditKeyDown);
			if (newTaskName !== taskName) {
				renameTask(taskName, newTaskName);
			}
			taskListContainer.innerHTML = "";
			const taskLS = JSON.parse(localStorage.getItem("tasks") || "[]");
			renderTasks(taskLS);
			updateGridNumbers();
		};
		textarea?.addEventListener("keydown", onEditKeyDown);
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
	if (!taskState) return;
	returnRemovedTask(taskState as Group, RemoveType.undo, (taskName as string) || undefined);
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

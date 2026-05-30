import { showIcon } from "./api.js";
import {
	checkTasksLS,
	getDate,
	reorderTasksLocalStorage,
} from "./data.js";
import {
	addBtn,
	errorMsg,
	noTasksUI,
	taskInput,
	taskList,
	undoBtn,
} from "./dom.js";
import {Show, Choose, State, RemoveType } from './types.js'


let dragSource: HTMLElement | null = null;
let taskListContainerInitialized = false;

export function showErrors(show: Show) {
	if (errorMsg instanceof HTMLElement) {
		errorMsg.classList.remove("hidden");
	}
	if (show === Show.empty) {
		errorMsg.textContent = "write a task";
	} else {
		errorMsg.textContent = "the task added already";
	}
	addBtn?.removeAttribute("disabled");
	taskInput?.removeAttribute("disabled");
}

function updateTaskOrderFromDOM() {
	if (!taskList) return;
	const newOrder = Array.from(taskList.children).map(
		(child) => (child as HTMLElement).getAttribute("name") || "",
	);
	reorderTasksLocalStorage(newOrder);
}

function onDragStart(this: HTMLElement, event: DragEvent) {
	dragSource = this;
	const dataTransfer = event.dataTransfer;
	if (dataTransfer) {
		dataTransfer.setData("text/plain", this.getAttribute("name") || "");
		dataTransfer.effectAllowed = "move";
	}
	this.style.opacity = "0.4";
}

function onDragEnd(this: HTMLElement) {
	this.style.opacity = "";
}

function onDragOver(this: HTMLElement, event: DragEvent) {
	event.preventDefault();
	if (this !== dragSource) {
		this.style.border = "2px dashed #3b82f6";
		this.style.backgroundColor = "#eff6ff";
	}
}

function onDragLeave(this: HTMLElement) {
	this.style.border = "";
	this.style.backgroundColor = "";
}

function onDrop(this: HTMLElement, event: DragEvent) {
	event.preventDefault();
	event.stopPropagation();
	this.style.border = "";
	this.style.backgroundColor = "";
	const sourceName = event.dataTransfer?.getData("text/plain");
	if (!sourceName) return;

	if (sourceName === this.getAttribute("name")) return;
	const sourceElement = document.querySelector(
		`[name="${sourceName}"]`,
	) as HTMLElement | null;
	if (sourceElement && taskList) {
		const rect = this.getBoundingClientRect();
		const insertBefore = event.clientY < rect.top + rect.height / 2;
		if (insertBefore) {
			taskList.insertBefore(sourceElement, this);
		} else {
			taskList.insertBefore(sourceElement, this.nextSibling);
		}
		updateTaskOrderFromDOM();
	}
}

export function attachDragAndDrop(taskItem: HTMLElement) {
	taskItem.setAttribute("draggable", "true");
	taskItem.addEventListener("dragstart", onDragStart);
	taskItem.addEventListener("dragend", onDragEnd);
	taskItem.addEventListener("dragover", onDragOver);
	taskItem.addEventListener("dragleave", onDragLeave);
	taskItem.addEventListener("drop", onDrop);
}

export function setupTaskListContainerDrag() {
	if (!taskList || taskListContainerInitialized) return;
	taskList.addEventListener("dragover", (event) => {
		event.preventDefault();
	});
	taskList.addEventListener("drop", (event) => {
		event.preventDefault();
		const sourceName = event.dataTransfer?.getData("text/plain");
		if (!sourceName || !taskList) return;
		const sourceElement = document.querySelector(
			`[name="${sourceName}"]`,
		) as HTMLElement | null;
		if (sourceElement && event.target === taskList) {
			taskList.appendChild(sourceElement);
			updateTaskOrderFromDOM();
		}
	});
	taskListContainerInitialized = true;
}

export async function addTaskUI(taskName: string, state: State, date: string) {
	const parentDiv = document.createElement("div");
	const nameIconDiv = document.createElement("div");
	const iconDiv = document.createElement("div");
	const nameDiv = document.createElement("div");
	const iconsDiv = document.createElement("div");
	const checkDiv = document.createElement("div");
	const removeDiv = document.createElement("div");
	const burgerDiv = document.createElement("div");
	const dateDiv = document.createElement("div");
	const editDiv = document.createElement("div");
	const burgerI = document.createElement("i");
	const editI = document.createElement("i");
	const checkI = document.createElement("i");
	const removeI = document.createElement("i");
	const icon = await showIcon(taskName);
	editDiv.className =
		"font-bold p-2 rounded-full cursor-pointer text-white flex items-center justify-center bg-yellow-500";
	editI.id = Choose.edit;
	editI.className = "fa-solid fa-pen";
	editI.setAttribute("data-src", taskName);
	editI.setAttribute("data-date", date);
	// nameDiv.cols = 30
	// nameDiv.rows = 1
	if (date.length > 0) {
		if (getDate(date) >= 0) {
			dateDiv.textContent = `task ended from ${getDate(date)} days`;
		} else {
			dateDiv.textContent = `task ends in ${-getDate(date)} days`;
		}
	}
	burgerDiv.className =
		"cursor-move flex justify-center items-center text-gray-600";
	burgerI.className = "fa-solid fa-bars";
	nameIconDiv.className = "flex gap-3 items-center h-full";
	iconDiv.className = `py-1 px-2 shadow-2xl flex justify-center items-center font-bold rounded-full`;
	parentDiv.setAttribute("name", taskName);
	parentDiv.setAttribute("state", state);
	parentDiv.className =
		"flex items-center justify-between w-full p-3 bg-transparent hover:bg-[rgba(257,196,211,0.5)] rounded-2xl";
	nameDiv.className =
		"px-2 font-bold capitalize flex-1 flex justify-center items-center";
	nameDiv.id = "title";
	nameDiv.textContent = taskName;
	iconsDiv.className = "flex gap-3 items-center justify-center";
	if (state === State.completed) {
		checkI.className = "fa-solid fa-circle-check";
		checkI.id = Choose.unachieve;
	} else if (state === State.uncompleted) {
		checkI.className = "fa-regular fa-circle text-lg";
		checkI.id = Choose.check;
	}
	checkI.setAttribute("data-src", taskName);
	removeI.setAttribute("data-src", taskName);
	checkI.setAttribute("data-date", date);
	removeI.setAttribute("data-date", date);
	removeI.id = Choose.remove;
	removeI.className = "fa-solid fa-trash";
	checkDiv.className =
		"font-bold rounded-full cursor-pointer text-white flex items-center justify-center";
	removeDiv.className =
		"font-bold bg-red-400 rounded-full cursor-pointer text-white p-2 flex items-center justify-center";
	if (state === State.completed) {
		parentDiv.classList.toggle("bg-transparent");
		parentDiv.classList.toggle("bg-[rgba(255,194,209,0.3)]");
		nameDiv.style.textDecoration = "line-through";
	}
	editDiv.append(editI);
	burgerDiv.append(burgerI);
	checkDiv.append(checkI);
	if (icon !== undefined) {
		iconDiv.append(icon);
		nameIconDiv.append(iconDiv, checkDiv, nameDiv, dateDiv);
	} else {
		nameIconDiv.append(checkDiv, nameDiv, dateDiv);
	}
	removeDiv.append(removeI);
	iconsDiv.append(editDiv, removeDiv, burgerDiv);
	parentDiv.append(nameIconDiv, iconsDiv);
	if (state === State.completed) {
		taskList?.append(parentDiv);
	} else {
		taskList?.prepend(parentDiv);
	}
	attachDragAndDrop(parentDiv);
	setupTaskListContainerDrag();
	addBtn?.removeAttribute("disabled");
	taskInput?.removeAttribute("disabled");
}

export function removeUI(taskName: string) {
	const parent = document.querySelector(`[name="${taskName}"]`);
	if (parent instanceof HTMLElement) {
		parent.remove();
	}
}

export function checkedUI(taskName: string) {
	const parent = document.querySelector(`[name="${taskName}"]`);
	const checkI = document.querySelector(
		`[name="${taskName}"] [data-src="${taskName}"]`,
	);
	const text = document.querySelector(`[name="${taskName}"] #title`);
	if (
		text instanceof HTMLElement &&
		parent instanceof HTMLElement &&
		checkI instanceof HTMLElement
	) {
		parent.classList.toggle("bg-[rgba(255,194,209,0.3)]");
		parent.classList.toggle("bg-transparent");
		text.style.textDecoration = "line-through";
		checkI.className = "fa-solid fa-circle-check";
		checkI.id = Choose.unachieve;
	}
	const t = parent;
	parent?.remove();
	if (t) {
		taskList?.appendChild(t);
	}
}

export function renderTasks(tasks: [string, State, string][]) {
	tasks.forEach((task) => {
		addTaskUI(task[0], task[1], task[2]);
	});
}

// export function showUndoBtn() {
// 	undoBtn.classList.remove("hidden");
// 	document.body.addEventListener("click", () => {
// 		undoBtn.classList.add("hidden")
// 	}, {once: true})
// 	setTimeout(() => {
// 		undoBtn.classList.add("hidden");
// 	}, 5000);
// }

export function showUndoBtn() {
	undoBtn.classList.remove("hidden");

	const hideUndo = (e: MouseEvent) => {
		const target = e.target as HTMLElement;

		if (target.closest("#undo-btn")) return;

		undoBtn.classList.add("hidden");

		document.body.removeEventListener("click", hideUndo);
	};

	setTimeout(() => {
		undoBtn.classList.add("hidden");
		document.body.removeEventListener("click", hideUndo);
	}, 5000);

	setTimeout(() => {
		document.body.addEventListener("click", hideUndo);
	}, 0);
}

export function checkTasks(state?: boolean) {
	if (!noTasksUI) return;
	const show = state !== undefined ? state : checkTasksLS();
	noTasksUI.style.display = show ? "block" : "none";
}

export function changeTag(elements: HTMLElement, newTaskName?: string) {
	const element = elements.querySelector(`#title`);

	if (!(element instanceof HTMLElement)) return;

	const newElement = document.createElement("textarea");

	// copy attributes
	for (const attr of element.attributes) {
		newElement.setAttribute(attr.name, attr.value);
	}
	// newElement may be a HTMLTextAreaElement when creating a textarea; cast to access rows
	(newElement as HTMLTextAreaElement).rows = 1;
	newElement.setAttribute("textarea", "true");

	element.replaceWith(newElement);
}

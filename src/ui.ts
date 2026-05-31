import { showIcon } from "./api.js";
import { checkTasksLS, getDate, reorderTasksLocalStorage } from "./data.js";
import { addTaskButton, emptyTasksMessage, errorMessage, newTaskInput, taskListContainer, undoButton } from "./dom.js";
import { Choose, RemoveType, Show, State } from "./types.js";

let dragSource: HTMLElement | null = null;
let taskListContainerContainerInitialized = false;

export function showErrors(show: Show) {
	if (errorMessage instanceof HTMLElement) {
		errorMessage.classList.remove("hidden");
	}
	if (show === Show.empty) {
		errorMessage.textContent = "write a task";
	} else {
		errorMessage.textContent = "the task added already";
	}
	addTaskButton?.removeAttribute("disabled");
	newTaskInput?.removeAttribute("disabled");
}

function updateTaskOrderFromDOM() {
	if (!taskListContainer) return;
	const newOrder = Array.from(taskListContainer.children).map((child) => (child as HTMLElement).getAttribute("name") || "");
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
	const sourceElement = document.querySelector(`[name="${sourceName}"]`) as HTMLElement | null;
	if (sourceElement && taskListContainer) {
		const rect = this.getBoundingClientRect();
		const insertBefore = event.clientY < rect.top + rect.height / 2;
		if (insertBefore) {
			taskListContainer.insertBefore(sourceElement, this);
		} else {
			taskListContainer.insertBefore(sourceElement, this.nextSibling);
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
	if (!taskListContainer || taskListContainerContainerInitialized) return;
	taskListContainer.addEventListener("dragover", (event) => {
		event.preventDefault();
	});
	taskListContainer.addEventListener("drop", (event) => {
		event.preventDefault();
		const sourceName = event.dataTransfer?.getData("text/plain");
		if (!sourceName || !taskListContainer) return;
		const sourceElement = document.querySelector(`[name="${sourceName}"]`) as HTMLElement | null;
		if (sourceElement && event.target === taskListContainer) {
			taskListContainer.appendChild(sourceElement);
			updateTaskOrderFromDOM();
		}
	});
	taskListContainerContainerInitialized = true;
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
	editDiv.className = "font-bold p-2 rounded-full cursor-pointer text-white flex items-center justify-center bg-yellow-500";
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
	burgerDiv.className = "cursor-move flex justify-center items-center text-gray-600";
	burgerI.className = "fa-solid fa-bars";
	nameIconDiv.className = "flex gap-3 items-center h-full";
	iconDiv.className = `py-1 px-2 shadow-2xl flex justify-center items-center font-bold rounded-full`;
	parentDiv.setAttribute("name", taskName);
	parentDiv.setAttribute("state", state);
	parentDiv.className = "flex items-center justify-between w-full p-3 bg-transparent hover:bg-[rgba(257,196,211,0.5)] rounded-2xl";
	nameDiv.className = "px-2 font-bold capitalize flex-1 flex justify-center items-center";
	nameDiv.id = "taskTitle";
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
	checkDiv.className = "font-bold rounded-full cursor-pointer text-white flex items-center justify-center";
	removeDiv.className = "font-bold bg-red-400 rounded-full cursor-pointer text-white p-2 flex items-center justify-center";
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
		taskListContainer?.append(parentDiv);
	} else {
		taskListContainer?.prepend(parentDiv);
	}
	attachDragAndDrop(parentDiv);
	setupTaskListContainerDrag();
	addTaskButton?.removeAttribute("disabled");
	newTaskInput?.removeAttribute("disabled");
}

export function removeUI(taskName: string) {
	const parent = document.querySelector(`[name="${taskName}"]`);
	if (parent instanceof HTMLElement) {
		parent.remove();
	}
}

export function checkedUI(taskName: string) {
	const parent = document.querySelector(`[name="${taskName}"]`);
	const checkI = document.querySelector(`[name="${taskName}"] [data-src="${taskName}"]`);
	const text = document.querySelector(`[name="${taskName}"] #taskTitle`);
	if (text instanceof HTMLElement && parent instanceof HTMLElement && checkI instanceof HTMLElement) {
		parent.classList.toggle("bg-[rgba(255,194,209,0.3)]");
		parent.classList.toggle("bg-transparent");
		text.style.textDecoration = "line-through";
		checkI.className = "fa-solid fa-circle-check";
		checkI.id = Choose.unachieve;
	}
	const t = parent;
	parent?.remove();
	if (t) {
		taskListContainer?.appendChild(t);
	}
}

export function renderTasks(tasks: [string, State, string][]) {
	tasks.forEach((task) => {
		addTaskUI(task[0], task[1], task[2]);
	});
}

// export function showUndoBtn() {
// 	undoButton.classList.remove("hidden");
// 	document.body.addEventListener("click", () => {
// 		undoButton.classList.add("hidden")
// 	}, {once: true})
// 	setTimeout(() => {
// 		undoButton.classList.add("hidden");
// 	}, 5000);
// }

export function showUndoBtn() {
	undoButton.classList.remove("hidden");

	const hideUndo = (e: MouseEvent) => {
		const target = e.target as HTMLElement;

		if (target.closest("#undo-btn")) return;

		undoButton.classList.add("hidden");

		document.body.removeEventListener("click", hideUndo);
	};

	setTimeout(() => {
		undoButton.classList.add("hidden");
		document.body.removeEventListener("click", hideUndo);
	}, 5000);

	setTimeout(() => {
		document.body.addEventListener("click", hideUndo);
	}, 0);
}

export function checkTasks(state?: boolean) {
	if (!emptyTasksMessage) return;
	const show = state !== undefined ? state : checkTasksLS();
	emptyTasksMessage.style.display = show ? "block" : "none";
}

export function changeTag(elements: HTMLElement, newTaskName?: string) {
	const element = elements.querySelector(`#taskTitle`);

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

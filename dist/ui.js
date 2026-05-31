var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { showIcon } from "./api.js";
import { checkTasksLS, getDate, reorderTasksLocalStorage } from "./data.js";
import { addTaskButton, emptyTasksMessage, errorMessage, newTaskInput, taskListContainer, undoButton } from "./dom.js";
import { Choose, Show, State } from "./types.js";
let dragSource = null;
let taskListContainerContainerInitialized = false;
export function showErrors(show) {
    if (errorMessage instanceof HTMLElement) {
        errorMessage.classList.remove("hidden");
    }
    if (show === Show.empty) {
        errorMessage.textContent = "write a task";
    }
    else {
        errorMessage.textContent = "the task added already";
    }
    addTaskButton === null || addTaskButton === void 0 ? void 0 : addTaskButton.removeAttribute("disabled");
    newTaskInput === null || newTaskInput === void 0 ? void 0 : newTaskInput.removeAttribute("disabled");
}
function updateTaskOrderFromDOM() {
    if (!taskListContainer)
        return;
    const newOrder = Array.from(taskListContainer.children).map((child) => child.getAttribute("name") || "");
    reorderTasksLocalStorage(newOrder);
}
function onDragStart(event) {
    dragSource = this;
    const dataTransfer = event.dataTransfer;
    if (dataTransfer) {
        dataTransfer.setData("text/plain", this.getAttribute("name") || "");
        dataTransfer.effectAllowed = "move";
    }
    this.style.opacity = "0.4";
}
function onDragEnd() {
    this.style.opacity = "";
}
function onDragOver(event) {
    event.preventDefault();
    if (this !== dragSource) {
        this.style.border = "2px dashed #3b82f6";
        this.style.backgroundColor = "#eff6ff";
    }
}
function onDragLeave() {
    this.style.border = "";
    this.style.backgroundColor = "";
}
function onDrop(event) {
    var _a;
    event.preventDefault();
    event.stopPropagation();
    this.style.border = "";
    this.style.backgroundColor = "";
    const sourceName = (_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.getData("text/plain");
    if (!sourceName)
        return;
    if (sourceName === this.getAttribute("name"))
        return;
    const sourceElement = document.querySelector(`[name="${sourceName}"]`);
    if (sourceElement && taskListContainer) {
        const rect = this.getBoundingClientRect();
        const insertBefore = event.clientY < rect.top + rect.height / 2;
        if (insertBefore) {
            taskListContainer.insertBefore(sourceElement, this);
        }
        else {
            taskListContainer.insertBefore(sourceElement, this.nextSibling);
        }
        updateTaskOrderFromDOM();
    }
}
export function attachDragAndDrop(taskItem) {
    taskItem.setAttribute("draggable", "true");
    taskItem.addEventListener("dragstart", onDragStart);
    taskItem.addEventListener("dragend", onDragEnd);
    taskItem.addEventListener("dragover", onDragOver);
    taskItem.addEventListener("dragleave", onDragLeave);
    taskItem.addEventListener("drop", onDrop);
}
export function setupTaskListContainerDrag() {
    if (!taskListContainer || taskListContainerContainerInitialized)
        return;
    taskListContainer.addEventListener("dragover", (event) => {
        event.preventDefault();
    });
    taskListContainer.addEventListener("drop", (event) => {
        var _a;
        event.preventDefault();
        const sourceName = (_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.getData("text/plain");
        if (!sourceName || !taskListContainer)
            return;
        const sourceElement = document.querySelector(`[name="${sourceName}"]`);
        if (sourceElement && event.target === taskListContainer) {
            taskListContainer.appendChild(sourceElement);
            updateTaskOrderFromDOM();
        }
    });
    taskListContainerContainerInitialized = true;
}
export function addTaskUI(taskName, state, date) {
    return __awaiter(this, void 0, void 0, function* () {
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
        const icon = yield showIcon(taskName);
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
            }
            else {
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
        }
        else if (state === State.uncompleted) {
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
        }
        else {
            nameIconDiv.append(checkDiv, nameDiv, dateDiv);
        }
        removeDiv.append(removeI);
        iconsDiv.append(editDiv, removeDiv, burgerDiv);
        parentDiv.append(nameIconDiv, iconsDiv);
        if (state === State.completed) {
            taskListContainer === null || taskListContainer === void 0 ? void 0 : taskListContainer.append(parentDiv);
        }
        else {
            taskListContainer === null || taskListContainer === void 0 ? void 0 : taskListContainer.prepend(parentDiv);
        }
        attachDragAndDrop(parentDiv);
        setupTaskListContainerDrag();
        addTaskButton === null || addTaskButton === void 0 ? void 0 : addTaskButton.removeAttribute("disabled");
        newTaskInput === null || newTaskInput === void 0 ? void 0 : newTaskInput.removeAttribute("disabled");
    });
}
export function removeUI(taskName) {
    const parent = document.querySelector(`[name="${taskName}"]`);
    if (parent instanceof HTMLElement) {
        parent.remove();
    }
}
export function checkedUI(taskName) {
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
    parent === null || parent === void 0 ? void 0 : parent.remove();
    if (t) {
        taskListContainer === null || taskListContainer === void 0 ? void 0 : taskListContainer.appendChild(t);
    }
}
export function renderTasks(tasks) {
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
    const hideUndo = (e) => {
        const target = e.target;
        if (target.closest("#undo-btn"))
            return;
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
export function checkTasks(state) {
    if (!emptyTasksMessage)
        return;
    const show = state !== undefined ? state : checkTasksLS();
    emptyTasksMessage.style.display = show ? "block" : "none";
}
export function changeTag(elements) {
    const element = elements.querySelector(`#taskTitle`);
    if (!(element instanceof HTMLElement))
        return;
    const newElement = document.createElement("textarea");
    // copy attributes
    for (const attr of element.attributes) {
        newElement.setAttribute(attr.name, attr.value);
    }
    newElement.rows = 1;
    newElement.value = element.textContent || "";
    newElement.setAttribute("textarea", "true");
    element.replaceWith(newElement);
}

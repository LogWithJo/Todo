var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { taskListContainer, updateGridNumbers } from "./dom.js";
import { Group, RemoveType, State } from "./types.js";
import { addTaskUI, checkTasks, renderTasks } from "./ui.js";
const API_BASE = "/api";
function fetchTasksFromServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(`${API_BASE}/tasks`);
        if (!response.ok) {
            return [];
        }
        const data = yield response.json();
        return data.tasks;
    });
}
function createTaskOnServer(task) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fetch(`${API_BASE}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: task[0], state: task[1], date: task[2] }),
        });
    });
}
function saveTasksToServer(tasks) {
    return __awaiter(this, void 0, void 0, function* () {
        const order = tasks.map((task) => task[0]);
        yield fetch(`${API_BASE}/tasks/reorder`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order }),
        });
    });
}
export function addTaskToLocalStorage(taskName, date) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fetch(`${API_BASE}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: taskName, date }),
        });
        const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
        tasks.push([taskName, State.uncompleted, date]);
        localStorage.setItem("tasks", JSON.stringify(tasks));
    });
}
export function stateTaskLocalStorage(taskName, state) {
    return __awaiter(this, void 0, void 0, function* () {
        const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
        tasks.forEach((task) => {
            if (task[0] === taskName) {
                task[1] = state;
            }
        });
        localStorage.setItem("tasks", JSON.stringify(tasks));
        yield fetch(`${API_BASE}/tasks/${encodeURIComponent(taskName)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ state }),
        });
    });
}
export function saveRemovedTask(state, taskName) {
    if (state === Group.all) {
        const allTasksLocalStorage = JSON.parse(localStorage.getItem("tasks") || "[]");
        sessionStorage.setItem("all", JSON.stringify(allTasksLocalStorage));
    }
    else if (state === Group.completed) {
        const allTasksLocalStorage = JSON.parse(localStorage.getItem("tasks") || "[]");
        const completedTasks = allTasksLocalStorage.filter((task) => task[1] === State.completed);
        sessionStorage.setItem("completed", JSON.stringify(completedTasks));
    }
    else if (state === Group.tasks) {
        const tasksLocalStorage = JSON.parse(localStorage.getItem("tasks") || "[]");
        const removedTask = tasksLocalStorage.filter((task) => task[0].includes(taskName || ""));
        const tasksSessionStorage = JSON.parse(sessionStorage.getItem("tasks") || "[]");
        sessionStorage.setItem("tasks", JSON.stringify([...tasksSessionStorage, removedTask[0]]));
    }
}
export function returnRemovedTask(group, type, taskName) {
    return __awaiter(this, void 0, void 0, function* () {
        const tasksLS = JSON.parse(localStorage.getItem("tasks") || "[]");
        if (group === Group.all) {
            const tasksSS = JSON.parse(sessionStorage.getItem("all") || "[]");
            if (type === RemoveType.undo) {
                const all = [...tasksSS, ...tasksLS];
                localStorage.setItem("tasks", JSON.stringify(all));
                sessionStorage.removeItem("all");
                renderTasks(all);
            }
            else if (type === RemoveType.return) {
                const task = tasksSS.find((task) => task[0] === taskName) || ["taskName", State.completed, "date"];
                const alls = [...tasksLS, task];
                localStorage.setItem("tasks", JSON.stringify(alls));
                sessionStorage.setItem("all", JSON.stringify(tasksSS.filter((t) => t[0] !== taskName)));
                addTaskUI(task[0], task[1], task[2]);
                yield createTaskOnServer(task);
            }
        }
        else if (group === Group.completed) {
            const tasksSS = JSON.parse(sessionStorage.getItem("completed") || "[]");
            if (type === RemoveType.undo) {
                const all = [...tasksSS, ...tasksLS];
                localStorage.setItem("tasks", JSON.stringify(all));
                sessionStorage.removeItem("completed");
                renderTasks(tasksSS);
            }
            else if (type === RemoveType.return) {
                const task = tasksSS.find((task) => task[0] === taskName) || ["taskName", State.completed, "date"];
                const alls = [...tasksLS, task];
                localStorage.setItem("tasks", JSON.stringify(alls));
                sessionStorage.setItem("completed", JSON.stringify(tasksSS.filter((t) => t[0] !== taskName)));
                addTaskUI(task[0], task[1], task[2]);
                yield createTaskOnServer(task);
            }
        }
        else if (group === Group.tasks) {
            const tasksSS = JSON.parse(sessionStorage.getItem("tasks") || "[]");
            const task = tasksSS.find((task) => task[0] === taskName);
            if (!task)
                return;
            localStorage.setItem("tasks", JSON.stringify([...tasksLS, task]));
            sessionStorage.setItem("tasks", JSON.stringify(tasksSS.filter((t) => t[0] !== taskName)));
            addTaskUI(task[0], task[1], task[2]);
            yield createTaskOnServer(task);
        }
    });
}
export function removeTaskLocalStorage(taskName) {
    return __awaiter(this, void 0, void 0, function* () {
        const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
        const updatedTasks = tasks.filter((task) => task[0] !== taskName);
        localStorage.setItem("tasks", JSON.stringify(updatedTasks));
        yield fetch(`${API_BASE}/tasks/${encodeURIComponent(taskName)}`, {
            method: "DELETE",
        });
    });
}
export function reorderTasksLocalStorage(newOrder) {
    return __awaiter(this, void 0, void 0, function* () {
        const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
        const taskMap = new Map(tasks.map((task) => [task[0], task[1]]));
        const reordered = newOrder
            .map((name) => {
            const state = taskMap.get(name);
            return state ? [name, state, "date"] : undefined;
        })
            .filter((entry) => entry !== undefined);
        const remaining = tasks.filter((task) => !newOrder.includes(task[0]));
        const finalTasks = [...reordered, ...remaining];
        localStorage.setItem("tasks", JSON.stringify(finalTasks));
        yield saveTasksToServer(finalTasks);
    });
}
window.addEventListener("load", () => __awaiter(void 0, void 0, void 0, function* () {
    const tasks = yield fetchTasksFromServer();
    localStorage.setItem("tasks", JSON.stringify(tasks));
    tasks.forEach((task) => {
        addTaskUI(task[0], task[1], task[2]);
    });
    checkTasks();
    updateGridNumbers();
}));
export function searchTasks(SearchVal) {
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    taskListContainer.innerHTML = "";
    const tasksArray = [];
    tasks.forEach((task) => {
        if (task[0].toLowerCase().includes(SearchVal.toLowerCase())) {
            tasksArray.push(task);
        }
    });
    if (tasksArray.length <= 0) {
        checkTasks(true);
    }
    else {
        checkTasks(false);
        tasksArray.forEach((task) => {
            addTaskUI(task[0], task[1], task[2]);
        });
    }
}
export function removeAllTasks() {
    return __awaiter(this, void 0, void 0, function* () {
        localStorage.setItem("tasks", JSON.stringify([]));
        yield fetch(`${API_BASE}/tasks`, { method: "DELETE" });
    });
}
export function removeAllCompletedTasks() {
    return __awaiter(this, void 0, void 0, function* () {
        const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
        const updatedTasks = tasks.filter((task) => task[1] === State.uncompleted);
        localStorage.setItem("tasks", JSON.stringify(updatedTasks));
        updatedTasks.forEach((task) => {
            addTaskUI(task[0], task[1], task[2]);
        });
        yield fetch(`${API_BASE}/tasks?state=completed`, { method: "DELETE" });
    });
}
export function checkTasksLS() {
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    return tasks.length <= 0;
}
export function getDate(time) {
    const today = new Date();
    const date = new Date(`${time}T00:00:00`);
    const def = today.getTime() - date.getTime();
    const days = Math.floor(def / (1000 * 60 * 60 * 24));
    return days;
}
export function auth(taskName) {
    const LS = JSON.parse(localStorage.getItem("tasks") || "[]");
    const all = JSON.parse(sessionStorage.getItem("tasks") || "[]");
    const completed = JSON.parse(sessionStorage.getItem("tasks") || "[]");
    const allTasks = [...LS, ...all, ...completed];
    return allTasks.some((task) => task[0] === taskName);
}
export function renameTask(taskName, newTaskName) {
    return __awaiter(this, void 0, void 0, function* () {
        const tasksLS = JSON.parse(localStorage.getItem("tasks") || "[]");
        tasksLS.forEach((task) => {
            if (task[0] === taskName) {
                task[0] = newTaskName;
            }
        });
        localStorage.setItem("tasks", JSON.stringify(tasksLS));
        yield fetch(`${API_BASE}/tasks/${encodeURIComponent(taskName)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newTaskName }),
        });
    });
}

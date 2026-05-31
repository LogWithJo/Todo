import { taskListContainer, updateGridNumbers } from "./dom.js";
import { type alone, type array, Group, RemoveType, State } from "./types.js";
import { addTaskUI, checkTasks, renderTasks } from "./ui.js";

const API_BASE = "/api";

async function fetchTasksFromServer() {
	const response = await fetch(`${API_BASE}/tasks`);
	if (!response.ok) {
		return [];
	}
	const data = await response.json();
	return data.tasks as Array<[string, State, string]>;
}

async function createTaskOnServer(task: [string, State, string]) {
	await fetch(`${API_BASE}/tasks`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name: task[0], state: task[1], date: task[2] }),
	});
}

async function saveTasksToServer(tasks: Array<[string, State, string]>) {
	const order = tasks.map((task) => task[0]);
	await fetch(`${API_BASE}/tasks/reorder`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ order }),
	});
}

export async function addTaskToLocalStorage(taskName: string, date: string) {
	await fetch(`${API_BASE}/tasks`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name: taskName, date }),
	});

	const tasks: Array<[string, State, string]> = JSON.parse(localStorage.getItem("tasks") || "[]");
	tasks.push([taskName, State.uncompleted, date]);
	localStorage.setItem("tasks", JSON.stringify(tasks));
}

export async function stateTaskLocalStorage(taskName: string, state: State) {
	const tasks: Array<[string, State, string]> = JSON.parse(localStorage.getItem("tasks") || "[]");
	tasks.forEach((task) => {
		if (task[0] === taskName) {
			task[1] = state;
		}
	});
	localStorage.setItem("tasks", JSON.stringify(tasks));

	await fetch(`${API_BASE}/tasks/${encodeURIComponent(taskName)}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ state }),
	});
}

export function saveRemovedTask(state: Group, taskName?: string) {
	if (state === Group.all) {
		const allTasksLocalStorage = JSON.parse(localStorage.getItem("tasks") || "[]");
		sessionStorage.setItem("all", JSON.stringify(allTasksLocalStorage));
	} else if (state === Group.completed) {
		const allTasksLocalStorage = JSON.parse(localStorage.getItem("tasks") || "[]");
		const completedTasks = allTasksLocalStorage.filter((task: alone) => task[1] === State.completed);
		sessionStorage.setItem("completed", JSON.stringify(completedTasks));
	} else if (state === Group.tasks) {
		const tasksLocalStorage: Array<[string, State, string]> = JSON.parse(localStorage.getItem("tasks") || "[]");
		const removedTask = tasksLocalStorage.filter((task: [string, State, string]) => task[0].includes(taskName || ""));
		const tasksSessionStorage: array = JSON.parse(sessionStorage.getItem("tasks") || "[]");
		sessionStorage.setItem("tasks", JSON.stringify([...tasksSessionStorage, removedTask[0]]));
	}
}

export async function returnRemovedTask(group: Group, type: RemoveType, taskName?: string) {
	const tasksLS: [string, State, string][] = JSON.parse(localStorage.getItem("tasks") || "[]");
	if (group === Group.all) {
		const tasksSS: [string, State, string][] = JSON.parse(sessionStorage.getItem("all") || "[]");
		if (type === RemoveType.undo) {
			const all: [string, State, string][] = [...tasksSS, ...tasksLS];
			localStorage.setItem("tasks", JSON.stringify(all));
			sessionStorage.removeItem("all");
			renderTasks(all);
		} else if (type === RemoveType.return) {
			const task: [string, State, string] = tasksSS.find((task) => task[0] === taskName) || ["taskName", State.completed, "date"];
			const alls: [string, State, string][] = [...tasksLS, task];
			localStorage.setItem("tasks", JSON.stringify(alls));
			sessionStorage.setItem("all", JSON.stringify(tasksSS.filter((t) => t[0] !== taskName)));
			addTaskUI(task[0], task[1], task[2]);
			await createTaskOnServer(task);
		}
	} else if (group === Group.completed) {
		const tasksSS: array = JSON.parse(sessionStorage.getItem("completed") || "[]");
		if (type === RemoveType.undo) {
			const all = [...tasksSS, ...tasksLS];
			localStorage.setItem("tasks", JSON.stringify(all));
			sessionStorage.removeItem("completed");
			renderTasks(tasksSS);
		} else if (type === RemoveType.return) {
			const task: alone = tasksSS.find((task) => task[0] === taskName) || ["taskName", State.completed, "date"];
			const alls: array = [...tasksLS, task];
			localStorage.setItem("tasks", JSON.stringify(alls));
			sessionStorage.setItem("completed", JSON.stringify(tasksSS.filter((t) => t[0] !== taskName)));
			addTaskUI(task[0], task[1], task[2]);
			await createTaskOnServer(task);
		}
	} else if (group === Group.tasks) {
		const tasksSS: array = JSON.parse(sessionStorage.getItem("tasks") || "[]");
		const task = tasksSS.find((task) => task[0] === taskName);
		if (!task) return;
		localStorage.setItem("tasks", JSON.stringify([...tasksLS, task]));
		sessionStorage.setItem("tasks", JSON.stringify(tasksSS.filter((t) => t[0] !== taskName)));
		addTaskUI(task[0], task[1], task[2]);
		await createTaskOnServer(task);
	}
}

export async function removeTaskLocalStorage(taskName: string) {
	const tasks: Array<[string, State, string]> = JSON.parse(localStorage.getItem("tasks") || "[]");
	const updatedTasks = tasks.filter((task) => task[0] !== taskName);
	localStorage.setItem("tasks", JSON.stringify(updatedTasks));

	await fetch(`${API_BASE}/tasks/${encodeURIComponent(taskName)}`, {
		method: "DELETE",
	});
}

export async function reorderTasksLocalStorage(newOrder: string[]) {
	const tasks: Array<[string, State, string]> = JSON.parse(localStorage.getItem("tasks") || "[]");
	const taskMap = new Map(tasks.map((task) => [task[0], task[1]]));
	const reordered: array = newOrder
		.map((name) => {
			const state = taskMap.get(name);
			return state ? ([name, state, "date"] as alone) : undefined;
		})
		.filter((entry): entry is alone => entry !== undefined);
	const remaining = tasks.filter((task) => !newOrder.includes(task[0]));
	const finalTasks = [...reordered, ...remaining];
	localStorage.setItem("tasks", JSON.stringify(finalTasks));
	await saveTasksToServer(finalTasks);
}

window.addEventListener("load", async () => {
	const tasks = await fetchTasksFromServer();
	localStorage.setItem("tasks", JSON.stringify(tasks));
	tasks.forEach((task) => {
		addTaskUI(task[0], task[1], task[2]);
	});
	checkTasks();
	updateGridNumbers();
});

export function searchTasks(SearchVal: string) {
	const tasks: Array<[string, State, string]> = JSON.parse(localStorage.getItem("tasks") || "[]");
	taskListContainer.innerHTML = "";
	const tasksArray: Array<[string, State, string]> = [];
	tasks.forEach((task) => {
		if (task[0].toLowerCase().includes(SearchVal.toLowerCase())) {
			tasksArray.push(task);
		}
	});
	if (tasksArray.length <= 0) {
		checkTasks(true);
	} else {
		checkTasks(false);
		tasksArray.forEach((task) => {
			addTaskUI(task[0], task[1], task[2]);
		});
	}
}

export async function removeAllTasks() {
	localStorage.setItem("tasks", JSON.stringify([]));
	await fetch(`${API_BASE}/tasks`, { method: "DELETE" });
}

export async function removeAllCompletedTasks() {
	const tasks: Array<[string, State, string]> = JSON.parse(localStorage.getItem("tasks") || "[]");
	const updatedTasks = tasks.filter((task) => task[1] === State.uncompleted);
	localStorage.setItem("tasks", JSON.stringify(updatedTasks));
	updatedTasks.forEach((task) => {
		addTaskUI(task[0], task[1], task[2]);
	});
	await fetch(`${API_BASE}/tasks?state=completed`, { method: "DELETE" });
}

export function checkTasksLS() {
	const tasks: Array<[string, State, string]> = JSON.parse(localStorage.getItem("tasks") || "[]");
	return tasks.length <= 0;
}

export function getDate(time: string) {
	const today = new Date();
	const date = new Date(`${time}T00:00:00`);
	const def: number = today.getTime() - date.getTime();
	const days = Math.floor(def / (1000 * 60 * 60 * 24));
	return days;
}

export function auth(taskName: string) {
	const LS = JSON.parse(localStorage.getItem("tasks") || "[]");
	const all = JSON.parse(sessionStorage.getItem("tasks") || "[]");
	const completed = JSON.parse(sessionStorage.getItem("tasks") || "[]");
	const allTasks = [...LS, ...all, ...completed];
	return allTasks.some((task) => task[0] === taskName);
}

export async function renameTask(taskName: string, newTaskName: string) {
	const tasksLS: [string, State, string][] = JSON.parse(localStorage.getItem("tasks") || "[]");
	tasksLS.forEach((task: [string, State, string]) => {
		if (task[0] === taskName) {
			task[0] = newTaskName;
		}
	});
	localStorage.setItem("tasks", JSON.stringify(tasksLS));
	await fetch(`${API_BASE}/tasks/${encodeURIComponent(taskName)}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name: newTaskName }),
	});
}

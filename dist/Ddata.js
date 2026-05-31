import { deletedTasksContainer, Group } from "./Ddom.js";
import { checkDeletedTasks, createDeletedTaskUI } from "./Dui.js";
// import {} from "./dom.js";
// import {} from "./ui.js";
export function renderTasksSS() {
    if (deletedTasksContainer) {
        deletedTasksContainer.innerHTML = "";
    }
    const all = JSON.parse(sessionStorage.getItem("all") || "[]");
    const completed = JSON.parse(sessionStorage.getItem("completed") || "[]");
    const tasks = JSON.parse(sessionStorage.getItem("tasks") || "[]");
    all.forEach((task) => {
        createDeletedTaskUI(task[0], Group.all, task[1]);
    });
    tasks.forEach((task) => {
        createDeletedTaskUI(task[0], Group.tasks, task[1]);
    });
    completed.forEach((task) => {
        createDeletedTaskUI(task[0], Group.completed, task[1]);
    });
}
export function removeRemovedTask(taskName, group) {
    const tasksSS = JSON.parse(sessionStorage.getItem(group) || "[]");
    console.log(tasksSS);
    sessionStorage.setItem(group, JSON.stringify(tasksSS.filter((task) => task[0] !== taskName)));
}
export function searchDelTasks(SearchVal) {
    const all = JSON.parse(sessionStorage.getItem("all") || "[]");
    const completed = JSON.parse(sessionStorage.getItem("completed") || "[]");
    const tasks = JSON.parse(sessionStorage.getItem("tasks") || "[]");
    if (!deletedTasksContainer)
        return;
    deletedTasksContainer.innerHTML = "";
    const tasksArray = [];
    all.forEach((task) => {
        if (task[0].toLowerCase().includes(SearchVal.toLowerCase())) {
            tasksArray.push([task[0], Group.all, task[1]]);
        }
    });
    completed.forEach((task) => {
        if (task[0].toLowerCase().includes(SearchVal.toLowerCase())) {
            tasksArray.push([task[0], Group.completed, task[1]]);
        }
    });
    tasks.forEach((task) => {
        if (task[0].toLowerCase().includes(SearchVal.toLowerCase())) {
            tasksArray.push([task[0], Group.tasks, task[1]]);
        }
    });
    if (tasksArray.length <= 0) {
        checkDeletedTasks(true);
    }
    else {
        checkDeletedTasks(false);
        tasksArray.forEach((task) => {
            createDeletedTaskUI(task[0], task[1], task[2]);
        });
    }
}
export function checkDeletedTasksLS() {
    const tasks = JSON.parse(sessionStorage.getItem("tasks") || "[]");
    const alls = JSON.parse(sessionStorage.getItem("all") || "[]");
    const completed = JSON.parse(sessionStorage.getItem("completed") || "[]");
    const all = [...tasks, ...alls, ...completed];
    if (all.length <= 0) {
        return true;
    }
    else {
        return false;
    }
}

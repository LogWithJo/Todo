import { checkDeletedTasksLS } from "./Ddata.js";
import { deletedTasksList, noDeletedTasksUI } from "./Ddom.js";
var Mission;
(function (Mission) {
    Mission["restore"] = "restore";
    Mission["delete"] = "delete";
})(Mission || (Mission = {}));
export default Mission;
export function createDeletedTaskUI(taskName, group, state) {
    // main card
    const card = document.createElement("div");
    card.setAttribute("data-cardName", taskName);
    card.setAttribute("data-group", group);
    card.setAttribute("data-state", state);
    card.className =
        "bg-[rgba(255,194,209,0.3)] rounded-3xl p-5 flex flex-col gap-4";
    // top row
    const topRow = document.createElement("div");
    topRow.className = "flex items-center gap-3";
    // icon circle
    const iconCircle = document.createElement("div");
    iconCircle.className =
        "w-14 h-14 rounded-full text-white flex items-center justify-center text-xl";
    const icon = document.createElement("i");
    icon.className = "fa-solid fa-code";
    iconCircle.append(icon);
    // text container
    const textContainer = document.createElement("div");
    const title = document.createElement("h3");
    title.className = "font-bold text-white text-lg capitalize";
    title.textContent = taskName;
    textContainer.append(title);
    topRow.append(iconCircle, textContainer);
    // buttons row
    const btnRow = document.createElement("div");
    btnRow.className = "flex gap-3 mt-2";
    // restore button
    const restoreBtn = document.createElement("button");
    restoreBtn.type = "button";
    restoreBtn.className =
        "flex-1 bg-[rgba(255,194,209,0.3)] cursor-pointer text-white py-3 rounded-2xl font-medium";
    restoreBtn.textContent = "Restore";
    restoreBtn.id = Mission.restore;
    restoreBtn.setAttribute("data-name", taskName);
    // delete forever button
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className =
        "flex-1 bg-[rgba(255,194,209,0.3)] text-white py-3 rounded-2xl font-medium";
    deleteBtn.textContent = "Delete Forever";
    deleteBtn.setAttribute("data-name", taskName);
    deleteBtn.id = Mission.delete;
    btnRow.append(restoreBtn, deleteBtn);
    // assemble card
    card.append(topRow, btnRow);
    deletedTasksList === null || deletedTasksList === void 0 ? void 0 : deletedTasksList.append(card);
}
export function removeDUI(taskName) {
    const parent = document.querySelector(`[name="${taskName}"]`);
    if (parent instanceof HTMLElement) {
        parent.remove();
    }
}
export function checkDeletedTasks(state) {
    if (!noDeletedTasksUI)
        return;
    const show = state !== undefined ? state : checkDeletedTasksLS();
    noDeletedTasksUI.style.display = show ? "block" : "none";
}

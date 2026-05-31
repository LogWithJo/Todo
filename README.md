# To-do App

## What changed

- Renamed DOM ids to descriptive names across `index.html`, `src/`, and runtime `dist/` files.
- Updated task editing so the edit icon opens an inline textarea and pressing `Enter` saves changes.
- Edit now updates local storage and the task UI without clearing the whole task list.

## Edited IDs

- `taskInput` → `newTaskInput`
- `addBtn` → `addTaskButton`
- `taskList` → `taskListContainer`
- `searchInput` → `searchTaskInput`
- `deleteAllBtn` → `deleteAllButton`
- `deleteCompletedBtn` → `deleteCompletedButton`
- `errorMsg` → `errorMessage`
- `noTasksUI` → `emptyTasksMessage`
- `dateInput` → `dueDateInput`
- `undoBtn` → `undoButton`
- `deletedPopup` → `deletedTasksPopup`
- `popupBody` → `deletedPopupBody`
- `closeDeletedBtn` → `closeDeletedPopupButton`
- `searchDeletedTasks` → `searchDeletedTasksInput`
- `restoreAllRemovedTasks` → `restoreAllDeletedTasksButton`
- `deleteAllRemovedTasks` → `deleteAllDeletedTasksButton`
- `noDeletedTasksUI` → `noDeletedTasksMessage`
- `deletedTasksList` → `deletedTasksContainer`
- `title` → `taskTitle`

## How edit works

1. Click the pen icon on a task.
2. The task text becomes an inline textarea.
3. Press `Enter` to save the updated task name.
4. The task name updates in local storage and the UI.

## Notes

- The project runs using the compiled scripts under `dist/`.
- Only ids and edit-related logic were changed.

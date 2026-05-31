# To-do App

A simple browser-based to-do list application built with TypeScript and vanilla DOM APIs.

## What was updated

- Renamed DOM `id` values to clearer names like `taskListContainer`, `newTaskInput`, `addTaskButton`, `taskTitle`, and deleted popup/button IDs.
- Completed the edit feature so tasks can be renamed in place and saved back to local storage.
- Completed the grid statistics feature by updating finished, pending, and deleted counts.

## Features

- Add tasks with due dates
- Search tasks
- Mark tasks as completed and uncompleted
- Delete tasks with undo support
- Restore deleted tasks from the deleted tasks popup
- Drag-and-drop task ordering
- Task statistics grid with finished, pending, and deleted counts

## Running the app

Open `index.html` in a browser or use a local static server. The project uses TypeScript source files under `src/` and outputs compiled code to `dist/`.

## Notes

- The edit functionality uses an inline textarea, and pressing `Enter` saves the renamed task.
- The deleted tasks view uses a grid container for layout.

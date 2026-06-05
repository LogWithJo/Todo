# To-do App

A simple browser-based to-do list application built with TypeScript and vanilla DOM APIs.
[Live demo →](https://logwithjo.github.io/Todo)

![App screenshot](./preview.png)

![HTML](https://img.shields.io/badge/html-5)
![Tailwind](https://img.shields.io/badge/tailwind-4)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## About

This was my first complete project in my TypeScript learning roadmap.
The goal was to understand how TypeScript integrates with JavaScript.
Looking back, I noticed some weaknesses in the project architecture, especially duplicated logic and poor code organization.
This happened because I initially started with simple features and kept expanding the project without refactoring the older code.
I thought about refactoring the project from scratch, but I felt it would be a poor use of time. I decided it would be more valuable to focus on learning better architecture practices in React instead.


## Features

- Add tasks with due dates
- Search tasks
- Mark tasks as completed and uncompleted
- Delete tasks with undo support
- Restore deleted tasks from the deleted tasks popup
- Drag-and-drop task ordering
- Task statistics grid with finished, pending, and deleted counts
- Responsive design
  
## Built with

- **Html 5** _ page structure
- **CSS 3** — scoped styling
- **Tailwindcss** _ better UI
- **TypeScript** — type safety

## Getting started
[Just Click here →](https://logwithjo.github.io/Todo)
 


## Running the app

The app now includes a Node backend for task persistence.

- Install dependencies: `npm install`
- Build TypeScript: `npm run build`
- Start the backend server: `npm start`

Open `http://localhost:3000` in your browser to use the app.

The project uses TypeScript source files under `src/` and outputs compiled code to `dist/`.

## Notes

- The edit functionality uses an inline textarea, and pressing `Enter` saves the renamed task.
- The deleted tasks view uses a grid container for layout.

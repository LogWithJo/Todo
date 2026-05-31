const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const TASKS_FILE = path.join(__dirname, "tasks.json");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

function readTasks() {
	try {
		const raw = fs.readFileSync(TASKS_FILE, "utf8");
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed.tasks) ? parsed.tasks : [];
	} catch (error) {
		return [];
	}
}

function writeTasks(tasks) {
	fs.writeFileSync(TASKS_FILE, JSON.stringify({ tasks }, null, 2), "utf8");
}

app.get("/api/tasks", (req, res) => {
	const tasks = readTasks();
	res.json({ tasks });
});

app.post("/api/tasks", (req, res) => {
	const { name, state, date } = req.body;
	if (!name || typeof name !== "string") {
		return res.status(400).json({ error: "Task name is required" });
	}

	const tasks = readTasks();
	if (tasks.some((task) => task[0] === name)) {
		return res.status(409).json({ error: "Task already exists" });
	}

	const newTask = [name, state || "uncompleted", date || ""];
	writeTasks(tasks);
	res.status(201).json({ task: newTask });
});

app.patch("/api/tasks/:name", (req, res) => {
	const taskName = req.params.name;
	const { name, state, date } = req.body;
	const tasks = readTasks();
	const index = tasks.findIndex((task) => task[0] === taskName);
	if (index === -1) {
		return res.status(404).json({ error: "Task not found" });
	}

	if (name && typeof name === "string") {
		tasks[index][0] = name;
	}
	if (state && typeof state === "string") {
		tasks[index][1] = state;
	}
	if (date && typeof date === "string") {
		tasks[index][2] = date;
	}

	writeTasks(tasks);
	res.json({ task: tasks[index] });
});

app.delete("/api/tasks/:name", (req, res) => {
	const taskName = req.params.name;
	const tasks = readTasks();
	const filtered = tasks.filter((task) => task[0] !== taskName);
	if (filtered.length === tasks.length) {
		return res.status(404).json({ error: "Task not found" });
	}
	writeTasks(filtered);
	res.status(204).send();
});

app.delete("/api/tasks", (req, res) => {
	const state = req.query.state;
	const tasks = readTasks();
	if (state === "completed") {
		const filtered = tasks.filter((task) => task[1] !== "completed");
		writeTasks(filtered);
		return res.status(204).send();
	}

	writeTasks([]);
	res.status(204).send();
});

app.post("/api/tasks/reorder", (req, res) => {
	const { order } = req.body;
	const tasks = readTasks();
	if (!Array.isArray(order)) {
		return res.status(400).json({ error: "Order must be an array of task names" });
	}

	const taskMap = new Map(tasks.map((task) => [task[0], task]));
	const reordered = order.map((name) => taskMap.get(name)).filter(Boolean);
	const remaining = tasks.filter((task) => !order.includes(task[0]));
	const finalTasks = [...reordered, ...remaining];
	writeTasks(finalTasks);

	res.status(200).json({ tasks: finalTasks });
});

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
	console.log(`Todo backend running at http://localhost:${PORT}`);
});

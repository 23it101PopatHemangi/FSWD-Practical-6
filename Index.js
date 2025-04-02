const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;
const TASKS_FILE = "tasks.json";

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Load tasks from file
const loadTasks = () => {
    try {
        const data = fs.readFileSync(TASKS_FILE, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

// Save tasks to file
const saveTasks = (tasks) => {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), "utf-8");
};

// Middleware for task validation
const validateTask = (req, res, next) => {
    const { title, status } = req.body;
    if (!title || typeof title !== "string") {
        return res.status(400).json({ error: "Title is required and must be a string" });
    }
    if (status && !["pending", "completed"].includes(status)) {
        return res.status(400).json({ error: "Status must be 'pending' or 'completed'" });
    }
    next();
};

// 📌 **CRUD OPERATIONS**

// ✅ **1. Get all tasks**
app.get("/tasks", (req, res) => {
    const tasks = loadTasks();
    res.json(tasks);
});

// ✅ **2. Get a single task by ID**
app.get("/tasks/:id", (req, res) => {
    const tasks = loadTasks();
    const task = tasks.find((t) => t.id === parseInt(req.params.id));
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
});

// ✅ **3. Create a new task**
app.put('/tasks/:id', async (req, res) => { 
    try { 
        const updatedTask = await Task.findOneAndUpdate( 
            { id: parseInt(req.params.id) }, 
            req.body, 
            { new: true } 
        ); 
        if (!updatedTask) { 
            return res.status(404).json({ message: "Task not found." }); 
        } 
        res.status(200).json({ message: "Task updated successfully." }); 
    } catch (error) { 
        res.status(400).json({ error: "Error updating task." }); 
    } 
}); 

// ✅ **4. Update a task**
app.put("/tasks/:id", validateTask, (req, res) => {
    const tasks = loadTasks();
    const index = tasks.findIndex((t) => t.id === parseInt(req.params.id));

    if (index === -1) return res.status(404).json({ error: "Task not found" });

    tasks[index] = { ...tasks[index], ...req.body };
    saveTasks(tasks);
    res.json(tasks[index]);
});

// ✅ **5. Delete a task**
app.delete("/tasks/:id", (req, res) => {
    let tasks = loadTasks();
    const filteredTasks = tasks.filter((t) => t.id !== parseInt(req.params.id));

    if (tasks.length === filteredTasks.length) {
        return res.status(404).json({ error: "Task not found" });
    }

    saveTasks(filteredTasks);
    res.json({ message: "Task deleted successfully" });
});

// ✅ **6. Start Server**
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

const express = require('express');
const db = require('./db');
const app = express();

app.use(express.json());
app.get("/", (req, res) => {
    res.status(200)
    .json({ message: "Hello, World!" });
});


app.get("/users", (req, res) => {
    const users = db.prepare("SELECT * FROM users").all();
    res.status(200).json(users);
});

app.get("/todos", (req, res) => {
    const todos = db.prepare("SELECT * FROM todos").all();
    res.status(200).json(todos);
});

app.post("/users", (req, res) => {
    const { name, email } = req.body;
    try {
        if (!name || !email) return res.status(400).json({ message: "Name and email are required" });

        const query = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)").run(name, email);
        const newUser = db.prepare("SELECT * FROM users WHERE id = ?").get(query.lastInsertRowid);

        res.status(200).json(newUser);
    } catch (error){
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


app.post("/todos", (req, res) => {
    const { title, completed } = req.body;
    try {
        if (!title) return res.status(400).json({ message: "Title is required" });

        const query = db.prepare("INSERT INTO todos (title, completed) VALUES (?, ?)").run(title, completed);
        const newTodo = db.prepare("SELECT * FROM todos WHERE id = ?").get(query.lastInsertRowid);

        res.status(200).json(newTodo);
    } catch (error){
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});




app.listen(3000);
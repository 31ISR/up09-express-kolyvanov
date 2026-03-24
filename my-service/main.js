const express = require('express');
const db = require('./db');
const jwt = require('jsonwebtoken');
const SECRET = 'kjkdjfdkdjfdkf';
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

app.post("/auth/signup", (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) return res.status(400).json({ message: "Name, email, and password are required" });

        const syncSalt = bcr.genSaltSync(10);
        const hashPassword = bcr.hashSync(password, syncSalt);
        const query = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)").run(name, email, hashPassword);
        const newUser = db.prepare("SELECT * FROM users WHERE id = ?").get(query.lastInsertRowid);


        const { password: _, ...safeUser } = newUser;
        res.status(201).json(safeUser);

    } catch (error){
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


app.post("/auth/signin", (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
            // return res.status(400).json({ message: "Sign in successful" });

            const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
            if (!user) return res.status(401).json({ message: "Invalid credentials" });

            const hashPassword = bcr.compareSync(password, user.password);
            if (!hashPassword) return res.status(401).json({ message: "Invalid credentials" });

            const { password: _, ...safeUser } = user;
            const token = jwt.sign(safeUser, SECRET, { expiresIn: "24h" });
            return res.status(200).json({success: true, token, error: null});

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

app.delete("/users/:id", (req, res) => {
    const { id } = req.params;
    try {
        const query = db.prepare("DELETE FROM users WHERE id = ?").run(id);
        if (query.changes === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.listen(3000);
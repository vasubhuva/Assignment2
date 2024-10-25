const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const jwt = require('jsonwebtoken');

const app = express();

app.use(express.static("public"));

const JWT_SECRET = '!@#$%^&*()'; // Change this to a secure secret

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/studentDB', { useNewUrlParser: true, useUnifiedTopology: true });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'session_secret', resave: false, saveUninitialized: true }));

// Student Schema
const studentSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    age: Number,
    password: { type: String, required: true }
});

const Student = mongoose.model('Student', studentSchema);

// Middleware to check JWT
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.sendStatus(403);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// API Routes
app.post('/api/register', async (req, res) => {
    const { name, email, age, password } = req.body;
    const newStudent = new Student({ name, email, age, password });
    await newStudent.save();
    res.status(201).json({ message: 'Student registered successfully' });
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });
    if (!student || password !== student.password) {
        return res.sendStatus(403); // Forbidden
    }

    const token = jwt.sign({ email: student.email, id: student._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

app.get('/api/students', authenticateJWT, async (req, res) => {
    const students = await Student.find();
    res.json(students);
});

app.post('/api/students', authenticateJWT, async (req, res) => {
    const { name, email, age } = req.body;
    const newStudent = new Student({ name, email, age });
    await newStudent.save();
    res.status(201).json(newStudent);
});

app.put('/api/students/:id', authenticateJWT, async (req, res) => {
    const { name, email, age } = req.body;
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, { name, email, age }, { new: true });
    res.json(updatedStudent);
});

app.delete('/api/students/:id', authenticateJWT, async (req, res) => {
    await Student.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
});

app.listen(8000, () => {
    console.log(`Server running on 8000`);
});

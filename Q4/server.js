const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const JWT_SECRET = '!@#$%^&*()'; // Change this to a secure secret

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/studentDB');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'session_secret', resave: false, saveUninitialized: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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
    console.log(req.headers['Authorization']);
    if (!token) return res.sendStatus(403);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get("/register", (req, res) => {
    res.render("register");
})

app.post('/register', async (req, res) => {
    const { name, email, age, password } = req.body;

    const newStudent = new Student({ name, email, age, password: password });
    await newStudent.save();
    res.send('Student registered successfully');
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });
    if (!student) {
        return res.sendStatus(403); // Forbidden
    }

    if (password !== student.password) {
        return res.sendStatus(403); // Forbidden
    }

    const token = jwt.sign({ email: student.email, id: student._id }, JWT_SECRET, { expiresIn: '1h' });
    res.header('Authorization', `Bearer ${token}`).redirect("/students");
});


app.post('/logout', (req, res) => {
    req.session.destroy();
    res.sendStatus(200);
});

// CRUD operations
app.get('/students', authenticateJWT, async (req, res) => {
    const students = await Student.find();
    res.render('students', { students });
});

app.post('/students', authenticateJWT, async (req, res) => {
    const { name, email, age } = req.body;
    const newStudent = new Student({ name, email, age });
    await newStudent.save();
    res.redirect('/students');
});

app.get('/students/edit/:id', authenticateJWT, async (req, res) => {
    const student = await Student.findById(req.params.id);
    res.render('editStudent', { student });
});

app.post('/students/edit/:id', authenticateJWT, async (req, res) => {
    const { name, email, age } = req.body;
    await Student.findByIdAndUpdate(req.params.id, { name, email, age });
    res.redirect('/students');
});

app.post('/students/delete/:id', authenticateJWT, async (req, res) => {
    await Student.findByIdAndDelete(req.params.id);
    res.redirect('/students');
});

app.listen(8000, () => {
    console.log(`Server running on 8000`);
});

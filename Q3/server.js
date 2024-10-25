const express = require('express');
const session = require('express-session');
const connectRedis = require('connect-redis');
const redis = require('redis');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Create Redis client
const redisClient = redis.createClient();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Session configuration
const RedisStore = connectRedis(session);
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using https
}));

// Dummy user data
const users = {
    user1: 'password1',
    user2: 'password2'
};

// Routes
app.get('/', (req, res) => {
    res.send('<h1>Home</h1><a href="/login">Login</a>');
});

app.get('/login', (req, res) => {
    res.send(`
        <form method="POST" action="/login">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
    `);
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (users[username] && users[username] === password) {
        req.session.user = username;
        return res.redirect('/dashboard');
    }
    res.send('Invalid credentials');
});

app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.send(`<h1>Dashboard</h1><p>Welcome, ${req.session.user}</p><a href="/logout">Logout</a>`);
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/dashboard');
        }
        res.redirect('/');
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// index.js

const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');

const app = express();

// Create Redis client
const redisClient = redis.createClient();
redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

// Set up session middleware
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: 'your_secret_key', // Change this to a strong secret
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using https
        maxAge: 1000 * 60 * 10 // Session expires in 10 minutes
    }
}));

// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
};

// Routes
app.get('/', (req, res) => {
    res.send('<h1>Welcome to the Express Redis Session App!</h1>');
});

app.get('/login', (req, res) => {
    // Simulate user login
    req.session.user = { id: 1, username: 'testuser' };
    res.send('You are logged in!');
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Could not log out.');
        }
        res.send('You are logged out!');
    });
});

app.get('/protected', isLoggedIn, (req, res) => {
    res.send(`Hello ${req.session.user.username}, this is a protected route!`);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on 8000`);
});

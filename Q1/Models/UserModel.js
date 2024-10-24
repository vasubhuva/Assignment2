const mongoose = require("../config/db");

const UserSchema = mongoose.Schema({
    name: String,
    age: Number,
    email: String,
    phoneno: String,
    profilepic: String
});

const User = mongoose.model('User', UserSchema, 'users');

module.exports = User;
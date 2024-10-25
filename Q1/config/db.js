const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/UserDB");

const db = mongoose.connection;

module.exports = mongoose;
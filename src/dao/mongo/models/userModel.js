const mongoose = require('mongoose');
const userCollection = "Users";

const userSchema = new mongoose.Schema({
    full_name: String,
    email: String,
    age: String,
    password: String,
    role: String
})

const userModel = mongoose.model(userCollection, userSchema)

module.exports = { userModel };
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    movie_id: {
        type: String,
        required: true
    },
    review: {
        type: String,
        required: true
    },
});

const userSchema = new mongoose.Schema({
    email_id: {
        type: String, 
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

module.exports = {
    reviewSchema: reviewSchema,
    userSchema: userSchema
}
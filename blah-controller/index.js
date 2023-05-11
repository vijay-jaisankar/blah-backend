const express = require('express');
require('dotenv').config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 3000;
const DATABASE_URL = process.env.DATABASE_URL;

// MongoDB models
const models = require("./models");

// Request headers
app.use(cors());

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Access-Control-Allow-Origin: *",
        "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization"
    );
    next();
});


app.use(express.json());

// Connect to MongoDB
mongoose.connect(
    DATABASE_URL, 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
).then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// Set up the models
const Review = mongoose.model('Review', models.reviewSchema);
const User = mongoose.model('User', models.userSchema);

// Add review
app.post("/reviews/new/", (req, res) => {
    // Get Username and Password
    let movie_id = req.body.movie_id;
    let review = req.body.review;

    // Base case
    if (movie_id === null || review === null){
        return res.sendStatus(401);
    }

    // Insert into the collection
    const row = new Review({
        movie_id: movie_id,
        review: review,
    });

    row
        .save()
        .then(
            () => {
                console.log("Movie review added");
                res.sendStatus(200);
            }, 
            (err) => {
                console.log("Error adding review");
                console.log(err)
                res.sendStatus(500);
            }
        );
});

// Get reviews for a particular movie_id
app.get("/reviews/fetch", (req, res) => {
    // Get movie ID
    let movie_id = req.body.movie_id;

    // Base case
    if (movie_id === null){
        return res.sendStatus(401);
    }

    // Query the collection
    Review.find({
        movie_id: movie_id
    }).then((list) => {
        if(list){
            res.send(list);
        }
        else{
            res.send({});
        }
    });
});



// Run the app
app.listen(PORT, () => {
    console.log(`Server Started at ${PORT}`)
})

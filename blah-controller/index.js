const express = require('express');
require('dotenv').config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");

const app = express();
const PORT = 3000;
const DATABASE_URL = process.env.DATABASE_URL;

// Bcrypt setup
const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10


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

// Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

const excludedRoutes = ["/", "/auth/register", "/auth/login"];

app.use(
    expressJwt({
        secret: process.env.TOKEN_SECRET,
        algorithms: ["HS256"],
    }).unless({ path: excludedRoutes })
);

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

// Base API route
app.get("/", function (req, res, next) {
    res.json({
        message: `The API is running on port ${PORT}.`,
    });
});

// Sign up
app.post("/auth/register", (req, res) => {
    // Get email ID and Password
    let email_id = req.body.email_id.toLowerCase();
    let password = req.body.password;

    // Base case
    if (email_id === null || password === null){
        return res.status(401).send("error in inputs");
    }


    // Check if email_id exists already in the collection
    User.find({
        "email_id": email_id
    }).then((list) => {
        if(list.length >= 1){
            return res.status(403).send("user already exists");
        }
        else{
            // If not, add into the collection
            bcrypt.hash(password, saltRounds, function(err, hash) {
                if(err) {
                    console.log("Error hashing password");
                    return res.status(500).send("error adding user");
                }
                else{
                    console.log(hash);
                    const row = new User({
                        email_id: email_id,
                        password: hash,
                    });
        
                    row
                        .save()
                            .then(
                                () => {
                                    console.log("User added");
                                    return res.status(200).send("user added");
                                },
                                (err) => {
                                    console.log("Error adding User");
                                    console.log(err);
                                    return res.status(500).send("error adding user");
                                }
                                
                            );
                        }
                });
            }
        });
    })


// Login
app.post("/auth/login", (req, res) => {
    // Get email ID and Password
    let email_id = req.body.email_id.toLowerCase();
    let password = req.body.password;

    // Base case
    if (email_id === null || password === null){
        return res.status(401).send("error in inputs");
    }

    // Check if email_id and password are present in the collection
    else{   
            User.find({
                "email_id": email_id,
            }).then((list) => {
                if(list.length >= 1){
                    hashedPassword = list[0]['password'];
                    bcrypt.compare(password, hashedPassword, function(err, result) {
                        if(result === true){
                            let token = jwt.sign({ userId: list[0].user_id }, process.env.TOKEN_SECRET, {
                                expiresIn: "1h",
                            });
                            return res.send({ "authorised" :token });
                        }
                        else{
                            return res.status(403).send("unauthorised");
                        }
                    });
                }
            })
    }
})

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
                return res.sendStatus(200);
            }, 
            (err) => {
                console.log("Error adding review");
                console.log(err)
                return res.sendStatus(500);
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
const express = require('express');
require('dotenv').config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const logger = require("./logger");


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

    if (token == null) {
        logger.error("Authenticate: Invalid inputs");
        return res.sendStatus(401);
    }

    else{
        jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
            if (err) {
                logger.error(`Authenticate: Error while generating token: ${err.stack? err.stack : null}`);
                return res.sendStatus(403);
            }
            else{
                req.user = user;
                next();
            }
        });
    }
}

// Check and see if the SECURE_ROUTES flag is set
const excludedRoutes = ["/", "/auth/register", "/auth/login", "/reviews/fetch"];


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
).then(() => {
    logger.info("MongoDB connected");
    console.log("MongoDB connected");
})
.catch(err => logger.error(`Database not connected: ${err.stack? err.stack : null}`));

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
        logger.error("Register - Invalid inputs");
        return res.status(401).send("error in inputs");
    }


    // Check if email_id exists already in the collection
    User.find({
        "email_id": email_id
    }).then((list) => {
        if(list.length >= 1){
            logger.error(`Register - user ${email_id} already exists`);
            return res.status(403).send("user already exists");
        }
        else{
            // If not, add into the collection
            bcrypt.hash(password, saltRounds, function(err, hash) {
                if(err) {
                    logger.error(`Hashing Error: ${err.stack? err.stack : null}`);
                    return res.status(500).send("error adding user");
                }
                else{
                    const row = new User({
                        email_id: email_id,
                        password: hash,
                    });
        
                    row
                        .save()
                            .then(
                                () => {
                                    logger.info(`Register - Successfully added user ${email_id}`);
                                    return res.status(200).send("user added");
                                },
                                (err) => {
                                    logger.error(`Register - Error while adding user ${err.stack? err.stack : null}`);
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
        logger.error("Login - Invalid inputs");
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
                            logger.info(`Login - Successfully logged in user ${email_id}`);
                            let token = jwt.sign({ userId: list[0].user_id }, process.env.TOKEN_SECRET, {
                                expiresIn: "1h",
                            });
                            return res.send({ "authorised" :token });
                        }
                        else{
                            logger.info(`Login - Invalid attempt for user ${email_id}`);
                            return res.status(403).send("unauthorised");
                        }
                    });
                }
            })
    }
})

// Add review
app.post("/reviews/new", (req, res) => {
    // Get Username and Password
    let movie_id = req.body.movie_id;
    let review = req.body.review;

    // Base case
    if (movie_id === null || review === null){
        logger.error("Add review - Invalid inputs");
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
                logger.info(`Add review - Successfully added review for ${movie_id}`);
                return res.sendStatus(200);
            }, 
            (err) => {
                logger.error(`Add review - Error while adding review for ${movie_id}: ${err.stack? err.stack : null}`);
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
        logger.error("Fetch reviews - Invalid inputs");
        return res.sendStatus(401);
    }

    // Query the collection
    Review.find({
        movie_id: movie_id
    }).then((list) => {
        if(list){
            logger.info(`Fetch reviews - Successfully fetched reviews for ${movie_id}`);
            res.send(list);
        }
        else{
            logger.info(`Fetch reviews - No current reviews for ${movie_id}`);
            res.send({});
        }
    });
});


// Run the app
app.listen(PORT, () => {
    console.log(`Server Started at ${PORT}`);
    logger.info(`Server Started at ${PORT}`);
});
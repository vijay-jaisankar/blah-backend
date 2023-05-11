const express = require('express');
require('dotenv').config();
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const cors = require("cors");

const app = express();
const PORT = 3000;

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

// Express middleware

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Excluded routes
const excludedRoutes = ["/"]

app.use(
    expressJwt({
        secret: process.env.TOKEN_SECRET,
        algorithms: ["HS256"],
    }).unless({ path: excludedRoutes })
);

app.use(express.json());


// Run the app
app.listen(3000, () => {
    console.log(`Server Started at ${PORT}`)
})
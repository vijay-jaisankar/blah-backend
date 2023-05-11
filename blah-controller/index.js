const express = require('express');
require('dotenv').config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 3000;
const DATABASE_URL = process.env.DATABASE_URL;

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


// Run the app
app.listen(3000, () => {
    console.log(`Server Started at ${PORT}`)
})
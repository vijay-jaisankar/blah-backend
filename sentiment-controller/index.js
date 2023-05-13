/*
Imports
*/
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const winston = require('winston');

const Sentiment = require("sentiment");
var sentiment = new Sentiment();

// Logger setup
const logger = winston.createLogger({
    format: winston.format.json(),
	transports: [new winston.transports.File({
        filename: './results/sentiment.log',
	})],
});


const getSentimentOfText = async (text) => {
    const prediction = sentiment.analyze(text);
    const value = prediction["comparative"];
    logger.info(`Input: ${text}; Score: ${value}`);
    return value;
};

// Express API setup
const app = express();
app.use(cors(({
    origin: "*"
})));

app.use(
    bodyParser.urlencoded({
        extended: false,
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



// Base route
app.get("/", function (req, res) {
    return res.json("Hello world!");
});

// Sentiment analysis route
app.post("/sentiment", async function (req, res) {
    let text = req.body.text;
    try {
        let summaryValue = await getSentimentOfText(text);
        if(summaryValue < 0)    return res.json({sentiment: "negative"});
        else{
            if(summaryValue < 0.3) return res.json({sentiment: "neutral"});
            else    return res.json({sentiment: "positive"});
        }

    } catch (error) {
        console.log(`Error: ${error}`);
        return res.json({message: "error"});
    }
});

// Run the API
const port = 9000;
app.listen(port, () => {
    console.log(`Listening at Port ${port}`);
});

module.exports = app;
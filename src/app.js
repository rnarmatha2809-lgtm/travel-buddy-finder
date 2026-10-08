const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load .env from the same folder as app.js
dotenv.config({
    path: path.join(__dirname, ".env")
});

const app = express();

// Use ByteXL's PORT if provided, otherwise 3000
const PORT = process.env.PORT || 3000;

// ------------------------------------
// MIDDLEWARE
// ------------------------------------

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve index.html and other files
// from the src folder
app.use(express.static(__dirname));


// ------------------------------------
// TEST ROUTE
// ------------------------------------

app.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "Express server is working!"
    });
});


// ------------------------------------
// MONGODB SCHEMA
// ------------------------------------

const buddySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    age: {
        type: Number,
        required: true
    },

    destination: {
        type: String,
        required: true
    },

    travelDate: {
        type: String,
        required: true
    },

    interests: {
        type: String,
        required: true
    }
});


// ------------------------------------
// MONGODB MODEL
// ------------------------------------

const TravelBuddy = mongoose.model(
    "TravelBuddy",
    buddySchema
);


// ------------------------------------
// ADD TRAVEL BUDDY
// ------------------------------------

app.post("/add", async (req, res) => {

    console.log("--------------------------------");
    console.log("POST /add received");
    console.log("Data received:");
    console.log(req.body);

    try {

        const buddy = new TravelBuddy({
            name: req.body.name,
            age: Number(req.body.age),
            destination: req.body.destination,
            travelDate: req.body.travelDate,
            interests: req.body.interests
        });

        await buddy.save();

        console.log("Travel Buddy saved successfully!");

        res.status(201).json({
            success: true,
            message: "Travel Buddy added successfully!"
        });

    } catch (error) {

        console.error("Error saving Travel Buddy:");
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// ------------------------------------
// GET ALL TRAVEL BUDDIES
// ------------------------------------

app.get("/buddies", async (req, res) => {

    try {

        const buddies = await TravelBuddy.find();

        res.json({
            success: true,
            buddies: buddies
        });

    } catch (error) {

        console.error("Error getting Travel Buddies:");
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// ------------------------------------
// SEARCH TRAVEL BUDDIES
// ------------------------------------

app.get("/search/:destination", async (req, res) => {

    try {

        const destination = req.params.destination;

        const buddies = await TravelBuddy.find({
            destination: {
                $regex: destination,
                $options: "i"
            }
        });

        res.json({
            success: true,
            buddies: buddies
        });

    } catch (error) {

        console.error("Search error:");
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// ------------------------------------
// START EXPRESS SERVER
// ------------------------------------

app.listen(PORT, "0.0.0.0", () => {

    console.log("--------------------------------");
    console.log("Travel Buddy server started");
    console.log(`Server running on port ${PORT}`);
    console.log("--------------------------------");

});


// ------------------------------------
// CONNECT TO MONGODB
// ------------------------------------

const mongoURL = process.env.MONGO_URL;

if (!mongoURL) {

    console.error("--------------------------------");
    console.error("ERROR: MONGO_URL was not found!");
    console.error("Check your .env file.");
    console.error("--------------------------------");

} else {

    mongoose.connect(mongoURL)
        .then(() => {

            console.log("MongoDB Connected Successfully");
            console.log("--------------------------------");

        })
        .catch((error) => {

            console.error("--------------------------------");
            console.error("MongoDB connection error:");
            console.error(error.message);
            console.error("--------------------------------");

        });
}
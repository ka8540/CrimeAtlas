require('dotenv').config({path: '../../.env'});
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const axios = require('axios');

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const crimeRateSchema = new mongoose.Schema({}, { collection: 'CrimeRate' });
const CrimeRate = mongoose.models.CrimeRate || mongoose.model('CrimeRate', crimeRateSchema);

const commentSchema = new mongoose.Schema({
    longitude: { type: Number, required: true },
    latitude: { type: Number, required: true },
    text: { type: String, required: true },
    user: { type: String },
    createdAt: { type: Date, default: Date.now }
});
const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);

// Add a comment to a specific location
router.post('/add_comment', async (req, res) => {
    const { longitude, latitude, text, user } = req.body;

    if (!longitude || !latitude || !text) {
        return res.status(400).send('Longitude, latitude, and text are required.');
    }

    try {
        const newComment = new Comment({ 
            longitude: parseFloat(longitude),
            latitude: parseFloat(latitude),
            text,
            user: user || 'Anonymous'
        });

        await newComment.save();
        res.status(201).json({message: 'Comment added successfully' ,comment: newComment });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Failed to add comment.' });
    }
});

// Get crime data by location and maximum distance
router.get('/get_crime_data_by_location', async (req, res) => {
    const { location, maxDistance } = req.query;

    try {
        // fetching node-fetch dynamically to avoid issues with serverless environments 
        const fetch = (await import('node-fetch')).default;

        // Get coordinates for the location using Google Maps API
        const googleMapsUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${process.env.GOOGLE_API_KEY}`;

        const googleResponse = await fetch(googleMapsUrl);
        const googleData = await googleResponse.json();

        if (!googleData.results.length) {
            return res.status(404).send('Location not found.');
        }

        const { lat, lng } = googleData.results[0].geometry.location;

        // Perform a geospatial query to find crime data within the specified distance
        const results = await CrimeRate.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [lng, lat]
                    },
                    distanceField: "distance",
                    maxDistance: parseInt(maxDistance, 10),
                    spherical: true
                }
            },
            {
                $group: {
                    _id: "$location.coordinates",
                    longitude: { $first: { $arrayElemAt: ["$location.coordinates", 0] } },
                    latitude: { $first: { $arrayElemAt: ["$location.coordinates", 1] } }
                }
            },
            {
                $project: {
                    _id: 0,
                    longitude: 1,
                    latitude: 1
                }
            }
        ]);

        if (!results.length) {
            return res.status(404).send('No crime data found within the specified distance.');
        }

        // Prepare and send response
        const crimeLocations = results.map(coords => ({
            longitude: coords.longitude,
            latitude: coords.latitude
        }));

        res.json(crimeLocations);

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).send('Server error occurred.');
    }
});

// Get detailed crime data at specific coordinates
router.get('/get_crime_data_at_coordinates', async (req, res) => {
    const { longitude, latitude } = req.query;

    if (!longitude || !latitude) {
        return res.status(400).send('Longitude and latitude are required.');
    }

    try {
        // Fetch crime data
        const crimeResults = await CrimeRate.aggregate([
            {
                $match: {
                    "location.coordinates": [parseFloat(longitude), parseFloat(latitude)]
                }
            },
            {
                $group: {
                    _id: "$Crm Cd Desc",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    crimeType: "$_id",
                    occurrences: "$count"
                }
            }
        ]);

        if (!crimeResults.length) {
            return res.status(404).send('No crime data found at the specified coordinates.');
        }

        const comments = await Comment.find({ 
            longitude: parseFloat(longitude),
            latitude: parseFloat(latitude)
        }).sort({ createdAt: -1 });

        // Call the internal API to get or create an image
        const imageResponse = await axios.get(`http://localhost:${process.env.PORT}/get-or-create-image`, {
            params: { latitude, longitude }
        });

        // Combine results and send response
        res.json({
            crimeData: crimeResults,
            comments: comments,
            imageData: imageResponse.data
        });

    } catch (error) {
        console.error('Server error:', error);
        if (error.response) {
            // Forward the status code from the internal API call if it failed
            res.status(error.response.status).send(error.response.data);
        } else {
            res.status(500).send('Server error occurred.');
        }
    }
});

router.get('/search_crime_by_keyword', async (req, res) => {
    console.log("Received request to search crime data by keyword");
    const { keyword } = req.query;

    if (!keyword) {
        return res.status(400).json({ error: "Keyword parameter is required." });
    }

    try {
        const regexPattern = new RegExp(keyword, 'i');

        const results = await CrimeRate.aggregate([
            {
                $match: {
                    "Crm Cd Desc": regexPattern 
                }
            },
            {
                $project: {
                    _id: 0,
                    keyword: keyword,
                    longitude: { $arrayElemAt: ["$location.coordinates", 0] },
                    latitude: { $arrayElemAt: ["$location.coordinates", 1] },
                    crimeType: "$Crm Cd Desc"
                }
            }
        ]);

        if (!results.length) {
            return res.status(404).json({ 
                error: "No crime data found for the given keyword.",
                keyword: keyword
            });
        }

        res.json(results);

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ 
            error: "Server error occurred.",
            keyword: keyword
        });
    }
});

router.get('/get_crime_data_at_coordinates_with_keyword', async (req, res) => {
    const { longitude, latitude, keyword } = req.query;

    if (!longitude || !latitude || !keyword) {
        return res.status(400).json({ error: "Longitude, latitude, and keyword are required." });
    }

    try {
        const regexPattern = new RegExp(keyword, 'i');

        const crimeResults = await CrimeRate.aggregate([
            {
                $match: {
                    "location.coordinates": [parseFloat(longitude), parseFloat(latitude)],
                    "Crm Cd Desc": regexPattern
                }
            },
            {
                $group: {
                    _id: "$Crm Cd Desc",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    crimeType: "$_id",
                    occurrences: "$count",
                    keyword: keyword 
                }
            }
        ]);

        if (!crimeResults.length) {
            return res.status(404).json({
                error: "No crime data found at the specified coordinates with the given keyword.",
                keyword: keyword
            });
        }

        const imageResponse = await axios.get(`http://localhost:${process.env.PORT}/get-or-create-image`, {
            params: { latitude, longitude }
        });

        res.json({
            crimeData: crimeResults,
            imageData: imageResponse.data
        });

    } catch (error) {
        console.error("Server error:", error);
        if (error.response) {
            res.status(error.response.status).send(error.response.data);
        } else {
            res.status(500).json({ error: "Server error occurred.", keyword: keyword });
        }
    }
});

module.exports = router;
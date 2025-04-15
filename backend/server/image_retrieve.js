require('dotenv').config({path: '../../.env'});
const express = require('express');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const axios = require('axios');
const { Readable } = require('stream'); // Import the Readable stream
const router = express.Router();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const conn = mongoose.connection;
let gridfsBucket;

conn.once("open", () => {
  gridfsBucket = new GridFSBucket(conn.db, { bucketName: "images" });
  console.log("Connected to MongoDB and GridFS.");
});

const crimeRateSchema = new mongoose.Schema({}, { collection: 'CrimeRate' });
const CrimeRate = mongoose.models.CrimeRate || mongoose.model('CrimeRate', crimeRateSchema);

// Function to fetch and store an image
async function fetchAndStoreImage(latitude, longitude) {
    const imageUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${latitude},${longitude}&key=${process.env.GOOGLE_API_KEY}`;
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    if (response.status !== 200) {
        throw new Error('Failed to fetch image from Google Street View');
    }

    const imageBuffer = response.data;
    const readableStream = new Readable({
        read() {
            this.push(imageBuffer);
            this.push(null);
        }
    });

    const filename = `streetview_${latitude}_${longitude}.jpg`;
    const uploadStream = gridfsBucket.openUploadStream(filename, {
        metadata: {
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
        }
    });

    return new Promise((resolve, reject) => {
        readableStream.pipe(uploadStream)
            .on('error', reject)
            .on('finish', () => {
                console.log(`Stored image with filename: ${filename}`);
                resolve(filename);
            });
    });
}

// Route to fetch or create an image based on coordinates
router.get('/get-or-create-image', async (req, res) => {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
        return res.status(400).send('Latitude and longitude are required');
    }

    try {
        const files = await gridfsBucket.find({ filename: `streetview_${latitude}_${longitude}.jpg` }).toArray();
        if (files.length > 0) {
            return res.json({ message: "Image already exists", filename: files[0].filename });
        }

        const newFilename = await fetchAndStoreImage(latitude, longitude);
        res.json({ message: "Image fetched and stored", filename: newFilename });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Failed to fetch and store image');
    }
});

// Serve images directly from GridFS
router.get('/images/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const downloadStream = gridfsBucket.openDownloadStreamByName(filename);

        downloadStream.on('data', (chunk) => res.write(chunk));
        downloadStream.on('error', () => res.status(404).send('Not found'));
        downloadStream.on('end', () => res.end());
    } catch (error) {
        console.error('Error serving image:', error);
        res.status(500).send('Server error occurred');
    }
});


module.exports = router;

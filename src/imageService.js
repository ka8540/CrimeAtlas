require('dotenv').config({ path: '../.env' });
const express = require("express");
const mongoose = require("mongoose");

console.log(process.env.MONGO_URI);

const axios = require("axios");
const { GridFSBucket } = require("mongodb");
const bodyParser = require("body-parser");
const { Readable } = require("stream");
const cors = require("cors");

const app = express();
const PORT = 5001;

app.use(bodyParser.json());
app.use(cors());
// MongoDB Connection
const mongoURI = `${process.env.MONGO_URI}`;
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let gridfsBucket;
conn.once("open", () => {
  gridfsBucket = new GridFSBucket(conn.db, { bucketName: "images" });
  console.log("Connected to MongoDB GridFS.");
});
const CrimeRate = conn.collection("CrimeRate");

// Google Street View API Key
const API_KEY = `${process.env.GOOGLE_API_KEY}`;

//Function 1: Fetch and store an image based on latitude and longitude.
const fetchAndStoreImage = async (latitude, longitude) => {
    try {
      // Step 1: Find all Crime Records for the given coordinates
      const crimeRecords = await CrimeRate.find({
        "location.coordinates": [parseFloat(longitude), parseFloat(latitude)]
      }).toArray(); // Fetch all matching records
  
      if (!crimeRecords || crimeRecords.length === 0) {
        console.error("No crime records found for the given coordinates.");
        return "No crime records found.";
      }
  
      // Extract all `_id`s from the found crime records
      const crimeRecordIds = crimeRecords.map(record => record._id);
      console.log(`Found ${crimeRecordIds.length} Crime Record IDs:`, crimeRecordIds);
  
      // Step 2: Fetch the Image from Google Street View API
      const imagePath = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${latitude},${longitude}&key=${API_KEY}`;
      const res = await axios.get(imagePath, { resType: "arraybuffer" });
  
      if (res.status !== 200) {
        console.error("Failed to fetch image from Google API.");
        return "Failed to fetch image.";
      }
  
      const rawImageData = res.data;
  
      // Step 3: Store Image in MongoDB GridFS with Multiple Crime Record References
      const readableStream = new Readable();
      readableStream.push(rawImageData);
      readableStream.push(null);
  
      const uploadStream = gridfsBucket.openUploadStream(`streetview_${latitude}_${longitude}.jpg`, {
        contentType: "image/jpeg",
        metadata: { crimeRecordIds } //Store all Crime Record References
      });
  
      readableStream.pipe(uploadStream);
  
      return new Promise((resolve, reject) => {
        uploadStream.on("finish", () => {
          console.log(`Image stored successfully in MongoDB GridFS with references to ${crimeRecordIds.length} crime records.`);
          resolve(`Image stored with references to ${crimeRecordIds.length} crime records.`);
        });
  
        uploadStream.on("error", (error) => {
          console.error("Error storing image:", error);
          reject("Error storing image.");
        });
      });
  
    } catch (error) {
      console.error("Error fetching and storing image:", error);
      return "Error fetching and storing image.";
    }
  };
  
// Route 1: Fetch an image based on latitude & longitude
app.get("/fetch-image", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Latitude and Longitude are required!" });
  }

  const filename = `streetview_${lat}_${lon}.jpg`;
  const fileCursor = await gridfsBucket.find({ filename }).toArray();

  if (fileCursor.length) {
    return res.json({ message: "Image already exists", filename });
  }

  const result = await fetchAndStoreImage(lat, lon);
  res.json({ message: result });
});

conn.once("open", async () => {
    try {
      gridfsBucket = new GridFSBucket(conn.db, { bucketName: "images" });
  
      // Reference to CrimeRate collection
      const CrimeRate = conn.db.collection("CrimeRate");
  
      // Step 1: Delete all past image records
      await conn.db.collection("images.files").deleteMany({});
      await conn.db.collection("images.chunks").deleteMany({});
      console.log("Deleted all images from GridFS.");
  
      // Step 2: Fetch the first 10 crime records
      const crimeRecords = await CrimeRate.find().limit(10).toArray();
  
      if (!crimeRecords || crimeRecords.length === 0) {
        console.error("No crime records found.");
        return;
      }
  
      console.log(`Found ${crimeRecords.length} crime records. Processing...`);
  
      // Step 3: Loop through the first 10 records and store images
      for (const record of crimeRecords) {
        if (record.location && record.location.coordinates) {
          const [longitude, latitude] = record.location.coordinates;
          console.log(`Processing Image for Coordinates: (${latitude}, ${longitude})`);
          await fetchAndStoreImage(latitude, longitude);
        } else {
          console.warn(`Skipping record with missing coordinates: ${record._id}`);
        }
      }
  
      console.log("Completed processing first 10 crime records.");
    } catch (error) {
      console.error("Error processing images:", error);
    }
  });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
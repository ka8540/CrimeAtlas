require('dotenv').config({path: '../../.env'});
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Import routes
const loginRoutes = require('./login');
const searchRoutes = require('./search_with_parameters');
const geoSearchRoutes = require('./advance_search_geospatial');
const imageRetrieveRoutes = require('./image_retrieve');
// Use routes
app.use(loginRoutes);
app.use(searchRoutes);
app.use(geoSearchRoutes);
app.use(imageRetrieveRoutes);
// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

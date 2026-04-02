const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/tasks', taskRoutes);

// Catch-all fallback route to serve the frontend for any other request
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server immediately so Render detects an open port
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=====================================`);
  console.log(`Server proudly running on port ${PORT}`);
  console.log(`=====================================`);
});

// Missing Environment Variable Validation
if (!process.env.MONGO_URI) {
  console.log("=====================================");
  console.log("FATAL ERROR: MONGO_URI IS MISSING!");
  console.log("Render failed to find the MONGO_URI environment variable.");
  console.log("Go to your Render Dashboard -> Environment -> Add Environment Variable.");
  console.log("Key: MONGO_URI");
  console.log("Value: mongodb+srv://...");
  console.log("=====================================");
} else {
  // MongoDB connection
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('Successfully connected to MongoDB Atlas');
    })
    .catch((err) => {
      console.log('=====================================');
      console.log('MongoDB Connection Failed!');
      console.log('Error Message:', err.message);
      console.log('Did you whitelist 0.0.0.0/0 in MongoDB Atlas Network Access?');
      console.log('=====================================');
    });
}

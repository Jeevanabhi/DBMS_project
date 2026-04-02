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

// Missing Environment Variable Validation
if (!process.env.MONGO_URI) {
  console.error("FATAL ERROR: MONGO_URI environment variable is missing.");
  console.error("If you are deploying on Render, please make sure you add it to the Environment Variables dashboard!");
  process.exit(1);
}

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  });

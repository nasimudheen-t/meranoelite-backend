const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const db = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');


require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// admin login
app.use('/api/auth', authRoutes);


// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/products', productRoutes);

// Test Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Product Management API is running'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  // If request has a file uploaded but server failed afterward, clean it up
  if (req.file) {
    const fs = require('fs');
    try {
      fs.unlinkSync(req.file.path);
    } catch (unlinkErr) {
      console.error('Failed to delete uploaded file in error handler:', unlinkErr);
    }
  }

  console.error('App Error:', err);

  // Catch Multer errors specifically (e.g. file size exceeded)
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  }

  // Catch generic validation/filter errors from Multer middleware
  if (err.message && (err.message.includes('Only .png, .jpg, .jpeg and .webp') || err.message.includes('formats are allowed!'))) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Default error response
  return res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Verify DB connection and start server
const startServer = async () => {
  try {
    // Attempt database pool connection check
    const connection = await db.getConnection();
    console.log('Database connected successfully!');
    connection.release();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed. Server not started.', error);
    process.exit(1);
  }
};

startServer();

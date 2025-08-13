const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');
const labelRoutes = require('./routes/labels');

// Import error handler
const errorHandler = require('./middleware/error');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/notes-app');
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Routes

app.get("/",(req,res)=>{
  res.status(200).json({
    message:"Hello World"
  })
})
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/labels', labelRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handler middleware (should be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});

module.exports = app;
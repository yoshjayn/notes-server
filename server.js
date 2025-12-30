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
const errorHandler = require('./middleware/error');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

// Cached connection for serverless
let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('Using cached database connection');
    return cachedConnection;
  }

  try {
    const opts = {
      bufferCommands: false,
    };
    
    cachedConnection = await mongoose.connect(
      process.env.MONGODB_URI || process.env.MONGO_URI,
      opts
    );
    
    console.log('MongoDB Connected:', mongoose.connection.readyState);
    return cachedConnection;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    cachedConnection = null;
    throw err;
  }
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB Connection Error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Database connection failed',
      details: err.message 
    });
  }
});

// Routes
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Notes App API is running",
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/labels', labelRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Error handlers
app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found',
    path: req.path 
  });
});

// Local development server
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = app;
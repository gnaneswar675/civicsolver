const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root & Health check endpoints for Render deployments & monitoring
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'CivicSolver Backend API',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : (dbState === 2 ? 'connecting' : 'disconnected');
  res.status(dbState === 1 ? 200 : 503).json({
    status: dbState === 1 ? 'healthy' : 'degraded',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Application Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/problems', require('./routes/problemRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

const PORT = process.env.PORT || 5000;

// Connect to MongoDB first
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('\x1b[32m%s\x1b[0m', '📦 Connected to MongoDB');
    // Start server after successful database connection
    app.listen(PORT, () => {
      console.log(`\x1b[36m%s\x1b[0m`, `🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('\x1b[31m%s\x1b[0m', '❌ MongoDB connection error:', err);
    process.exit(1);
  });

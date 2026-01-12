require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');

// Import models
const User = require('./models/User');
const ApiKey = require('./models/ApiKey');
const RecognitionLog = require('./models/RecognitionLog');
const RegisteredFace = require('./models/RegisteredFace');

// Import routes
const authRoutes = require('./routes/auth');
const apiKeyRoutes = require('./routes/apiKeys');
const recognitionRoutes = require('./routes/recognition');
const faceRoutes = require('./routes/faces');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



sequelize.authenticate()
  .then(() => {
    console.log('MySQL connected successfully');
    // Sync models without altering (database already exists)
    return sequelize.sync({ alter: false });
  })
  .then(() => {
    console.log('Database models synced');
  })
  .catch(err => console.log('MySQL connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/apikeys', apiKeyRoutes);
app.use('/api/recognition', recognitionRoutes);
app.use('/api/faces', faceRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

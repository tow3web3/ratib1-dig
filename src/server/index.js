const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const deployTokenHandler = require('./deploy-token').default;

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Deploy token route
app.post('/api/deploy-token', async (req, res) => {
  console.log('POST /api/deploy-token received');
  
  // Log headers for debugging
  console.log('Headers:', req.headers);
  
  try {
    await deployTokenHandler(req, res);
  } catch (error) {
    console.error('Error handling deploy-token request:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Add a test route
app.get('/api/test', (req, res) => {
  console.log('Test route hit');
  res.json({ status: 'API is working!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});

module.exports = app; 
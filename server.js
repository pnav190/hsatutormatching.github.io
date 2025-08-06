// server.js
// Simple Express proxy for OpenAI API (keeps your API key secret)
const express = require('express');
const { exec } = require('child_process');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Security middleware
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Sync endpoint
app.post('/sync-tutors', async (req, res) => {
  try {
    console.log('🔄 Webhook received - starting sync...');
    
    // Run the sync script
    exec('npm run sync', { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Sync error:', error);
        return res.status(500).json({ error: 'Sync failed', details: error.message });
      }
      
      console.log('✅ Sync completed successfully');
      console.log('Output:', stdout);
      
      res.json({ 
        success: true, 
        message: 'Tutor data synced successfully',
        timestamp: new Date().toISOString()
      });
    });
    
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Sync server running on port ${PORT}`);
  console.log(`📡 Webhook endpoint: http://localhost:${PORT}/sync-tutors`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

module.exports = app; 
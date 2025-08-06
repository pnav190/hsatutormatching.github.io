const express = require('express');
const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const HTML_FILE_PATH = path.join(__dirname, 'Dynamic.html');

// Middleware
app.use(express.json({ limit: '10mb' }));

// Security middleware
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.WEBHOOK_SECRET || 'your-secret-token'}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Update HTML file endpoint
app.post('/update-html', async (req, res) => {
  try {
    console.log('🔄 Received HTML update request...');
    
    const { tutorsString } = req.body;
    
    if (!tutorsString) {
      return res.status(400).json({ error: 'Missing tutorsString' });
    }
    
    // Read the current HTML file
    let htmlContent = fs.readFileSync(HTML_FILE_PATH, 'utf8');
    
    // Find the tutors array in the JavaScript code
    const tutorArrayStart = htmlContent.indexOf('const tutors = [');
    if (tutorArrayStart === -1) {
      throw new Error('Could not find tutors array in HTML file');
    }
    
    // Find the end of the tutors array
    let bracketCount = 0;
    let tutorArrayEnd = tutorArrayStart;
    let inString = false;
    let escapeNext = false;
    
    for (let i = tutorArrayStart; i < htmlContent.length; i++) {
      const char = htmlContent[i];
      
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      
      if (char === '"' || char === "'") {
        inString = !inString;
        continue;
      }
      
      if (!inString) {
        if (char === '[') {
          bracketCount++;
        } else if (char === ']') {
          bracketCount--;
          if (bracketCount === 0) {
            tutorArrayEnd = i + 1;
            break;
          }
        }
      }
    }
    
    if (bracketCount !== 0) {
      // Try a simpler approach
      const simpleEnd = htmlContent.indexOf('];', tutorArrayStart);
      if (simpleEnd !== -1) {
        tutorArrayEnd = simpleEnd + 2;
      } else {
        throw new Error('Could not properly parse tutors array');
      }
    }
    
    // Replace the tutors array in the HTML
    const beforeTutors = htmlContent.substring(0, tutorArrayStart);
    const afterTutors = htmlContent.substring(tutorArrayEnd);
    
    const newHTMLContent = beforeTutors + tutorsString + ';' + afterTutors;
    
    // Write the updated HTML file
    fs.writeFileSync(HTML_FILE_PATH, newHTMLContent, 'utf8');
    
    console.log('✅ Successfully updated HTML file');
    
    res.json({ 
      success: true, 
      message: 'HTML file updated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error updating HTML file:', error);
    res.status(500).json({ error: 'Failed to update HTML file', details: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Auto-update server running on port ${PORT}`);
  console.log(`📡 Update endpoint: http://localhost:${PORT}/update-html`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

module.exports = app; 
const { google } = require('googleapis');
const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();

// Configuration
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const RANGE = process.env.GOOGLE_SHEET_RANGE || 'A:L';
const HTML_FILE_PATH = path.join(__dirname, 'Dynamic.html');

// Google Sheets API setup
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || 'credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function fetchTutorData() {
  try {
    console.log('Fetching data from Google Sheets...');
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error('No data found in spreadsheet');
    }

    // Assume first row contains headers
    const headers = rows[0];
    const dataRows = rows.slice(1);

    console.log(`Found ${dataRows.length} tutor records`);
    console.log('Headers:', headers);

    // Convert spreadsheet data to tutor objects
    const tutors = dataRows.map((row, index) => {
      const tutor = {};
      
      headers.forEach((header, colIndex) => {
        const value = row[colIndex] || '';
        
        // Map spreadsheet columns to tutor object properties based on your sheet structure
        const headerLower = header.toLowerCase().trim();
        
        if (headerLower.includes('full name')) {
          tutor.name = value;
        } else if (headerLower.includes('active')) {
          // Store active status for filtering
          tutor.active = value.toLowerCase() === 'active' || value === 'TRUE';
        } else if (headerLower.includes('graduating year')) {
          tutor.grade = value;
        } else if (headerLower.includes('major/intended major')) {
          tutor.major = value;
        } else if (headerLower.includes('please submit your bio following the example structure below')) {
          tutor.bio = value;
        } else if (headerLower.includes('profile tag') && headerLower.includes('input it here')) {
          // Create the full TutorOcean URL
          if (value) {
            tutor.tutorocean = `https://hsatutoring.tutorocean.com/host/${value}`;
          }
        } else if (headerLower.includes('sat/act score')) {
          tutor.standardized = value;
        } else if (headerLower.includes('college email')) {
          // Store email for backend reference only
          tutor.email = value;
        } else if (headerLower.includes('clean phone')) {
          // Store phone for backend reference only
          tutor.phone = value;
        }
      });

      return tutor;
    }).filter(tutor => {
      // Only include tutors with names and who are active
      return tutor.name && tutor.active === true;
    });

    console.log(`Successfully processed ${tutors.length} active tutors`);
    return tutors;

  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    throw error;
  }
}

function updateHTMLFile(tutors) {
  try {
    console.log('Reading HTML file...');
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
      // Try a simpler approach - look for the closing bracket after the array
      const simpleEnd = htmlContent.indexOf('];', tutorArrayStart);
      if (simpleEnd !== -1) {
        tutorArrayEnd = simpleEnd + 2;
      } else {
        throw new Error('Could not properly parse tutors array');
      }
    }

    // Clean up tutor objects for frontend (remove backend-only fields)
    const cleanTutors = tutors.map(tutor => {
      const cleanTutor = {
        name: tutor.name,
        grade: tutor.grade,
        major: tutor.major,
        tests: tutor.standardized || 'N/A',
        bio: tutor.bio,
        subjects: 'N/A', // Removed as requested
        standardized: tutor.standardized || 'N/A',
        tutorocean: tutor.tutorocean,
        languages: 'N/A' // Removed as requested
      };
      return cleanTutor;
    });

    // Convert tutors array to JavaScript string
    const tutorsString = JSON.stringify(cleanTutors, null, 2)
      .replace(/"/g, '"')
      .replace(/"/g, '"')
      .replace(/^\[/, '[\n  ')
      .replace(/\]$/, '\n  ]')
      .replace(/,\n  \]/g, '\n  ]');

    // Replace the tutors array in the HTML
    const beforeTutors = htmlContent.substring(0, tutorArrayStart);
    const afterTutors = htmlContent.substring(tutorArrayEnd);
    
    const newHTMLContent = beforeTutors + 'const tutors = ' + tutorsString + ';' + afterTutors;

    // Write the updated HTML file
    fs.writeFileSync(HTML_FILE_PATH, newHTMLContent, 'utf8');
    console.log('Successfully updated HTML file with new tutor data');

  } catch (error) {
    console.error('Error updating HTML file:', error);
    throw error;
  }
}

async function syncTutorData() {
  try {
    console.log('Starting tutor data sync...');
    
    // Check if required environment variables are set
    if (!SPREADSHEET_ID) {
      throw new Error('GOOGLE_SPREADSHEET_ID environment variable is required');
    }

    // Fetch data from Google Sheets
    const tutors = await fetchTutorData();
    
    // Update the HTML file
    updateHTMLFile(tutors);
    
    console.log('✅ Tutor data sync completed successfully!');
    console.log(`Updated ${tutors.length} active tutors in the application`);
    
  } catch (error) {
    console.error('❌ Error during tutor data sync:', error);
    process.exit(1);
  }
}

// Run the sync if this file is executed directly
if (require.main === module) {
  syncTutorData();
}

module.exports = { syncTutorData, fetchTutorData, updateHTMLFile }; 
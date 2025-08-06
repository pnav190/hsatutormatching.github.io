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

async function outputTutorData() {
  try {
    console.log('Fetching data from Google Sheets...');
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return;
    }

    const headers = rows[0];
    const dataRows = rows.slice(1);
    
    console.log(`Found ${dataRows.length} tutor records`);
    console.log('Headers:', headers);
    
    const activeTutors = [];
    
    for (const row of dataRows) {
      const tutor = { active: false };
      
      // Map spreadsheet columns to tutor object properties
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i];
        const value = row[i] || '';
        
        // Use more specific matching for complex headers
        if (header.toLowerCase().includes('full name')) {
          tutor.name = value;
        } else if (header.toLowerCase().includes('active')) {
          tutor.active = value.toLowerCase() === 'active' || value === 'TRUE';
        } else if (header.toLowerCase().includes('graduating year')) {
          tutor.grade = value;
        } else if (header.toLowerCase().includes('major/intended major')) {
          tutor.major = value;
        } else if (header.toLowerCase().includes('please submit your bio following the example structure below')) {
          tutor.bio = value;
        } else if (header.toLowerCase().includes('profile tag') && header.toLowerCase().includes('input it here')) {
          if (value) {
            tutor.tutorocean = `https://hsatutoring.tutorocean.com/host/${value}`;
          }
        } else if (header.toLowerCase().includes('sat/act score')) {
          tutor.standardized = value;
        }
      }
      
      if (tutor.active && tutor.name) {
        activeTutors.push(tutor);
      }
    }
    
    console.log(`Successfully processed ${activeTutors.length} active tutors`);
    
    // Output the data in the exact format needed for the HTML file
    console.log('\n=== REPLACE YOUR TUTORS ARRAY WITH THIS ===\n');
    console.log('const tutors = [');
    
    activeTutors.forEach((tutor, index) => {
      console.log('  {');
      console.log(`    name: "${tutor.name || ''}",`);
      console.log(`    grade: "${tutor.grade || ''}",`);
      console.log(`    major: "${tutor.major || ''}",`);
      console.log(`    bio: "${tutor.bio || ''}",`);
      console.log(`    tutorocean: "${tutor.tutorocean || ''}",`);
      console.log(`    standardized: "${tutor.standardized || 'N/A'}"`);
      console.log(index === activeTutors.length - 1 ? '  }' : '  },');
    });
    
    console.log('];');
    console.log('\n=== END OF TUTORS ARRAY ===\n');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

outputTutorData(); 
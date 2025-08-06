// Google Apps Script for immediate sync when sheet changes
// This script will directly update your HTML file

function onEdit(e) {
  // Only trigger if the edit is in the main data range
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  
  // Check if edit is in the tutor data columns (A:L)
  if (range.getColumn() >= 1 && range.getColumn() <= 12) {
    // Trigger the sync
    syncTutorData();
  }
}

function syncTutorData() {
  try {
    console.log('🔄 Sheet changed - starting sync...');
    
    // Get the spreadsheet data
    const spreadsheetId = '1OTBaXW2aIMRY3LilTnjDArMqVnWA7VKU0cC9t2aFPRU';
    const range = 'A:L';
    const values = Sheets.Spreadsheets.Values.get(spreadsheetId, range).values;
    
    if (!values || values.length === 0) {
      console.log('No data found.');
      return;
    }
    
    const headers = values[0];
    const dataRows = values.slice(1);
    
    console.log(`Found ${dataRows.length} tutor records`);
    
    const activeTutors = [];
    
    for (const row of dataRows) {
      const tutor = { active: false };
      
      // Map spreadsheet columns to tutor object properties
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i];
        const value = row[i] || '';
        
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
    
    // Create the JavaScript array string
    let tutorsString = 'const tutors = [\n';
    
    activeTutors.forEach((tutor, index) => {
      tutorsString += '  {\n';
      tutorsString += `    name: "${tutor.name || ''}",\n`;
      tutorsString += `    grade: "${tutor.grade || ''}",\n`;
      tutorsString += `    major: "${tutor.major || ''}",\n`;
      tutorsString += `    bio: "${tutor.bio || ''}",\n`;
      tutorsString += `    tutorocean: "${tutor.tutorocean || ''}",\n`;
      tutorsString += `    standardized: "${tutor.standardized || 'N/A'}"\n`;
      tutorsString += index === activeTutors.length - 1 ? '  }\n' : '  },\n';
    });
    
    tutorsString += '];';
    
    // Send the data to your local server or save to a file
    // For now, we'll log it and you can copy it manually
    console.log('=== NEW TUTORS ARRAY ===');
    console.log(tutorsString);
    console.log('=== END OF ARRAY ===');
    
    // You can also send this to your local server if you set up a simple endpoint
    sendToLocalServer(tutorsString);
    
  } catch (error) {
    console.error('Error syncing tutor data:', error);
  }
}

function sendToLocalServer(tutorsString) {
  // This function can send the data to your local server
  // You'll need to set up a simple endpoint to receive this
  const payload = {
    tutors: tutorsString,
    timestamp: new Date().toISOString()
  };
  
  // For now, we'll just log it
  console.log('Data ready to send to local server:', payload);
}

// Manual trigger function (for testing)
function manualSync() {
  syncTutorData();
} 
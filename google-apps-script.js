// Google Apps Script to automatically sync when sheet changes
// Deploy this as a web app in Google Apps Script

function onEdit(e) {
  // Only trigger if the edit is in the main data range
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  
  // Check if edit is in the tutor data columns (A:L)
  if (range.getColumn() >= 1 && range.getColumn() <= 12) {
    // Trigger the sync
    triggerSync();
  }
}

function triggerSync() {
  // Replace with your actual sync endpoint URL
  const SYNC_URL = 'http://localhost:3000/sync-tutors';
  
  try {
    const response = UrlFetchApp.fetch(SYNC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_SECRET_TOKEN' // Add security
      },
      payload: JSON.stringify({
        timestamp: new Date().toISOString(),
        action: 'sheet_updated'
      })
    });
    
    console.log('Sync triggered successfully');
  } catch (error) {
    console.error('Error triggering sync:', error);
  }
}

// Manual trigger function (for testing)
function manualSync() {
  triggerSync();
} 
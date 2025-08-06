#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('🎓 HSA Tutoring - Google Sheets Integration Setup\n');
  
  try {
    // Check if .env exists
    const envPath = path.join(__dirname, '.env');
    if (await fs.pathExists(envPath)) {
      console.log('⚠️  .env file already exists. Skipping environment setup.');
    } else {
      console.log('📝 Setting up environment variables...\n');
      
      const spreadsheetId = await question('Enter your Google Spreadsheet ID: ');
      const sheetRange = await question('Enter sheet range (default: A:Z): ') || 'A:Z';
      
      const envContent = `# Google Sheets Configuration
GOOGLE_SPREADSHEET_ID=${spreadsheetId}
GOOGLE_SHEET_RANGE=${sheetRange}

# Google Service Account Credentials
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json

# Optional: Set to true to enable debug logging
DEBUG=false
`;
      
      await fs.writeFile(envPath, envContent);
      console.log('✅ Created .env file');
    }
    
    // Check if credentials.json exists
    const credentialsPath = path.join(__dirname, 'credentials.json');
    if (await fs.pathExists(credentialsPath)) {
      console.log('✅ Google credentials found');
    } else {
      console.log('\n⚠️  Google credentials not found.');
      console.log('Please follow the setup guide to create your credentials.json file:');
      console.log('📖 See: setup-google-sheets.md');
    }
    
    // Check if node_modules exists
    const nodeModulesPath = path.join(__dirname, 'node_modules');
    if (await fs.pathExists(nodeModulesPath)) {
      console.log('✅ Dependencies installed');
    } else {
      console.log('\n📦 Installing dependencies...');
      const { execSync } = require('child_process');
      try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('✅ Dependencies installed successfully');
      } catch (error) {
        console.error('❌ Failed to install dependencies:', error.message);
        console.log('Please run: npm install');
      }
    }
    
    console.log('\n🎉 Setup complete!');
    console.log('\nNext steps:');
    console.log('1. Make sure your Google Sheet is set up correctly');
    console.log('2. Share the sheet with your service account email');
    console.log('3. Test the sync: npm run sync');
    console.log('4. Set up automated sync (see setup-google-sheets.md)');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  setup();
}

module.exports = { setup }; 
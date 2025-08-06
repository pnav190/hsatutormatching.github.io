# Google Sheets Integration Setup Guide

This guide will help you set up automatic synchronization between your Google Sheets and the tutor matching application.

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click on it and press "Enable"

## Step 2: Create a Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: `tutor-sync-service`
   - Description: `Service account for tutor data synchronization`
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

## Step 3: Generate Service Account Key

1. In the Credentials page, find your service account and click on it
2. Go to the "Keys" tab
3. Click "Add Key" > "Create New Key"
4. Choose "JSON" format
5. Download the JSON file and save it as `credentials.json` in your project directory

## Step 4: Set Up Your Google Sheet

1. Create a new Google Sheet or use an existing one
2. Set up your columns with these headers (in the first row):
   - `Name` - Tutor's full name
   - `Grade` - Graduation year (e.g., "2027")
   - `Major` - Major/concentration
   - `Tests` - SAT/ACT scores (e.g., "1570 SAT, 36 ACT")
   - `Bio` - Tutor biography
   - `Subjects` - Subjects they can teach
   - `Standardized` - Standardized tests they can help with
   - `TutorOcean` - Booking link URL
   - `Languages` - Languages they speak

3. Add your tutor data starting from row 2
4. Share the sheet with your service account email (found in the credentials.json file) with "Viewer" permissions

## Step 5: Configure Environment Variables

1. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` with your actual values:
   ```env
   GOOGLE_SPREADSHEET_ID=your_actual_spreadsheet_id
   GOOGLE_SHEET_RANGE=A:Z
   GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
   ```

   To find your spreadsheet ID:
   - Open your Google Sheet
   - Look at the URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Copy the SPREADSHEET_ID part

## Step 6: Install Dependencies

```bash
npm install
```

## Step 7: Test the Sync

Run the sync script to test the connection:

```bash
npm run sync
```

You should see output like:
```
Starting tutor data sync...
Fetching data from Google Sheets...
Found 25 tutor records
Headers: ['Name', 'Grade', 'Major', 'Tests', 'Bio', 'Subjects', 'Standardized', 'TutorOcean', 'Languages']
Successfully processed 25 tutors
Reading HTML file...
Successfully updated HTML file with new tutor data
✅ Tutor data sync completed successfully!
Updated 25 tutors in the application
```

## Step 8: Set Up Automated Sync (Optional)

### Option A: Cron Job (Linux/Mac)
Add to your crontab to run daily at 2 AM:
```bash
0 2 * * * cd /path/to/your/project && npm run sync
```

### Option B: GitHub Actions (Recommended)
Create `.github/workflows/sync-tutors.yml`:

```yaml
name: Sync Tutor Data

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Setup Google credentials
      run: |
        echo '${{ secrets.GOOGLE_CREDENTIALS }}' > credentials.json
    
    - name: Sync tutor data
      env:
        GOOGLE_SPREADSHEET_ID: ${{ secrets.GOOGLE_SPREADSHEET_ID }}
        GOOGLE_APPLICATION_CREDENTIALS: ./credentials.json
      run: npm run sync
    
    - name: Commit changes
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add Dynamic.html
        git commit -m "Auto-sync tutor data from Google Sheets" || exit 0
        git push
```

## Troubleshooting

### Common Issues:

1. **"No data found in spreadsheet"**
   - Check that your spreadsheet has data starting from row 2
   - Verify the sheet range in your .env file

2. **"Could not find tutors array in HTML file"**
   - Make sure the HTML file contains `const tutors = [` in the JavaScript section

3. **Authentication errors**
   - Verify your credentials.json file is correct
   - Ensure the service account has access to the spreadsheet

4. **Permission denied**
   - Share the spreadsheet with your service account email
   - Make sure the service account has at least "Viewer" permissions

### Getting Help

If you encounter issues:
1. Check the console output for specific error messages
2. Verify your Google Cloud project has the Sheets API enabled
3. Ensure your service account has the correct permissions
4. Test with a simple spreadsheet first to verify the setup 
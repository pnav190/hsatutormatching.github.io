# Automatic Sync Setup Guide

This guide will help you set up automatic synchronization between your Google Sheet and your tutor matching application.

## 🚀 **Option 1: Google Apps Script (Recommended)**

### **Step 1: Set up Google Apps Script**

1. **Go to [Google Apps Script](https://script.google.com/)**
2. **Create a new project**
3. **Copy the code from `google-apps-script.js`**
4. **Replace the SYNC_URL with your actual endpoint**
5. **Deploy as a web app**

### **Step 2: Set up the webhook server**

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Add webhook secret to your .env file:**
   ```env
   WEBHOOK_SECRET=your-secret-token-here
   ```

3. **Start the webhook server:**
   ```bash
   npm run webhook
   ```

4. **Make it publicly accessible** (using ngrok or similar):
   ```bash
   npx ngrok http 3000
   ```

### **Step 3: Connect Google Apps Script to your server**

1. **Update the SYNC_URL in `google-apps-script.js`** with your ngrok URL
2. **Update the authorization header** with your webhook secret
3. **Deploy the Apps Script**

## 🔄 **Option 2: GitHub Actions (Daily Sync)**

The `.github/workflows/sync-tutors.yml` file will automatically sync daily.

## 🔄 **Option 3: Cron Job (Local Automatic)**

```bash
# Add to your crontab to run every 5 minutes
*/5 * * * * cd "/Users/eddielou/tutor match/tutor match" && npm run sync
```

## 🔄 **Option 4: Manual Sync (Current)**

```bash
npm run sync
```

## 🎯 **Recommended Setup**

For immediate automatic sync, I recommend **Option 1** (Google Apps Script + Webhook Server):

1. ✅ **Instant updates** when sheet changes
2. ✅ **No polling** required
3. ✅ **Reliable** and secure
4. ✅ **Free** to use

## 🔧 **Testing the Setup**

1. **Start the webhook server:**
   ```bash
   npm run webhook
   ```

2. **Test the endpoint:**
   ```bash
   curl -X POST http://localhost:3000/sync-tutors \
     -H "Authorization: Bearer your-secret-token-here" \
     -H "Content-Type: application/json"
   ```

3. **Make a change to your Google Sheet** and watch the sync happen automatically!

## 📝 **Next Steps**

1. Choose your preferred option
2. Follow the setup steps
3. Test the automatic sync
4. Enjoy real-time updates! 🎉 
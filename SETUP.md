# Waitlist Setup Guide

## Email Notifications Setup

### FormSubmit.co (Current Setup)
Your form is configured to send emails to: **onsight565@gmail.com**

**First-time activation required:**
1. Submit the form once with any test data
2. Check onsight565@gmail.com inbox
3. Click the verification link from FormSubmit.co
4. After verification, all future submissions will be emailed to you

---

## Google Sheets Storage (Recommended)

Store all waitlist submissions permanently in a Google Sheet that you can access anytime.

### Step 1: Create a Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "OnSight Waitlist"
4. In the first row, add these headers:
   - A1: `Name`
   - B1: `Email`
   - C1: `Travel Date`
   - D1: `Interest`
   - E1: `Timestamp`
   - F1: `User Agent`

### Step 2: Create Google Apps Script
1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any existing code
3. Paste this code:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      data.name || '',
      data.email || '',
      data.travelDate || '',
      data.interest || '',
      data.timestamp || new Date().toISOString(),
      data.userAgent || ''
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      'result': 'success'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({
      'result': 'error',
      'error': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click **Save** (disk icon)
5. Name the project "Waitlist Handler"

### Step 3: Deploy as Web App
1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure:
   - Description: "Waitlist Form Handler"
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**
6. Click **Authorize access**
7. Choose your Google account
8. Click **Advanced** → **Go to Waitlist Handler (unsafe)**
9. Click **Allow**
10. **Copy the Web App URL** (looks like: `https://script.google.com/macros/s/...../exec`)

### Step 4: Update Your Website
1. Open `script.js`
2. Find this line:
   ```javascript
   const GOOGLE_SHEET_URL = "YOUR_GOOGLE_SHEET_WEB_APP_URL_HERE";
   ```
3. Replace with your Web App URL:
   ```javascript
   const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/YOUR_ACTUAL_URL/exec";
   ```
4. Save the file
5. Push to GitHub

---

## Testing

1. Open your waitlist page
2. Fill out the form with test data
3. Submit the form
4. Check:
   - ✅ Google Sheet has a new row with your data
   - ✅ Email received at onsight565@gmail.com (after FormSubmit verification)
   - ✅ Success message appears on the page

---

## Viewing Your Waitlist Data

### Option 1: Google Sheets (Recommended)
- Open your Google Sheet anytime to see all submissions
- Export as CSV/Excel for analysis
- Share with team members

### Option 2: LocalStorage (Browser Only)
- Open browser console (F12)
- Type: `JSON.parse(localStorage.getItem('waitlist'))`
- Shows submissions from that specific browser only

### Option 3: Email Notifications
- Check onsight565@gmail.com for individual submission emails

---

## Troubleshooting

**Not receiving emails?**
- Check spam folder
- Verify FormSubmit.co activation link was clicked
- Try submitting the form again

**Google Sheets not working?**
- Verify the Web App URL is correct in script.js
- Check that deployment is set to "Anyone" can access
- Look at Google Apps Script logs: Apps Script → Executions

**Need help?**
Contact: onsight565@gmail.com

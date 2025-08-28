# 🔧 Quick OAuth Setup - Fix Authorization Error

## **URGENT: Fix the "Access blocked: authorisation error"**

You're getting this error because the OAuth application isn't properly configured. Follow these steps:

### **Step 1: Google Cloud Console Setup**

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project** (or use existing)
3. **Enable billing** (required for creating new projects)

### **Step 2: Enable Required APIs**

Go to "APIs & Services" → "Library" and enable:
- ✅ **Google+ API**
- ✅ **Cloud Resource Manager API** 
- ✅ **Service Usage API**
- ✅ **Firebase Management API**
- ✅ **Cloud Functions API**

### **Step 3: Create OAuth 2.0 Credentials**

1. **Go to "APIs & Services" → "Credentials"**
2. **Click "Create Credentials" → "OAuth 2.0 Client IDs"**
3. **Choose "Web application"**
4. **Add Authorized redirect URIs:**
   ```
   https://mwl-impact.web.app/provision/callback
   http://localhost:5173/provision/callback
   ```
5. **Copy the Client ID and Client Secret**

### **Step 4: Set Environment Variables**

Create `.env.local` file in your project root:

```env
VITE_APP_URL=https://mwl-impact.web.app
VITE_GOOGLE_CLIENT_ID=your-oauth-client-id-here
VITE_GOOGLE_CLIENT_SECRET=your-oauth-client-secret-here
```

### **Step 5: Redeploy**

```bash
npm run build
firebase deploy --only hosting
```

### **Step 6: Test**

Visit: https://mwl-impact.web.app
Click "Get your own IMPACT Management System"

---

## **Alternative: Use Test Mode**

If you want to test immediately without full OAuth setup:

1. **In Google Cloud Console** → "OAuth consent screen"
2. **Add test users** (your email addresses)
3. **Set app to "Testing" mode**
4. **This allows testing without full verification**

---

## **Common Issues:**

❌ **"invalid_request"** → Missing or incorrect OAuth credentials
❌ **"redirect_uri_mismatch"** → Wrong redirect URI in Google Console
❌ **"unauthorized_client"** → Client ID/Secret mismatch

---

**Need help?** Check the full setup guide: `PROVISIONING_SETUP.md`

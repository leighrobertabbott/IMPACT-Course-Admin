# IMPACT Course Admin - Cloud Shell Setup

## Welcome to IMPACT Course Management System Setup!

This guide will help you set up your own IMPACT Course Management System using Google Cloud Shell.

## ⚠️ Important Note

**This setup requires technical knowledge.** If you're not comfortable with command-line tools, we recommend our **"We'll Set It Up For You"** service instead.

**Email us:** setup@impact-course.com

---

## What We'll Create

- ✅ **Firebase Project** with your hospital name
- ✅ **Firestore Database** for course data
- ✅ **Authentication System** for users and faculty
- ✅ **Hosting** for your website
- ✅ **Complete IMPACT System** deployed and ready to use

## Prerequisites

- Google account with billing enabled
- Basic familiarity with command-line tools
- About 10-15 minutes of setup time

## Quick Setup (Copy-Paste Method)

**Step 1:** Copy and paste this entire script into your Cloud Shell terminal:

```bash
#!/bin/bash
set -e

echo "🚀 IMPACT Course Management System - Automated Setup"
echo "=================================================="
echo ""

# Get hospital name
echo "Step 1: Enter your hospital name"
echo "Enter a short name for your hospital (letters, numbers, hyphens only):"
echo "Examples: whiston-hospital, liverpool-nhs, manchester-trust"
echo ""
read -rp "Hospital name: " HOSPITAL_NAME

# Validate and clean hospital name
if [[ -z "${HOSPITAL_NAME}" ]]; then
    echo "❌ Hospital name is required. Please run the script again."
    exit 1
fi

# Clean slug (lowercase, replace invalid chars with hyphens)
SLUG=$(echo "$HOSPITAL_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g' | sed 's/-\+/-/g' | sed 's/^-\|-$//g')

if [[ -z "${SLUG}" ]]; then
    echo "❌ Invalid hospital name. Please use only letters, numbers, and hyphens."
    exit 1
fi

# Generate unique project ID
PROJECT_ID="${SLUG}-impact-$(date +%s)"
DISPLAY_NAME="IMPACT - ${HOSPITAL_NAME}"

echo ""
echo "✅ Hospital name: ${HOSPITAL_NAME}"
echo "✅ Project ID: ${PROJECT_ID}"
echo ""

# Check if gcloud is available
if ! command -v gcloud >/dev/null 2>&1; then
    echo "❌ Google Cloud CLI (gcloud) is not available."
    echo "   Please ensure you're running this in Google Cloud Shell."
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ You need to be logged into Google Cloud."
    echo "   Please run: gcloud auth login"
    exit 1
fi

echo "Step 2: Creating your Firebase project..."
echo "========================================"

# Create GCP project
echo "Creating project: ${PROJECT_ID}"
gcloud projects create "${PROJECT_ID}" --name="${DISPLAY_NAME}" --quiet

# Set as default project
gcloud config set project "${PROJECT_ID}"

echo "✅ Project created successfully"
echo ""

echo "Step 3: Enabling required services..."
echo "===================================="

# Enable required APIs
echo "Enabling Firebase and related APIs..."
gcloud services enable \
    firebase.googleapis.com \
    firestore.googleapis.com \
    firebasehosting.googleapis.com \
    identitytoolkit.googleapis.com \
    cloudresourcemanager.googleapis.com \
    serviceusage.googleapis.com \
    --quiet

echo "✅ APIs enabled successfully"
echo ""

echo "Step 4: Setting up Firebase..."
echo "=============================="

# Install Firebase CLI if not available
if ! command -v firebase >/dev/null 2>&1; then
    echo "Installing Firebase CLI..."
    npm install -g firebase-tools >/dev/null 2>&1
fi

# Login to Firebase (this will open a browser window)
echo "Logging into Firebase..."
firebase login --no-localhost

# Add Firebase to project
echo "Adding Firebase to your project..."
firebase projects:addfirebase "${PROJECT_ID}"

echo "✅ Firebase setup complete"
echo ""

echo "Step 5: Creating Firestore database..."
echo "====================================="

# Create Firestore database
echo "Creating Firestore database in europe-west2..."
gcloud firestore databases create \
    --database="(default)" \
    --location="europe-west2" \
    --type=firestore-native \
    --quiet

echo "✅ Firestore database created"
echo ""

echo "Step 6: Creating Firebase Web App..."
echo "===================================="

# Create Firebase Web App
echo "Creating Firebase Web App..."
APP_JSON=$(firebase apps:create WEB "IMPACT Web" --project "${PROJECT_ID}" --json)
APP_ID=$(echo "$APP_JSON" | grep -o '"appId":"[^"]*' | cut -d'"' -f4)

# Get Firebase config
echo "Getting Firebase configuration..."
SDK_JSON=$(firebase apps:sdkconfig WEB "${APP_ID}" --project "${PROJECT_ID}" --json)

# Extract config values
API_KEY=$(echo "$SDK_JSON" | grep -o '"apiKey":"[^"]*' | cut -d'"' -f4)
AUTH_DOMAIN="${PROJECT_ID}.firebaseapp.com"
PROJECT_ID_OUT="${PROJECT_ID}"
STORAGE_BUCKET="${PROJECT_ID}.appspot.com"
MSG_SENDER_ID=$(echo "$SDK_JSON" | grep -o '"messagingSenderId":"[^"]*' | cut -d'"' -f4)
APP_ID_OUT=$(echo "$SDK_JSON" | grep -o '"appId":"[^"]*' | cut -d'"' -f4)

echo "✅ Firebase Web App created"
echo ""

echo "Step 7: Cloning and building your IMPACT system..."
echo "================================================"

# Clone the IMPACT repository
echo "Cloning IMPACT Course Management System..."
git clone https://github.com/leighrobertabbott/IMPACT-Course-Admin.git impact-temp
cd impact-temp

# Install dependencies
echo "Installing dependencies..."
npm ci

# Create Firebase config file
echo "Creating Firebase configuration..."
mkdir -p web-config
cat > web-config/firebaseConfig.json <<EOF
{
  "apiKey": "${API_KEY}",
  "authDomain": "${AUTH_DOMAIN}",
  "projectId": "${PROJECT_ID_OUT}",
  "storageBucket": "${STORAGE_BUCKET}",
  "messagingSenderId": "${MSG_SENDER_ID}",
  "appId": "${APP_ID_OUT}"
}
EOF

# Build the application
echo "Building the application..."
npm run build

# Initialize Firebase Hosting
echo "Setting up Firebase Hosting..."
firebase init hosting --project "${PROJECT_ID}" --public dist --yes

# Deploy to Firebase Hosting
echo "Deploying to Firebase Hosting..."
firebase deploy --only hosting --project "${PROJECT_ID}"

# Clean up
cd ..
rm -rf impact-temp

echo ""
echo "🎉 SUCCESS! Your IMPACT system is ready!"
echo "========================================"
echo ""
echo "Your live site: https://${PROJECT_ID}.web.app"
echo ""
echo "Next steps:"
echo "1. Open your site: https://${PROJECT_ID}.web.app"
echo "2. Complete the setup wizard to create your admin account"
echo "3. Add your hospital details and start creating courses!"
echo ""
echo "Need help? Contact: support@impact-course.com"
echo ""
echo "Firebase Console: https://console.firebase.google.com/project/${PROJECT_ID}"
echo ""

# Save project info to file
cat > impact-setup-info.txt <<EOF
IMPACT Course Management System Setup
====================================

Hospital Name: ${HOSPITAL_NAME}
Project ID: ${PROJECT_ID}
Live Site: https://${PROJECT_ID}.web.app
Firebase Console: https://console.firebase.google.com/project/${PROJECT_ID}

Firebase Configuration:
{
  "apiKey": "${API_KEY}",
  "authDomain": "${AUTH_DOMAIN}",
  "projectId": "${PROJECT_ID_OUT}",
  "storageBucket": "${STORAGE_BUCKET}",
  "messagingSenderId": "${MSG_SENDER_ID}",
  "appId": "${APP_ID_OUT}"
}

Contact: setup@impact-course.com
Phone: 0151 705 7428
EOF

echo "✅ Setup information saved to: impact-setup-info.txt"
```

**Step 2:** Press Enter to run the script

**Step 3:** Follow the prompts to enter your hospital name

**Step 4:** Wait for the deployment to complete (about 10-15 minutes)

**Step 5:** Visit your live site and complete the setup wizard

---

## Alternative: We'll Do Everything For You

**This is much easier!** We can set up your entire IMPACT system for you:

1. **Email us** at setup@impact-course.com
2. **Tell us your hospital name** and contact details
3. **We'll create everything** - Firebase project, database, website, admin account
4. **You'll get login details** and a live website

**Cost:** Free setup service

## Need Help?

- **Email:** setup@impact-course.com
- **Phone:** 0151 705 7428
- **Support Hours:** Monday-Friday, 9am-5pm

## Why Choose "We'll Set It Up For You"?

✅ **No technical knowledge required**
✅ **No command-line tools needed**
✅ **No GitHub accounts required**
✅ **We handle all the complexity**
✅ **You get a working system in 24 hours**
✅ **Free setup service**

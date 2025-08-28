#!/usr/bin/env bash
set -euo pipefail

echo "🚀 IMPACT Course Management System - One-Click Setup"
echo "=================================================="
echo ""

# Check if we're in Cloud Shell
if [[ -z "${CLOUDSHELL_ENVIRONMENT:-}" ]]; then
    echo "⚠️  Warning: This script is designed to run in Google Cloud Shell."
    echo "   It may not work correctly in other environments."
    echo ""
fi

# Get site name from user
echo "Step 1: Choose your site name"
echo "Enter a short name for your site (letters, numbers, hyphens only):"
echo "Examples: whiston-impact, liverpool-nhs, manchester-trust"
echo ""
read -rp "Site name: " SLUG

# Validate slug
if [[ -z "${SLUG}" ]]; then
    echo "❌ Site name is required. Please run the script again."
    exit 1
fi

# Clean slug (lowercase, replace invalid chars with hyphens)
SLUG=$(echo "$SLUG" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g' | sed 's/-\+/-/g' | sed 's/^-\|-$//g')

if [[ -z "${SLUG}" ]]; then
    echo "❌ Invalid site name. Please use only letters, numbers, and hyphens."
    exit 1
fi

# Generate unique project ID
PROJECT_ID="${SLUG}-$(tr -dc a-z0-9 </dev/urandom | head -c 6)"
DISPLAY_NAME="IMPACT - ${SLUG}"

echo ""
echo "✅ Site name: ${SLUG}"
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

echo "Step 7: Building and deploying your IMPACT system..."
echo "==================================================="

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

#!/bin/bash

# IMPACT Course Management System - One-Click Setup Script
# This script automatically sets up a complete IMPACT system for your hospital

echo "🚀 IMPACT Course Management System - One-Click Setup"
echo "=================================================="
echo ""

# Check if gcloud is available
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: Google Cloud CLI is not available."
    echo "Please make sure you're running this in Google Cloud Shell."
    exit 1
fi

# Get hospital name
echo "🏥 Please enter your hospital name (e.g., 'Whiston Hospital'):"
read -r hospital_name

if [ -z "$hospital_name" ]; then
    echo "❌ Hospital name is required. Exiting."
    exit 1
fi

# Create a clean project ID from hospital name (max 30 chars)
base_id=$(echo "$hospital_name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/-\+/-/g' | sed 's/^-\|-$//g')
# Truncate to fit within 30 char limit, leaving room for timestamp
max_base_length=$((30 - 10))  # 10 chars for timestamp
if [ ${#base_id} -gt $max_base_length ]; then
    base_id=$(echo "$base_id" | cut -c1-$max_base_length)
fi
timestamp=$(date +%s | tail -c 6)  # Use last 6 digits of timestamp
project_id="${base_id}-${timestamp}"

echo ""
echo "📋 Setup Summary:"
echo "   Hospital: $hospital_name"
echo "   Project ID: $project_id"
echo ""

# Confirm setup
echo "Do you want to proceed with the setup? (y/N):"
read -r confirm

if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
echo "🔄 Starting setup process..."
echo ""

# Step 1: Create new project
echo "1️⃣ Creating new Google Cloud project..."
gcloud projects create "$project_id" --name="$hospital_name IMPACT System"

if [ $? -ne 0 ]; then
    echo "❌ Failed to create project. Please check your permissions."
    exit 1
fi

# Step 2: Set the project
echo "2️⃣ Setting project as default..."
gcloud config set project "$project_id"

echo ""
echo "💰 Billing Setup Required"
echo "========================="
echo "Your IMPACT system needs billing enabled for Cloud Functions."
echo "Don't worry - this is just to verify your account."
echo "You'll only be charged if you exceed free quotas (very unlikely)."
echo ""

# Step 3: Auto-open billing page and wait for setup
echo "4️⃣ Opening billing setup page..."
echo "Please complete these steps:"
echo "1. Click 'Authorize' if prompted"
echo "2. Click 'Link Billing Account'"
echo "3. Select or create a billing account"
echo "4. Click 'Continue'"
echo ""

# Open the billing page automatically
billing_url="https://console.cloud.google.com/billing/projects/$project_id"
echo "Opening: $billing_url"
if command -v xdg-open &> /dev/null; then
    xdg-open "$billing_url"
elif command -v open &> /dev/null; then
    open "$billing_url"
else
    echo "Please manually open: $billing_url"
fi

echo ""
echo "⏳ Waiting for billing to be enabled..."
echo "The script will continue automatically once billing is linked."
echo ""

# Poll for billing status
while true; do
    billing_status=$(gcloud billing projects describe "$project_id" --format="value(billingAccountName)" 2>/dev/null)
    if [ -n "$billing_status" ] && [ "$billing_status" != "" ]; then
        echo "✅ Billing enabled successfully!"
        break
    fi
    echo "⏳ Still waiting for billing setup... (checking every 10 seconds)"
    sleep 10
done

echo ""

# Step 5: Enable required APIs
echo "5️⃣ Enabling required APIs..."
gcloud services enable firebase.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable firebasehosting.googleapis.com
gcloud services enable identitytoolkit.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Step 6: Initialize Firebase
echo "6️⃣ Initializing Firebase..."
firebase projects:addfirebase "$project_id"

# Step 7: Create Firestore database
echo "7️⃣ Creating Firestore database..."
gcloud firestore databases create --region=europe-west2 --project="$project_id"

# Step 8: Create Firebase web app
echo "8️⃣ Creating Firebase web app..."
firebase apps:create WEB "$hospital_name IMPACT" --project="$project_id"

# Step 9: Get Firebase config
echo "9️⃣ Getting Firebase configuration..."
firebase_config=$(firebase apps:sdkconfig WEB --project="$project_id" --json)

# Step 10: Create web-config directory and save config
echo "🔟 Saving Firebase configuration..."
mkdir -p web-config
echo "$firebase_config" > web-config/firebaseConfig.json

# Step 11: Install dependencies
echo "1️⃣1️⃣ Installing dependencies..."
npm install

# Step 12: Build the application
echo "1️⃣2️⃣ Building the application..."
npm run build

# Step 13: Deploy to Firebase Hosting
echo "1️⃣3️⃣ Deploying to Firebase Hosting..."
firebase deploy --only hosting --project="$project_id"

# Step 14: Get the live URL
echo "1️⃣4️⃣ Getting your live URL..."
live_url=$(firebase hosting:channel:list --project="$project_id" --json | jq -r '.result.channels[0].url // empty')

if [ -z "$live_url" ]; then
    live_url="https://$project_id.web.app"
fi

echo ""
echo "🎉 SETUP COMPLETE!"
echo "=================="
echo ""
echo "🏥 Your IMPACT Course Management System is now live!"
echo "🌐 Live URL: $live_url"
echo ""
echo "💳 Billing Information:"
echo "• Billing enabled for Cloud Functions"
echo "• Works within Google's free quotas"
echo "• Only charged if you exceed free limits"
echo ""
echo "📋 Next Steps:"
echo "1. Visit your live site: $live_url"
echo "2. Complete the admin setup wizard"
echo "3. Create your first admin account"
echo "4. Add your hospital details"
echo "5. Start creating IMPACT courses!"
echo ""
echo "📞 Need help? Contact: setup@impact-course.com"
echo ""
echo "✅ Setup completed successfully!"

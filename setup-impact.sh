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
echo "🆓 Using Free Tier Services"
echo "=========================="
echo "This setup uses only free-tier services - no billing required!"
echo "Your IMPACT system will work within Google's free quotas."
echo ""

# Step 4: Enable required APIs (Free Tier Only)
echo "3️⃣ Enabling required APIs (Free Tier)..."
gcloud services enable firebase.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable firebasehosting.googleapis.com
gcloud services enable identitytoolkit.googleapis.com

# Step 5: Initialize Firebase
echo "4️⃣ Initializing Firebase..."
firebase projects:addfirebase "$project_id"

# Step 6: Create Firestore database
echo "5️⃣ Creating Firestore database..."
gcloud firestore databases create --region=europe-west2 --project="$project_id"

# Step 7: Create Firebase web app
echo "6️⃣ Creating Firebase web app..."
firebase apps:create WEB "$hospital_name IMPACT" --project="$project_id"

# Step 8: Get Firebase config
echo "7️⃣ Getting Firebase configuration..."
firebase_config=$(firebase apps:sdkconfig WEB --project="$project_id" --json)

# Step 9: Create web-config directory and save config
echo "8️⃣ Saving Firebase configuration..."
mkdir -p web-config
echo "$firebase_config" > web-config/firebaseConfig.json

# Step 10: Install dependencies
echo "9️⃣ Installing dependencies..."
npm install

# Step 11: Build the application
echo "🔨 Building the application..."
npm run build

# Step 12: Deploy to Firebase Hosting (Free Tier)
echo "🚀 Deploying to Firebase Hosting (Free Tier)..."
firebase deploy --only hosting --project="$project_id"

# Step 13: Get the live URL
echo "10️⃣ Getting your live URL..."
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
echo "🆓 Free Tier Benefits:"
echo "• No billing required"
echo "• Works within Google's free quotas"
echo "• Hosting, Firestore, and Auth included"
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

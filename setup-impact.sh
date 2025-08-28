#!/usr/bin/env bash
set -euo pipefail

# ---------- CONFIGURE THESE ----------
REGION="europe-west2"           # Firestore & (optional) Functions region
BUILD_DIR="dist"                # Your static build directory ('out' for Next export, 'dist' for Vite)
NEED_FUNCTIONS="yes"            # "yes" if you must deploy Cloud Functions
# ------------------------------------

echo "🚀 IMPACT Course Management System - One-Click Setup"
echo "===================================================="
echo

# 0) Pre-checks
if ! command -v gcloud >/dev/null; then
  echo "❌ Google Cloud CLI not found. Please use Google Cloud Shell."; exit 1
fi

# 1) Install Firebase CLI if missing
if ! command -v firebase >/dev/null; then
  echo "🔧 Installing Firebase CLI..."
  npm install -g firebase-tools >/dev/null 2>&1
fi

# 2) Ask hospital name → make a valid project id (<= 30 chars)
echo -n "🏥 Enter your hospital name (e.g. 'Whiston Hospital'): "
read HOSPITAL
[ -z "${HOSPITAL}" ] && { echo "❌ Hospital name is required."; exit 1; }

BASE_ID=$(echo "$HOSPITAL" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g;s/-\+/-/g;s/^-//;s/-$//')
MAX_BASE=$((30-7)) # leave 7 for suffix
[ ${#BASE_ID} -gt $MAX_BASE ] && BASE_ID="${BASE_ID:0:$MAX_BASE}"
SUFFIX=$(date +%s | tail -c 6)
PROJECT_ID="${BASE_ID}-${SUFFIX}"

echo
echo "📋 Summary:"
echo "  Hospital   : $HOSPITAL"
echo "  Project ID : $PROJECT_ID"
echo -n "Proceed? (y/N): "
read OK; [[ ! "$OK" =~ ^[Yy]$ ]] && { echo "Cancelled."; exit 0; }

# 3) Create project (idempotent-ish)
echo "1️⃣  Creating project..."
if gcloud projects describe "$PROJECT_ID" >/dev/null 2>&1; then
  echo "ℹ️  Project already exists."
else
  gcloud projects create "$PROJECT_ID" --name="$HOSPITAL IMPACT System"
fi
gcloud config set project "$PROJECT_ID" >/dev/null

# 4) Optional: billing auto-link (advanced users)
echo -n "Have a Billing Account ID to auto-link? (leave blank to open the billing page): "
read BILLING
if [ -n "${BILLING:-}" ]; then
  echo "🔗 Linking billing account $BILLING..."
  gcloud beta billing projects link "$PROJECT_ID" --billing-account="$BILLING" || true
fi

# 5) If not linked, open billing page & poll until linked (required if NEED_FUNCTIONS=yes)
if [ "$NEED_FUNCTIONS" = "yes" ]; then
  echo
  echo "💳 Cloud Functions require billing. We'll help you link it."
  URL="https://console.cloud.google.com/billing/projects/$PROJECT_ID"
  echo "📋 Please follow these steps:"
  echo "1. Open this URL in a new tab: $URL"
  echo "2. Click 'Link a billing account'"
  echo "3. Select or create a billing account"
  echo "4. Wait for the page to confirm billing is linked"
  echo
  echo "⏳ The script will check every 8 seconds for billing to be enabled..."
  for i in {1..60}; do
    LINKED=$(gcloud beta billing projects describe "$PROJECT_ID" --format="value(billingEnabled)" 2>/dev/null || echo "False")
    [ "$LINKED" = "True" ] && { echo "✅ Billing enabled!"; break; }
    echo "   Checking... (attempt $i/60)"
    sleep 8
    [ $i -eq 60 ] && { echo "❌ Billing not linked after 8 minutes. Please link billing and re-run the script."; exit 1; }
  done
fi

# 6) Enable required APIs
echo "2️⃣  Enabling APIs..."
APIS=( firebase.googleapis.com firestore.googleapis.com firebasehosting.googleapis.com identitytoolkit.googleapis.com )
if [ "$NEED_FUNCTIONS" = "yes" ]; then
  APIS+=( cloudfunctions.googleapis.com cloudbuild.googleapis.com run.googleapis.com )
fi
gcloud services enable "${APIS[@]}" >/dev/null

# 7) Add Firebase to the project (idempotent)
echo "3️⃣  Adding Firebase to project..."
firebase projects:addfirebase "$PROJECT_ID" >/dev/null || echo "ℹ️  Firebase already added."

# 8) Create Firestore database (default) if missing
echo "4️⃣  Ensuring Firestore database exists..."
if gcloud firestore databases describe --database="(default)" >/dev/null 2>&1; then
  echo "ℹ️  Firestore already exists."
else
  gcloud firestore databases create --region="$REGION" >/dev/null
fi

# 9) Create a Firebase Web App and get its config
echo "5️⃣  Creating Firebase Web App & fetching config..."
APP_JSON=$(firebase apps:create WEB "$HOSPITAL IMPACT" --project "$PROJECT_ID" --json 2>/dev/null || true)
APP_ID=$(echo "$APP_JSON" | grep -o '"appId":"[^"]*' | cut -d'"' -f4 || true)
if [ -z "$APP_ID" ]; then
  # fall back: list existing web apps and take the first
  APP_ID=$(firebase apps:list --project "$PROJECT_ID" --json | jq -r '.result[] | select(.platform=="WEB") | .appId' | head -n1)
fi
[ -z "$APP_ID" ] && { echo "❌ Could not obtain a Web App ID."; exit 1; }
SDK_JSON=$(firebase apps:sdkconfig WEB "$APP_ID" --project "$PROJECT_ID" --json)

# 10) Write runtime config into build output
echo "6️⃣  Writing runtime Firebase config..."
mkdir -p "$BUILD_DIR/web-config"
echo "$SDK_JSON" > "$BUILD_DIR/web-config/firebaseConfig.json"

# 11) Ensure firebase.json exists & points hosting to BUILD_DIR
echo "7️⃣  Preparing firebase.json..."
if [ ! -f firebase.json ]; then
  cat > firebase.json <<JSON
{
  "hosting": {
    "public": "$BUILD_DIR",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
JSON
fi

# 12) Build the app (static)
echo "8️⃣  Installing deps & building app..."
if [ -f package-lock.json ]; then npm ci; else npm install; fi
npm run build

# 13) Deploy (hosting + optional functions)
echo "9️⃣  Deploying to Firebase..."
if [ "$NEED_FUNCTIONS" = "yes" ]; then
  # optional: build functions first if your repo needs it
  # (cd functions && npm ci && npm run build)
  firebase deploy --only functions,hosting --project "$PROJECT_ID"
else
  firebase deploy --only hosting --project "$PROJECT_ID"
fi

# 14) Show live URL
LIVE_URL="https://${PROJECT_ID}.web.app"
echo
echo "🎉 Setup Complete!"
echo "🌐 Your site: $LIVE_URL"
echo "➡️  Open /setup to finish admin onboarding."

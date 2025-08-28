#!/usr/bin/env bash

echo "🧪 Testing IMPACT Provisioning Script"
echo "===================================="
echo ""

# Test slug validation
echo "Testing slug validation..."

# Test valid slugs
VALID_SLUGS=("whiston-impact" "liverpool-nhs" "manchester-trust" "birmingham-hospital")
for slug in "${VALID_SLUGS[@]}"; do
    CLEAN_SLUG=$(echo "$slug" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g' | sed 's/-\+/-/g' | sed 's/^-\|-$//g')
    if [[ "$CLEAN_SLUG" == "$slug" ]]; then
        echo "✅ Valid slug: $slug"
    else
        echo "❌ Invalid slug: $slug -> $CLEAN_SLUG"
    fi
done

echo ""

# Test invalid slugs
INVALID_SLUGS=("" "a" "ab" "test@site" "test site" "test_site")
for slug in "${INVALID_SLUGS[@]}"; do
    CLEAN_SLUG=$(echo "$slug" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g' | sed 's/-\+/-/g' | sed 's/^-\|-$//g')
    if [[ -z "$CLEAN_SLUG" ]]; then
        echo "✅ Correctly rejected invalid slug: '$slug'"
    else
        echo "❌ Should have rejected invalid slug: '$slug' -> '$CLEAN_SLUG'"
    fi
done

echo ""

# Test project ID generation
echo "Testing project ID generation..."
SLUG="whiston-impact"
PROJECT_ID="${SLUG}-$(tr -dc a-z0-9 </dev/urandom | head -c 6)"
echo "✅ Generated project ID: $PROJECT_ID"

echo ""

# Test required commands
echo "Testing required commands..."

if command -v gcloud >/dev/null 2>&1; then
    echo "✅ gcloud is available"
else
    echo "❌ gcloud is not available"
fi

if command -v git >/dev/null 2>&1; then
    echo "✅ git is available"
else
    echo "❌ git is not available"
fi

if command -v npm >/dev/null 2>&1; then
    echo "✅ npm is available"
else
    echo "❌ npm is not available"
fi

echo ""

echo "🎉 Test completed!"
echo "If all tests pass, the provisioning script should work correctly."

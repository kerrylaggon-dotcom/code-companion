#!/bin/bash
# Script untuk setup EAS build tanpa interactive eas init

set -e

echo "🚀 Setting up EAS Build..."

# Pastikan EXPO_TOKEN ada
if [ -z "$EXPO_TOKEN" ]; then
    echo "❌ Error: EXPO_TOKEN tidak ditemukan"
    exit 1
fi

# Run EAS build
echo "📦 Building APK..."
npx eas-cli build --platform android --non-interactive --wait

echo "✅ Build selesai!"
echo "📥 Cek hasil di: https://expo.dev/projects"

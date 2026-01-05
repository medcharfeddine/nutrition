#!/bin/bash

# NutriEd - Quick Start Script

echo "🚀 NutriEd Platform - Quick Start"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo ""
    echo "⚠️  .env.local file not found!"
    echo "Please create .env.local with the following variables:"
    echo ""
    echo "MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nutrition-saas"
    echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"
    echo "NEXTAUTH_URL=http://localhost:3000"
    echo "NODE_ENV=development"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "✅ .env.local file found"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Start development server
echo ""
echo "🎉 Starting development server..."
echo "Visit http://localhost:3000 in your browser"
echo ""

npm run dev

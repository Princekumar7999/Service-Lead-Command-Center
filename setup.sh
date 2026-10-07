#!/usr/bin/env bash
set -e

echo "=================================================="
echo "🚀 Setting up Gushwork FollowUp Command Center"
echo "=================================================="

# Copy environment template if not present
if [ ! -f .env ]; then
  echo "📋 Creating .env from .env.example..."
  cp .env.example .env
fi

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install

# Initialize Prisma SQLite database
echo "🗄️ Initializing SQLite database..."
npx prisma db push

# Seed realistic data
echo "🌱 Seeding commercial refrigeration repair jobs..."
npm run db:seed

# Run tests
echo "🧪 Running automated test suite..."
npm test

echo "=================================================="
echo "✅ Setup complete! Run 'npm run dev' to start."
echo "=================================================="

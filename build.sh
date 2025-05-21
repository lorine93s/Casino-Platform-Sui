#!/bin/bash

# Install dependencies
npm install

# Build the frontend
npx vite build

# Create API folder in dist directory
mkdir -p dist/api

# Build the backend
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist/api

echo "Build completed successfully!"
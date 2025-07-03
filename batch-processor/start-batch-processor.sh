#!/bin/bash

echo "==================================="
echo "LinkedIn Learning CSV Batch Processor"
echo "==================================="
echo

# Check if Maven is available
if ! command -v mvn &> /dev/null; then
    echo "ERROR: Maven not found in PATH"
    echo "Please install Maven and add it to your PATH"
    exit 1
fi

# Create necessary directories
mkdir -p input
mkdir -p processed

echo "Created input and processed directories"
echo

echo "Building and starting the application..."
echo "This may take a few minutes on first run..."
echo

# Build and run the application
mvn clean spring-boot:run

echo
echo "Application stopped." 
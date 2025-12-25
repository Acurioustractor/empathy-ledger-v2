#!/bin/bash

# Voice Analysis Service Setup Script
# Sets up Python environment and installs dependencies

set -e

echo "Setting up Voice Analysis Service..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    echo "Please install Python 3.8 or higher"
    exit 1
fi

echo "Python version: $(python3 --version)"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Test installation
echo "Testing Praat installation..."
python3 -c "import parselmouth; print('✓ Praat (parselmouth) installed successfully')"

echo ""
echo "✓ Voice Analysis Service setup complete!"
echo ""
echo "To use the service:"
echo "  1. Activate the virtual environment: source venv/bin/activate"
echo "  2. Run analysis: python3 praat_analyzer.py analyze <audio_file>"
echo ""
echo "To deactivate: deactivate"

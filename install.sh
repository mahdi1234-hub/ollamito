#!/bin/bash
# One-command installer for Ollamito
# Run: bash install.sh

set -e

echo "Installing Ollamito Auto-Start..."

# Install Docker
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
fi

# Install ngrok
if ! command -v ngrok &> /dev/null; then
    echo "Installing ngrok..."
    curl -sL https://bin.equinox.io/p/v2/ngrok-version-3-stable-download-url.txt | sh
    sudo mv ngrok /usr/local/bin/
fi

# Configure ngrok
mkdir -p ~/.ngrok
cat > ~/.ngrok/ngrok.yml << 'EOF'
authtoken: ak_341EUO79wCrROTqcM0zykoINmyo
tunnels:
  ollama:
    proto: http
    addr: 11434
region: us
EOF

echo "Done! Run: ollamito"
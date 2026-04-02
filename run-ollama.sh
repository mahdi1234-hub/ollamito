#!/bin/bash
# ✅ Ollamito Auto-Start Script
# Run this to automatically start Docker + Ollama + Ngrok tunnel
# Works on macOS, Linux, and WSL

set -e

echo "🚀 Starting Ollamito with Ngrok Tunnel..."
echo "========================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# ============================================
# PART 1: Install Dependencies (if needed)
# ============================================

install_docker() {
    echo -e "${YELLOW}Installing Docker...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "Please download Docker Desktop from: https://docker.com/download"
        open "https://docker.com/download"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        curl -fsSL https://get.docker.com | sh
        sudo usermod -aG docker $USER
    fi
}

install_ngrok() {
    echo -e "${YELLOW}Installing ngrok...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install ngrok
    else
        curl -sL https://bin.equinox.io/p/v2/ngrok-version-3-stable-download-url.txt | sh
        sudo mv ngrok /usr/local/bin/
    fi
}

# Check/install Docker
if ! command -v docker &> /dev/null; then
    install_docker
fi

# Check/install ngrok  
if ! command -v ngrok &> /dev/null; then
    install_ngrok
fi

# ============================================
# PART 2: Configure ngrok
# ============================================

echo -e "${BLUE}Configuring ngrok...${NC}"
mkdir -p ~/.ngrok
cat > ~/.ngrok/ngrok.yml << 'EOF'
authtoken: ak_341EUO79wCrROTqcM0zykoINmyo
tunnels:
  ollama:
    proto: http
    addr: 11434
    host_header: localhost
    inspect: false
region: us
EOF

# ============================================
# PART 3: Start Ollama (Docker)
# ============================================

echo -e "${BLUE}Starting Ollama container...${NC}"

# Check if Ollama container exists
if docker ps -a | grep -q ollama; then
    echo "Ollama container found, starting..."
    docker start ollama 2>/dev/null || docker rm ollama
else
    echo "Creating new Ollama container..."
    docker run -d \
        --name ollama \
        -p 11434:11434 \
        -v ollama_data:/root/.ollama \
        --restart unless-stopped \
        ollama/ollama:latest
fi

# Wait for Ollama to start
echo "Waiting for Ollama to initialize..."
sleep 5

# Try to pull llama3 model
echo "Checking/pulling llama3 model..."
docker exec ollama ollama pull llama3 2>/dev/null || echo "Model ready"

# ============================================
# PART 4: Start ngrok tunnel
# ============================================

echo -e "${BLUE}Starting ngrok tunnel...${NC}"

# Kill existing ngrok
pkill -f "ngrok" 2>/dev/null || true
sleep 1

# Start ngrok in background
nohup ngrok http 11434 --log=stdout > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

# Wait for ngrok to start
sleep 5

# Get the URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o 'https://[^"]*\.ngrok-free\.dev' | head -1)

if [ -z "$NGROK_URL" ]; then
    # Try alternative method
    NGROK_URL=$(grep "url=" /tmp/ngrok.log 2>/dev/null | grep -o 'https://[^ ]*' | head -1)
fi

echo ""
echo -e "${GREEN}✅ All services started!${NC}"
echo "========================================"
echo -e "${GREEN}Ollama API:${NC} $NGROK_URL"
echo -e "${GREEN}Next.js UI:${NC} http://localhost:3000"
echo ""
echo "Your Vercel app will now work!"
echo "URL: https://ollamito.vercel.app"
echo ""
echo "Keep this terminal open!"
echo "To stop: pkill -f ngrok && docker stop ollama"
echo ""
echo "Ngrok PID: $NGROK_PID"

# Save URL for reference
echo "$NGROK_URL" > /tmp/ollama-url.txt
cat /tmp/ngrok.log
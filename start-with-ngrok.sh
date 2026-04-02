#!/bin/bash
# Start Ollama + Ngrok + Next.js automatically
# This script starts Docker Ollama, creates ngrok tunnel, and ensures Next.js can connect

set -e

echo "=========================================="
echo "  Ollamito - Starting with Ngrok Tunnel"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Start Ollama Docker container
echo -e "${YELLOW}[1/4]${NC} Starting Ollama container..."
docker run -d \
  --name ollama \
  -p 11434:11434 \
  -v ollama_data:/root/.ollama \
  ollama/ollama:latest

# Wait for Ollama to be ready
echo "Waiting for Ollama..."
sleep 10

# 2. Pull a default model
echo -e "${YELLOW}[2/4]${NC} Pulling llama3 model..."
docker exec ollama ollama pull llama3 || echo "Model may already exist"

# 3. Start ngrok tunnel
echo -e "${YELLOW}[3/4]${NC} Starting ngrok tunnel..."
export NGROK_AUTHTOKEN="ak_341EUO79wCrROTqcM0zykoINmyo"

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "Installing ngrok..."
    curl -s https://bin.equinox.io/p/v2/ngrok-version-2-stable-download-url.txt | sh
fi

# Start ngrok in background (only if not already running)
pgrep -f "ngrok" || ngrok http 11434 --log=ngrok.log &

# Wait for ngrok to start and get URL
sleep 5

# Get ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c "import sys,json; print(json.load(sys.stdin)['tunnels'][0]['public_url'])")

echo -e "${GREEN}Ngrok URL: $NGROK_URL${NC}"

# 4. Start Next.js with the ngrok URL
echo -e "${YELLOW}[4/4]${NC} Starting Next.js..."
export OLLAMA_BASE_URL=$NGROK_URL
npm run dev &

echo ""
echo -e "${GREEN}=========================================="
echo "  All services running!"
echo "=========================================="
echo "Ollama API: $NGROK_URL"
echo "Next.js UI: http://localhost:3000"
echo ""
echo "The AI chat will always work as long as:"
echo "1. This script is running"
echo "2. Ngrok tunnel is active"
echo "3. Ollama Docker is running"
echo ""
echo "To test the API:"
curl -X POST $NGROK_URL/api/chat \
  -H "Content-Type: application/json" \
  -d '{"model":"llama3","messages":[{"role":"user","content":"Hello"}]}'
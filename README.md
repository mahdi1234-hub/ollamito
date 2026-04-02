# Ollamito - AI Chat with Ollama + Ngrok

## Quick Start with Ngrok Tunnel

### Option 1: Run Everything Locally
```bash
# Make script executable
chmod +x start-with-ngrok.sh

# Run the startup script
./start-with-ngrok.sh
```

This will:
1. Start Ollama Docker container
2. Pull llama3 model
3. Create ngrok tunnel to port 11434
4. Start Next.js UI

### Option 2: Manual Setup
```bash
# 1. Start Ollama
docker run -d --name ollama -p 11434:11434 ollama/ollama:latest
docker exec ollama ollama pull llama3

# 2. Start ngrok
ngrok authtoken ak_341EUO79wCrROTqcM0zykoINmyo
ngrok http 11434

# 3. Copy the ngrok URL (e.g., https://abc.ngrok.io)

# 4. Set environment and run Next.js
export OLLAMA_BASE_URL=https://your-ngrok-url.ngrok.io
npm run dev
```

## Vercel Deployment

To deploy to Vercel with ngrok:

1. Run the start script locally to get your ngrok URL
2. Go to Vercel Dashboard → Settings → Environment Variables
3. Add:
   - Key: `OLLAMA_BASE_URL`
   - Value: `https://your-ngrok-url.ngrok.io` (from step 1)
4. Redeploy

**Note:** Keep your local tunnel running when using Vercel!

## Alternative: Coolify (Recommended)

For production without local tunnels:
```bash
# Install Coolify on any Ubuntu server
wget -q https://get.coolify.io -O ./install.sh && bash ./install.sh
```

Then add Docker Compose with both Ollama and Next.js.
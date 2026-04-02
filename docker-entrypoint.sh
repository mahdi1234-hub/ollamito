#!/bin/bash
set -e

echo "Waiting for Ollama to be ready..."
until curl -sf http://ollama:11434/api/tags > /dev/null 2>&1; do
    echo "Ollama not ready, waiting..."
    sleep 2
done

echo "Ollama is ready!"

# Pull default model if not exists
echo "Checking for llama3 model..."
if ! curl -sf http://ollama:11434/api/tags | grep -q "llama3"; then
    echo "Pulling llama3 model..."
    ollama pull llama3 || echo "Could not pull llama3, will use available models"
else
    echo "llama3 model already available"
fi

echo "Starting Next.js..."
exec npm start
// Mock Ollama server for testing
const http = require('http');

const responses = {
  'llama3': "Hello! I'm Llama 3, running locally via Ollama. I'm a large language model trained by Meta. How can I help you today?",
  'llama3.1': "Hi! I'm Llama 3.1, the latest version from Meta. I have improved reasoning capabilities. What would you like to know?",
  'mistral': "Greetings! I'm Mistral AI, a compact but powerful model. I was created by Mistral AI in France. How may I assist you?",
  'mixtral': "Hello! I'm Mixtral, a mixture-of-experts model from Mistral AI. I combine multiple expert specialists for better responses.",
  'phi3': "Hi there! I'm Phi-3 from Microsoft. I'm a small but capable language model optimized for efficiency.",
  'qwen': "Greetings! I'm Qwen, developed by Alibaba Cloud. I'm a multilingual model that can help in many languages.",
  'codellama': "Hello! I'm CodeLlama, specialized in code generation and understanding. I can help you write, debug, and explain code.",
  'default': "Hello! I'm your local AI assistant powered by Ollama. I can help with questions, code, writing, and more. What would you like to discuss?"
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/api/tags') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      models: [
        { name: 'llama3:latest', modified_at: '2024-01-01T00:00:00Z' },
        { name: 'llama3.1:latest', modified_at: '2024-01-01T00:00:00Z' },
        { name: 'mistral:latest', modified_at: '2024-01-01T00:00:00Z' },
        { name: 'mixtral:latest', modified_at: '2024-01-01T00:00:00Z' },
        { name: 'phi3:latest', modified_at: '2024-01-01T00:00:00Z' },
        { name: 'qwen:latest', modified_at: '2024-01-01T00:00:00Z' },
        { name: 'codellama:latest', modified_at: '2024-01-01T00:00:00Z' },
      ]
    }));
    return;
  }

  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const model = data.model || 'default';
        const userMessage = data.messages?.[data.messages.length - 1]?.content || '';
        
        // Get response based on model or default
        let response = responses[model] || responses['default'];
        
        // Add custom response based on user message
        if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
          response = responses[model] || responses['default'];
        } else if (userMessage.toLowerCase().includes('name')) {
          response = `I'm ${model}, a local AI model running on Ollama. I'm hosted locally on your machine for privacy and speed.`;
        } else if (userMessage.length > 0) {
          response = `Thanks for your message: "${userMessage.substring(0, 50)}..."\n\nAs a local Ollama model (${model}), I can help with:\n- Answering questions\n- Writing and editing code\n- Summarizing text\n- Brainstorming ideas\n\nWhat would you like to explore?`;
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          model,
          message: {
            role: 'assistant',
            content: response
          },
          done: true
        }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

const PORT = process.env.PORT || 11434;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Mock Ollama server running on http://localhost:${PORT}`);
  console.log(`Available models: ${Object.keys(responses).join(', ')}`);
});
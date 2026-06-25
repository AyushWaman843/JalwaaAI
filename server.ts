import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveApiKey(primaryName: string, secondaryName?: string): string | undefined {
  const isPlaceholder = (val: string | undefined) => {
    if (!val) return true;
    const cleaned = val.trim().toLowerCase();
    return cleaned === '' || 
           cleaned === 'your_groq_api_key' || 
           cleaned === 'your_apify_token' || 
           cleaned === 'your_supabase_url' ||
           cleaned.includes('placeholder') ||
           cleaned.includes('your_');
  };

  const primaryVal = process.env[primaryName];
  if (!isPlaceholder(primaryVal)) {
    return primaryVal;
  }

  if (secondaryName) {
    const secondaryVal = process.env[secondaryName];
    if (!isPlaceholder(secondaryVal)) {
      return secondaryVal;
    }
  }

  return undefined;
}

async function startServer() {
  const app = express();
  // Support larger body payload for base64 image style uploads
  app.use(express.json({ limit: '15mb' }));

  // APIS SECTION

  // 1. Apify Search Proxy with Local Fallback
  app.post('/api/apify/search', async (req: Request, res: Response) => {
    try {
      const { query, limit = 10 } = req.body;
      const apifyToken = resolveApiKey('VITE_APIFY_API_TOKEN', 'APIFY_API_TOKEN') || resolveApiKey('APIFY_TOKEN', 'VITE_APIFY_TOKEN');

      console.log(`Apify Search request: "${query}" (limit: ${limit})`);

      // If Apify token is not configured or user requests fallback, return mock instantly
      if (!apifyToken) {
        console.log('Apify token missing/default. Serving seed fallback data.');
        return res.json({ source: 'fallback', data: [] }); // Client will merge with MUMBAI_SALONS_SEED
      }

      // If token is configured, call the real Apify Google Maps Scraper Actor!
      // To ensure faster response times, we can call the direct run-sync API
      const url = `https://api.apify.com/v2/acts/apify~google-maps-scraper/runs?token=${apifyToken}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchStrings: [query || "salons in Mumbai"],
          maxCrawledPlacesPerSearch: limit,
          includeReviews: true,
          onlyImages: true
        })
      });

      if (!response.ok) {
        console.log(`Apify run status: ${response.status}. Serving seed fallback data.`);
        return res.json({ source: 'fallback', data: [] });
      }

      const runData = await response.json();
      const datasetId = runData.data?.defaultDatasetId;

      if (!datasetId) {
        console.log('No dataset ID from Apify run. Serving seed fallback data.');
        return res.json({ source: 'fallback', data: [] });
      }

      // Fetch dataset results (wait for up to 10 seconds or fetch directly if sync)
      // For real-time in typical user interfaces, they can wait, or we query immediately
      const datasetUrl = `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}`;
      const datasetRes = await fetch(datasetUrl);
      if (datasetRes.ok) {
        const items = await datasetRes.json();
        console.log(`Successfully retrieved ${items.length} salons from Apify.`);
        return res.json({ source: 'apify', data: items });
      } else {
        console.log(`Apify dataset fetch status: ${datasetRes.status}. Serving seed fallback data.`);
        return res.json({ source: 'fallback', data: [] });
      }
    } catch (error: any) {
      console.log('Apify proxy alert, falling back to mock data:', error.message || error);
      try {
        const fs = await import('fs');
        fs.appendFileSync(path.join(process.cwd(), 'src', 'server_errors.log'), `${new Date().toISOString()} - Apify Error: ${error.stack || error.message || error}\n`);
      } catch (e) {}
      return res.json({ source: 'fallback', data: [], error: error.message || 'Apify query fallback' });
    }
  });

  app.get('/api/diagnostics', (req: Request, res: Response) => {
    const keys: Record<string, any> = {};
    const checkKey = (name: string) => {
      const val = process.env[name];
      if (!val) {
        keys[name] = { present: false };
      } else {
        const cleaned = val.trim();
        const isPlaceholder = cleaned === '' || cleaned.includes('your_') || cleaned.includes('MY_APP_URL') || cleaned === 'your_groq_api_key' || cleaned === 'your_apify_token';
        keys[name] = {
          present: true,
          length: val.length,
          isPlaceholder,
          prefix: cleaned.substring(0, 10) + (cleaned.length > 10 ? '...' : '')
        };
      }
    };
    const names = [
      'GROQ_API_KEY', 'VITE_GROQ_API_KEY',
      'APIFY_API_TOKEN', 'VITE_APIFY_API_TOKEN',
      'APIFY_TOKEN', 'VITE_APIFY_TOKEN',
      'SUPABASE_URL', 'VITE_SUPABASE_URL',
      'SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY'
    ];
    names.forEach(checkKey);
    res.json({ keys, env: process.env.NODE_ENV });
  });

  // 2. Groq AI Integration Endpoint
  app.post('/api/groq/chat', async (req: Request, res: Response) => {
    try {
      const { messages, base64Image, systemPrompt } = req.body;
      const groqApiKey = resolveApiKey('VITE_GROQ_API_KEY', 'GROQ_API_KEY');

      if (!groqApiKey) {
        return res.json({
          source: 'mock',
          text: "Hi! I am your Jalwaa AI Assistant. Since the GROQ API key is not yet configured, I'm running in demo mode! I highly recommend checking out BBlunt in Bandra West for premium haircuts, or JCB in Juhu for luxury facial rituals. What style are you looking to achieve today?"
        });
      }

      // Select model based on whether there's an image payload
      const model = base64Image ? 'llama-3.2-11b-vision-preview' : 'llama-3.3-70b-versatile';
      
      const groqMessages = [];
      if (systemPrompt) {
        groqMessages.push({ role: 'system', content: systemPrompt });
      }

      // Add actual messages history
      if (base64Image) {
        // If vision request, append image to user message
        const lastUserIndex = [...messages].reverse().findIndex(m => m.role === 'user');
        const userMsg = messages[messages.length - 1 - lastUserIndex] || { role: 'user', content: 'Analyze this style' };
        
        groqMessages.push({
          role: 'user',
          content: [
            { type: 'text', text: userMsg.content },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
          ]
        });
      } else {
        // Standard chat completions format
        groqMessages.push(...messages);
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          model,
          messages: groqMessages,
          temperature: 0.7,
          max_tokens: 600
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API returned error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      return res.json({ source: 'groq', text: content });
    } catch (error: any) {
      console.error('Error in Groq proxy:', error);
      try {
        const fs = await import('fs');
        fs.appendFileSync(path.join(process.cwd(), 'src', 'server_errors.log'), `${new Date().toISOString()} - Groq Error: ${error.stack || error.message || error}\n`);
      } catch (e) {}
      return res.status(500).json({ error: error.message || 'Groq AI query failed' });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port} [${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}]`);
    console.log('--- Environment Secret Diagnostics ---');
    let diagnosticsStr = '--- Environment Secret Diagnostics ---\n';
    const checkKey = (name: string) => {
      const val = process.env[name];
      if (!val) {
        const msg = `  ${name}: MISSING\n`;
        console.log(msg.trim());
        diagnosticsStr += msg;
      } else {
        const cleaned = val.trim();
        const isPlaceholder = cleaned === '' || cleaned.includes('your_') || cleaned.includes('MY_APP_URL') || cleaned === 'your_groq_api_key' || cleaned === 'your_apify_token';
        const msg = `  ${name}: PRESENT (length: ${val.length}, placeholder: ${isPlaceholder}, prefix: "${cleaned.substring(0, 8)}...")\n`;
        console.log(msg.trim());
        diagnosticsStr += msg;
      }
    };
    checkKey('GROQ_API_KEY');
    checkKey('VITE_GROQ_API_KEY');
    checkKey('APIFY_API_TOKEN');
    checkKey('VITE_APIFY_API_TOKEN');
    checkKey('APIFY_TOKEN');
    checkKey('VITE_APIFY_TOKEN');
    checkKey('SUPABASE_URL');
    checkKey('VITE_SUPABASE_URL');
    checkKey('SUPABASE_ANON_KEY');
    checkKey('VITE_SUPABASE_ANON_KEY');
    console.log('--------------------------------------');
    diagnosticsStr += '--------------------------------------\n';
    try {
      const fs = require('fs');
      fs.writeFileSync(path.join(process.cwd(), 'src', 'diagnostics_log.txt'), diagnosticsStr);
    } catch (e) {
      // In ES modules context, let's use dynamic import
      import('fs').then(fs => {
        fs.writeFileSync(path.join(process.cwd(), 'src', 'diagnostics_log.txt'), diagnosticsStr);
      }).catch(() => {});
    }
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

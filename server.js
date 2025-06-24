const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// Test endpoint pro ověření API klíče
app.get('/api/test', async (req, res) => {
  try {
    console.log('Testing Perplexity API...');
    
    if (!process.env.PERPLEXITY_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: 'PERPLEXITY_API_KEY není nastaven v environment variables' 
      });
    }

    const response = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [{ role: 'user', content: 'Hello, test message' }],
      max_tokens: 10
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('API test successful');
    res.json({ 
      success: true, 
      message: 'API klíč funguje správně',
      model: 'llama-3.1-sonar-small-128k-online'
    });
  } catch (error) {
    console.error('API test failed:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: error.response?.data?.error?.message || error.message,
      status: error.response?.status
    });
  }
});

// Reálné AI Image generation endpoint
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt je povinný'
      });
    }

    console.log('Generating AI image for prompt:', prompt);

    let imageUrl = null;
    let generationMethod = 'none';

    if (process.env.OPENAI_API_KEY) {
      try {
        console.log('Trying OpenAI DALL-E generation...');
        
        const openaiResponse = await axios.post('https://api.openai.com/v1/images/generations', {
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          quality: 'hd',
          style: 'natural'
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 120000
        });

        if (openaiResponse.data.data?.[0]?.url) {
          imageUrl = openaiResponse.data.data[0].url;
          generationMethod = 'openai-dalle3';
          console.log('Image generated via OpenAI DALL-E 3:', imageUrl);
        }
      } catch (openaiError) {
        console.log('OpenAI DALL-E generation failed:', openaiError.response?.data || openaiError.message);
      }
    }

    if (!imageUrl && process.env.OPENAI_API_KEY) {
      try {
        console.log('Trying OpenAI DALL-E 2 generation...');
        
        const dalle2Response = await axios.post('https://api.openai.com/v1/images/generations', {
          prompt: prompt,
          n: 1,
          size: '1024x1024'
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        });

        if (dalle2Response.data.data?.[0]?.url) {
          imageUrl = dalle2Response.data.data[0].url;
          generationMethod = 'openai-dalle2';
          console.log('Image generated via OpenAI DALL-E 2:', imageUrl);
        }
      } catch (dalle2Error) {
        console.log('OpenAI DALL-E 2 generation failed:', dalle2Error.response?.data || dalle2Error.message);
      }
    }

    if (!imageUrl) {
      console.log('All AI image generation methods failed, using placeholder');
      imageUrl = `https://picsum.photos/1080/1350?random=${Date.now()}`;
      generationMethod = 'placeholder';
    }
    
    res.json({
      success: true,
      imageUrl: imageUrl,
      prompt: prompt,
      generationMethod: generationMethod,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Chyba při generování obrázku: ' + error.message
    });
  }
});

// Instagram post endpoint (zjednodušená verze - pouze stahování)
app.post('/api/post-to-instagram', async (req, res) => {
  try {
    const { imageData, caption, hashtags } = req.body;
    
    if (!imageData || !caption) {
      return res.status(400).json({
        success: false,
        error: 'Obrázek a text jsou povinné'
      });
    }

    console.log('Preparing Instagram content for manual posting...');

    const fullCaption = `${caption}\n\n${hashtags}`;
    
    res.json({
      success: true,
      message: 'Instagram obsah je připraven ke stažení. Můžete ho manuálně zveřejnit na Instagramu.',
      data: {
        caption: fullCaption,
        imageUrl: imageData,
        instructions: [
          '1. Stáhněte si obrázek pomocí tlačítka "Stáhnout slides"',
          '2. Zkopírujte text pomocí tlačítka "Kopírovat text"', 
          '3. Otevřete Instagram aplikaci',
          '4. Vytvořte nový příspěvek a nahrajte obrázek',
          '5. Vložte zkopírovaný text jako popis',
          '6. Zveřejněte příspěvek'
        ]
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Instagram preparation error:', error);
    res.status(500).json({
      success: false,
      error: 'Chyba při přípravě Instagram obsahu: ' + error.message
    });
  }
});

// Instagram carousel endpoint - upravený pro carousel
app.post('/api/instagram-image', async (req, res) => {
  try {
    const { selectedText } = req.body;
    
    if (!selectedText) {
      return res.status(400).json({
        success: false,
        error: 'Pro vytvoření Instagram carousel musíte vybrat text'
      });
    }

    console.log('Generating Instagram carousel for text:', selectedText.substring(0, 50));

    // 1. Vygeneruj krátký poutavý nadpis pro první slide
    const titleResponse = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        { 
          role: 'system', 
          content: 'Vytvoř krátký, poutavý nadpis v češtině pro Instagram obrázek. Nadpis by měl být výstižný a lákavý (max 40 znaků).' 
        },
        { 
          role: 'user', 
          content: `Na základě tohoto textu vytvoř krátký nadpis: "${selectedText}"` 
        }
      ],
      temperature: 0.8,
      max_tokens: 50
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // 2. Vygeneruj text pro druhý slide
    const textResponse = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        { 
          role: 'system', 
          content: 'Vytvoř stručný, poutavý text pro Instagram carousel slide v češtině. Text by měl být čitelný na obrázku (max 200 znaků).' 
        },
        { 
          role: 'user', 
          content: `Na základě tohoto obsahu vytvoř text pro Instagram slide: "${selectedText}"` 
        }
      ],
      temperature: 0.7,
      max_tokens: 150
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // 3. Vygeneruj popis pro AI obrázek
    const imageDescriptionResponse = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        { 
          role: 'system', 
          content: 'Vytvoř detailní popis v angličtině pro AI generovaný obrázek. Popis by měl být vizuálně bohatý a vhodný pro moderní Instagram carousel.' 
        },
        { 
          role: 'user', 
          content: `Na základě tohoto obsahu vytvoř popis pro AI obrázek: "${selectedText}"` 
        }
      ],
      temperature: 0.8,
      max_tokens: 100
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // 4. Vygeneruj čisté hashtags
    const hashtagsResponse = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        { 
          role: 'system', 
          content: 'Vytvoř pouze čisté hashtags pro Instagram. Odpověz pouze hashtags oddělené mezerami, nic

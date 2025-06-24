const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
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

// AI Image generation endpoint
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

    // Simulace AI generování obrázku - v reálné aplikaci by se použilo DALL-E, Midjourney API, nebo Stable Diffusion
    // Pro demo účely vracíme placeholder
    const imageUrl = `https://picsum.photos/1080/1350?random=${Date.now()}`;
    
    res.json({
      success: true,
      imageUrl: imageUrl,
      prompt: prompt,
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

// Instagram post endpoint
app.post('/api/post-to-instagram', async (req, res) => {
  try {
    const { imageData, caption, hashtags } = req.body;
    
    if (!imageData || !caption) {
      return res.status(400).json({
        success: false,
        error: 'Obrázek a text jsou povinné'
      });
    }

    console.log('Posting to Instagram...');

    // Zde by se implementovalo skutečné postování na Instagram přes Instagram Graph API
    // Pro demo účely simulujeme úspěšné postování
    
    // V reálné aplikaci:
    // 1. Nahrát obrázek na Instagram
    // 2. Vytvořit media container
    // 3. Publikovat post s textem a hashtags
    
    const fullCaption = `${caption}\n\n${hashtags}`;
    
    // Simulace úspěšného postování
    setTimeout(() => {
      res.json({
        success: true,
        message: 'Příspěvek byl úspěšně zveřejněn na Instagramu!',
        postId: `post_${Date.now()}`,
        timestamp: new Date().toISOString()
      });
    }, 2000);

  } catch (error) {
    console.error('Instagram posting error:', error);
    res.status(500).json({
      success: false,
      error: 'Chyba při zveřejňování na Instagramu: ' + error.message
    });
  }
});

// Instagram obrázek endpoint s AI generovaným pozadím
app.post('/api/instagram-image', async (req, res) => {
  try {
    const { selectedText } = req.body;
    
    if (!selectedText) {
      return res.status(400).json({
        success: false,
        error: 'Pro vytvoření Instagram obrázku musíte vybrat text'
      });
    }

    console.log('Generating Instagram post for text:', selectedText.substring(0, 50));

    // 1. Vygeneruj optimalizovaný text pro Instagram
    const textResponse = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        { 
          role: 'system', 
          content: 'Jsi expert na Instagram marketing. Vytvoř poutavý, krátký a výstižný text pro Instagram post v češtině. Text musí být jasný, bez speciálních značek jako ### nebo [], a vhodný pro umístění na obrázek.' 
        },
        { 
          role: 'user', 
          content: `Přepis následující text do formátu vhodného pro Instagram post (max 120 znaků, bez hashtagů, bez speciálních značek): "${selectedText}"` 
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

    // 2. Vygeneruj popis pro AI obrázek
    const imageDescriptionResponse = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        { 
          role: 'system', 
          content: 'Jsi expert na vytváření popisů pro AI generované obrázky. Vytvoř krátký, výstižný popis v angličtině pro moderní, minimalistický obrázek vhodný jako pozadí pro Instagram post.' 
        },
        { 
          role: 'user', 
          content: `Na základě tohoto textu vytvoř popis pro AI generovaný obrázek (v angličtině, max 50 slov, moderní styl): "${selectedText}"` 
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

    // 3. Vygeneruj čisté hashtags
    const hashtagsResponse = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        { 
          role: 'system', 
          content: 'Vytvoř pouze čisté hashtags pro Instagram. Odpověz pouze hashtags oddělené mezerami, nic jiného. Například: #hashtag1 #hashtag2 #hashtag3' 
        },
        { 
          role: 'user', 
          content: `Na základě tohoto obsahu vytvoř 8-12 relevantních hashtagů pro Instagram: "${selectedText}"` 
        }
      ],
      temperature: 0.6,
      max_tokens: 200
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const instagramText = textResponse.data.choices[0].message.content.trim()
      .replace(/^###\s*/, '')  // Odstraň ### na začátku
      .replace(/\[.*?\]/g, '') // Odstraň [text v závorkách]
      .trim();

    const imageDescription = imageDescriptionResponse.data.choices[0].message.content.trim();
    
    // Vyčisti hashtags - ponech pouze hashtags
    let hashtags = hashtagsResponse.data.choices[0].message.content.trim();
    hashtags = hashtags.split(/\s+/).filter(tag => tag.startsWith('#')).join(' ');
    
    console.log('Generated Instagram content:', {
      text: instagramText,
      imageDesc: imageDescription,
      hashtags: hashtags
    });

    res.json({
      success: true,
      result: instagramText,
      imageDescription: imageDescription,
      hashtags: hashtags,
      action: 'instagram-image',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Instagram image generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Chyba při generování Instagram postu: ' + (error.response?.data?.error?.message || error.message)
    });
  }
});

// Zbytek endpoints zůstává stejný...
// [Zde by pokračovaly ostatní endpoints z předchozího server.js]

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server běží na portu ${PORT}`);
  console.log(`📅 Spuštěno: ${new Date().toISOString()}`);
  console.log(`🔑 API klíč: ${process.env.PERPLEXITY_API_KEY ? 'nastaven' : 'CHYBÍ!'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

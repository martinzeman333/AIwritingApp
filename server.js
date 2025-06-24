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

// OPRAVA: AI Image generation s pixel art optimalizací
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt je povinný'
      });
    }

    console.log('🎮 Generating PIXEL ART image for prompt:', prompt);

    let imageUrl = null;
    let generationMethod = 'none';

    // OPRAVA: Pokus 1: OpenAI DALL-E 3 s pixel art optimalizací
    if (process.env.OPENAI_API_KEY && !imageUrl) {
      try {
        console.log('🎮 Trying OpenAI DALL-E 3 with PIXEL ART style...');
        
        // OPRAVA: Optimalizovaný prompt pro pixel art
        const pixelArtPrompt = prompt.includes('pixel art') 
          ? prompt 
          : `${prompt}, 16-bit pixel art style, retro gaming aesthetic, vibrant colors, crisp pixel work, detailed pixel graphics, classic video game style, blocky visuals, pixelated illustration, 8-bit aesthetic`;
        
        console.log('🎮 Using pixel art prompt:', pixelArtPrompt);
        
        const openaiResponse = await axios.post('https://api.openai.com/v1/images/generations', {
          model: 'dall-e-3',
          prompt: pixelArtPrompt,
          n: 1,
          size: '1024x1024',
          quality: 'hd',
          style: 'vivid'
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 120000
        });

        if (openaiResponse.data.data?.[0]?.url) {
          imageUrl = openaiResponse.data.data[0].url;
          generationMethod = 'openai-dalle3-pixel-art';
          console.log('🎮 Pixel art image generated via OpenAI DALL-E 3:', imageUrl);
        }
      } catch (openaiError) {
        console.log('❌ OpenAI DALL-E 3 failed:', openaiError.response?.data || openaiError.message);
      }
    }

    // Pokus 2: Stability AI s pixel art stylem
    if (process.env.STABILITY_API_KEY && !imageUrl) {
      try {
        console.log('🎮 Trying Stability AI with pixel art...');
        
        const stabilityResponse = await axios.post('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
          text_prompts: [{ text: `${prompt}, pixel art style, 16-bit graphics, retro game aesthetic, blocky visuals` }],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: 1,
          steps: 30,
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 120000
        });

        if (stabilityResponse.data.artifacts?.[0]?.base64) {
          imageUrl = `data:image/png;base64,${stabilityResponse.data.artifacts[0].base64}`;
          generationMethod = 'stability-ai-pixel-art';
          console.log('🎮 Pixel art image generated via Stability AI');
        }
      } catch (stabilityError) {
        console.log('❌ Stability AI failed:', stabilityError.response?.data || stabilityError.message);
      }
    }

    // Pokus 3: Fallback na DALL-E 2 s pixel art
    if (process.env.OPENAI_API_KEY && !imageUrl) {
      try {
        console.log('🎮 Trying OpenAI DALL-E 2 as fallback...');
        
        const dalle2Response = await axios.post('https://api.openai.com/v1/images/generations', {
          prompt: `${prompt}, pixel art style, 8-bit graphics, retro aesthetic, blocky visuals`,
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
          generationMethod = 'openai-dalle2-pixel-art';
          console.log('🎮 Pixel art image generated via OpenAI DALL-E 2');
        }
      } catch (dalle2Error) {
        console.log('❌ OpenAI DALL-E 2 failed:', dalle2Error.response?.data || dalle2Error.message);
      }
    }

    if (!imageUrl) {
      console.log('❌ All AI image generation methods failed, using placeholder');
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
    console.error('❌ Image generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Chyba při generování obrázku: ' + error.message
    });
  }
});

// OPRAVA: Instagram carousel endpoint s pixel art stylem
app.post('/api/instagram-image', async (req, res) => {
  try {
    const { selectedText } = req.body;
    
    if (!selectedText) {
      return res.status(400).json({
        success: false,
        error: 'Pro vytvoření Instagram carousel musíte vybrat text'
      });
    }

    console.log('🎮 Generating Instagram carousel with PIXEL ART for text:', selectedText.substring(0, 50));

    // 1. Vygeneruj krátký poutavý nadpis pro první slide
    const titleResponse = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        { 
          role: 'system', 
          content: 'Vytvoř krátký, poutavý nadpis v češtině pro Instagram obrázek. Nadpis by měl být výstižný a lákavý (max 40 znaků). NEPOUŽÍVEJ ŽÁDNÉ markdown značky jako #, *, **, _, nebo ---. Odpověz pouze čistým textem.' 
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

    // 2. Vygeneruj čistý text pro druhý slide
    const textResponse = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        { 
          role: 'system', 
          content: 'Vytvoř stručný, poutavý text pro Instagram carousel slide v češtině. Text by měl být čitelný na obrázku (max 200 znaků). NEPOUŽÍVEJ ŽÁDNÉ markdown značky jako #, *, **, _, ---, ####. Nepoužívej odrážky s - nebo *. Nepoužívej nadpisy. Piš pouze čistý text bez jakéhokoliv formátování. Odpověz pouze prostým textem.' 
        },
        { 
          role: 'user', 
          content: `Na základě tohoto obsahu vytvoř čistý text pro Instagram slide: "${selectedText}"` 
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

    // 3. OPRAVA: Vygeneruj stručný popis pro pixel art - zaměř se na hlavní postavu/věc
    const imageDescriptionResponse = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        { 
          role: 'system', 
          content: 'Na základě textu identifikuj HLAVNÍ postavu, osobu, objekt nebo místo a vytvoř velmi stručný popis v angličtině (max 8 slov). Zaměř se pouze na tu nejdůležitější věc z textu. Nepoužívej "pixel art" - to se přidá automaticky. Příklady: "businessman in suit", "mountain landscape", "racing car", "medieval castle", "smartphone", "coffee cup".' 
        },
        { 
          role: 'user', 
          content: `Identifikuj hlavní postavu/věc z tohoto textu a popiš ji stručně: "${selectedText}"` 
        }
      ],
      temperature: 0.6,
      max_tokens: 30
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
          content: 'Vytvoř pouze čisté hashtags pro Instagram. Odpověz pouze hashtags oddělené mezerami, nic jiného. Nepoužívej markdown formátování.' 
        },
        { 
          role: 'user', 
          content: `Vytvoř 8-12 relevantních hashtagů pro: "${selectedText}"` 
        }
      ],
      temperature: 0.6,
      max_tokens: 150
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // 5. OPRAVA: Vygeneruj pixel art ilustraci s novým promptem
    let backgroundImageUrl = null;
    let mainSubject = imageDescriptionResponse.data.choices[0].message.content.trim();
    
    // OPRAVA: Vytvoř pixel art prompt podle požadavků
    const pixelArtPrompt = `${mainSubject}, 16-bit pixel art style, retro gaming aesthetic, vibrant colors, crisp pixel work, detailed pixel graphics, classic video game style, blocky visuals, pixelated illustration, 8-bit aesthetic`;
    
    console.log('🎮 Generated pixel art prompt:', pixelArtPrompt);
    
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log('🎮 Generating pixel art with ChatGPT...');
        
        const imageResponse = await axios.post('https://api.openai.com/v1/images/generations', {
          model: 'dall-e-3',
          prompt: pixelArtPrompt,
          n: 1,
          size: '1024x1024',
          quality: 'hd',
          style: 'vivid'
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 120000
        });

        if (imageResponse.data.data?.[0]?.url) {
          backgroundImageUrl = imageResponse.data.data[0].url;
          console.log('🎮 Pixel art illustration generated:', backgroundImageUrl);
        }
      } catch (imageError) {
        console.log('❌ Image generation failed:', imageError.message);
        
        // OPRAVA: Fallback na placeholder s debug informacemi
        console.log('🔄 Using placeholder image as fallback');
        backgroundImageUrl = `https://picsum.photos/1080/1350?random=${Date.now()}`;
      }
    } else {
      console.log('⚠️ No OpenAI API key, using placeholder');
      backgroundImageUrl = `https://picsum.photos/1080/1350?random=${Date.now()}`;
    }

    // Vyčisti text od markdown značek
    const title = titleResponse.data.choices[0].message.content.trim()
      .replace(/[#*_`~\[\]]/g, '')
      .replace(/^[-\s]+|[-\s]+$/g, '')
      .replace(/\*\*/g, '')
      .replace(/###/g, '')
      .replace(/####/g, '')
      .replace(/^- /gm, '')
      .replace(/^\* /gm, '');

    const slideText = textResponse.data.choices[0].message.content.trim()
      .replace(/[#*_`~\[\]]/g, '')
      .replace(/^[-\s]+|[-\s]+$/g, '')
      .replace(/\*\*/g, '')
      .replace(/###/g, '')
      .replace(/####/g, '')
      .replace(/^- /gm, '')
      .replace(/^\* /gm, '')
      .replace(/^Sport$/gm, '')
      .replace(/^Politika$/gm, '')
      .replace(/^Ekonomika$/gm, '');
    
    // Vyčisti hashtags
    let hashtags = hashtagsResponse.data.choices[0].message.content.trim();
    hashtags = hashtags.split(/\s+/).filter(tag => tag.startsWith('#')).join(' ');
    
    console.log('🎮 Generated Instagram carousel with PIXEL ART:', {
      title: title,
      text: slideText,
      hashtags: hashtags,
      mainSubject: mainSubject,
      pixelArtPrompt: pixelArtPrompt,
      backgroundImage: backgroundImageUrl
    });

    res.json({
      success: true,
      title: title,
      result: slideText,
      hashtags: hashtags,
      backgroundImageUrl: backgroundImageUrl,
      imageDescription: pixelArtPrompt,
      action: 'instagram-carousel-pixel-art',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Instagram carousel generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Chyba při generování Instagram carousel: ' + (error.response?.data?.error?.message || error.message)
    });
  }
});

// Perplexity API proxy endpoint - opravený bez markdown
app.post('/api/perplexity', async (req, res) => {
  try {
    const { prompt, selectedText, action } = req.body;
    
    console.log('Received request:', { 
      action, 
      prompt: prompt?.substring(0, 50) + (prompt?.length > 50 ? '...' : ''), 
      selectedText: selectedText?.substring(0, 50) + (selectedText?.length > 50 ? '...' : ''),
      timestamp: new Date().toISOString()
    });
    
    if (!process.env.PERPLEXITY_API_KEY) {
      console.error('PERPLEXITY_API_KEY not found in environment variables');
      return res.status(500).json({
        success: false,
        error: 'API klíč není nastaven v environment variables'
      });
    }

    let systemPrompt = "Jsi užitečný asistent, který pomáhá s úpravou textu. Odpovídej v češtině. NEPOUŽÍVEJ markdown formátování jako #, *, **, _, ---. Odpovídej pouze čistým textem.";
    let userPrompt = prompt;

    // Přednastavené AI funkce s anti-markdown instrukcemi
    switch (action) {
      case 'summarize':
        if (!selectedText) {
          return res.status(400).json({
            success: false,
            error: 'Pro sumarizaci musíte vybrat text'
          });
        }
        systemPrompt = "Jsi expert na sumarizaci textu. Vytvoř stručné shrnutí daného textu v češtině. NEPOUŽÍVEJ markdown formátování jako #, *, **, _, ---, ####. Nepoužívej odrážky. Odpovídej pouze čistým textem.";
        userPrompt = `Sumarizuj následující text: "${selectedText}"`;
        break;
      case 'twitter':
        if (!selectedText) {
          return res.status(400).json({
            success: false,
            error: 'Pro vytvoření Twitter postu musíte vybrat text'
          });
        }
        systemPrompt = "Jsi expert na tvorbu obsahu pro sociální sítě. Vytvoř atraktivní Twitter post v češtině. NEPOUŽÍVEJ markdown formátování jako #, *, **, _, ---. Odpovídej pouze čistým textem.";
        userPrompt = `Přepis následující text do formátu vhodného pro Twitter post (max 280 znaků): "${selectedText}"`;
        break;
      case 'instagram':
        if (!selectedText) {
          return res.status(400).json({
            success: false,
            error: 'Pro vytvoření Instagram postu musíte vybrat text'
          });
        }
        systemPrompt = "Jsi expert na Instagram marketing. Vytvoř poutavý text pro Instagram post v češtině. NEPOUŽÍVEJ markdown formátování jako #, *, **, _, ---, ####. Nepoužívej odrážky. Odpovídej pouze čistým textem.";
        userPrompt = `Přepis následující text do formátu vhodného pro Instagram post s hashtegy: "${selectedText}"`;
        break;
      case 'expand':
        if (!selectedText) {
          return res.status(400).json({
            success: false,
            error: 'Pro rozšíření textu musíte vybrat text'
          });
        }
        systemPrompt = "Jsi expert na rozšiřování a vylepšování textů. Rozšiř daný text zachováním původního významu. NEPOUŽÍVEJ markdown formátování jako #, *, **, _, ---. Odpovídej pouze čistým textem.";
        userPrompt = `Rozšiř a vylepši následující text: "${selectedText}"`;
        break;
      case 'improve':
        if (!selectedText) {
          return res.status(400).json({
            success: false,
            error: 'Pro vylepšení textu musíte vybrat text'
          });
        }
        systemPrompt = "Jsi expert na jazykové korekce a stylistické úpravy. Vylepši gramatiku a styl textu. NEPOUŽÍVEJ markdown formátování jako #, *, **, _, ---, ####. Nepoužívej odrážky. Odpovídej pouze čistým textem.";
        userPrompt = `Vylepši gramatiku a styl následujícího textu: "${selectedText}"`;
        break;
      case 'generate':
      case 'custom':
        if (!prompt) {
          return res.status(400).json({
            success: false,
            error: 'Musíte zadat prompt pro generování textu'
          });
        }
        systemPrompt = "Jsi užitečný asistent. Odpovídej v češtině. NEPOUŽÍVEJ markdown formátování jako #, *, **, _, ---. Odpovídej pouze čistým textem.";
        userPrompt = selectedText ? `${prompt} "${selectedText}"` : prompt;
        break;
      default:
        userPrompt = selectedText ? `${prompt} "${selectedText}"` : prompt;
    }

    console.log('Making API request to Perplexity...');

    const response = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    if (!response.data.choices || response.data.choices.length === 0) {
      throw new Error('API nevrátilo žádné výsledky');
    }

    if (!response.data.choices[0].message || !response.data.choices[0].message.content) {
      throw new Error('API vrátilo prázdnou odpověď');
    }

    let result = response.data.choices[0].message.content.trim();
    
    // OPRAVA: Vyčisti výsledek od markdown značek
    result = result
      .replace(/[#*_`~\[\]]/g, '')  // Odstraň markdown znaky
      .replace(/^[-\s]+|[-\s]+$/g, '')  // Odstraň pomlčky na začátku/konci
      .replace(/\*\*/g, '')  // Odstraň tučné značky
      .replace(/###/g, '')  // Odstraň nadpisy
      .replace(/####/g, '')  // Odstraň nadpisy
      .replace(/^- /gm, '')  // Odstraň odrážky
      .replace(/^\* /gm, '')  // Odstraň odrážky
      .replace(/^Sport$/gm, '')  // Odstraň kategorie
      .replace(/^Politika$/gm, '')  // Odstraň kategorie
      .replace(/^Ekonomika$/gm, ''); // Odstraň kategorie
    
    if (!result) {
      throw new Error('API vrátilo prázdný obsah');
    }

    console.log('Sending successful response, content length:', result.length);

    res.json({
      success: true,
      result: result,
      action: action,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Perplexity API error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      timeout: error.code === 'ECONNABORTED',
      timestamp: new Date().toISOString()
    });

    let errorMessage = 'Neznámá chyba při komunikaci s AI';
    let statusCode = 500;

    if (error.response) {
      statusCode = error.response.status;
      switch (error.response.status) {
        case 401:
          errorMessage = 'Neplatný API klíč';
          break;
        case 403:
          errorMessage = 'Přístup zamítnut - zkontrolujte API klíč';
          break;
        case 429:
          errorMessage = 'Překročen limit API požadavků';
          break;
        case 500:
          errorMessage = 'Chyba na straně Perplexity serveru';
          break;
        default:
          errorMessage = error.response.data?.error?.message || `HTTP ${error.response.status}`;
      }
    } else if (error.request) {
      errorMessage = 'Timeout nebo síťová chyba';
    } else {
      errorMessage = error.message;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    env: {
      hasPerplexityKey: !!process.env.PERPLEXITY_API_KEY,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasStabilityKey: !!process.env.STABILITY_API_KEY,
      hasReplicateKey: !!process.env.REPLICATE_API_TOKEN,
      nodeEnv: process.env.NODE_ENV,
      port: PORT
    }
  });
});

// Hlavní stránka
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl 
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server běží na portu ${PORT}`);
  console.log(`📅 Spuštěno: ${new Date().toISOString()}`);
  console.log(`🔑 Perplexity API: ${process.env.PERPLEXITY_API_KEY ? 'nastaven' : 'CHYBÍ!'}`);
  console.log(`🤖 OpenAI API: ${process.env.OPENAI_API_KEY ? 'nastaven' : 'CHYBÍ!'}`);
  console.log(`🎨 Stability AI: ${process.env.STABILITY_API_KEY ? 'nastaven' : 'CHYBÍ!'}`);
  console.log(`🔄 Replicate: ${process.env.REPLICATE_API_TOKEN ? 'nastaven' : 'CHYBÍ!'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🎮 Instagram: Pixel art ilustrace přes ChatGPT DALL-E`);
});

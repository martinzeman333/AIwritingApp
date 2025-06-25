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

// OPRAVA: ChatGPT endpoint - používá nejlepší dostupný model DALL-E 3
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt je povinný'
      });
    }

    console.log('🎮 Generating image with DALL-E 3 HD using EXACT prompt:', prompt);

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'OpenAI API klíč není nastaven'
      });
    }

    console.log('🎮 Using EXACT prompt without modifications:', prompt);
    
    try {
      // OPRAVA: Používá nejlepší dostupný model DALL-E 3 s HD kvalitou
      const openaiResponse = await axios.post('https://api.openai.com/v1/images/generations', {
        model: 'dall-e-3', // Nejlepší dostupný model
        prompt: prompt, // Přesný prompt bez úprav
        n: 1,
        size: '1024x1024', // Nejvyšší dostupné rozlišení pro DALL-E 3
        quality: 'hd', // Nejvyšší kvalita
        style: 'vivid' // Nejlepší styl pro živé barvy
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 120000
      });

      if (openaiResponse.data.data?.[0]?.url) {
        const imageUrl = openaiResponse.data.data[0].url;
        console.log('🎮 HD Image generated with EXACT prompt via DALL-E 3:', imageUrl);
        
        res.json({
          success: true,
          imageUrl: imageUrl,
          prompt: prompt,
          usedPrompt: prompt,
          generationMethod: 'openai-dalle3-hd-exact',
          model: 'dall-e-3',
          quality: 'hd',
          timestamp: new Date().toISOString()
        });
      } else {
        throw new Error('No image URL in OpenAI response');
      }
    } catch (openaiError) {
      console.log('❌ OpenAI DALL-E 3 HD failed:', openaiError.response?.data || openaiError.message);
      
      // Fallback na standardní kvalitu
      try {
        console.log('🔄 Trying DALL-E 3 with standard quality as fallback...');
        
        const fallbackResponse = await axios.post('https://api.openai.com/v1/images/generations', {
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard', // Fallback na standardní kvalitu
          style: 'vivid'
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        });

        if (fallbackResponse.data.data?.[0]?.url) {
          const imageUrl = fallbackResponse.data.data[0].url;
          console.log('🎮 Standard quality image generated:', imageUrl);
          
          res.json({
            success: true,
            imageUrl: imageUrl,
            prompt: prompt,
            usedPrompt: prompt,
            generationMethod: 'openai-dalle3-standard-fallback',
            model: 'dall-e-3',
            quality: 'standard',
            timestamp: new Date().toISOString()
          });
        } else {
          throw new Error('Fallback also failed');
        }
      } catch (fallbackError) {
        console.log('❌ Fallback also failed:', fallbackError.message);
        
        res.status(500).json({
          success: false,
          error: 'Nepodařilo se vygenerovat obrázek: ' + (openaiError.response?.data?.error?.message || openaiError.message)
        });
      }
    }

  } catch (error) {
    console.error('❌ Image generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Chyba při generování obrázku: ' + error.message
    });
  }
});

// OPRAVA: Gemini endpoint - používá nejnovější Gemini 2.5 Flash
app.post('/api/generate-image-gemini', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt je povinný'
      });
    }

    console.log('🔮 Generating image with Gemini 2.5 Flash using EXACT prompt:', prompt);

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API klíč není nastaven'
      });
    }

    try {
      // OPRAVA: Používá nejnovější Gemini 2.5 Flash model
      console.log('🔮 Using Gemini 2.5 Flash for prompt enhancement...');
      
      const geminiResponse = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        contents: [{
          parts: [{
            text: `Create a detailed, vivid image description based on this exact prompt: "${prompt}". Enhance it for AI image generation while keeping the core concept intact. Make it visually rich and specific.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 300
        }
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      if (geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text) {
        const enhancedPrompt = geminiResponse.data.candidates[0].content.parts[0].text.trim();
        console.log('🔮 Gemini 2.5 Flash enhanced prompt:', enhancedPrompt.substring(0, 100) + '...');
        
        // Použij vylepšený prompt pro DALL-E 3 HD
        const dalleResponse = await axios.post('https://api.openai.com/v1/images/generations', {
          model: 'dall-e-3',
          prompt: enhancedPrompt.substring(0, 1000), // DALL-E má limit 1000 znaků
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

        if (dalleResponse.data.data?.[0]?.url) {
          const imageUrl = dalleResponse.data.data[0].url;
          console.log('🔮 HD Image generated via Gemini 2.5 Flash + DALL-E 3:', imageUrl);
          
          res.json({
            success: true,
            imageUrl: imageUrl,
            prompt: prompt,
            enhancedPrompt: enhancedPrompt,
            generationMethod: 'gemini-2.5-flash-dalle3-hd',
            geminiModel: 'gemini-2.5-flash',
            dalleModel: 'dall-e-3',
            quality: 'hd',
            timestamp: new Date().toISOString()
          });
        } else {
          throw new Error('No image URL in DALL-E response');
        }
      } else {
        throw new Error('No valid response from Gemini 2.5 Flash');
      }
    } catch (geminiError) {
      console.log('❌ Gemini 2.5 Flash failed, using direct DALL-E 3 HD with exact prompt...');
      
      // Fallback na přímé DALL-E 3 HD s původním promptem
      const fallbackResponse = await axios.post('https://api.openai.com/v1/images/generations', {
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        style: 'vivid'
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      });

      if (fallbackResponse.data.data?.[0]?.url) {
        const imageUrl = fallbackResponse.data.data[0].url;
        console.log('🔮 HD Image generated with exact prompt via direct DALL-E 3:', imageUrl);
        
        res.json({
          success: true,
          imageUrl: imageUrl,
          prompt: prompt,
          usedPrompt: prompt,
          generationMethod: 'dalle3-hd-direct-fallback',
          model: 'dall-e-3',
          quality: 'hd',
          timestamp: new Date().toISOString()
        });
      } else {
        throw new Error('Both Gemini 2.5 Flash and DALL-E 3 failed');
      }
    }

  } catch (error) {
    console.error('❌ Gemini 2.5 Flash image generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Chyba při generování obrázku přes Gemini 2.5 Flash: ' + error.message
    });
  }
});

// Instagram carousel endpoint pouze s ChatGPT obrázky
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

    // 3. Vygeneruj NEUTRÁLNÍ popis pro pixel art
    const imageDescriptionResponse = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        { 
          role: 'system', 
          content: 'Na základě textu identifikuj NEUTRÁLNÍ objekt, budovu, krajinu nebo abstraktní koncept pro pixel art ilustraci. Vytvoř velmi stručný popis v angličtině (max 4 slova). NEPOUŽÍVEJ politické osobnosti, zbraně, násilí, útoky nebo kontroverzní témata. Zaměř se na neutrální vizuální prvky. Příklady: "office building", "city skyline", "abstract pattern", "geometric shapes", "retro computer".' 
        },
        { 
          role: 'user', 
          content: `Vytvoř neutrální pixel art popis pro: "${selectedText}"` 
        }
      ],
      temperature: 0.6,
      max_tokens: 15
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

    // 5. Vyčisti mainSubject a vytvoř pixel art prompt
    let mainSubject = imageDescriptionResponse.data.choices[0].message.content.trim();
    
    // Základní čištění
    mainSubject = mainSubject
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#/g, '')
      .replace(/_/g, '')
      .replace(/---/g, '')
      .replace(/:/g, '')
      .replace(/"/g, '')
      .replace(/'/g, '')
      .replace(/\[/g, '')
      .replace(/\]/g, '')
      .replace(/\(/g, '')
      .replace(/\)/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Fallback pokud je mainSubject prázdný
    if (!mainSubject || mainSubject.length < 3) {
      console.log('⚠️ Using safe fallback subject due to empty content');
      mainSubject = 'geometric abstract pattern';
    }
    
    // Vytvoř pixel art prompt
    const pixelArtPrompt = `${mainSubject}, 16-bit pixel art style, retro gaming aesthetic, vibrant colors, crisp pixel work, detailed pixel graphics, classic video game style, blocky visuals, pixelated illustration, 8-bit aesthetic, digital art`;
    
    console.log('🎮 Safe mainSubject:', mainSubject);
    console.log('🎮 Pixel art prompt:', pixelArtPrompt);
    
    let backgroundImageUrl = null;
    
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'OpenAI API klíč není nastaven - nelze generovat obrázky'
      });
    }

    try {
      console.log('🎮 Generating HD pixel art with DALL-E 3...');
      
      // OPRAVA: Používá DALL-E 3 HD pro nejlepší kvalitu
      const imageResponse = await axios.post('https://api.openai.com/v1/images/generations', {
        model: 'dall-e-3',
        prompt: pixelArtPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd', // HD kvalita pro Instagram
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
        console.log('🎮 HD Pixel art illustration generated successfully:', backgroundImageUrl);
      } else {
        throw new Error('No image URL in response');
      }
    } catch (imageError) {
      console.log('❌ HD Image generation failed:', imageError.response?.data || imageError.message);
      
      try {
        console.log('🔄 Trying standard quality pixel art as fallback...');
        
        const fallbackResponse = await axios.post('https://api.openai.com/v1/images/generations', {
          model: 'dall-e-3',
          prompt: 'geometric abstract pattern, 16-bit pixel art style, retro gaming aesthetic, vibrant colors, simple shapes, blocky visuals, 8-bit aesthetic',
          n: 1,
          size: '1024x1024',
          quality: 'standard',
          style: 'vivid'
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        });

        if (fallbackResponse.data.data?.[0]?.url) {
          backgroundImageUrl = fallbackResponse.data.data[0].url;
          console.log('🎮 Fallback geometric pixel art generated:', backgroundImageUrl);
        } else {
          throw new Error('Fallback failed - no image URL');
        }
      } catch (fallbackError) {
        console.log('❌ Fallback also failed:', fallbackError.message);
        
        return res.status(500).json({
          success: false,
          error: 'Nepodařilo se vygenerovat pixel art obrázek: ' + (imageError.response?.data?.error?.message || imageError.message)
        });
      }
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
    
    console.log('🎮 Generated Instagram carousel with DALL-E 3 HD PIXEL ART:', {
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
      action: 'instagram-carousel-dalle3-hd',
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

// Perplexity API proxy endpoint
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
    
    // Vyčisti výsledek od markdown značek
    result = result
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
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
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
  console.log(`🔮 Gemini API: ${process.env.GEMINI_API_KEY ? 'nastaven' : 'CHYBÍ!'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🎮 Image Generation: DALL-E 3 HD + Gemini 2.5 Flash enhancement!`);
  console.log(`📱 Instagram Editor: Nejlepší dostupné modely pro generování`);
});

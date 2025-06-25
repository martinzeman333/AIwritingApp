// OPRAVA: Gemini API endpoint pro generování obrázků
app.post('/api/generate-image-gemini', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt je povinný'
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API klíč není nastaven'
      });
    }

    console.log('🔮 Generating image with Gemini for prompt:', prompt);

    // Čištění promptu
    let cleanPrompt = prompt
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#/g, '')
      .replace(/_/g, '')
      .replace(/---/g, '')
      .replace(/:/g, '')
      .replace(/"/g, '')
      .replace(/'/g, '')
      .trim();

    // Bezpečnostní filtry
    const problematicWords = [
      'trump', 'biden', 'putin', 'president', 'politician', 'politik',
      'war', 'attack', 'bomb', 'weapon', 'gun', 'violence', 'kill',
      'útok', 'válka', 'bomba', 'zbraň', 'násilí', 'zabít', 'smrt',
      'nuclear', 'jaderný', 'military', 'army', 'soldier', 'voják',
      'terrorist', 'terorista', 'explosion', 'výbuch', 'blood', 'krev'
    ];
    
    const lowerPrompt = cleanPrompt.toLowerCase();
    const hasProblematicWord = problematicWords.some(word => 
      lowerPrompt.includes(word.toLowerCase())
    );
    
    if (hasProblematicWord) {
      console.log('⚠️ Using safe fallback prompt for Gemini');
      cleanPrompt = 'beautiful abstract art pattern';
    }

    try {
      // OPRAVA: Správný Gemini API endpoint pro text generation
      console.log('🔮 Trying Gemini text enhancement...');
      
      const geminiResponse = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        contents: [{
          parts: [{
            text: `Create a detailed, artistic image description for: "${cleanPrompt}". Make it vivid, colorful, and visually appealing for AI image generation. Focus on visual details, lighting, composition, and artistic style. Maximum 200 words.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 200
        }
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      if (geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text) {
        const enhancedPrompt = geminiResponse.data.candidates[0].content.parts[0].text.trim();
        console.log('🔮 Gemini enhanced prompt:', enhancedPrompt.substring(0, 100) + '...');
        
        // Použij vylepšený prompt pro DALL-E
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
          console.log('🔮 Image generated via Gemini + DALL-E:', imageUrl);
          
          res.json({
            success: true,
            imageUrl: imageUrl,
            prompt: prompt,
            enhancedPrompt: enhancedPrompt,
            generationMethod: 'gemini-enhanced-dalle3',
            timestamp: new Date().toISOString()
          });
        } else {
          throw new Error('No image URL in DALL-E response');
        }
      } else {
        throw new Error('No valid response from Gemini');
      }
    } catch (geminiError) {
      console.log('❌ Gemini enhancement failed:', geminiError.response?.status, geminiError.response?.data || geminiError.message);
      
      // OPRAVA: Lepší fallback na přímé DALL-E s vylepšeným promptem
      console.log('🔄 Using direct DALL-E with enhanced prompt as fallback...');
      
      const enhancedPrompt = `${cleanPrompt}, highly detailed, artistic, vibrant colors, professional photography, cinematic lighting, masterpiece quality, 8k resolution`;
      
      const fallbackResponse = await axios.post('https://api.openai.com/v1/images/generations', {
        model: 'dall-e-3',
        prompt: enhancedPrompt,
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
        console.log('🔮 Fallback image generated via DALL-E:', imageUrl);
        
        res.json({
          success: true,
          imageUrl: imageUrl,
          prompt: prompt,
          enhancedPrompt: enhancedPrompt,
          generationMethod: 'dalle3-enhanced-fallback',
          timestamp: new Date().toISOString()
        });
      } else {
        throw new Error('Both Gemini and DALL-E fallback failed');
      }
    }

  } catch (error) {
    console.error('❌ Gemini image generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Chyba při generování obrázku přes Gemini: ' + error.message
    });
  }
});

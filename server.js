// Instagram carousel endpoint - opravený s realistickými prompty
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

    // 3. Vygeneruj REALISTICKÝ popis pro fotografii (OPRAVENO)
    const imageDescriptionResponse = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        { 
          role: 'system', 
          content: 'Na základě textu vytvoř krátký popis pro realistickou fotografii v angličtině. Začni vždy "Realistic photo of" a popiš konkrétní scénu, osobu nebo místo z textu. Maximálně 10 slov.' 
        },
        { 
          role: 'user', 
          content: `Vytvoř popis realistické fotografie pro: "${selectedText}"` 
        }
      ],
      temperature: 0.6,
      max_tokens: 50
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
          content: 'Vytvoř pouze čisté hashtags pro Instagram. Odpověz pouze hashtags oddělené mezerami, nic jiného.' 
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

    // 5. Vygeneruj realistickou fotografii pro první slide
    let backgroundImageUrl = null;
    let imageDescription = imageDescriptionResponse.data.choices[0].message.content.trim();
    
    // Zajisti správný formát promptu
    if (!imageDescription.toLowerCase().startsWith('realistic photo of')) {
      imageDescription = `Realistic photo of ${imageDescription}`;
    }
    
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log('Generating realistic photo with prompt:', imageDescription);
        
        const imageResponse = await axios.post('https://api.openai.com/v1/images/generations', {
          model: 'dall-e-3',
          prompt: `${imageDescription}, professional photography, high quality, photorealistic, detailed, natural lighting, suitable for Instagram post`,
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

        if (imageResponse.data.data?.[0]?.url) {
          backgroundImageUrl = imageResponse.data.data[0].url;
          console.log('Realistic photo generated:', backgroundImageUrl);
        }
      } catch (imageError) {
        console.log('Image generation failed:', imageError.message);
      }
    }

    const title = titleResponse.data.choices[0].message.content.trim();
    const slideText = textResponse.data.choices[0].message.content.trim();
    
    // Vyčisti hashtags
    let hashtags = hashtagsResponse.data.choices[0].message.content.trim();
    hashtags = hashtags.split(/\s+/).filter(tag => tag.startsWith('#')).join(' ');
    
    console.log('Generated Instagram carousel:', {
      title: title,
      text: slideText,
      hashtags: hashtags,
      imageDescription: imageDescription,
      backgroundImage: backgroundImageUrl
    });

    res.json({
      success: true,
      title: title,
      result: slideText,
      hashtags: hashtags,
      backgroundImageUrl: backgroundImageUrl,
      imageDescription: imageDescription,
      action: 'instagram-carousel',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Instagram carousel generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Chyba při generování Instagram carousel: ' + (error.response?.data?.error?.message || error.message)
    });
  }
});

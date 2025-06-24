// Instagram obrázek endpoint s reálným AI generováním
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
          content: 'Jsi expert na Instagram marketing. Vytvoř poutavý text pro Instagram post v češtině. Text by měl být zajímavý, čitelný a vhodný pro sociální sítě.' 
        },
        { 
          role: 'user', 
          content: `Na základě tohoto obsahu vytvoř text pro Instagram post (bez hashtagů): "${selectedText}"` 
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // 2. Vygeneruj nadpis pro obrázek
    const titleResponse = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        { 
          role: 'system', 
          content: 'Vytvoř krátký, výstižný nadpis v češtině pro Instagram obrázek. Nadpis by měl být poutavý a výstižný.' 
        },
        { 
          role: 'user', 
          content: `Na základě tohoto textu vytvoř krátký nadpis (max 50 znaků): "${selectedText}"` 
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

    // 3. Vygeneruj popis pro AI obrázek
    const imageDescriptionResponse = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'llama-3.1-sonar-small-128k-online',
      messages: [
        { 
          role: 'system', 
          content: 'Vytvoř detailní popis v angličtině pro AI generovaný obrázek. Popis by měl být vizuálně bohatý a vhodný pro moderní Instagram post.' 
        },
        { 
          role: 'user', 
          content: `Na základě tohoto obsahu vytvoř popis pro AI obrázek (v angličtině, detailní): "${selectedText}"` 
        }
      ],
      temperature: 0.8,
      max_tokens: 150
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

    // 5. Vygeneruj AI obrázek
    let backgroundImageUrl = null;
    const imageDescription = imageDescriptionResponse.data.choices[0].message.content.trim();
    
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log('Generating background image with DALL-E...');
        
        const imageResponse = await axios.post('https://api.openai.com/v1/images/generations', {
          model: 'dall-e-3',
          prompt: `${imageDescription}, high quality, modern style, suitable for Instagram post, 4:5 aspect ratio`,
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
          console.log('Background image generated:', backgroundImageUrl);
        }
      } catch (imageError) {
        console.log('Image generation failed:', imageError.message);
      }
    }

    const instagramText = textResponse.data.choices[0].message.content.trim();
    const imageTitle = titleResponse.data.choices[0].message.content.trim();
    
    // Vyčisti hashtags - ponech pouze hashtags
    let hashtags = hashtagsResponse.data.choices[0].message.content.trim();
    hashtags = hashtags.split(/\s+/).filter(tag => tag.startsWith('#')).join(' ');
    
    console.log('Generated Instagram content:', {
      text: instagramText,
      title: imageTitle,
      imageDesc: imageDescription,
      hashtags: hashtags,
      backgroundImage: backgroundImageUrl
    });

    res.json({
      success: true,
      result: instagramText,
      title: imageTitle,
      imageDescription: imageDescription,
      hashtags: hashtags,
      backgroundImageUrl: backgroundImageUrl,
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

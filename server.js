app.post('/api/perplexity', async (req, res) => {
  try {
    const { prompt, selectedText, action } = req.body;
    
    console.log('Received request:', { action, prompt: prompt?.substring(0, 50), selectedText: selectedText?.substring(0, 50) });
    
    if (!process.env.PERPLEXITY_API_KEY) {
      console.error('PERPLEXITY_API_KEY not found in environment variables');
      return res.status(500).json({
        success: false,
        error: 'API klíč není nastaven'
      });
    }

    let systemPrompt = "Jsi užitečný asistent, který pomáhá s úpravou textu. Odpovídej v češtině.";
    let userPrompt = prompt;

    // Přednastavené AI funkce (zůstává stejné)
    switch (action) {
      case 'summarize':
        systemPrompt = "Jsi expert na sumarizaci textu. Vytvoř stručné shrnutí daného textu v češtině.";
        userPrompt = `Sumarizuj následující text: "${selectedText}"`;
        break;
      // ... ostatní cases zůstávají stejné
    }

    console.log('Making API request to Perplexity...');

    const response = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'llama-3.1-sonar-small-128k-online', // Změna modelu
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
      timeout: 30000 // 30 sekund timeout
    });

    console.log('API response received:', response.data.choices?.[0]?.message?.content?.substring(0, 100));

    if (!response.data.choices?.[0]?.message?.content) {
      throw new Error('Prázdná odpověď z API');
    }

    res.json({
      success: true,
      result: response.data.choices[0].message.content
    });

  } catch (error) {
    console.error('Perplexity API error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers ? 'present' : 'missing'
      }
    });

    res.status(500).json({
      success: false,
      error: `Chyba API: ${error.response?.data?.error?.message || error.message}`
    });
  }
});

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Perplexity API proxy endpoint
app.post('/api/perplexity', async (req, res) => {
  try {
    const { prompt, selectedText, action } = req.body;
    
    let systemPrompt = "Jsi užitečný asistent, který pomáhá s úpravou textu. Odpovídej v češtině.";
    let userPrompt = prompt;

    // Přednastavené AI funkce
    switch (action) {
      case 'summarize':
        systemPrompt = "Jsi expert na sumarizaci textu. Vytvoř stručné shrnutí daného textu v češtině.";
        userPrompt = `Sumarizuj následující text: "${selectedText}"`;
        break;
      case 'twitter':
        systemPrompt = "Jsi expert na tvorbu obsahu pro sociální sítě. Vytvoř atraktivní Twitter post v češtině.";
        userPrompt = `Přepis následující text do formátu vhodného pro Twitter post (max 280 znaků): "${selectedText}"`;
        break;
      case 'instagram':
        systemPrompt = "Jsi expert na Instagram marketing. Vytvoř poutavý text pro Instagram post v češtině.";
        userPrompt = `Přepis následující text do formátu vhodného pro Instagram post s hashtegy: "${selectedText}"`;
        break;
      case 'expand':
        systemPrompt = "Jsi expert na rozšiřování a vylepšování textů. Rozšiř daný text zachováním původního významu.";
        userPrompt = `Rozšiř a vylepši následující text: "${selectedText}"`;
        break;
      case 'improve':
        systemPrompt = "Jsi expert na jazykové korekce a stylistické úpravy. Vylepši gramatiku a styl textu.";
        userPrompt = `Vylepši gramatiku a styl následujícího textu: "${selectedText}"`;
        break;
      default:
        // Vlastní prompt
        userPrompt = selectedText ? `${prompt} "${selectedText}"` : prompt;
    }

    const response = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'sonar-pro',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    res.json({
      success: true,
      result: response.data.choices[0].message.content
    });

  } catch (error) {
    console.error('Perplexity API error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Chyba při komunikaci s AI API: ' + (error.response?.data?.error?.message || error.message)
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server běží na portu ${PORT}`);
});

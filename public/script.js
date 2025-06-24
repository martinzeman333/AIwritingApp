// Přidej do AITextEditor třídy novou metodu pro Instagram
async processInstagramImage() {
    console.log('Processing Instagram image for text:', this.selectedText);
    
    this.showLoading();
    document.getElementById('loadingText').textContent = 'Generuji Instagram obsah...';

    try {
        const response = await fetch('/api/instagram-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                selectedText: this.selectedText
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        if (data.success && data.result) {
            // Zobraz Instagram modal s vygenerovaným obsahem
            this.showInstagramModal(data);
        } else {
            this.showError(data.error || 'Chyba při generování Instagram postu');
        }
    } catch (error) {
        console.error('Instagram image generation failed:', error);
        this.showError('Chyba při generování obrázku: ' + error.message);
    } finally {
        this.hideLoading();
    }
}

showInstagramModal(data) {
    // Nastav hodnoty do polí
    document.getElementById('postText').value = data.result;
    document.getElementById('postHashtags').value = data.hashtags;
    document.getElementById('imagePrompt').value = data.imageDescription;

    // Uložit data pro pozdější použití
    this.instagramData = {
        text: data.result,
        title: data.title,
        hashtags: data.hashtags,
        imageDescription: data.imageDescription,
        backgroundImageUrl: data.backgroundImageUrl
    };

    // Vygeneruj slides
    this.generateInstagramSlides();

    // Zobraz modal
    document.getElementById('instagramModal').classList.remove('hidden');

    // Přidej event listenery pro nové funkce
    this.setupInstagramEventListeners();
}

generateInstagramSlides() {
    // Slide 1: Obrázek s nadpisem
    this.generateImageSlide();
    
    // Slide 2: Text na abstraktním pozadí
    this.generateTextSlide();
}

async generateImageSlide() {
    const canvas = document.getElementById('imageCanvas');
    const ctx = canvas.getContext('2d');
    
    // Vyčisti canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    try {
        if (this.instagramData.backgroundImageUrl) {
            // Načti AI vygenerovaný obrázek
            document.getElementById('loadingText').textContent = 'Načítám AI obrázek...';
            
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            await new Promise((resolve, reject) => {
                img.onload = () => {
                    // Nakresli pozadí
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve();
                };
                img.onerror = reject;
                img.src = this.instagramData.backgroundImageUrl;
            });
        } else {
            // Fallback - gradient pozadí
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Přidej overlay pro lepší čitelnost textu
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Přidej nadpis
        this.addTitleToCanvas(ctx, this.instagramData.title);
        
    } catch (error) {
        console.error('Error loading background image:', error);
        // Fallback na gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        this.addTitleToCanvas(ctx, this.instagramData.title);
    }
}

addTitleToCanvas(ctx, title) {
    // Nastavení fontu pro nadpis
    ctx.font = 'bold 80px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Stín pro lepší čitelnost
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;

    // Bílý text s černým obrysem
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;

    const maxWidth = ctx.canvas.width * 0.85;
    const lines = this.wrapText(ctx, title, maxWidth);
    const lineHeight = 100;
    const startY = ctx.canvas.height / 2 - (lines.length - 1) * lineHeight / 2;

    lines.forEach((line, index) => {
        const y = startY + index * lineHeight;
        ctx.strokeText(line, ctx.canvas.width / 2, y);
        ctx.fillText(line, ctx.canvas.width / 2, y);
    });

    // Reset stínu
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

generateTextSlide() {
    const canvas = document.getElementById('textCanvas');
    const ctx = canvas.getContext('2d');
    
    // Vyčisti canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Moderní abstraktní pozadí
    this.createAbstractBackground(ctx);
    
    // Přidej text příspěvku
    this.addPostTextToCanvas(ctx, this.instagramData.text);
}

createAbstractBackground(ctx) {
    // Moderní gradient pozadí
    const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, ctx.canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Přidej geometrické tvary pro moderní vzhled
    ctx.globalAlpha = 0.1;
    
    // Kruh
    ctx.beginPath();
    ctx.arc(ctx.canvas.width * 0.8, ctx.canvas.height * 0.2, 200, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    // Trojúhelník
    ctx.beginPath();
    ctx.moveTo(ctx.canvas.width * 0.1, ctx.canvas.height * 0.8);
    ctx.lineTo(ctx.canvas.width * 0.4, ctx.canvas.height * 0.6);
    ctx.lineTo(ctx.canvas.width * 0.2, ctx.canvas.height * 0.95);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    ctx.globalAlpha = 1;
}

addPostTextToCanvas(ctx, text) {
    // Nastavení fontu pro text příspěvku
    ctx.font = '48px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';

    const maxWidth = ctx.canvas.width * 0.8;
    const lines = this.wrapText(ctx, text, maxWidth);
    const lineHeight = 65;
    const startY = ctx.canvas.height / 2 - (lines.length - 1) * lineHeight / 2;

    lines.forEach((line, index) => {
        const y = startY + index * lineHeight;
        ctx.fillText(line, ctx.canvas.width / 2, y);
    });
}

wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < maxWidth) {
            currentLine += ' ' + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

setupInstagramEventListeners() {
    // Slide indicators
    document.querySelectorAll('.indicator').forEach(indicator => {
        indicator.addEventListener('click', (e) => {
            const slideNum = e.target.dataset.slide;
            this.switchSlide(slideNum);
        });
    });

    // Regenerate image button
    document.getElementById('regenerateImage').addEventListener('click', async () => {
        const newPrompt = document.getElementById('imagePrompt').value;
        await this.regenerateBackgroundImage(newPrompt);
    });

    // Text/hashtags change listeners
    document.getElementById('postText').addEventListener('input', (e) => {
        this.instagramData.text = e.target.value;
        this.generateTextSlide();
    });

    document.getElementById('postHashtags').addEventListener('input', (e) => {
        this.instagramData.hashtags = e.target.value;
    });

    // Action buttons
    document.getElementById('downloadSlides').addEventListener('click', () => {
        this.downloadSlides();
    });

    document.getElementById('copyInstagramText').addEventListener('click', () => {
        const fullText = `${this.instagramData.text}\n\n${this.instagramData.hashtags}`;
        navigator.clipboard.writeText(fullText).then(() => {
            this.showNotification('Text zkopírován do schránky');
        });
    });

    document.getElementById('postToInstagram').addEventListener('click', () => {
        this.prepareForInstagram();
    });

    document.getElementById('insertInstagramText').addEventListener('click', () => {
        const fullText = `${this.instagramData.text}\n\n${this.instagramData.hashtags}`;
        this.insertAIResult(fullText, 'instagram');
        document.getElementById('instagramModal').classList.add('hidden');
    });

    // Close modal
    document.querySelector('#instagramModal .close-btn').addEventListener('click', () => {
        document.getElementById('instagramModal').classList.add('hidden');
    });
}

switchSlide(slideNum) {
    // Skryj všechny slides
    document.querySelectorAll('.slide').forEach(slide => {
        slide.classList.remove('active');
    });
    
    // Skryj všechny indicators
    document.querySelectorAll('.indicator').forEach(indicator => {
        indicator.classList.remove('active');
    });
    
    // Zobraz vybraný slide a indicator
    document.getElementById(`slide${slideNum}`).classList.add('active');
    document.querySelector(`[data-slide="${slideNum}"]`).classList.add('active');
}

async regenerateBackgroundImage(newPrompt) {
    if (!process.env.OPENAI_API_KEY) {
        this.showError('OpenAI API klíč není nastaven');
        return;
    }

    this.showLoading();
    document.getElementById('loadingText').textContent = 'Regeneruji obrázek...';

    try {
        const response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: newPrompt
            })
        });

        const data = await response.json();
        
        if (data.success && data.imageUrl) {
            this.instagramData.backgroundImageUrl = data.imageUrl;
            await this.generateImageSlide();
            this.showNotification('Obrázek regenerován');
        } else {
            this.showError('Chyba při regeneraci obrázku');
        }
    } catch (error) {
        this.showError('Chyba při regeneraci: ' + error.message);
    } finally {
        this.hideLoading();
    }
}

downloadSlides() {
    // Stáhni slide 1
    const canvas1 = document.getElementById('imageCanvas');
    const link1 = document.createElement('a');
    link1.download = 'instagram-slide-1.png';
    link1.href = canvas1.toDataURL();
    link1.click();

    // Stáhni slide 2
    setTimeout(() => {
        const canvas2 = document.getElementById('textCanvas');
        const link2 = document.createElement('a');
        link2.download = 'instagram-slide-2.png';
        link2.href = canvas2.toDataURL();
        link2.click();
    }, 500);

    this.showNotification('Slides staženy');
}

prepareForInstagram() {
    const fullText = `${this.instagramData.text}\n\n${this.instagramData.hashtags}`;
    
    // Zkopíruj text do schránky
    navigator.clipboard.writeText(fullText);
    
    // Zobraz instrukce
    alert(`Instagram obsah je připraven!

📋 Text byl zkopírován do schránky
💾 Stáhněte si slides pomocí tlačítka "Stáhnout slides"

Instrukce:
1. Otevřete Instagram aplikaci
2. Vytvořte nový příspěvek (carousel)
3. Nahrajte oba stažené obrázky
4. Vložte zkopírovaný text jako popis
5. Zveřejněte příspěvek`);
}

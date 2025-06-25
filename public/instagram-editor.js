class InstagramCarouselEditor {
    constructor() {
        this.slides = [];
        this.currentSlideIndex = -1;
        this.maxSlides = 10;
        
        this.initializeElements();
        this.setupEventListeners();
        this.updateUI();
        
        console.log('Instagram Carousel Editor initialized');
    }
    
    initializeElements() {
        // Header buttons
        this.backBtn = document.getElementById('backToMainBtn');
        this.saveBtn = document.getElementById('saveCarouselBtn');
        this.loadBtn = document.getElementById('loadCarouselBtn');
        this.exportBtn = document.getElementById('exportCarouselBtn');
        
        // Slides
        this.addSlideBtn = document.getElementById('addSlideBtn');
        this.slidesList = document.getElementById('slidesList');
        this.slidePreview = document.getElementById('currentSlidePreview');
        
        // Text editor
        this.textEditor = document.getElementById('slideTextEditor');
        this.boldBtn = document.getElementById('boldBtn');
        this.italicBtn = document.getElementById('italicBtn');
        this.underlineBtn = document.getElementById('underlineBtn');
        this.fontSize = document.getElementById('fontSize');
        this.textColor = document.getElementById('textColor');
        
        // Background controls
        this.imagePrompt = document.getElementById('imagePrompt');
        this.chatGPTBtn = document.getElementById('generateChatGPTBtn');
        this.geminiBtn = document.getElementById('generateGeminiBtn');
        this.removeBackgroundBtn = document.getElementById('removeBackgroundBtn');
        this.backgroundColor = document.getElementById('backgroundColor');
        
        // Slide settings
        this.textPosition = document.getElementById('textPosition');
        this.textBackgroundOpacity = document.getElementById('textBackgroundOpacity');
        this.opacityValue = document.getElementById('opacityValue');
        
        // Modals
        this.saveModal = document.getElementById('saveModal');
        this.loadModal = document.getElementById('loadModal');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.carouselName = document.getElementById('carouselName');
        this.carouselsList = document.getElementById('carouselsList');
    }
    
    setupEventListeners() {
        // Header buttons
        this.backBtn.addEventListener('click', () => this.goBackToMain());
        this.saveBtn.addEventListener('click', () => this.showSaveModal());
        this.loadBtn.addEventListener('click', () => this.showLoadModal());
        this.exportBtn.addEventListener('click', () => this.exportSlides());
        
        // Slides
        this.addSlideBtn.addEventListener('click', () => this.addSlide());
        
        // Text editor
        this.textEditor.addEventListener('input', () => this.updateCurrentSlide());
        this.boldBtn.addEventListener('click', () => this.toggleFormat('bold'));
        this.italicBtn.addEventListener('click', () => this.toggleFormat('italic'));
        this.underlineBtn.addEventListener('click', () => this.toggleFormat('underline'));
        this.fontSize.addEventListener('change', () => this.updateCurrentSlide());
        this.textColor.addEventListener('change', () => this.updateCurrentSlide());
        
        // Background controls
        this.chatGPTBtn.addEventListener('click', () => this.generateImage('chatgpt'));
        this.geminiBtn.addEventListener('click', () => this.generateImage('gemini'));
        this.removeBackgroundBtn.addEventListener('click', () => this.removeBackground());
        this.backgroundColor.addEventListener('change', () => this.updateCurrentSlide());
        
        // Slide settings
        this.textPosition.addEventListener('change', () => this.updateCurrentSlide());
        this.textBackgroundOpacity.addEventListener('input', (e) => {
            this.opacityValue.textContent = e.target.value + '%';
            this.updateCurrentSlide();
        });
        
        // Modals
        document.getElementById('confirmSaveCarousel').addEventListener('click', () => this.saveCarousel());
        document.getElementById('cancelSaveCarousel').addEventListener('click', () => this.hideSaveModal());
        document.getElementById('cancelLoadCarousel').addEventListener('click', () => this.hideLoadModal());
    }
    
    addSlide() {
        if (this.slides.length >= this.maxSlides) {
            alert(`Maximální počet slidů je ${this.maxSlides}`);
            return;
        }
        
        const newSlide = {
            id: this.generateId(),
            text: '',
            backgroundImage: null,
            backgroundColor: '#667eea',
            textPosition: 'center',
            textBackgroundOpacity: 70,
            fontSize: '18px',
            textColor: '#ffffff',
            formatting: {
                bold: false,
                italic: false,
                underline: false
            }
        };
        
        this.slides.push(newSlide);
        this.currentSlideIndex = this.slides.length - 1;
        this.updateUI();
        this.loadSlideToEditor();
        
        console.log('Added new slide:', newSlide.id);
    }
    
    deleteSlide(index) {
        if (confirm('Opravdu chcete smazat tento slide?')) {
            this.slides.splice(index, 1);
            
            if (this.currentSlideIndex >= this.slides.length) {
                this.currentSlideIndex = this.slides.length - 1;
            }
            
            this.updateUI();
            
            if (this.currentSlideIndex >= 0) {
                this.loadSlideToEditor();
            } else {
                this.clearEditor();
            }
        }
    }
    
    selectSlide(index) {
        this.saveCurrentSlide();
        this.currentSlideIndex = index;
        this.loadSlideToEditor();
        this.updateUI();
    }
    
    saveCurrentSlide() {
        if (this.currentSlideIndex >= 0 && this.slides[this.currentSlideIndex]) {
            const slide = this.slides[this.currentSlideIndex];
            slide.text = this.textEditor.innerHTML;
            slide.fontSize = this.fontSize.value;
            slide.textColor = this.textColor.value;
            slide.backgroundColor = this.backgroundColor.value;
            slide.textPosition = this.textPosition.value;
            slide.textBackgroundOpacity = parseInt(this.textBackgroundOpacity.value);
        }
    }
    
    loadSlideToEditor() {
        if (this.currentSlideIndex >= 0 && this.slides[this.currentSlideIndex]) {
            const slide = this.slides[this.currentSlideIndex];
            
            this.textEditor.innerHTML = slide.text;
            this.fontSize.value = slide.fontSize;
            this.textColor.value = slide.textColor;
            this.backgroundColor.value = slide.backgroundColor;
            this.textPosition.value = slide.textPosition;
            this.textBackgroundOpacity.value = slide.textBackgroundOpacity;
            this.opacityValue.textContent = slide.textBackgroundOpacity + '%';
            
            this.updateSlidePreview();
        }
    }
    
    clearEditor() {
        this.textEditor.innerHTML = '';
        this.imagePrompt.value = '';
        this.updateSlidePreview();
    }
    
    updateCurrentSlide() {
        this.saveCurrentSlide();
        this.updateSlidePreview();
        this.updateSlideThumbnail();
    }
    
    updateSlidePreview() {
        if (this.currentSlideIndex >= 0 && this.slides[this.currentSlideIndex]) {
            const slide = this.slides[this.currentSlideIndex];
            
            this.slidePreview.innerHTML = `
                <div class="slide-canvas">
                    ${slide.backgroundImage ? 
                        `<img src="${slide.backgroundImage}" class="slide-background" alt="Background">` : 
                        `<div class="slide-background" style="background: ${slide.backgroundColor};"></div>`
                    }
                    <div class="slide-text-overlay ${slide.textPosition}" 
                         style="
                             font-size: ${slide.fontSize};
                             color: ${slide.textColor};
                             background: rgba(0,0,0,${slide.textBackgroundOpacity / 100});
                             border-radius: 6px;
                             ${slide.text ? 'padding: 0.5rem;' : ''}
                         ">
                        ${slide.text}
                    </div>
                </div>
            `;
        } else {
            this.slidePreview.innerHTML = `
                <div class="slide-canvas">
                    <div class="empty-slide">
                        <p>Vyberte slide nebo vytvořte nový</p>
                    </div>
                </div>
            `;
        }
    }
    
    updateSlideThumbnail() {
        if (this.currentSlideIndex >= 0) {
            const slideItem = this.slidesList.children[this.currentSlideIndex];
            if (slideItem) {
                const thumbnail = slideItem.querySelector('.slide-thumbnail');
                const slide = this.slides[this.currentSlideIndex];
                
                thumbnail.innerHTML = `
                    ${slide.backgroundImage ? 
                        `<img src="${slide.backgroundImage}" alt="Background">` : 
                        `<div style="background: ${slide.backgroundColor}; width: 100%; height: 100%;"></div>`
                    }
                    <div class="slide-number">${this.currentSlideIndex + 1}</div>
                `;
            }
        }
    }
    
    updateUI() {
        // Update slides count
        const slidesHeader = document.querySelector('.slides-header h3');
        slidesHeader.textContent = `Slides (${this.slides.length}/${this.maxSlides})`;
        
        // Update slides list
        this.slidesList.innerHTML = '';
        this.slides.forEach((slide, index) => {
            const slideItem = document.createElement('div');
            slideItem.className = `slide-item ${index === this.currentSlideIndex ? 'active' : ''}`;
            slideItem.innerHTML = `
                <div class="slide-thumbnail">
                    ${slide.backgroundImage ? 
                        `<img src="${slide.backgroundImage}" alt="Background">` : 
                        `<div style="background: ${slide.backgroundColor}; width: 100%; height: 100%;"></div>`
                    }
                    <div class="slide-number">${index + 1}</div>
                </div>
                <button class="slide-delete" onclick="editor.deleteSlide(${index})">×</button>
            `;
            
            slideItem.addEventListener('click', (e) => {
                if (!e.target.classList.contains('slide-delete')) {
                    this.selectSlide(index);
                }
            });
            
            this.slidesList.appendChild(slideItem);
        });
        
        // Update add button state
        this.addSlideBtn.disabled = this.slides.length >= this.maxSlides;
    }
    
    toggleFormat(format) {
        document.execCommand(format, false, null);
        this.updateFormatButtons();
        this.updateCurrentSlide();
    }
    
    updateFormatButtons() {
        this.boldBtn.classList.toggle('active', document.queryCommandState('bold'));
        this.italicBtn.classList.toggle('active', document.queryCommandState('italic'));
        this.underlineBtn.classList.toggle('active', document.queryCommandState('underline'));
    }
    
    async generateImage(provider) {
        const prompt = this.imagePrompt.value.trim();
        if (!prompt) {
            alert('Zadejte popis obrázku');
            return;
        }
        
        this.showLoading(`Generuji obrázek přes ${provider.toUpperCase()}...`);
        
        try {
            let response;
            
            if (provider === 'chatgpt') {
                response = await fetch('/api/generate-image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        prompt: prompt + ', high quality, detailed, vibrant colors'
                    })
                });
            } else if (provider === 'gemini') {
                response = await fetch('/api/generate-image-gemini', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        prompt: prompt + ', high quality, detailed, vibrant colors'
                    })
                });
            }
            
            const data = await response.json();
            
            if (data.success && data.imageUrl) {
                if (this.currentSlideIndex >= 0) {
                    this.slides[this.currentSlideIndex].backgroundImage = data.imageUrl;
                    this.updateSlidePreview();
                    this.updateSlideThumbnail();
                }
                this.showNotification(`Obrázek vygenerován přes ${provider.toUpperCase()}`);
            } else {
                throw new Error(data.error || 'Nepodařilo se vygenerovat obrázek');
            }
        } catch (error) {
            console.error('Image generation failed:', error);
            alert('Chyba při generování obrázku: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }
    
    removeBackground() {
        if (this.currentSlideIndex >= 0) {
            this.slides[this.currentSlideIndex].backgroundImage = null;
            this.updateSlidePreview();
            this.updateSlideThumbnail();
        }
    }
    
    showSaveModal() {
        this.saveCurrentSlide();
        this.saveModal.classList.remove('hidden');
        this.carouselName.focus();
    }
    
    hideSaveModal() {
        this.saveModal.classList.add('hidden');
        this.carouselName.value = '';
    }
    
    saveCarousel() {
        const name = this.carouselName.value.trim();
        if (!name) {
            alert('Zadejte název carousel');
            return;
        }
        
        const carousel = {
            id: this.generateId(),
            name: name,
            slides: this.slides,
            created: new Date().toISOString()
        };
        
        const saved = this.getSavedCarousels();
        saved.unshift(carousel);
        localStorage.setItem('instagramCarousels', JSON.stringify(saved));
        
        this.hideSaveModal();
        this.showNotification(`Carousel "${name}" uložen`);
    }
    
    showLoadModal() {
        this.loadCarouselsList();
        this.loadModal.classList.remove('hidden');
    }
    
    hideLoadModal() {
        this.loadModal.classList.add('hidden');
    }
    
    loadCarouselsList() {
        const saved = this.getSavedCarousels();
        this.carouselsList.innerHTML = '';
        
        if (saved.length === 0) {
            this.carouselsList.innerHTML = '<p>Žádné uložené carousely</p>';
            return;
        }
        
        saved.forEach(carousel => {
            const item = document.createElement('div');
            item.className = 'carousel-item';
            item.innerHTML = `
                <h4>${carousel.name}</h4>
                <p>${carousel.slides.length} slidů • ${this.formatDate(carousel.created)}</p>
            `;
            
            item.addEventListener('click', () => {
                this.loadCarousel(carousel);
                this.hideLoadModal();
            });
            
            this.carouselsList.appendChild(item);
        });
    }
    
    loadCarousel(carousel) {
        this.slides = carousel.slides;
        this.currentSlideIndex = this.slides.length > 0 ? 0 : -1;
        this.updateUI();
        
        if (this.currentSlideIndex >= 0) {
            this.loadSlideToEditor();
        } else {
            this.clearEditor();
        }
        
        this.showNotification(`Carousel "${carousel.name}" načten`);
    }
    
    getSavedCarousels() {
        const saved = localStorage.getItem('instagramCarousels');
        return saved ? JSON.parse(saved) : [];
    }
    
    exportSlides() {
        if (this.slides.length === 0) {
            alert('Nejdříve vytvořte nějaké slides');
            return;
        }
        
        this.saveCurrentSlide();
        
        this.slides.forEach((slide, index) => {
            // Vytvoř canvas pro export
            const canvas = document.createElement('canvas');
            canvas.width = 1080;
            canvas.height = 1350;
            const ctx = canvas.getContext('2d');
            
            // Pozadí
            if (slide.backgroundImage) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    this.drawTextOnCanvas(ctx, slide, canvas.width, canvas.height);
                    this.downloadCanvas(canvas, `slide-${index + 1}.png`);
                };
                img.src = slide.backgroundImage;
            } else {
                ctx.fillStyle = slide.backgroundColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                this.drawTextOnCanvas(ctx, slide, canvas.width, canvas.height);
                this.downloadCanvas(canvas, `slide-${index + 1}.png`);
            }
        });
        
        this.showNotification('Export slidů zahájen');
    }
    
    drawTextOnCanvas(ctx, slide, width, height) {
        if (!slide.text) return;
        
        const text = slide.text.replace(/<[^>]*>/g, ''); // Odstraň HTML tagy
        const fontSize = parseInt(slide.fontSize) * 3; // Zvětši pro vysoké rozlišení
        
        ctx.font = `${fontSize}px Arial, sans-serif`;
        ctx.fillStyle = slide.textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Pozadí textu
        const opacity = slide.textBackgroundOpacity / 100;
        ctx.fillStyle = `rgba(0,0,0,${opacity})`;
        
        const textMetrics = ctx.measureText(text);
        const textWidth = textMetrics.width;
        const textHeight = fontSize;
        
        let x, y;
        
        switch (slide.textPosition) {
            case 'center':
                x = width / 2;
                y = height / 2;
                break;
            case 'top':
                x = width / 2;
                y = textHeight + 50;
                break;
            case 'bottom':
                x = width / 2;
                y = height - textHeight - 50;
                break;
            case 'left':
                x = textWidth / 2 + 50;
                y = height / 2;
                break;
            case 'right':
                x = width - textWidth / 2 - 50;
                y = height / 2;
                break;
        }
        
        // Nakresli pozadí textu
        ctx.fillRect(x - textWidth / 2 - 20, y - textHeight / 2 - 10, textWidth + 40, textHeight + 20);
        
        // Nakresli text
        ctx.fillStyle = slide.textColor;
        ctx.fillText(text, x, y);
    }
    
    downloadCanvas(canvas, filename) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
    
    showLoading(text) {
        document.getElementById('loadingText').textContent = text;
        this.loadingOverlay.classList.remove('hidden');
    }
    
    hideLoading() {
        this.loadingOverlay.classList.add('hidden');
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #0095f6;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 3000;
            font-weight: 500;
            font-size: 14px;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
    
    goBackToMain() {
        if (this.slides.length > 0 && !confirm('Opravdu chcete opustit editor? Neuložené změny budou ztraceny.')) {
            return;
        }
        window.location.href = '/';
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('cs-CZ', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    generateId() {
        return 'slide_' + Math.random().toString(36).substr(2, 9);
    }
}

// Inicializace editoru
let editor;
document.addEventListener('DOMContentLoaded', () => {
    editor = new InstagramCarouselEditor();
});

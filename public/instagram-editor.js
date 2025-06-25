class InstagramCarouselEditor {
    constructor() {
        console.log('🎨 Instagram Carousel Editor initializing...');
        
        // Data
        this.slides = [];
        this.currentSlideIndex = -1;
        this.currentCarouselId = null;
        this.currentFilter = 'all';
        this.maxSlides = 10;
        
        // Initialize
        this.initializeElements();
        this.setupEventListeners();
        this.loadCarouselsList();
        this.updateUI();
        
        console.log('✅ Instagram Carousel Editor initialized');
    }
    
    initializeElements() {
        // Navigation
        this.backBtn = document.getElementById('backToMainBtn');
        this.newCarouselBtn = document.getElementById('newCarouselBtn');
        
        // Header
        this.carouselTitle = document.getElementById('carouselTitle');
        this.saveBtn = document.getElementById('saveCarouselBtn');
        this.exportBtn = document.getElementById('exportCarouselBtn');
        
        // Slides
        this.slidesContainer = document.getElementById('slidesContainer');
        this.addSlideBtn = document.getElementById('addSlideBtn');
        this.addFirstSlideBtn = document.getElementById('addFirstSlideBtn');
        this.prevSlideBtn = document.getElementById('prevSlideBtn');
        this.nextSlideBtn = document.getElementById('nextSlideBtn');
        this.slideCounter = document.getElementById('slideCounter');
        
        // Editor panel
        this.slideEditorPanel = document.getElementById('slideEditorPanel');
        this.slideText = document.getElementById('slideText');
        this.textPosition = document.getElementById('textPosition');
        this.textSize = document.getElementById('textSize');
        this.textColorPicker = document.getElementById('textColorPicker');
        this.backgroundColorPicker = document.getElementById('backgroundColorPicker');
        this.textOpacity = document.getElementById('textOpacity');
        this.opacityValue = document.getElementById('opacityValue');
        this.imagePrompt = document.getElementById('imagePrompt');
        this.generateChatGPTBtn = document.getElementById('generateChatGPTBtn');
        this.generateGeminiBtn = document.getElementById('generateGeminiBtn');
        this.generateReplicateBtn = document.getElementById('generateReplicateBtn');
        this.removeImageBtn = document.getElementById('removeImageBtn');
        
        // Carousels list
        this.carouselsList = document.getElementById('carouselsList');
        
        // Modals
        this.saveModal = document.getElementById('saveModal');
        this.carouselNameInput = document.getElementById('carouselNameInput');
        this.confirmSaveBtn = document.getElementById('confirmSaveBtn');
        this.cancelSaveBtn = document.getElementById('cancelSaveBtn');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.loadingText = document.getElementById('loadingText');
    }
    
    setupEventListeners() {
        // Navigation
        this.backBtn?.addEventListener('click', () => this.goBackToMain());
        this.newCarouselBtn?.addEventListener('click', () => this.createNewCarousel());
        
        // Header actions
        this.saveBtn?.addEventListener('click', () => this.showSaveModal());
        this.exportBtn?.addEventListener('click', () => this.exportCarousel());
        
        // Slides
        this.addSlideBtn?.addEventListener('click', () => this.addSlide());
        this.addFirstSlideBtn?.addEventListener('click', () => this.addSlide());
        this.prevSlideBtn?.addEventListener('click', () => this.navigateSlide(-1));
        this.nextSlideBtn?.addEventListener('click', () => this.navigateSlide(1));
        
        // Editor controls
        this.slideText?.addEventListener('input', () => this.updateCurrentSlide());
        this.textPosition?.addEventListener('change', () => this.updateCurrentSlide());
        this.textSize?.addEventListener('change', () => this.updateCurrentSlide());
        this.textColorPicker?.addEventListener('change', () => this.updateCurrentSlide());
        this.backgroundColorPicker?.addEventListener('change', () => this.updateCurrentSlide());
        this.textOpacity?.addEventListener('input', (e) => {
            if (this.opacityValue) {
                this.opacityValue.textContent = e.target.value + '%';
            }
            this.updateCurrentSlide();
        });
        
        // Image generation - všechny tři možnosti
        this.generateChatGPTBtn?.addEventListener('click', () => this.generateImage('chatgpt'));
        this.generateGeminiBtn?.addEventListener('click', () => this.generateImage('gemini'));
        this.generateReplicateBtn?.addEventListener('click', () => this.generateImage('replicate'));
        this.removeImageBtn?.addEventListener('click', () => this.removeBackgroundImage());
        
        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // Format buttons
        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleFormat(e.target.dataset.format));
        });
        
        // Modal
        this.confirmSaveBtn?.addEventListener('click', () => this.saveCarousel());
        this.cancelSaveBtn?.addEventListener('click', () => this.hideSaveModal());
        
        // Filter items
        document.querySelectorAll('.section-item[data-filter]').forEach(item => {
            item.addEventListener('click', (e) => this.handleFilterClick(e));
        });
    }
    
    createNewCarousel() {
        console.log('🆕 Creating new carousel...');
        this.slides = [];
        this.currentSlideIndex = -1;
        this.currentCarouselId = null;
        if (this.carouselTitle) {
            this.carouselTitle.textContent = 'New Instagram Carousel';
        }
        this.updateUI();
        this.showNotification('New carousel created');
    }
    
    addSlide() {
        if (this.slides.length >= this.maxSlides) {
            this.showNotification(`Maximum ${this.maxSlides} slides allowed`, 'error');
            return;
        }
        
        console.log('➕ Adding new slide...');
        
        const newSlide = {
            id: this.generateId(),
            text: '',
            textPosition: 'center',
            textSize: '20px',
            textColor: '#ffffff',
            backgroundColor: '#667eea',
            backgroundImage: null,
            textOpacity: 70,
            imagePrompt: ''
        };
        
        this.slides.push(newSlide);
        this.currentSlideIndex = this.slides.length - 1;
        this.updateUI();
        this.selectSlide(this.currentSlideIndex);
        this.showNotification(`Slide ${this.slides.length} added`);
    }
    
    selectSlide(index) {
        if (index < 0 || index >= this.slides.length) return;
        
        console.log(`🎯 Selecting slide ${index + 1}...`);
        
        this.saveCurrentSlideData();
        this.currentSlideIndex = index;
        this.loadSlideToEditor();
        this.updateSlidesDisplay();
        if (this.slideEditorPanel) {
            this.slideEditorPanel.style.display = 'block';
        }
    }
    
    saveCurrentSlideData() {
        if (this.currentSlideIndex >= 0 && this.slides[this.currentSlideIndex]) {
            const slide = this.slides[this.currentSlideIndex];
            slide.text = this.slideText?.value || '';
            slide.textPosition = this.textPosition?.value || 'center';
            slide.textSize = this.textSize?.value || '20px';
            slide.textColor = this.textColorPicker?.value || '#ffffff';
            slide.backgroundColor = this.backgroundColorPicker?.value || '#667eea';
            slide.textOpacity = parseInt(this.textOpacity?.value || 70);
            slide.imagePrompt = this.imagePrompt?.value || '';
        }
    }
    
    loadSlideToEditor() {
        if (this.currentSlideIndex >= 0 && this.slides[this.currentSlideIndex]) {
            const slide = this.slides[this.currentSlideIndex];
            
            if (this.slideText) this.slideText.value = slide.text;
            if (this.textPosition) this.textPosition.value = slide.textPosition;
            if (this.textSize) this.textSize.value = slide.textSize;
            if (this.textColorPicker) this.textColorPicker.value = slide.textColor;
            if (this.backgroundColorPicker) this.backgroundColorPicker.value = slide.backgroundColor;
            if (this.textOpacity) {
                this.textOpacity.value = slide.textOpacity;
                if (this.opacityValue) {
                    this.opacityValue.textContent = slide.textOpacity + '%';
                }
            }
            if (this.imagePrompt) this.imagePrompt.value = slide.imagePrompt;
        }
    }
    
    updateCurrentSlide() {
        this.saveCurrentSlideData();
        this.updateSlidesDisplay();
    }
    
    deleteSlide(index) {
        if (confirm(`Delete slide ${index + 1}?`)) {
            console.log(`🗑️ Deleting slide ${index + 1}...`);
            
            this.slides.splice(index, 1);
            
            if (this.currentSlideIndex >= this.slides.length) {
                this.currentSlideIndex = this.slides.length - 1;
            }
            
            this.updateUI();
            
            if (this.currentSlideIndex >= 0) {
                this.selectSlide(this.currentSlideIndex);
            } else {
                if (this.slideEditorPanel) {
                    this.slideEditorPanel.style.display = 'none';
                }
            }
            
            this.showNotification('Slide deleted');
        }
    }
    
    navigateSlide(direction) {
        const newIndex = this.currentSlideIndex + direction;
        if (newIndex >= 0 && newIndex < this.slides.length) {
            this.selectSlide(newIndex);
        }
    }
    
    updateUI() {
        this.updateSlidesDisplay();
        this.updateNavigationButtons();
        this.updateSlideCounter();
        this.updateCarouselTitle();
    }
    
    updateSlidesDisplay() {
        if (!this.slidesContainer) return;
        
        if (this.slides.length === 0) {
            this.slidesContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📱</div>
                    <h3>Create Your First Slide</h3>
                    <p>Click "Add Slide" to start building your Instagram carousel</p>
                    <button id="addFirstSlideBtn" class="btn btn-primary">Add Slide</button>
                </div>
            `;
            
            // Re-attach event listener
            const addFirstBtn = document.getElementById('addFirstSlideBtn');
            if (addFirstBtn) {
                addFirstBtn.addEventListener('click', () => this.addSlide());
            }
            return;
        }
        
        this.slidesContainer.innerHTML = this.slides.map((slide, index) => `
            <div class="slide-preview ${index === this.currentSlideIndex ? 'active' : ''}" data-index="${index}">
                <div class="slide-number">${index + 1}</div>
                <button class="slide-delete" onclick="editor.deleteSlide(${index})">×</button>
                ${slide.backgroundImage ? 
                    `<img src="${slide.backgroundImage}" class="slide-background" alt="Background">` : 
                    `<div class="slide-background" style="background: ${slide.backgroundColor};"></div>`
                }
                ${slide.text ? `
                    <div class="slide-text-overlay ${slide.textPosition}" 
                         style="
                             font-size: ${slide.textSize};
                             color: ${slide.textColor};
                             background: rgba(0,0,0,${slide.textOpacity / 100});
                         ">
                        ${this.escapeHtml(slide.text)}
                    </div>
                ` : ''}
            </div>
        `).join('');
        
        // Add click listeners to slides
        document.querySelectorAll('.slide-preview').forEach((element, index) => {
            element.addEventListener('click', () => this.selectSlide(index));
        });
    }
    
    updateNavigationButtons() {
        if (this.prevSlideBtn) {
            this.prevSlideBtn.disabled = this.currentSlideIndex <= 0;
        }
        if (this.nextSlideBtn) {
            this.nextSlideBtn.disabled = this.currentSlideIndex >= this.slides.length - 1;
        }
    }
    
    updateSlideCounter() {
        if (this.slideCounter) {
            this.slideCounter.textContent = `${this.currentSlideIndex + 1} / ${this.slides.length}`;
        }
        
        // Update slides count in header
        const slidesCount = document.querySelector('.slides-count');
        if (slidesCount) {
            slidesCount.textContent = `${this.slides.length} Slides`;
        }
    }
    
    updateCarouselTitle() {
        if (this.slides.length === 0 && this.carouselTitle) {
            this.carouselTitle.textContent = 'New Instagram Carousel';
        }
    }
    
    // Generování obrázků s podporou všech tří API
    async generateImage(provider) {
        const prompt = this.imagePrompt?.value?.trim();
        if (!prompt) {
            this.showNotification('Enter image description first', 'error');
            return;
        }
        
        console.log(`🎨 Generating image with ${provider} using EXACT prompt: "${prompt}"`);
        
        let loadingText = `Generating image with ${provider.toUpperCase()}...`;
        if (provider === 'replicate') {
            loadingText += ' (No restrictions - may take 30-60 seconds)';
        }
        
        this.showLoading(loadingText);
        
        try {
            let endpoint;
            switch(provider) {
                case 'chatgpt':
                    endpoint = '/api/generate-image';
                    break;
                case 'gemini':
                    endpoint = '/api/generate-image-gemini';
                    break;
                case 'replicate':
                    endpoint = '/api/generate-image-replicate';
                    break;
                default:
                    endpoint = '/api/generate-image';
            }
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: prompt
                })
            });
            
            const data = await response.json();
            
            if (data.success && data.imageUrl) {
                if (this.currentSlideIndex >= 0) {
                    this.slides[this.currentSlideIndex].backgroundImage = data.imageUrl;
                    this.updateSlidesDisplay();
                }
                
                let successMessage = `Image generated with ${provider.toUpperCase()}`;
                if (data.restrictions) {
                    successMessage += ` (${data.restrictions})`;
                }
                
                this.showNotification(successMessage);
                console.log(`✅ Image generated successfully with: "${prompt}"`);
            } else {
                throw new Error(data.error || 'Failed to generate image');
            }
        } catch (error) {
            console.error('Image generation failed:', error);
            this.showNotification('Failed to generate image: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    removeBackgroundImage() {
        if (this.currentSlideIndex >= 0) {
            this.slides[this.currentSlideIndex].backgroundImage = null;
            this.updateSlidesDisplay();
            this.showNotification('Background image removed');
        }
    }
    
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabName + 'Tab');
        });
    }
    
    toggleFormat(format) {
        // Simple text formatting - in a real app you'd implement rich text editing
        const btn = document.querySelector(`[data-format="${format}"]`);
        if (btn) {
            btn.classList.toggle('active');
        }
        this.showNotification(`${format} formatting toggled`);
    }
    
    showSaveModal() {
        this.saveCurrentSlideData();
        if (this.saveModal) {
            this.saveModal.classList.remove('hidden');
        }
        if (this.carouselNameInput) {
            this.carouselNameInput.focus();
            
            // Suggest a name
            const suggestedName = `Carousel ${new Date().toLocaleDateString()}`;
            this.carouselNameInput.value = suggestedName;
            this.carouselNameInput.select();
        }
    }
    
    hideSaveModal() {
        if (this.saveModal) {
            this.saveModal.classList.add('hidden');
        }
        if (this.carouselNameInput) {
            this.carouselNameInput.value = '';
        }
    }
    
    saveCarousel() {
        const name = this.carouselNameInput?.value?.trim();
        if (!name) {
            this.showNotification('Enter carousel name', 'error');
            return;
        }
        
        if (this.slides.length === 0) {
            this.showNotification('Add at least one slide', 'error');
            return;
        }
        
        console.log('💾 Saving carousel...', name);
        
        this.saveCurrentSlideData();
        
        const carousel = {
            id: this.currentCarouselId || this.generateId(),
            name: name,
            slides: this.slides,
            created: this.currentCarouselId ? undefined : new Date().toISOString(),
            updated: new Date().toISOString()
        };
        
        const carousels = this.getSavedCarousels();
        
        if (this.currentCarouselId) {
            // Update existing
            const index = carousels.findIndex(c => c.id === this.currentCarouselId);
            if (index !== -1) {
                carousels[index] = { ...carousels[index], ...carousel };
            }
        } else {
            // Create new
            this.currentCarouselId = carousel.id;
            carousels.unshift(carousel);
        }
        
        localStorage.setItem('instagramCarousels', JSON.stringify(carousels));
        
        if (this.carouselTitle) {
            this.carouselTitle.textContent = name;
        }
        this.hideSaveModal();
        this.loadCarouselsList();
        this.showNotification(`Carousel "${name}" saved`);
    }
    
    loadCarousel(carousel) {
        console.log('📂 Loading carousel...', carousel.name);
        
        this.currentCarouselId = carousel.id;
        this.slides = carousel.slides || [];
        this.currentSlideIndex = this.slides.length > 0 ? 0 : -1;
        if (this.carouselTitle) {
            this.carouselTitle.textContent = carousel.name;
        }
        
        this.updateUI();
        
        if (this.currentSlideIndex >= 0) {
            this.selectSlide(this.currentSlideIndex);
        } else {
            if (this.slideEditorPanel) {
                this.slideEditorPanel.style.display = 'none';
            }
        }
        
        this.showNotification(`Carousel "${carousel.name}" loaded`);
    }
    
    exportCarousel() {
        if (this.slides.length === 0) {
            this.showNotification('No slides to export', 'error');
            return;
        }
        
        console.log('📤 Exporting carousel...');
        
        this.saveCurrentSlideData();
        
        // Create download for each slide
        this.slides.forEach((slide, index) => {
            this.downloadSlide(slide, index + 1);
        });
        
        this.showNotification(`Exporting ${this.slides.length} slides...`);
    }
    
    downloadSlide(slide, slideNumber) {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1350;
        const ctx = canvas.getContext('2d');
        
        // Background
        if (slide.backgroundImage) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                this.drawTextOnCanvas(ctx, slide, canvas.width, canvas.height);
                this.downloadCanvas(canvas, `slide-${slideNumber}.png`);
            };
            img.onerror = () => {
                this.drawBackground(ctx, slide, canvas.width, canvas.height);
                this.drawTextOnCanvas(ctx, slide, canvas.width, canvas.height);
                this.downloadCanvas(canvas, `slide-${slideNumber}.png`);
            };
            img.src = slide.backgroundImage;
        } else {
            this.drawBackground(ctx, slide, canvas.width, canvas.height);
            this.drawTextOnCanvas(ctx, slide, canvas.width, canvas.height);
            this.downloadCanvas(canvas, `slide-${slideNumber}.png`);
        }
    }
    
    drawBackground(ctx, slide, width, height) {
        ctx.fillStyle = slide.backgroundColor;
        ctx.fillRect(0, 0, width, height);
    }
    
    drawTextOnCanvas(ctx, slide, width, height) {
        if (!slide.text) return;
        
        const fontSize = parseInt(slide.textSize) * 3; // Scale for high resolution
        ctx.font = `${fontSize}px Arial, sans-serif`;
        ctx.fillStyle = slide.textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Text background
        const opacity = slide.textOpacity / 100;
        ctx.fillStyle = `rgba(0,0,0,${opacity})`;
        
        const textMetrics = ctx.measureText(slide.text);
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
                y = textHeight + 100;
                break;
            case 'bottom':
                x = width / 2;
                y = height - textHeight - 100;
                break;
            case 'left':
                x = textWidth / 2 + 100;
                y = height / 2;
                break;
            case 'right':
                x = width - textWidth / 2 - 100;
                y = height / 2;
                break;
        }
        
        // Draw text background
        ctx.fillRect(x - textWidth / 2 - 40, y - textHeight / 2 - 20, textWidth + 80, textHeight + 40);
        
        // Draw text
        ctx.fillStyle = slide.textColor;
        ctx.fillText(slide.text, x, y);
    }
    
    downloadCanvas(canvas, filename) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
    
    loadCarouselsList() {
        if (!this.carouselsList) return;
        
        const carousels = this.getSavedCarousels();
        
        if (carousels.length === 0) {
            this.carouselsList.innerHTML = `
                <div class="no-articles">
                    <p>No saved carousels yet.</p>
                    <p>Create your first carousel to get started.</p>
                </div>
            `;
            return;
        }
        
        this.carouselsList.innerHTML = carousels.map(carousel => `
            <div class="carousel-item ${carousel.id === this.currentCarouselId ? 'active' : ''}" data-id="${carousel.id}">
                <div class="carousel-title">${this.escapeHtml(carousel.name)}</div>
                <div class="carousel-meta">
                    <span>${this.formatDate(carousel.updated || carousel.created)}</span>
                    <span class="carousel-slides-count">${carousel.slides?.length || 0} slides</span>
                </div>
            </div>
        `).join('');
        
        // Add click listeners
        document.querySelectorAll('.carousel-item').forEach(item => {
            item.addEventListener('click', () => {
                const carousel = carousels.find(c => c.id === item.dataset.id);
                if (carousel) {
                    this.loadCarousel(carousel);
                }
            });
        });
    }
    
    handleFilterClick(e) {
        document.querySelectorAll('.section-item[data-filter]').forEach(item => {
            item.classList.remove('active');
        });
        
        e.currentTarget.classList.add('active');
        this.currentFilter = e.currentTarget.dataset.filter;
        this.loadCarouselsList();
    }
    
    getSavedCarousels() {
        const carousels = localStorage.getItem('instagramCarousels');
        return carousels ? JSON.parse(carousels) : [];
    }
    
    goBackToMain() {
        if (this.slides.length > 0 && !confirm('Leave without saving? Unsaved changes will be lost.')) {
            return;
        }
        window.location.href = '/';
    }
    
    showLoading(text = 'Processing...') {
        if (this.loadingText) {
            this.loadingText.textContent = text;
        }
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.remove('hidden');
        }
    }
    
    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.add('hidden');
        }
    }
    
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#dc3545' : '#28a745'};
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 4000;
            font-weight: 500;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
        return 'carousel_' + Math.random().toString(36).substr(2, 9);
    }
}

// Initialize editor
let editor;
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎨 DOM loaded, initializing Instagram Carousel Editor...');
    editor = new InstagramCarouselEditor();
});

// Debug functions
window.debugCarousel = function() {
    console.log('🐛 Current carousel state:', {
        slides: editor?.slides,
        currentSlideIndex: editor?.currentSlideIndex,
        currentCarouselId: editor?.currentCarouselId
    });
};

window.clearCarousels = function() {
    localStorage.removeItem('instagramCarousels');
    console.log('🗑️ All carousels cleared from localStorage');
    if (editor) {
        editor.loadCarouselsList();
    }
};

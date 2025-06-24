class InstagramImageGenerator {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.setupCanvas();
    }

    setupCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 1080;
        this.canvas.height = 1350;
        this.ctx = this.canvas.getContext('2d');
    }

    generateAIBackground(description) {
        const themes = this.parseDescription(description);
        
        if (themes.includes('politics') || themes.includes('news')) {
            this.generateNewsBackground();
        } else if (themes.includes('business') || themes.includes('finance')) {
            this.generateBusinessBackground();
        } else if (themes.includes('technology') || themes.includes('tech')) {
            this.generateTechBackground();
        } else if (themes.includes('lifestyle') || themes.includes('personal')) {
            this.generateLifestyleBackground();
        } else {
            this.generateModernBackground();
        }
    }

    parseDescription(description) {
        const lowerDesc = description.toLowerCase();
        const themes = [];
        
        if (lowerDesc.includes('politic') || lowerDesc.includes('government') || lowerDesc.includes('election')) {
            themes.push('politics');
        }
        if (lowerDesc.includes('business') || lowerDesc.includes('corporate') || lowerDesc.includes('finance')) {
            themes.push('business');
        }
        if (lowerDesc.includes('tech') || lowerDesc.includes('digital') || lowerDesc.includes('innovation')) {
            themes.push('technology');
        }
        if (lowerDesc.includes('lifestyle') || lowerDesc.includes('personal') || lowerDesc.includes('daily')) {
            themes.push('lifestyle');
        }
        
        return themes;
    }

    generateNewsBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#1e3a8a');
        gradient.addColorStop(0.5, '#dc2626');
        gradient.addColorStop(1, '#1f2937');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.addNewsElements();
    }

    generateBusinessBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#0f172a');
        gradient.addColorStop(0.5, '#1e40af');
        gradient.addColorStop(1, '#059669');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.addBusinessElements();
    }

    generateTechBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#7c3aed');
        gradient.addColorStop(0.5, '#06b6d4');
        gradient.addColorStop(1, '#10b981');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.addTechElements();
    }

    generateLifestyleBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#f59e0b');
        gradient.addColorStop(0.5, '#ec4899');
        gradient.addColorStop(1, '#8b5cf6');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.addLifestyleElements();
    }

    generateModernBackground() {
        const gradients = [
            ['#667eea', '#764ba2'],
            ['#f093fb', '#f5576c'],
            ['#4facfe', '#00f2fe'],
            ['#43e97b', '#38f9d7']
        ];

        const selectedGradient = gradients[Math.floor(Math.random() * gradients.length)];
        
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, selectedGradient[0]);
        gradient.addColorStop(1, selectedGradient[1]);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.addGeometricShapes();
    }

    addNewsElements() {
        this.ctx.globalAlpha = 0.15;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(50, 100, 200, 20);
        this.ctx.fillRect(50, 140, 150, 20);
        this.ctx.fillRect(50, 180, 180, 20);
        this.ctx.globalAlpha = 1;
    }

    addBusinessElements() {
        this.ctx.globalAlpha = 0.1;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(100, 300);
        this.ctx.lineTo(200, 250);
        this.ctx.lineTo(300, 280);
        this.ctx.lineTo(400, 200);
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }

    addTechElements() {
        this.ctx.globalAlpha = 0.1;
        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const size = Math.random() * 5 + 2;
            this.ctx.fillRect(x, y, size, size);
        }
        this.ctx.globalAlpha = 1;
    }

    addLifestyleElements() {
        this.ctx.globalAlpha = 0.12;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(200, 200, 80, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(800, 400, 60, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
    }

    addGeometricShapes() {
        this.ctx.globalAlpha = 0.1;
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width * 0.8, this.canvas.height * 0.2, 150, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width * 0.1, this.canvas.height * 0.8);
        this.ctx.lineTo(this.canvas.width * 0.3, this.canvas.height * 0.7);
        this.ctx.lineTo(this.canvas.width * 0.2, this.canvas.height * 0.9);
        this.ctx.closePath();
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
    }

    wrapText(text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0] || '';

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = this.ctx.measureText(currentLine + ' ' + word).width;
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

    addTextToImage(text) {
        this.ctx.font = 'bold 72px Arial, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowOffsetX = 3;
        this.ctx.shadowOffsetY = 3;

        this.ctx.fillStyle = '#ffffff';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 6;

        const maxWidth = this.canvas.width * 0.85;
        const lines = this.wrapText(text, maxWidth);
        const lineHeight = 90;
        const startY = this.canvas.height / 2 - (lines.length - 1) * lineHeight / 2;

        lines.forEach((line, index) => {
            const y = startY + index * lineHeight;
            this.ctx.strokeText(line, this.canvas.width / 2, y);
            this.ctx.fillText(line, this.canvas.width / 2, y);
        });

        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }

    generateImage(text, imageDescription = '') {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.generateAIBackground(imageDescription);
        this.addTextToImage(text);
        return this.canvas.toDataURL('image/png');
    }
}

class AITextEditor {
    constructor() {
        this.editor = document.getElementById('editor');
        this.contextMenu = document.getElementById('contextMenu');
        this.promptModal = document.getElementById('promptModal');
        this.saveModal = document.getElementById('saveModal');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.promptInput = document.getElementById('promptInput');
        this.articleTitle = document.getElementById('articleTitle');
        this.articlesList = document.getElementById('articlesList');
        this.imageGenerator = new InstagramImageGenerator();
        
        this.selectedText = '';
        this.selectionRange = null;
        this.lastCursorPosition = null;
        this.currentArticleId = null;
        this.instagramData = null;
        
        this.initializeEventListeners();
        this.loadArticlesList();
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    initializeEventListeners() {
        // Kontextové menu
        this.editor.addEventListener('contextmenu', (e) => this.showContextMenu(e));
        document.addEventListener('click', () => this.hideContextMenu());
        
        // Menu items
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleMenuClick(e));
        });

        // Modal
        document.getElementById('submitPrompt').addEventListener('click', () => this.submitPrompt());
        document.getElementById('cancelPrompt').addEventListener('click', () => this.hideModal());

        // Save modal
        document.getElementById('confirmSave').addEventListener('click', () => this.confirmSaveArticle());
        document.getElementById('cancelSave').addEventListener('click', () => this.hideSaveModal());

        // Header buttons
        document.getElementById('saveBtn').addEventListener('click', () => this.showSaveModal());
        document.getElementById('newBtn').addEventListener('click', () => this.newArticle());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearEditor());

        // Auto-save current work
        this.editor.addEventListener('input', () => this.autoSave());

        // Selection tracking
        document.addEventListener('selectionchange', () => this.trackSelection());
        
        // Sledování pozice kurzoru
        this.editor.addEventListener('click', () => this.saveCursorPosition());
        this.editor.addEventListener('keyup', () => this.saveCursorPosition());

        // Enter key v save modal
        this.articleTitle.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.confirmSaveArticle();
            }
        });
    }

    showSaveModal() {
        const content = this.editor.innerHTML.trim();
        if (!content) {
            this.showError('Nelze uložit prázdný článek');
            return;
        }

        const textContent = this.editor.textContent.trim();
        const suggestedTitle = textContent.substring(0, 50) + (textContent.length > 50 ? '...' : '');
        this.articleTitle.value = suggestedTitle;
        
        this.saveModal.classList.remove('hidden');
        this.articleTitle.focus();
        this.articleTitle.select();
    }

    hideSaveModal() {
        this.saveModal.classList.add('hidden');
        this.articleTitle.value = '';
    }

    confirmSaveArticle() {
        const title = this.articleTitle.value.trim();
        const content = this.editor.innerHTML.trim();
        
        if (!title) {
            this.showError('Zadejte název článku');
            return;
        }
        
        if (!content) {
            this.showError('Nelze uložit prázdný článek');
            return;
        }

        this.saveArticle(title, content);
        this.hideSaveModal();
    }

    saveArticle(title, content) {
        const articles = this.getSavedArticles();
        const articleId = this.generateUUID();
        
        const newArticle = {
            id: articleId,
            title: title,
            content: content,
            timestamp: new Date().toISOString(),
            preview: this.generatePreview(content)
        };

        articles.unshift(newArticle);
        localStorage.setItem('savedArticles', JSON.stringify(articles));
        
        this.loadArticlesList();
        this.showNotification(`Článek "${title}" byl uložen`);
        
        this.currentArticleId = articleId;
    }

    generatePreview(content) {
        const textContent = content.replace(/<[^>]*>/g, '').trim();
        return textContent.substring(0, 150) + (textContent.length > 150 ? '...' : '');
    }

    getSavedArticles() {
        const articles = localStorage.getItem('savedArticles');
        return articles ? JSON.parse(articles) : [];
    }

    loadArticlesList() {
        const articles = this.getSavedArticles();
        
        if (articles.length === 0) {
            this.articlesList.innerHTML = `
                <div class="no-articles">
                    <p>Zatím nemáte žádné uložené články.</p>
                    <p>Napište něco a klikněte na "💾 Uložit článek"</p>
                </div>
            `;
            return;
        }

        this.articlesList.innerHTML = articles.map(article => `
            <div class="article-item ${article.id === this.currentArticleId ? 'active' : ''}" data-id="${article.id}">
                <div class="article-header">
                    <h4 class="article-title">${this.escapeHtml(article.title)}</h4>
                    <div class="article-actions">
                        <button class="btn-icon delete-article" data-id="${article.id}" title="Smazat článek">🗑️</button>
                    </div>
                </div>
                <p class="article-preview">${this.escapeHtml(article.preview)}</p>
                <div class="article-meta">
                    <span class="article-date">${this.formatDate(article.timestamp)}</span>
                </div>
            </div>
        `).join('');

        // Přidej event listenery
        document.querySelectorAll('.article-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-article')) {
                    this.loadArticle(item.dataset.id);
                }
            });
        });

        document.querySelectorAll('.delete-article').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteArticle(btn.dataset.id);
            });
        });
    }

    loadArticle(articleId) {
        const articles = this.getSavedArticles();
        const article = articles.find(a => a.id === articleId);
        
        if (article) {
            this.editor.innerHTML = article.content;
            this.currentArticleId = articleId;
            this.loadArticlesList();
            this.showNotification(`Načten článek: ${article.title}`);
        }
    }

    deleteArticle(articleId) {
        const articles = this.getSavedArticles();
        const article = articles.find(a => a.id === articleId);
        
        if (article && confirm(`Opravdu chcete smazat článek "${article.title}"?`)) {
            const updatedArticles = articles.filter(a => a.id !== articleId);
            localStorage.setItem('savedArticles', JSON.stringify(updatedArticles));
            
            if (this.currentArticleId === articleId) {
                this.newArticle();
            }
            
            this.loadArticlesList();
            this.showNotification(`Článek "${article.title}" byl smazán`);
        }
    }

    newArticle() {
        this.editor.innerHTML = '';
        this.currentArticleId = null;
        this.loadArticlesList();
        this.editor.focus();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'právě teď';
        if (diffMins < 60) return `před ${diffMins} min`;
        if (diffHours < 24) return `před ${diffHours} h`;
        if (diffDays < 7) return `před ${diffDays} dny`;
        
        return date.toLocaleDateString('cs-CZ', {
            day: 'numeric',
            month: 'short',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }

    saveCursorPosition() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0 && this.editor.contains(selection.anchorNode)) {
            this.lastCursorPosition = selection.getRangeAt(0).cloneRange();
        }
    }

    showContextMenu(e) {
        e.preventDefault();
        
        this.saveCursorPosition();
        
        const selection = window.getSelection();
        this.selectedText = selection.toString().trim();
        
        document.querySelectorAll('.menu-item').forEach(item => {
            const needsSelection = item.hasAttribute('data-needs-selection');
            if (needsSelection) {
                item.classList.toggle('disabled', !this.selectedText);
            }
        });

        this.contextMenu.style.left = e.pageX + 'px';
        this.contextMenu.style.top = e.pageY + 'px';
        this.contextMenu.classList.remove('hidden');
    }

    hideContextMenu() {
        this.contextMenu.classList.add('hidden');
    }

    handleMenuClick(e) {
        e.stopPropagation();
        
        const action = e.currentTarget.dataset.action;
        if (e.currentTarget.classList.contains('disabled')) return;

        this.hideContextMenu();

        if (action === 'generate') {
            this.showPromptModal();
        } else if (action === 'instagram') {
            this.processInstagramImage();
        } else {
            this.processAIAction(action);
        }
    }

    showPromptModal() {
        this.promptModal.classList.remove('hidden');
        this.promptInput.focus();
    }

    hideModal() {
        this.promptModal.classList.add('hidden');
        this.promptInput.value = '';
    }

    async submitPrompt() {
        const prompt = this.promptInput.value.trim();
        if (!prompt) return;

        this.hideModal();
        await this.processAIAction('custom', prompt);
    }

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
        document.getElementById('postText').value = data.result;
        document.getElementById('postHashtags').value = data.hashtags;
        document.getElementById('imagePrompt').value = data.imageDescription;

        this.instagramData = {
            text: data.result,
            title: data.title,
            hashtags: data.hashtags,
            imageDescription: data.imageDescription,
            backgroundImageUrl: data.backgroundImageUrl
        };

        this.generateInstagramSlides();
        document.getElementById('instagramModal').classList.remove('hidden');
        this.setupInstagramEventListeners();
    }

    generateInstagramSlides() {
        this.generateImageSlide();
        this.generateTextSlide();
    }

    async generateImageSlide() {
        const canvas = document.getElementById('imageCanvas');
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        try {
            if (this.instagramData.backgroundImageUrl) {
                document.getElementById('loadingText').textContent = 'Načítám AI obrázek...';
                
                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                await new Promise((resolve, reject) => {
                    img.onload = () => {
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        resolve();
                    };
                    img.onerror = reject;
                    img.src = this.instagramData.backgroundImageUrl;
                });
            } else {
                const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                gradient.addColorStop(0, '#667eea');
                gradient.addColorStop(1, '#764ba2');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            this.addTitleToCanvas(ctx, this.instagramData.title);
            
        } catch (error) {
            console.error('Error loading background image:', error);
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            this.addTitleToCanvas(ctx, this.instagramData.title);
        }
    }

    addTitleToCanvas(ctx, title) {
        ctx.font = 'bold 80px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;

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

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    generateTextSlide() {
        const canvas = document.getElementById('textCanvas');
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        this.createAbstractBackground(ctx);
        this.addPostTextToCanvas(ctx, this.instagramData.text);
    }

    createAbstractBackground(ctx) {
        const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, ctx.canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        ctx.globalAlpha = 0.1;
        
        ctx.beginPath();
        ctx.arc(ctx.canvas.width * 0.8, ctx.canvas.height * 0.2, 200, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        
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
        ctx.font = '48px Arial, sans-serif';

class InstagramImageGenerator {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.setupCanvas();
    }

    setupCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 1080;  // 4:5 poměr - šířka
        this.canvas.height = 1350; // 4:5 poměr - výška
        this.ctx = this.canvas.getContext('2d');
    }

    generateAIBackground(description) {
        // Vytvoř AI-inspirované pozadí na základě popisu
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
        // Červeno-modrý gradient pro zprávy/politiku
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#1e3a8a');
        gradient.addColorStop(0.5, '#dc2626');
        gradient.addColorStop(1, '#1f2937');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.addNewsElements();
    }

    generateBusinessBackground() {
        // Elegantní modrý gradient pro business
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#0f172a');
        gradient.addColorStop(0.5, '#1e40af');
        gradient.addColorStop(1, '#059669');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.addBusinessElements();
    }

    generateTechBackground() {
        // Futuristický gradient pro technologie
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#7c3aed');
        gradient.addColorStop(0.5, '#06b6d4');
        gradient.addColorStop(1, '#10b981');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.addTechElements();
    }

    generateLifestyleBackground() {
        // Teplý gradient pro lifestyle
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#f59e0b');
        gradient.addColorStop(0.5, '#ec4899');
        gradient.addColorStop(1, '#8b5cf6');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.addLifestyleElements();
    }

    generateModernBackground() {
        // Výchozí moderní gradient
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
        
        // Geometrické tvary připomínající zpravodajství
        this.ctx.fillStyle = '#ffffff';
        
        // Obdélníky jako "články"
        this.ctx.fillRect(50, 100, 200, 20);
        this.ctx.fillRect(50, 140, 150, 20);
        this.ctx.fillRect(50, 180, 180, 20);
        
        this.ctx.globalAlpha = 1;
    }

    addBusinessElements() {
        this.ctx.globalAlpha = 0.1;
        
        // Grafy a čáry
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
        
        // Technologické vzory
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
        
        // Organické tvary
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
        
        // Kruh
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width * 0.8, this.canvas.height * 0.2, 150, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();

        // Trojúhelník
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
        let currentLine = words[0];

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
        // Nastavení fontu
        this.ctx.font = 'bold 72px Arial, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Stín pro lepší čitelnost
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowOffsetX = 3;
        this.ctx.shadowOffsetY = 3;

        // Bílý text s černým obrysem
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

        // Reset stínu
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }

    generateImage(text, imageDescription = '') {
        // Vyčisti canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Vygeneruj AI pozadí na základě popisu
        this.generateAIBackground(imageDescription);
        
        // Přidej text
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
        
        this.initializeEventListeners();
        this.loadArticlesList();
        // Editor zůstane prázdný při spuštění
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
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAllArticles());

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

        // Automaticky navrhni název na základě prvních slov
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

        articles.unshift(newArticle); // Přidej na začátek
        localStorage.setItem('savedArticles', JSON.stringify(articles));
        
        this.loadArticlesList();
        this.showNotification(`Článek "${title}" byl uložen`);
        
        // Nastav aktuální článek
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
            this.loadArticlesList(); // Refresh pro označení aktivního
            this.showNotification(`Načten článek: ${article.title}`);
        }
    }

    deleteArticle(articleId) {
        const articles = this.getSavedArticles();
        const article = articles.find(a => a.id === articleId);
        
        if (article && confirm(`Opravdu chcete smazat článek "${article.title}"?`)) {
            const updatedArticles = articles.filter(a => a.id !== articleId);
            localStorage.setItem('savedArticles', JSON.stringify(updatedArticles));
            
            // Pokud mažeme aktuálně načtený článek, vyčisti editor
            if (this.currentArticleId === articleId) {
                this.newArticle();
            }
            
            this.loadArticlesList();
            this.showNotification(`Článek "${article.title}" byl smazán`);
        }
    }

    clearAllArticles() {
        const articles = this.getSavedArticles();
        if (articles.length === 0) return;
        
        if (confirm(`Opravdu chcete smazat všech ${articles.length} uložených článků? Tato akce je nevratná.`)) {
            localStorage.removeItem('savedArticles');
            this.newArticle();
            this.loadArticlesList();
            this.showNotification('Všechny články byly smazány');
        }
    }

    newArticle() {
        this.editor.innerHTML = '';
        this.currentArticleId = null;
        this.loadArticlesList(); // Refresh pro odebrání označení aktivního
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
            day:

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

    generateImage(text, imageDescription = '') {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Gradient pozadí
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Přidej text
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
        console.log('Initializing event listeners...');
        
        // Kontextové menu - opraveno
        this.editor.addEventListener('contextmenu', (e) => {
            console.log('Context menu triggered');
            this.showContextMenu(e);
        });
        
        document.addEventListener('click', (e) => {
            if (!this.contextMenu.contains(e.target)) {
                this.hideContextMenu();
            }
        });
        
        // Menu items - opraveno
        const menuItems = document.querySelectorAll('.menu-item');
        console.log('Found menu items:', menuItems.length);
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                console.log('Menu item clicked:', e.currentTarget.dataset.action);
                this.handleMenuClick(e);
            });
        });

        // Header buttons - opraveno
        const saveBtn = document.getElementById('saveBtn');
        const newBtn = document.getElementById('newBtn');
        const clearBtn = document.getElementById('clearBtn');
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                console.log('Save button clicked');
                this.showSaveModal();
            });
        }
        
        if (newBtn) {
            newBtn.addEventListener('click', () => {
                console.log('New button clicked');
                this.newArticle();
            });
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                console.log('Clear button clicked');
                this.clearEditor();
            });
        }

        // Modal buttons
        const submitPrompt = document.getElementById('submitPrompt');
        const cancelPrompt = document.getElementById('cancelPrompt');
        const confirmSave = document.getElementById('confirmSave');
        const cancelSave = document.getElementById('cancelSave');
        
        if (submitPrompt) {
            submitPrompt.addEventListener('click', () => this.submitPrompt());
        }
        if (cancelPrompt) {
            cancelPrompt.addEventListener('click', () => this.hideModal());
        }
        if (confirmSave) {
            confirmSave.addEventListener('click', () => this.confirmSaveArticle());
        }
        if (cancelSave) {
            cancelSave.addEventListener('click', () => this.hideSaveModal());
        }

        // Auto-save
        this.editor.addEventListener('input', () => this.autoSave());

        // Selection tracking
        document.addEventListener('selectionchange', () => this.trackSelection());
        this.editor.addEventListener('click', () => this.saveCursorPosition());
        this.editor.addEventListener('keyup', () => this.saveCursorPosition());

        // Enter key v save modal
        if (this.articleTitle) {
            this.articleTitle.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.confirmSaveArticle();
                }
            });
        }
        
        console.log('Event listeners initialized');
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
                    <p>Napište něco a klikněte na "Uložit článek"</p>
                </div>
            `;
            return;
        }

        this.articlesList.innerHTML = articles.map(article => `
            <div class="article-item ${article.id === this.currentArticleId ? 'active' : ''}" data-id="${article.id}">
                <div class="article-header">
                    <h4 class="article-title">${this.escapeHtml(article.title)}</h4>
                    <div class="article-actions">
                        <button class="btn-icon delete-article" data-id="${article.id}" title="Smazat článek">×</button>
                    </div>
                </div>
                <p class="article-preview">${this.escapeHtml(article.preview)}</p>
                <div class="article-meta">
                    <span class="article-date">${this.formatDate(article.timestamp)}</span>
                </div>
            </div>
        `).join('');

        // Přidej event listenery pro články
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
        console.log('Showing context menu');
        
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
        // Zobraz jednoduchý alert místo složitého modalu
        const fullText = `${data.result}\n\n${data.hashtags}`;
        
        if (confirm(`Instagram post vygenerován!\n\n${fullText}\n\nChcete vložit text do editoru?`)) {
            this.insertAIResult(fullText, 'instagram');
        }
    }

    async processAIAction(action, customPrompt = '') {
        console.log('Processing AI action:', { action, customPrompt, selectedText: this.selectedText });
        
        this.showLoading();

        try {
            const response = await fetch('/api/perplexity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: action,
                    prompt: customPrompt,
                    selectedText: this.selectedText
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();

            if (data.success && data.result) {
                this.insertAIResult(data.result, action);
            } else {
                this.showError(data.error || 'Prázdná odpověď z API');
            }
        } catch (error) {
            console.error('Request failed:', error);
            this.showError('Chyba sítě: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    insertAIResult(result, action) {
        console.log('Inserting AI result:', { result: result.substring(0, 100), action });
        
        this.editor.focus();
        
        const selection = window.getSelection();
        
        try {
            if (action === 'generate' || action === 'custom') {
                if (this.lastCursorPosition) {
                    selection.removeAllRanges();
                    selection.addRange(this.lastCursorPosition);
                }
                
                const range = selection.getRangeAt(0);
                const textNode = document.createTextNode(result);
                range.insertNode(textNode);
                
                range.setStartAfter(textNode);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
                
            } else if (this.selectedText && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                
                if (range.collapsed && this.selectedText) {
                    const editorText = this.editor.textContent;
                    const textIndex = editorText.indexOf(this.selectedText);
                    
                    if (textIndex !== -1) {
                        const textNode = this.findTextNode(this.editor, textIndex);
                        if (textNode) {
                            range.setStart(textNode.node, textNode.offset);
                            range.setEnd(textNode.node, textNode.offset + this.selectedText.length);
                        }
                    }
                }
                
                range.deleteContents();
                const textNode = document.createTextNode(result);
                range.insertNode(textNode);
                
                range.setStartAfter(textNode);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            } else {
                this.editor.appendChild(document.createTextNode('\n' + result));
            }
            
        } catch (error) {
            console.error('Error inserting text:', error);
            this.editor.appendChild(document.createTextNode('\n' + result));
        }
        
        this.selectedText = '';
        this.autoSave();
        
        console.log('Text successfully inserted');
    }

    findTextNode(element, targetIndex) {
        let currentIndex = 0;
        
        function traverse(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                const nodeLength = node.textContent.length;
                if (currentIndex + nodeLength > targetIndex) {
                    return {
                        node: node,
                        offset: targetIndex - currentIndex
                    };
                }
                currentIndex += nodeLength;
            } else {
                for (let child of node.childNodes) {
                    const result = traverse(child);
                    if (result) return result;
                }
            }
            return null;
        }
        
        return traverse(element);
    }

    trackSelection() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0 && this.editor.contains(selection.anchorNode)) {
            this.selectionRange = selection.getRangeAt(0).cloneRange();
        }
    }

    showLoading() {
        this.loadingOverlay.classList.remove('hidden');
    }

    hideLoading() {
        this.loadingOverlay.classList.add('hidden');
    }

    showError(message) {
        console.error('Error:', message);
        alert('Chyba: ' + message);
    }

    autoSave() {
        localStorage.setItem('currentWork', this.editor.innerHTML);
    }

    clearEditor() {
        if (confirm('Opravdu chcete vymazat celý obsah?')) {
            this.newArticle();
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4a90e2;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 4000;
            font-weight: 500;
            font-size: 14px;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

// Inicializace aplikace
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    new AITextEditor();
});

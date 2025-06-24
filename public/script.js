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

    createGradientBackground(ctx) {
        const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, ctx.canvas.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(0.5, '#764ba2');
        gradient.addColorStop(1, '#f093fb');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    createAbstractBackground(ctx) {
        const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, ctx.canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.3, '#16213e');
        gradient.addColorStop(0.7, '#0f3460');
        gradient.addColorStop(1, '#533483');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        ctx.globalAlpha = 0.1;
        
        ctx.beginPath();
        ctx.arc(ctx.canvas.width * 0.8, ctx.canvas.height * 0.2, 300, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(ctx.canvas.width * 0.1, ctx.canvas.height * 0.8);
        ctx.lineTo(ctx.canvas.width * 0.4, ctx.canvas.height * 0.6);
        ctx.lineTo(ctx.canvas.width * 0.2, ctx.canvas.height * 0.95);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(ctx.canvas.width * 0.15, ctx.canvas.height * 0.3, 100, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        
        ctx.globalAlpha = 1;
    }

    addTitleToSlide(ctx, title) {
        ctx.font = 'bold 90px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 25;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 10;

        const maxWidth = ctx.canvas.width * 0.85;
        const lines = this.wrapText(ctx, title, maxWidth);
        const lineHeight = 110;
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

    addTextToSlide(ctx, text) {
        ctx.font = '52px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';

        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        const maxWidth = ctx.canvas.width * 0.85;
        const lines = this.wrapText(ctx, text, maxWidth);
        const lineHeight = 70;
        const startY = ctx.canvas.height / 2 - (lines.length - 1) * lineHeight / 2;

        lines.forEach((line, index) => {
            const y = startY + index * lineHeight;
            ctx.fillText(line, ctx.canvas.width / 2, y);
        });

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
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
        this.wordCountElement = document.querySelector('.word-count');
        this.instagramSidebar = document.getElementById('instagramSidebar');
        this.imageGenerator = new InstagramImageGenerator();
        
        this.selectedText = '';
        this.selectionRange = null;
        this.lastCursorPosition = null;
        this.currentArticleId = null;
        this.currentInstagramPost = null;
        this.currentFilter = 'all';
        
        this.initializeEventListeners();
        this.loadArticlesList();
        this.updateWordCount();
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    updateWordCount() {
        const text = this.editor.textContent.trim();
        const words = text ? text.split(/\s+/).length : 0;
        this.wordCountElement.textContent = `${words} Words`;
    }

    initializeEventListeners() {
        console.log('Initializing event listeners...');
        
        // Context menu
        this.editor.addEventListener('contextmenu', (e) => {
            console.log('Context menu triggered');
            this.showContextMenu(e);
        });
        
        document.addEventListener('click', (e) => {
            if (!this.contextMenu.contains(e.target)) {
                this.hideContextMenu();
            }
        });
        
        // Menu items
        const menuItems = document.querySelectorAll('.menu-item');
        console.log('Found menu items:', menuItems.length);
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                console.log('Menu item clicked:', e.currentTarget.dataset.action);
                this.handleMenuClick(e);
            });
        });

        // Library sidebar filters
        document.querySelectorAll('.section-item[data-filter]').forEach(item => {
            item.addEventListener('click', (e) => {
                this.handleFilterClick(e);
            });
        });

        // New project button
        document.getElementById('newProjectBtn')?.addEventListener('click', () => {
            this.createNewProject();
        });

        // Header buttons
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

        // Instagram sidebar
        document.getElementById('closeInstagramSidebar')?.addEventListener('click', () => {
            this.hideInstagramSidebar();
        });

        document.getElementById('instagramText')?.addEventListener('input', (e) => {
            if (this.currentInstagramPost) {
                this.currentInstagramPost.text = e.target.value;
                this.updateInstagramPreview();
            }
        });

        document.getElementById('instagramHashtags')?.addEventListener('input', (e) => {
            if (this.currentInstagramPost) {
                this.currentInstagramPost.hashtags = e.target.value;
            }
        });

        document.getElementById('regenerateInstagramImage')?.addEventListener('click', () => {
            this.regenerateInstagramImage();
        });

        document.getElementById('saveInstagramPost')?.addEventListener('click', () => {
            this.saveInstagramPost();
        });

        document.getElementById('downloadInstagramSlides')?.addEventListener('click', () => {
            this.downloadInstagramSlides();
        });

        // Editor events
        this.editor.addEventListener('input', () => {
            this.autoSave();
            this.updateWordCount();
        });

        document.addEventListener('selectionchange', () => this.trackSelection());
        this.editor.addEventListener('click', () => this.saveCursorPosition());
        this.editor.addEventListener('keyup', () => this.saveCursorPosition());

        if (this.articleTitle) {
            this.articleTitle.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.confirmSaveArticle();
                }
            });
        }
        
        console.log('Event listeners initialized');
    }

    handleFilterClick(e) {
        // Remove active from all filter items
        document.querySelectorAll('.section-item[data-filter]').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active to clicked item
        e.currentTarget.classList.add('active');
        
        // Update current filter
        this.currentFilter = e.currentTarget.dataset.filter;
        
        // Reload articles list with filter
        this.loadArticlesList();
    }

    createNewProject() {
        const projectName = prompt('Zadejte název nového projektu:');
        if (projectName) {
            this.showNotification(`Projekt "${projectName}" vytvořen`);
            // Here you could implement project creation logic
        }
    }

    showInstagramSidebar() {
        this.instagramSidebar.classList.remove('hidden');
    }

    hideInstagramSidebar() {
        this.instagramSidebar.classList.add('hidden');
        this.currentInstagramPost = null;
    }

    async updateInstagramPreview() {
        if (!this.currentInstagramPost) return;

        const canvas1 = document.getElementById('previewCanvas1');
        const canvas2 = document.getElementById('previewCanvas2');
        
        if (!canvas1 || !canvas2) return;

        const ctx1 = canvas1.getContext('2d');
        const ctx2 = canvas2.getContext('2d');

        // Update slide 1
        await this.createPreviewSlide1(ctx1);
        
        // Update slide 2
        this.createPreviewSlide2(ctx2);
    }

    async createPreviewSlide1(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        try {
            if (this.currentInstagramPost.backgroundImageUrl) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                await new Promise((resolve, reject) => {
                    img.onload = () => {
                        ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
                        resolve();
                    };
                    img.onerror = () => {
                        this.imageGenerator.createGradientBackground(ctx);
                        resolve();
                    };
                    img.src = this.currentInstagramPost.backgroundImageUrl;
                });
            } else {
                this.imageGenerator.createGradientBackground(ctx);
            }
            
            // Dark overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            // Add title (scaled down for preview)
            ctx.font = 'bold 22px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;

            const maxWidth = ctx.canvas.width * 0.85;
            const lines = this.imageGenerator.wrapText(ctx, this.currentInstagramPost.title, maxWidth);
            const lineHeight = 28;
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
            
        } catch (error) {
            console.error('Error creating preview slide 1:', error);
        }
    }

    createPreviewSlide2(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        this.imageGenerator.createAbstractBackground(ctx);
        
        // Add text (scaled down for preview)
        ctx.font = '13px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        const maxWidth = ctx.canvas.width * 0.85;
        const lines = this.imageGenerator.wrapText(ctx, this.currentInstagramPost.text, maxWidth);
        const lineHeight = 18;
        const startY = ctx.canvas.height / 2 - (lines.length - 1) * lineHeight / 2;

        lines.forEach((line, index) => {
            const y = startY + index * lineHeight;
            ctx.fillText(line, ctx.canvas.width / 2, y);
        });

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    async regenerateInstagramImage() {
        if (!this.currentInstagramPost) return;

        const newPrompt = document.getElementById('instagramImagePrompt').value;
        if (!newPrompt) return;

        this.showLoading();
        document.getElementById('loadingText').textContent = 'Regeneruji obrázek...';

        try {
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: `${newPrompt}, realistic photography, high quality, professional photo, suitable for Instagram post`
                })
            });

            const data = await response.json();
            
            if (data.success && data.imageUrl) {
                this.currentInstagramPost.backgroundImageUrl = data.imageUrl;
                this.currentInstagramPost.imageDescription = newPrompt;
                await this.updateInstagramPreview();
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

    saveInstagramPost() {
        if (!this.currentInstagramPost) return;

        // Update current post with form values
        this.currentInstagramPost.text = document.getElementById('instagramText').value;
        this.currentInstagramPost.hashtags = document.getElementById('instagramHashtags').value;
        this.currentInstagramPost.imageDescription = document.getElementById('instagramImagePrompt').value;

        // Save to localStorage
        const instagramPosts = this.getSavedInstagramPosts();
        
        if (this.currentInstagramPost.id) {
            // Update existing
            const index = instagramPosts.findIndex(p => p.id === this.currentInstagramPost.id);
            if (index !== -1) {
                instagramPosts[index] = this.currentInstagramPost;
            }
        } else {
            // Create new
            this.currentInstagramPost.id = this.generateUUID();
            this.currentInstagramPost.timestamp = new Date().toISOString();
            instagramPosts.unshift(this.currentInstagramPost);
        }

        localStorage.setItem('instagramPosts', JSON.stringify(instagramPosts));
        this.showNotification('Instagram post uložen');
    }

    getSavedInstagramPosts() {
        const posts = localStorage.getItem('instagramPosts');
        return posts ? JSON.parse(posts) : [];
    }

    downloadInstagramSlides() {
        if (!this.currentInstagramPost) return;

        // Create full-size canvases for download
        const canvas1 = document.createElement('canvas');
        const canvas2 = document.createElement('canvas');
        
        canvas1.width = 1080;
        canvas1.height = 1350;
        canvas2.width = 1080;
        canvas2.height = 1350;
        
        const ctx1 = canvas1.getContext('2d');
        const ctx2 = canvas2.getContext('2d');
        
        // Generate full-size slides
        this.createFullSizeSlide1(ctx1).then(() => {
            this.createFullSizeSlide2(ctx2);
            
            // Download slides
            const link1 = document.createElement('a');
            link1.download = 'instagram-slide-1.png';
            link1.href = canvas1.toDataURL('image/png');
            link1.click();

            setTimeout(() => {
                const link2 = document.createElement('a');
                link2.download = 'instagram-slide-2.png';
                link2.href = canvas2.toDataURL('image/png');
                link2.click();
                
                this.showNotification('Slides staženy');
            }, 500);
        });
    }

    async createFullSizeSlide1(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        try {
            if (this.currentInstagramPost.backgroundImageUrl) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                await new Promise((resolve, reject) => {
                    img.onload = () => {
                        ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
                        resolve();
                    };
                    img.onerror = () => {
                        this.imageGenerator.createGradientBackground(ctx);
                        resolve();
                    };
                    img.src = this.currentInstagramPost.backgroundImageUrl;
                });
            } else {
                this.imageGenerator.createGradientBackground(ctx);
            }
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            this.imageGenerator.addTitleToSlide(ctx, this.currentInstagramPost.title);
            
        } catch (error) {
            console.error('Error creating full-size slide 1:', error);
            this.imageGenerator.createGradientBackground(ctx);
            this.imageGenerator.addTitleToSlide(ctx, this.currentInstagramPost.title);
        }
    }

    createFullSizeSlide2(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        this.imageGenerator.createAbstractBackground(ctx);
        this.imageGenerator.addTextToSlide(ctx, this.currentInstagramPost.text);
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
            preview: this.generatePreview(content),
            isTrash: false
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
        let articles = this.getSavedArticles();
        
        // Apply filter
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        switch (this.currentFilter) {
            case 'recent':
                articles = articles.filter(article => new Date(article.timestamp) >= sevenDaysAgo);
                break;
            case 'trash':
                articles = articles.filter(article => article.isTrash);
                break;
            case 'all':
            default:
                articles = articles.filter(article => !article.isTrash);
                break;
        }
        
        if (articles.length === 0) {
            this.articlesList.innerHTML = `
                <div class="no-articles">
                    <p>Zatím nemáte žádné uložené články.</p>
                    <p>Napište něco a klikněte na "Uložit"</p>
                </div>
            `;
            return;
        }

        this.articlesList.innerHTML = articles.map(article => `
            <div class="article-item ${article.id === this.currentArticleId ? 'active' : ''}" data-id="${article.id}">
                <div class="article-header">
                    <h4 class="article-title">${this.escapeHtml(article.title)}</h4>
                    <div class="article-actions">
                        <button class="delete-article" data-id="${article.id}" title="${article.isTrash ? 'Smazat natrvalo' : 'Přesunout do koše'}">×</button>
                    </div>
                </div>
                <p class="article-preview">${this.escapeHtml(article.preview)}</p>
                <div class="article-meta">
                    <span class="article-date">${this.formatDate(article.timestamp)}</span>
                </div>
            </div>
        `).join('');

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
            this.updateWordCount();
            this.showNotification(`Načten článek: ${article.title}`);
        }
    }

    deleteArticle(articleId) {
        const articles = this.getSavedArticles();
        const article = articles.find(a => a.id === articleId);
        
        if (!article) return;

        if (this.currentFilter === 'trash') {
            // Permanent delete
            if (confirm(`Opravdu chcete natrvalo smazat článek "${article.title}"?`)) {
                const updatedArticles = articles.filter(a => a.id !== articleId);
                localStorage.setItem('savedArticles', JSON.stringify(updatedArticles));
                
                if (this.currentArticleId === articleId) {
                    this.newArticle();
                }
                
                this.loadArticlesList();
                this.showNotification(`Článek "${article.title}" byl natrvalo smazán`);
            }
        } else {
            // Move to trash
            if (confirm(`Přesunout článek "${article.title}" do koše?`)) {
                article.isTrash = true;
                localStorage.setItem('savedArticles', JSON.stringify(articles));
                
                if (this.currentArticleId === articleId) {
                    this.newArticle();
                }
                
                this.loadArticlesList();
                this.showNotification(`Článek "${article.title}" byl přesunut do koše`);
            }
        }
    }

    newArticle() {
        this.editor.innerHTML = '';
        this.currentArticleId = null;
        this.loadArticlesList();
        this.updateWordCount();
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
        console.log('Processing Instagram carousel for text:', this.selectedText);
        
        this.showLoading();
        document.getElementById('loadingText').textContent = 'Generuji Instagram carousel...';

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
                await this.showInstagramPreview(data);
            } else {
                this.showError(data.error || 'Chyba při generování Instagram carousel');
            }
        } catch (error) {
            console.error('Instagram carousel generation failed:', error);
            this.showError('Chyba při generování carousel: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async showInstagramPreview(data) {
        // Create Instagram post object
        this.currentInstagramPost = {
            id: null,
            title: data.title,
            text: data.result,
            hashtags: data.hashtags,
            imageDescription: data.imageDescription,
            backgroundImageUrl: data.backgroundImageUrl,
            timestamp: null
        };

        // Fill form fields
        document.getElementById('instagramText').value = data.result;
        document.getElementById('instagramHashtags').value = data.hashtags;
        document.getElementById('instagramImagePrompt').value = data.imageDescription;

        // Show sidebar
        this.showInstagramSidebar();

        // Update preview
        await this.updateInstagramPreview();

        this.showNotification('Instagram carousel vygenerován! Můžete ho upravit a uložit.');
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

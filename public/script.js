// Globální proměnné pro debug
let globalEditor = null;

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
        // ZATÍM NEPOUŽÍVÁME
        console.log('Title method called but not executed');
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
        console.log('🚀 AITextEditor constructor called');
        
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
        
        // Globální reference pro debug
        globalEditor = this;
        
        this.initializeEventListeners();
        this.setupFormattingToolbar();
        this.loadArticlesList();
        this.updateWordCount();
        
        console.log('✅ AITextEditor initialized successfully');
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    updateWordCount() {
        if (this.wordCountElement && this.editor) {
            const text = this.editor.textContent.trim();
            const words = text ? text.split(/\s+/).length : 0;
            this.wordCountElement.textContent = `${words} Words`;
        }
    }

    setupFormattingToolbar() {
        console.log('Setting up formatting toolbar...');
        
        // Font family
        const fontFamily = document.getElementById('fontFamily');
        if (fontFamily) {
            fontFamily.addEventListener('change', (e) => {
                document.execCommand('fontName', false, e.target.value);
                this.editor.focus();
            });
        }

        // Font size
        const fontSize = document.getElementById('fontSize');
        if (fontSize) {
            fontSize.addEventListener('change', (e) => {
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    if (!range.collapsed) {
                        const span = document.createElement('span');
                        span.style.fontSize = e.target.value;
                        try {
                            range.surroundContents(span);
                        } catch (ex) {
                            span.appendChild(range.extractContents());
                            range.insertNode(span);
                        }
                    }
                }
                this.editor.focus();
            });
        }

        // Bold
        const boldBtn = document.getElementById('boldBtn');
        if (boldBtn) {
            boldBtn.addEventListener('click', () => {
                document.execCommand('bold', false, null);
                this.updateToolbarState();
                this.editor.focus();
            });
        }

        // Italic
        const italicBtn = document.getElementById('italicBtn');
        if (italicBtn) {
            italicBtn.addEventListener('click', () => {
                document.execCommand('italic', false, null);
                this.updateToolbarState();
                this.editor.focus();
            });
        }

        // Underline
        const underlineBtn = document.getElementById('underlineBtn');
        if (underlineBtn) {
            underlineBtn.addEventListener('click', () => {
                document.execCommand('underline', false, null);
                this.updateToolbarState();
                this.editor.focus();
            });
        }

        // Align Left
        const alignLeftBtn = document.getElementById('alignLeftBtn');
        if (alignLeftBtn) {
            alignLeftBtn.addEventListener('click', () => {
                document.execCommand('justifyLeft', false, null);
                this.updateAlignmentState();
                this.editor.focus();
            });
        }

        // Align Center
        const alignCenterBtn = document.getElementById('alignCenterBtn');
        if (alignCenterBtn) {
            alignCenterBtn.addEventListener('click', () => {
                document.execCommand('justifyCenter', false, null);
                this.updateAlignmentState();
                this.editor.focus();
            });
        }

        // Align Right
        const alignRightBtn = document.getElementById('alignRightBtn');
        if (alignRightBtn) {
            alignRightBtn.addEventListener('click', () => {
                document.execCommand('justifyRight', false, null);
                this.updateAlignmentState();
                this.editor.focus();
            });
        }

        // Text Color
        const textColor = document.getElementById('textColor');
        if (textColor) {
            textColor.addEventListener('change', (e) => {
                document.execCommand('foreColor', false, e.target.value);
                this.editor.focus();
            });
        }

        // Background Color
        const bgColor = document.getElementById('bgColor');
        if (bgColor) {
            bgColor.addEventListener('change', (e) => {
                document.execCommand('backColor', false, e.target.value);
                this.editor.focus();
            });
        }

        // Bullet List
        const bulletListBtn = document.getElementById('bulletListBtn');
        if (bulletListBtn) {
            bulletListBtn.addEventListener('click', () => {
                document.execCommand('insertUnorderedList', false, null);
                this.updateToolbarState();
                this.editor.focus();
            });
        }

        // Numbered List
        const numberedListBtn = document.getElementById('numberedListBtn');
        if (numberedListBtn) {
            numberedListBtn.addEventListener('click', () => {
                document.execCommand('insertOrderedList', false, null);
                this.updateToolbarState();
                this.editor.focus();
            });
        }

        // Clear Format
        const clearFormatBtn = document.getElementById('clearFormatBtn');
        if (clearFormatBtn) {
            clearFormatBtn.addEventListener('click', () => {
                document.execCommand('removeFormat', false, null);
                this.updateToolbarState();
                this.editor.focus();
            });
        }

        // Update toolbar state on selection change
        this.editor.addEventListener('mouseup', () => this.updateToolbarState());
        this.editor.addEventListener('keyup', () => this.updateToolbarState());

        // Keyboard shortcuts
        this.editor.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'b':
                        e.preventDefault();
                        document.execCommand('bold', false, null);
                        this.updateToolbarState();
                        break;
                    case 'i':
                        e.preventDefault();
                        document.execCommand('italic', false, null);
                        this.updateToolbarState();
                        break;
                    case 'u':
                        e.preventDefault();
                        document.execCommand('underline', false, null);
                        this.updateToolbarState();
                        break;
                }
            }
        });

        console.log('Formatting toolbar setup complete');
    }

    updateToolbarState() {
        // Update button states based on current selection
        const boldBtn = document.getElementById('boldBtn');
        const italicBtn = document.getElementById('italicBtn');
        const underlineBtn = document.getElementById('underlineBtn');
        const bulletListBtn = document.getElementById('bulletListBtn');
        const numberedListBtn = document.getElementById('numberedListBtn');

        if (boldBtn) {
            boldBtn.classList.toggle('active', document.queryCommandState('bold'));
        }
        if (italicBtn) {
            italicBtn.classList.toggle('active', document.queryCommandState('italic'));
        }
        if (underlineBtn) {
            underlineBtn.classList.toggle('active', document.queryCommandState('underline'));
        }
        if (bulletListBtn) {
            bulletListBtn.classList.toggle('active', document.queryCommandState('insertUnorderedList'));
        }
        if (numberedListBtn) {
            numberedListBtn.classList.toggle('active', document.queryCommandState('insertOrderedList'));
        }

        this.updateAlignmentState();
    }

    updateAlignmentState() {
        const alignLeftBtn = document.getElementById('alignLeftBtn');
        const alignCenterBtn = document.getElementById('alignCenterBtn');
        const alignRightBtn = document.getElementById('alignRightBtn');

        if (alignLeftBtn) alignLeftBtn.classList.remove('active');
        if (alignCenterBtn) alignCenterBtn.classList.remove('active');
        if (alignRightBtn) alignRightBtn.classList.remove('active');

        if (document.queryCommandState('justifyLeft') && alignLeftBtn) {
            alignLeftBtn.classList.add('active');
        } else if (document.queryCommandState('justifyCenter') && alignCenterBtn) {
            alignCenterBtn.classList.add('active');
        } else if (document.queryCommandState('justifyRight') && alignRightBtn) {
            alignRightBtn.classList.add('active');
        }
    }

    initializeEventListeners() {
        console.log('Initializing event listeners...');
        
        // Context menu
        this.editor.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            console.log('Context menu triggered');
            this.showContextMenu(e);
        });
        
        document.addEventListener('click', (e) => {
            if (!this.contextMenu.contains(e.target)) {
                this.hideContextMenu();
            }
        });
        
        // Menu items
        this.setupMenuItems();
        
        // Library sidebar filters
        this.setupLibraryFilters();

        // New project button
        const newProjectBtn = document.getElementById('newProjectBtn');
        if (newProjectBtn) {
            newProjectBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('New project clicked');
                this.createNewProject();
            });
        }

        // Header buttons
        this.setupHeaderButtons();
        
        // Modal buttons
        this.setupModalButtons();

        // Instagram sidebar
        this.setupInstagramSidebar();

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

    setupMenuItems() {
        setTimeout(() => {
            const menuItems = document.querySelectorAll('.menu-item');
            console.log('Setting up menu items:', menuItems.length);
            
            menuItems.forEach((item, index) => {
                console.log(`Setting up menu item ${index}:`, item.dataset.action);
                
                item.removeEventListener('click', this.handleMenuClick);
                
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Menu item clicked:', e.currentTarget.dataset.action);
                    this.handleMenuClick(e);
                });
            });
        }, 100);
    }

    setupLibraryFilters() {
        setTimeout(() => {
            const filterItems = document.querySelectorAll('.section-item[data-filter]');
            console.log('Setting up library filters:', filterItems.length);
            
            filterItems.forEach((item, index) => {
                console.log(`Setting up filter ${index}:`, item.dataset.filter);
                
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Filter clicked:', e.currentTarget.dataset.filter);
                    this.handleFilterClick(e);
                });
            });
        }, 100);
    }

    setupHeaderButtons() {
        const saveBtn = document.getElementById('saveBtn');
        const newBtn = document.getElementById('newBtn');
        const clearBtn = document.getElementById('clearBtn');
        const instagramEditorBtn = document.getElementById('instagramEditorBtn'); // OPRAVA
        
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Save button clicked');
                this.showSaveModal();
            });
        }
        
        if (newBtn) {
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('New button clicked');
                this.newArticle();
            });
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Clear button clicked');
                this.clearEditor();
            });
        }
        
        // OPRAVA: Instagram Editor tlačítko
        if (instagramEditorBtn) {
            instagramEditorBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Instagram Editor button clicked');
                window.location.href = '/instagram-editor.html';
            });
        }
    }

    setupModalButtons() {
        const submitPrompt = document.getElementById('submitPrompt');
        const cancelPrompt = document.getElementById('cancelPrompt');
        const confirmSave = document.getElementById('confirmSave');
        const cancelSave = document.getElementById('cancelSave');
        
        if (submitPrompt) {
            submitPrompt.addEventListener('click', (e) => {
                e.preventDefault();
                this.submitPrompt();
            });
        }
        if (cancelPrompt) {
            cancelPrompt.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideModal();
            });
        }
        if (confirmSave) {
            confirmSave.addEventListener('click', (e) => {
                e.preventDefault();
                this.confirmSaveArticle();
            });
        }
        if (cancelSave) {
            cancelSave.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideSaveModal();
            });
        }
    }

    setupInstagramSidebar() {
        const closeBtn = document.getElementById('closeInstagramSidebar');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideInstagramSidebar();
            });
        }

        const instagramText = document.getElementById('instagramText');
        if (instagramText) {
            instagramText.addEventListener('input', (e) => {
                if (this.currentInstagramPost) {
                    this.currentInstagramPost.text = e.target.value;
                    this.updateInstagramPreview();
                }
            });
        }

        const instagramHashtags = document.getElementById('instagramHashtags');
        if (instagramHashtags) {
            instagramHashtags.addEventListener('input', (e) => {
                if (this.currentInstagramPost) {
                    this.currentInstagramPost.hashtags = e.target.value;
                }
            });
        }

        const regenerateBtn = document.getElementById('regenerateInstagramImage');
        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.regenerateInstagramImage();
            });
        }

        const saveBtn = document.getElementById('saveInstagramPost');
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveInstagramPost();
            });
        }

        const downloadBtn = document.getElementById('downloadInstagramSlides');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.downloadInstagramSlides();
            });
        }
    }

    handleFilterClick(e) {
        console.log('Filter click handler called:', e.currentTarget.dataset.filter);
        
        document.querySelectorAll('.section-item[data-filter]').forEach(item => {
            item.classList.remove('active');
        });
        
        e.currentTarget.classList.add('active');
        this.currentFilter = e.currentTarget.dataset.filter;
        this.loadArticlesList();
        
        const filterNames = {
            'all': 'Všechny články',
            'recent': 'Posledních 7 dní',
            'trash': 'Koš'
        };
        
        this.showNotification(`Filtr: ${filterNames[this.currentFilter]}`);
    }

    createNewProject() {
        const projectName = prompt('Zadejte název nového projektu:');
        if (projectName && projectName.trim()) {
            this.showNotification(`Projekt "${projectName}" vytvořen`);
        }
    }

    showInstagramSidebar() {
        if (this.instagramSidebar) {
            this.instagramSidebar.classList.remove('hidden');
        }
    }

    hideInstagramSidebar() {
        if (this.instagramSidebar) {
            this.instagramSidebar.classList.add('hidden');
        }
        this.currentInstagramPost = null;
    }

    async updateInstagramPreview() {
        if (!this.currentInstagramPost) return;

        const canvas1 = document.getElementById('previewCanvas1');
        const canvas2 = document.getElementById('previewCanvas2');
        
        if (!canvas1 || !canvas2) return;

        const ctx1 = canvas1.getContext('2d');
        const ctx2 = canvas2.getContext('2d');

        // OPRAVA: Místo canvas použij HTML img element
        await this.createHTMLImageSlide1();
        this.createPreviewSlide2(ctx2);
    }

    // OPRAVA: Úplně nový přístup - HTML img místo canvas
    async createHTMLImageSlide1() {
        console.log('🖼️ Creating HTML image slide instead of canvas...');
        
        const canvas1 = document.getElementById('previewCanvas1');
        if (!canvas1) return;
        
        // Skryj canvas a vytvoř img element
        canvas1.style.display = 'none';
        
        // Odstraň starý img pokud existuje
        const existingImg = document.getElementById('htmlImageSlide1');
        if (existingImg) {
            existingImg.remove();
        }
        
        if (this.currentInstagramPost?.backgroundImageUrl) {
            console.log('🖼️ Creating HTML img element...');
            
            const img = document.createElement('img');
            img.id = 'htmlImageSlide1';
            img.src = this.currentInstagramPost.backgroundImageUrl;
            img.style.cssText = `
                width: ${canvas1.width}px;
                height: ${canvas1.height}px;
                object-fit: cover;
                border-radius: 8px;
                border: 3px solid lime;
                display: block;
            `;
            
            img.onload = function() {
                console.log('✅ HTML img loaded successfully!');
            };
            
            img.onerror = function() {
                console.log('❌ HTML img failed to load');
                img.alt = 'Obrázek se nepodařilo načíst';
                img.style.background = 'red';
                img.style.color = 'white';
                img.style.display = 'flex';
                img.style.alignItems = 'center';
                img.style.justifyContent = 'center';
            };
            
            // Vlož img za canvas
            canvas1.parentNode.insertBefore(img, canvas1.nextSibling);
            
            console.log('🖼️ HTML img element created and inserted');
        } else {
            console.log('❌ No image URL for HTML img');
            
            // Vytvoř placeholder div
            const placeholder = document.createElement('div');
            placeholder.id = 'htmlImageSlide1';
            placeholder.style.cssText = `
                width: ${canvas1.width}px;
                height: ${canvas1.height}px;
                background: linear-gradient(45deg, #667eea, #764ba2);
                border-radius: 8px;
                border: 3px solid red;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
                font-weight: bold;
            `;
            placeholder.textContent = 'Žádný obrázek';
            
            canvas1.parentNode.insertBefore(placeholder, canvas1.nextSibling);
        }
    }

    createPreviewSlide2(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        this.imageGenerator.createAbstractBackground(ctx);
        
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

        console.log('🎮 DEBUG: Regenerating image with prompt:', newPrompt);

        this.showLoading();
        document.getElementById('loadingText').textContent = 'Regeneruji pixel art ilustraci...';

        try {
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: `${newPrompt}, pixel art style, 16-bit retro game style, crisp pixel work, vibrant colors, isometric perspective, pixelated, 8-bit aesthetic`
                })
            });

            console.log('🎮 DEBUG: Response status:', response.status);
            const data = await response.json();
            console.log('🎮 DEBUG: Response data:', data);
            
            if (data.success && data.imageUrl) {
                console.log('🎮 DEBUG: New image URL received:', data.imageUrl);
                this.currentInstagramPost.backgroundImageUrl = data.imageUrl;
                this.currentInstagramPost.imageDescription = newPrompt;
                
                await this.updateInstagramPreview();
                this.showNotification(`Pixel art ilustrace regenerována (${data.generationMethod})`);
            } else {
                console.log('❌ DEBUG: No image URL in response');
                this.showError('Chyba při regeneraci obrázku - žádná URL');
            }
        } catch (error) {
            console.error('❌ DEBUG: Regeneration error:', error);
            this.showError('Chyba při regeneraci: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    saveInstagramPost() {
        if (!this.currentInstagramPost) return;

        this.currentInstagramPost.text = document.getElementById('instagramText').value;
        this.currentInstagramPost.hashtags = document.getElementById('instagramHashtags').value;
        this.currentInstagramPost.imageDescription = document.getElementById('instagramImagePrompt').value;

        const instagramPosts = this.getSavedInstagramPosts();
        
        if (this.currentInstagramPost.id) {
            const index = instagramPosts.findIndex(p => p.id === this.currentInstagramPost.id);
            if (index !== -1) {
                instagramPosts[index] = this.currentInstagramPost;
            }
        } else {
            this.currentInstagramPost.id = this.generateUUID();
            this.currentInstagramPost.timestamp = new Date().toISOString();
            instagramPosts.unshift(this.currentInstagramPost);
        }

        localStorage.setItem('instagramPosts', JSON.stringify(instagramPosts));
        this.showNotification('Instagram post uložen do historie');
    }

    getSavedInstagramPosts() {
        const posts = localStorage.getItem('instagramPosts');
        return posts ? JSON.parse(posts) : [];
    }

    downloadInstagramSlides() {
        if (!this.currentInstagramPost) return;

        // OPRAVA: Pro download stále použij canvas, ale s lepším handlingem
        const canvas1 = document.createElement('canvas');
        const canvas2 = document.createElement('canvas');
        
        canvas1.width = 1080;
        canvas1.height = 1350;
        canvas2.width = 1080;
        canvas2.height = 1350;
        
        const ctx1 = canvas1.getContext('2d');
        const ctx2 = canvas2.getContext('2d');
        
        this.createFullSizeSlide1(ctx1).then(() => {
            this.createFullSizeSlide2(ctx2);
            
            const link1 = document.createElement('a');
            link1.download = 'instagram-slide-1.png';
            link1.href = canvas1.toDataURL('image/png');
            link1.click();

            setTimeout(() => {
                const link2 = document.createElement('a');
                link2.download = 'instagram-slide-2.png';
                link2.href = canvas2.toDataURL('image/png');
                link2.click();
                
                if (this.currentInstagramPost.hashtags) {
                    navigator.clipboard.writeText(this.currentInstagramPost.hashtags).then(() => {
                        this.showNotification('Slides staženy a hashtags zkopírovány!');
                    });
                } else {
                    this.showNotification('Slides staženy!');
                }
            }, 500);
        });
    }

    async createFullSizeSlide1(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        try {
            if (this.currentInstagramPost.backgroundImageUrl) {
                const img = new Image();
                
                const isOpenAIImage = this.currentInstagramPost.backgroundImageUrl.includes('oaidalleapiprodscus.blob.core.windows.net');
                if (!isOpenAIImage) {
                    img.crossOrigin = 'anonymous';
                }
                
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
            
        } catch (error) {
            console.error('Error creating full-size slide 1:', error);
            this.imageGenerator.createGradientBackground(ctx);
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
                    <p>Zatím nemáte žádné články v kategorii "${this.getFilterName()}".</p>
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

    getFilterName() {
        const filterNames = {
            'all': 'Všechny články',
            'recent': 'Posledních 7 dní',
            'trash': 'Koš'
        };
        return filterNames[this.currentFilter] || 'Neznámá kategorie';
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
        this.updateWordCount();
        
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
            background: var(--accent);
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 4000;
            font-weight: 500;
            font-size: 13px;
            box-shadow: var(--shadow);
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

// Debug funkce
window.debugImageInfo = function() {
    console.log('🧪 DEBUG: Current Instagram post:', globalEditor?.currentInstagramPost);
    if (globalEditor?.currentInstagramPost?.backgroundImageUrl) {
        console.log('🧪 DEBUG: Opening image in new tab...');
        window.open(globalEditor.currentInstagramPost.backgroundImageUrl, '_blank');
    } else {
        console.log('❌ DEBUG: No image URL found');
    }
};

window.forceTestImage = function() {
    console.log('🧪 DEBUG: Force testing with test image...');
    
    if (globalEditor) {
        globalEditor.currentInstagramPost = {
            title: 'Test',
            text: 'Test text',
            backgroundImageUrl: 'https://picsum.photos/1080/1350?random=' + Date.now()
        };
        
        globalEditor.updateInstagramPreview();
        console.log('✅ Force test triggered');
    }
};

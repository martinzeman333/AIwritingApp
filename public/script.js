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
        console.log('🚀 AITextEditor constructor called');
        
        // Najdi elementy
        this.findElements();
        
        // Inicializuj proměnné
        this.initializeProperties();
        
        // Nastav event listenery
        this.setupEventListeners();
        
        // Načti data
        this.loadInitialData();
        
        // Globální reference pro debug
        globalEditor = this;
        
        console.log('✅ AITextEditor initialized successfully');
    }

    findElements() {
        console.log('🔍 Finding DOM elements...');
        
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
        
        console.log('📊 Elements found:', {
            editor: !!this.editor,
            contextMenu: !!this.contextMenu,
            promptModal: !!this.promptModal,
            saveModal: !!this.saveModal,
            loadingOverlay: !!this.loadingOverlay,
            wordCountElement: !!this.wordCountElement
        });
        
        if (!this.editor) {
            console.error('❌ Critical: Editor element not found!');
            return false;
        }
        
        return true;
    }

    initializeProperties() {
        this.imageGenerator = new InstagramImageGenerator();
        this.selectedText = '';
        this.selectionRange = null;
        this.lastCursorPosition = null;
        this.currentArticleId = null;
        this.currentInstagramPost = null;
        this.currentFilter = 'all';
    }

    setupEventListeners() {
        console.log('🎯 Setting up event listeners...');
        
        // OPRAVA: Context menu s více metodami
        this.setupContextMenu();
        
        // OPRAVA: Header buttons
        this.setupHeaderButtons();
        
        // OPRAVA: Library filters
        this.setupLibraryFilters();
        
        // OPRAVA: Menu items
        this.setupMenuItems();
        
        // Modal buttons
        this.setupModalButtons();
        
        // Instagram sidebar
        this.setupInstagramSidebar();
        
        // Formatting toolbar
        this.setupFormattingToolbar();
        
        // Editor events
        this.setupEditorEvents();
        
        console.log('✅ All event listeners set up');
    }

    setupContextMenu() {
        console.log('🖱️ Setting up context menu...');
        
        if (!this.editor || !this.contextMenu) {
            console.error('❌ Editor or context menu not found');
            return;
        }

        // OPRAVA: Více metod pro context menu
        
        // Metoda 1: Standardní contextmenu event
        this.editor.addEventListener('contextmenu', (e) => {
            console.log('🖱️ Context menu event triggered');
            e.preventDefault();
            e.stopPropagation();
            this.showContextMenu(e);
        });

        // Metoda 2: Mousedown pro pravé tlačítko
        this.editor.addEventListener('mousedown', (e) => {
            if (e.button === 2) { // Pravé tlačítko
                console.log('🖱️ Right mouse button down');
                e.preventDefault();
                // Malé zpoždění pro lepší handling
                setTimeout(() => {
                    this.showContextMenu(e);
                }, 10);
            }
        });

        // Metoda 3: Mouseup pro pravé tlačítko (fallback)
        this.editor.addEventListener('mouseup', (e) => {
            if (e.button === 2) { // Pravé tlačítko
                console.log('🖱️ Right mouse button up');
                e.preventDefault();
                this.showContextMenu(e);
            }
        });

        // Skrytí menu při kliknutí jinam
        document.addEventListener('click', (e) => {
            if (this.contextMenu && !this.contextMenu.contains(e.target)) {
                this.hideContextMenu();
            }
        });

        // Zabránění výchozímu context menu na celé stránce
        document.addEventListener('contextmenu', (e) => {
            if (this.editor && this.editor.contains(e.target)) {
                e.preventDefault();
            }
        });

        console.log('✅ Context menu setup complete');
    }

    setupHeaderButtons() {
        console.log('🔘 Setting up header buttons...');
        
        // OPRAVA: Použij addEventListener místo onclick
        const buttons = [
            { id: 'saveBtn', handler: () => this.showSaveModal(), name: 'Save' },
            { id: 'newBtn', handler: () => this.newArticle(), name: 'New' },
            { id: 'clearBtn', handler: () => this.clearEditor(), name: 'Clear' }
        ];

        buttons.forEach(({ id, handler, name }) => {
            const btn = document.getElementById(id);
            if (btn) {
                console.log(`✅ Setting up ${name} button`);
                
                // OPRAVA: Odstraň všechny staré event listenery
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                
                // Přidej nový event listener
                newBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`🔘 ${name} button clicked`);
                    handler();
                });
                
                // Ujisti se, že tlačítko je klikatelné
                newBtn.style.pointerEvents = 'auto';
                newBtn.style.cursor = 'pointer';
                
            } else {
                console.warn(`⚠️ Button ${id} not found`);
            }
        });
    }

    setupLibraryFilters() {
        console.log('📁 Setting up library filters...');
        
        setTimeout(() => {
            const filterItems = document.querySelectorAll('.section-item[data-filter]');
            console.log(`📁 Found ${filterItems.length} filter items`);
            
            filterItems.forEach((item, index) => {
                const filter = item.dataset.filter;
                console.log(`📁 Setting up filter ${index}: ${filter}`);
                
                // OPRAVA: Klonuj element pro odstranění starých listenerů
                const newItem = item.cloneNode(true);
                item.parentNode.replaceChild(newItem, item);
                
                newItem.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`📁 Filter clicked: ${filter}`);
                    this.handleFilterClick(e);
                });
                
                // Ujisti se, že je klikatelný
                newItem.style.pointerEvents = 'auto';
                newItem.style.cursor = 'pointer';
            });
        }, 100);
    }

    setupMenuItems() {
        console.log('📋 Setting up menu items...');
        
        setTimeout(() => {
            const menuItems = document.querySelectorAll('.menu-item');
            console.log(`📋 Found ${menuItems.length} menu items`);
            
            menuItems.forEach((item, index) => {
                const action = item.dataset.action;
                console.log(`📋 Setting up menu item ${index}: ${action}`);
                
                // OPRAVA: Klonuj element
                const newItem = item.cloneNode(true);
                item.parentNode.replaceChild(newItem, item);
                
                newItem.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`📋 Menu item clicked: ${action}`);
                    this.handleMenuClick(e);
                });
                
                // Ujisti se, že je klikatelný
                newItem.style.pointerEvents = 'auto';
                newItem.style.cursor = 'pointer';
            });
        }, 200);
    }

    setupModalButtons() {
        console.log('🔘 Setting up modal buttons...');
        
        const modalButtons = [
            { id: 'submitPrompt', handler: () => this.submitPrompt() },
            { id: 'cancelPrompt', handler: () => this.hideModal() },
            { id: 'confirmSave', handler: () => this.confirmSaveArticle() },
            { id: 'cancelSave', handler: () => this.hideSaveModal() }
        ];

        modalButtons.forEach(({ id, handler }) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log(`🔘 Modal button ${id} clicked`);
                    handler();
                });
            }
        });
    }

    setupInstagramSidebar() {
        // Instagram sidebar setup
        const closeBtn = document.getElementById('closeInstagramSidebar');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideInstagramSidebar();
            });
        }

        // Ostatní Instagram tlačítka...
        const instagramButtons = [
            { id: 'regenerateInstagramImage', handler: () => this.regenerateInstagramImage() },
            { id: 'saveInstagramPost', handler: () => this.saveInstagramPost() },
            { id: 'downloadInstagramSlides', handler: () => this.downloadInstagramSlides() }
        ];

        instagramButtons.forEach(({ id, handler }) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    handler();
                });
            }
        });
    }

    setupFormattingToolbar() {
        console.log('🎨 Setting up formatting toolbar...');
        
        // Formatting toolbar buttons
        const toolbarButtons = [
            { id: 'boldBtn', command: 'bold' },
            { id: 'italicBtn', command: 'italic' },
            { id: 'underlineBtn', command: 'underline' },
            { id: 'alignLeftBtn', command: 'justifyLeft' },
            { id: 'alignCenterBtn', command: 'justifyCenter' },
            { id: 'alignRightBtn', command: 'justifyRight' },
            { id: 'bulletListBtn', command: 'insertUnorderedList' },
            { id: 'numberedListBtn', command: 'insertOrderedList' },
            { id: 'clearFormatBtn', command: 'removeFormat' }
        ];

        toolbarButtons.forEach(({ id, command }) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log(`🎨 Toolbar button ${id} clicked`);
                    document.execCommand(command, false, null);
                    this.updateToolbarState();
                    this.editor.focus();
                });
            }
        });

        // Font selectors
        const fontFamily = document.getElementById('fontFamily');
        if (fontFamily) {
            fontFamily.addEventListener('change', (e) => {
                document.execCommand('fontName', false, e.target.value);
                this.editor.focus();
            });
        }

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
    }

    setupEditorEvents() {
        if (this.editor) {
            this.editor.addEventListener('input', () => {
                this.autoSave();
                this.updateWordCount();
            });

            this.editor.addEventListener('mouseup', () => this.updateToolbarState());
            this.editor.addEventListener('keyup', () => {
                this.updateToolbarState();
                this.saveCursorPosition();
            });
            this.editor.addEventListener('click', () => this.saveCursorPosition());
        }

        document.addEventListener('selectionchange', () => this.trackSelection());

        if (this.articleTitle) {
            this.articleTitle.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.confirmSaveArticle();
                }
            });
        }
    }

    loadInitialData() {
        this.loadArticlesList();
        this.updateWordCount();
    }

    // OPRAVA: Lepší showContextMenu
    showContextMenu(e) {
        console.log('📋 Showing context menu at:', e.pageX, e.pageY);
        
        if (!this.contextMenu) {
            console.error('❌ Context menu element not found');
            return;
        }

        this.saveCursorPosition();
        
        const selection = window.getSelection();
        this.selectedText = selection.toString().trim();
        
        console.log('📋 Selected text:', this.selectedText ? `"${this.selectedText.substring(0, 50)}..."` : 'none');
        
        // Update menu items based on selection
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            const needsSelection = item.hasAttribute('data-needs-selection');
            if (needsSelection) {
                item.classList.toggle('disabled', !this.selectedText);
            }
        });

        // Position menu
        const x = Math.min(e.pageX, window.innerWidth - 220); // Prevent overflow
        const y = Math.min(e.pageY, window.innerHeight - 200);
        
        this.contextMenu.style.left = x + 'px';
        this.contextMenu.style.top = y + 'px';
        this.contextMenu.style.display = 'block';
        this.contextMenu.classList.remove('hidden');
        
        console.log('✅ Context menu should be visible now');
    }

    hideContextMenu() {
        if (this.contextMenu) {
            this.contextMenu.classList.add('hidden');
            this.contextMenu.style.display = 'none';
        }
    }

    handleMenuClick(e) {
        console.log('📋 Menu click handler called');
        
        const target = e.currentTarget || e.target;
        const action = target.dataset.action;
        
        console.log('📋 Action:', action);
        
        if (target.classList.contains('disabled')) {
            console.log('📋 Menu item is disabled');
            return;
        }

        this.hideContextMenu();

        switch (action) {
            case 'generate':
                this.showPromptModal();
                break;
            case 'instagram':
                this.processInstagramImage();
                break;
            default:
                this.processAIAction(action);
                break;
        }
    }

    handleFilterClick(e) {
        console.log('📁 Filter click handler called');
        
        const target = e.currentTarget || e.target;
        const filter = target.dataset.filter;
        
        console.log('📁 Filter:', filter);
        
        // Remove active from all filter items
        document.querySelectorAll('.section-item[data-filter]').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active to clicked item
        target.classList.add('active');
        
        // Update current filter
        this.currentFilter = filter;
        
        // Reload articles list with filter
        this.loadArticlesList();
        
        const filterNames = {
            'all': 'Všechny články',
            'recent': 'Posledních 7 dní',
            'trash': 'Koš'
        };
        
        this.showNotification(`Filtr: ${filterNames[this.currentFilter]}`);
    }

    // Utility methods
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

    updateToolbarState() {
        const buttons = [
            { id: 'boldBtn', command: 'bold' },
            { id: 'italicBtn', command: 'italic' },
            { id: 'underlineBtn', command: 'underline' },
            { id: 'bulletListBtn', command: 'insertUnorderedList' },
            { id: 'numberedListBtn', command: 'insertOrderedList' }
        ];

        buttons.forEach(({ id, command }) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.classList.toggle('active', document.queryCommandState(command));
            }
        });
    }

    showNotification(message) {
        console.log('📢 Notification:', message);
        
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #007aff;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 4000;
            font-weight: 500;
            font-size: 13px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    showError(message) {
        console.error('❌ Error:', message);
        alert('Chyba: ' + message);
    }

    // Placeholder methods pro ostatní funkce
    showSaveModal() { 
        console.log('💾 Show save modal');
        if (this.saveModal) {
            this.saveModal.classList.remove('hidden');
        }
    }
    
    hideSaveModal() { 
        console.log('💾 Hide save modal');
        if (this.saveModal) {
            this.saveModal.classList.add('hidden');
        }
    }
    
    showPromptModal() { 
        console.log('✨ Show prompt modal');
        if (this.promptModal) {
            this.promptModal.classList.remove('hidden');
        }
    }
    
    hideModal() { 
        console.log('❌ Hide modal');
        if (this.promptModal) {
            this.promptModal.classList.add('hidden');
        }
    }
    
    newArticle() { 
        console.log('📄 New article');
        if (this.editor) {
            this.editor.innerHTML = '';
            this.updateWordCount();
        }
    }
    
    clearEditor() { 
        console.log('🗑️ Clear editor');
        if (confirm('Opravdu chcete vymazat celý obsah?')) {
            this.newArticle();
        }
    }
    
    processInstagramImage() { console.log('📸 Process Instagram'); }
    processAIAction(action) { console.log('🤖 Process AI action:', action); }
    loadArticlesList() { console.log('📚 Load articles list'); }
    autoSave() { /* Auto save logic */ }
    saveCursorPosition() { /* Save cursor logic */ }
    trackSelection() { /* Track selection logic */ }
    submitPrompt() { console.log('✅ Submit prompt'); }
    confirmSaveArticle() { console.log('✅ Confirm save'); }
    hideInstagramSidebar() { console.log('📸 Hide Instagram sidebar'); }
    regenerateInstagramImage() { console.log('📸 Regenerate Instagram image'); }
    saveInstagramPost() { console.log('📸 Save Instagram post'); }
    downloadInstagramSlides() { console.log('📸 Download Instagram slides'); }
}

// OPRAVA: Robustnější inicializace
function initializeApp() {
    console.log('🚀 Initializing AI Text Editor...');
    
    // Čekáme na DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                try {
                    new AITextEditor();
                } catch (error) {
                    console.error('❌ Failed to initialize:', error);
                }
            }, 200);
        });
    } else {
        setTimeout(() => {
            try {
                new AITextEditor();
            } catch (error) {
                console.error('❌ Failed to initialize:', error);
            }
        }, 200);
    }
}

// Spusť aplikaci
initializeApp();

// Debug funkce pro testování
window.testContextMenu = function() {
    console.log('🧪 Testing context menu...');
    if (globalEditor && globalEditor.contextMenu) {
        globalEditor.contextMenu.style.left = '100px';
        globalEditor.contextMenu.style.top = '100px';
        globalEditor.contextMenu.classList.remove('hidden');
        globalEditor.contextMenu.style.display = 'block';
        console.log('✅ Context menu should be visible');
    } else {
        console.error('❌ Global editor or context menu not found');
    }
};

window.testButtons = function() {
    console.log('🧪 Testing buttons...');
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        console.log('✅ Save button found, triggering click...');
        saveBtn.click();
    } else {
        console.error('❌ Save button not found');
    }
};

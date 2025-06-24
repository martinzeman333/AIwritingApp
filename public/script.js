class AITextEditor {
    constructor() {
        this.editor = document.getElementById('editor');
        this.contextMenu = document.getElementById('contextMenu');
        this.promptModal = document.getElementById('promptModal');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.promptInput = document.getElementById('promptInput');
        
        this.selectedText = '';
        this.selectionRange = null;
        
        this.initializeEventListeners();
        this.loadFromStorage();
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

        // Header buttons
        document.getElementById('saveBtn').addEventListener('click', () => this.saveToStorage());
        document.getElementById('loadBtn').addEventListener('click', () => this.loadFromStorage());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearEditor());

        // Auto-save
        this.editor.addEventListener('input', () => this.autoSave());

        // Selection tracking
        document.addEventListener('selectionchange', () => this.trackSelection());
    }

    showContextMenu(e) {
        e.preventDefault();
        
        const selection = window.getSelection();
        this.selectedText = selection.toString().trim();
        
        // Aktualizuj stav menu items
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

        if (action === 'generate') {
            this.showPromptModal();
        } else {
            this.processAIAction(action);
        }
        
        this.hideContextMenu();
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

            const data = await response.json();

            if (data.success) {
                this.insertAIResult(data.result, action);
            } else {
                this.showError(data.error || 'Chyba při komunikaci s AI');
            }
        } catch (error) {
            this.showError('Chyba sítě: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    insertAIResult(result, action) {
        const selection = window.getSelection();
        
        if (action === 'generate' || action === 'custom') {
            // Vložit na pozici kurzoru
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(result));
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        } else if (this.selectedText) {
            // Nahradit vybraný text
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(result));
            selection.removeAllRanges();
        }
        
        this.autoSave();
    }

    trackSelection() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            this.selectionRange = selection.getRangeAt(0);
        }
    }

    showLoading() {
        this.loadingOverlay.classList.remove('hidden');
    }

    hideLoading() {
        this.loadingOverlay.classList.add('hidden');
    }

    showError(message) {
        alert('Chyba: ' + message);
    }

    autoSave() {
        localStorage.setItem('editorContent', this.editor.innerHTML);
    }

    saveToStorage() {
        localStorage.setItem('editorContent', this.editor.innerHTML);
        this.showNotification('Dokument uložen');
    }

    loadFromStorage() {
        const content = localStorage.getItem('editorContent');
        if (content) {
            this.editor.innerHTML = content;
            this.showNotification('Dokument načten');
        }
    }

    clearEditor() {
        if (confirm('Opravdu chcete vymazat celý obsah?')) {
            this.editor.innerHTML = '';
            localStorage.removeItem('editorContent');
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #238636;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 4000;
            font-weight: 500;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

// Inicializace aplikace
document.addEventListener('DOMContentLoaded', () => {
    new AITextEditor();
})
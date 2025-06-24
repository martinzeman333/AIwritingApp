class AITextEditor {
    constructor() {
        this.editor = document.getElementById('editor');
        this.contextMenu = document.getElementById('contextMenu');
        this.promptModal = document.getElementById('promptModal');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.promptInput = document.getElementById('promptInput');
        
        this.selectedText = '';
        this.selectionRange = null;
        this.lastCursorPosition = null;
        
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
        
        // Sledování pozice kurzoru
        this.editor.addEventListener('click', () => this.saveCursorPosition());
        this.editor.addEventListener('keyup', () => this.saveCursorPosition());
    }

    saveCursorPosition() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0 && this.editor.contains(selection.anchorNode)) {
            this.lastCursorPosition = selection.getRangeAt(0).cloneRange();
        }
    }

    restoreCursorPosition() {
        if (this.lastCursorPosition) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(this.lastCursorPosition);
        }
    }

    showContextMenu(e) {
        e.preventDefault();
        
        // Uložit pozici kurzoru před zobrazením menu
        this.saveCursorPosition();
        
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

        // Skrýt menu PŘED zpracováním akce
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

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Response error:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('Response data:', data);

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
        
        // Ujisti se, že editor má focus
        this.editor.focus();
        
        const selection = window.getSelection();
        
        try {
            if (action === 'generate' || action === 'custom') {
                // Vložit na pozici kurzoru
                if (this.lastCursorPosition) {
                    selection.removeAllRanges();
                    selection.addRange(this.lastCursorPosition);
                }
                
                const range = selection.getRangeAt(0);
                const textNode = document.createTextNode(result);
                range.insertNode(textNode);
                
                // Posunout kurzor za vložený text
                range.setStartAfter(textNode);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
                
            } else if (this.selectedText && selection.rangeCount > 0) {
                // Nahradit vybraný text
                const range = selection.getRangeAt(0);
                
                // Pokud není nic vybráno, ale máme selectedText, najdi ho v editoru
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
                
                // Posunout kurzor za nahrazený text
                range.setStartAfter(textNode);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            } else {
                // Fallback - vložit na konec editoru
                this.editor.appendChild(document.createTextNode('\n' + result));
            }
            
        } catch (error) {
            console.error('Error inserting text:', error);
            // Fallback - vložit na konec editoru
            this.editor.appendChild(document.createTextNode('\n' + result));
        }
        
        // Vyčistit selectedText
        this.selectedText = '';
        
        // Auto-save
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
});

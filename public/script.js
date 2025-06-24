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
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.promptInput = document.getElementById('promptInput');
        this.imageGenerator = new InstagramImageGenerator();
        
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
                // Vygeneruj obrázek s AI pozadím
                const imageDataUrl = this.imageGenerator.generateImage(
                    data.result, 
                    data.imageDescription || ''
                );
                
                // Zobraz obrázek v novém okně s hashtags
                this.showInstagramImage(imageDataUrl, data.result, data.hashtags || '');
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

    showInstagramImage(imageDataUrl, text, hashtags) {
        // Vytvoř modal pro zobrazení obrázku
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="image-modal-content">
                <div class="image-modal-header">
                    <h3>📸 Instagram Post</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="image-container">
                    <img src="${imageDataUrl}" alt="Instagram post" />
                </div>
                <div class="instagram-content">
                    <div class="text-section">
                        <label>📝 Text:</label>
                        <textarea readonly>${text}</textarea>
                    </div>
                    <div class="hashtags-section">
                        <label>🏷️ Hashtags:</label>
                        <textarea readonly>${hashtags}</textarea>
                    </div>
                </div>
                <div class="image-modal-actions">
                    <button class="btn-secondary" id="downloadBtn">💾 Stáhnout obrázek</button>
                    <button class="btn-secondary" id="copyTextBtn">📋 Kopírovat text</button>
                    <button class="btn-primary" id="insertAllBtn">📝 Vložit vše</button>
                </div>
            </div>
        `;

        // Přidej styly
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 5000;
            overflow-y: auto;
        `;

        document.body.appendChild(modal);

        // Event listenery
        modal.querySelector('.close-btn').onclick = () => modal.remove();
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };

        modal.querySelector('#downloadBtn').onclick = () => {
            const link = document.createElement('a');
            link.download = 'instagram-post.png';
            link.href = imageDataUrl;
            link.click();
        };

        modal.querySelector('#copyTextBtn').onclick = () => {
            const fullText = `${text}\n\n${hashtags}`;
            navigator.clipboard.writeText(fullText).then(() => {
                this.showNotification('Text zkopírován do schránky');
            });
        };

        modal.querySelector('#insertAllBtn').onclick = () => {
            const fullText = `${text}\n\n${hashtags}`;
            this.insertAIResult(fullText, 'instagram');
            modal.remove();
        };
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

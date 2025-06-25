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

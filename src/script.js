document.addEventListener('DOMContentLoaded', () => {

    // ─── 1. Tauri Window Controls ───────────────────────────
    if (window.__TAURI__) {
        const { getCurrentWindow } = window.__TAURI__.window;
        const win = getCurrentWindow();

        document.getElementById('close-btn').addEventListener('click', () => win.close());
        document.getElementById('zoom-btn').addEventListener('click', () => win.toggleMaximize());
        document.getElementById('minimize-btn').addEventListener('click', () => win.minimize());
    }

    // ─── 2. Language ─────────────────────────────────────────
    const savedLang = localStorage.getItem('app-lang') || 'ar';
    setLanguage(savedLang);

    // ─── 3. Load saved cards ─────────────────────────────────
    loadCards();
})

// ─── 4. Theme ─────────────────────────────────────────────
const toggleBtn = document.querySelector('#themeCheckbox');

if (localStorage.getItem('dark-theme') === 'true') {
    toggleBtn.checked = true;
}

toggleBtn.addEventListener('change', function() {
    if (toggleBtn.checked) {
        document.documentElement.setAttribute('data-theme', 'dark')
        localStorage.setItem('dark-theme', 'true')
    } else {
        document.documentElement.removeAttribute('data-theme')
        localStorage.setItem('dark-theme', 'false')
    }
})

// ─── 5. Language ──────────────────────────────────────────
async function setLanguage(lang) {
    try {
        const response = await fetch(`assets/langs/${lang}.json`);
        const translations = await response.json();

        document.querySelectorAll('[data-lang]').forEach(function(element) {
            const key = element.getAttribute('data-lang');
            if (translations[key]) {
                if (element.tagName === 'INPUT') {
                    element.placeholder = translations[key];
                } else {
                    element.textContent = translations[key];
                }
            }
        });

        document.documentElement.lang = lang;
        document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
        localStorage.setItem('app-lang', lang);

    } catch (error) {
        console.error("حدث خطأ أثناء تحميل ملف اللغة:", error);
    }
}

document.querySelector('#langIcon').addEventListener('click', function() {
    const currentLang = document.documentElement.lang || 'ar';
    setLanguage(currentLang === 'ar' ? 'en' : 'ar');
});

// ─── 6. DOM References ───────────────────────────────────
const container               = document.querySelector('#container');
const createBtn               = document.querySelector('#create-btn');
const createBtnWrapper        = document.querySelector('#create-btn-wrapper');
const helloText               = document.querySelector('#hello-text');
const secondaryText           = document.querySelector('#secondary-text');
const cardSettingsOverlay     = document.querySelector('#card-settings-overlay');
const nameCardSettings        = document.querySelector('#name-cardSettings');
const descriptionCardSettings = document.querySelector('#description-cardSettings');
const createBtnCardSettings   = document.querySelector('#create-btn-cardSettings');
const backBtnCardSettings     = document.querySelector('#back-btn-cardSettings');

// ─── 7. LocalStorage ─────────────────────────────────────
function saveCards() {
    const cards = [];
    container.querySelectorAll('.board-card').forEach(function(card) {
        cards.push({
            name        : card.querySelector('.board-card-name').textContent,
            description : card.querySelector('.board-card-description').textContent
        });
    });
    localStorage.setItem('boards', JSON.stringify(cards));
}

function loadCards() {
    const saved = localStorage.getItem('boards');
    if (!saved) return;

    const cards = JSON.parse(saved);
    if (cards.length === 0) return;

    cards.forEach(function(data) {
        const card = createCardElement(data.name, data.description);
        container.insertBefore(card, createBtnWrapper);
    });

    helloText.classList.add('hide');
    secondaryText.classList.add('hide');
    container.classList.add('container-organize');
}

// ─── 8. Settings Overlay ─────────────────────────────────
let editingCard = null;

function openSettings() {
    editingCard = null;
    nameCardSettings.value = '';
    descriptionCardSettings.value = '';
    cardSettingsOverlay.classList.remove('hide');
}

function closeSettings() {
    editingCard = null;
    cardSettingsOverlay.classList.add('hide');
}

createBtn.addEventListener('click', openSettings);
backBtnCardSettings.addEventListener('click', closeSettings);

cardSettingsOverlay.addEventListener('click', function(e) {
    if (e.target === cardSettingsOverlay) closeSettings();
});

// ─── 9. Card Element Factory ─────────────────────────────
function createCardElement(name, description) {
    const card = document.createElement('div');
    card.classList.add('board-card');

    const actions = document.createElement('div');
    actions.classList.add('board-card-actions');

    const editBtn = document.createElement('button');
    editBtn.classList.add('board-card-action-btn', 'btn-edit');
    editBtn.innerHTML = `<img src="assets/icons/pen.svg" alt="edit">`;

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('board-card-action-btn', 'btn-delete');
    deleteBtn.innerHTML = `<img src="assets/icons/delete.svg" alt="delete">`;

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    const cardName = document.createElement('h3');
    cardName.classList.add('board-card-name');
    cardName.textContent = name;

    const cardDescription = document.createElement('p');
    cardDescription.classList.add('board-card-description');
    cardDescription.textContent = description;

    card.appendChild(actions);
    card.appendChild(cardName);
    card.appendChild(cardDescription);

    // ─── حذف ─────────────────────────────────────────────
    deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        card.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        card.style.opacity    = '0';
        card.style.transform  = 'scale(0.9)';
        setTimeout(() => {
            card.remove();
            saveCards();

            if (container.querySelectorAll('.board-card').length === 0) {
                helloText.classList.remove('hide');
                secondaryText.classList.remove('hide');
                container.classList.remove('container-organize');
            }
        }, 200);
    });

    // ─── تعديل ───────────────────────────────────────────
    editBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        editingCard = card;
        nameCardSettings.value        = cardName.textContent;
        descriptionCardSettings.value = cardDescription.textContent;
        cardSettingsOverlay.classList.remove('hide');
    });

    return card;
}

// ─── 10. Create / Edit Card ──────────────────────────────
createBtnCardSettings.addEventListener('click', function() {

    if (nameCardSettings.value.length < 3) {
        nameCardSettings.style.boxShadow = '0 0 0 3px rgba(220, 50, 50, 0.45)';
        setTimeout(() => { nameCardSettings.style.boxShadow = ''; }, 2000);
        return;
    }

    const name        = nameCardSettings.value.trim();
    const description = descriptionCardSettings.value.trim();

    // ─── تعديل كارد موجود ───────────────────────────────
    if (editingCard) {
        editingCard.querySelector('.board-card-name').textContent        = name;
        editingCard.querySelector('.board-card-description').textContent = description;
        saveCards();
        closeSettings();
        return;
    }

    // ─── إنشاء كارد جديد ────────────────────────────────
    closeSettings();

    const card = createCardElement(name, description);
    container.insertBefore(card, createBtnWrapper);
    saveCards();

    if (!container.classList.contains('container-organize')) {
        helloText.classList.add('hide');
        secondaryText.classList.add('hide');
        container.classList.add('container-organize');
    }
});
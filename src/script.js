document.addEventListener('DOMContentLoaded', () => {

    // ─── 1. Tauri Window Controls ───────────────────────────
    if (window.__TAURI__) {
        const { getCurrentWindow } = window.__TAURI__.window;
        const win = getCurrentWindow();

        document.getElementById('close-btn').addEventListener('click', () => win.close());
        document.getElementById('zoom-btn').addEventListener('click', () => win.toggleMaximize());
        document.getElementById('minimize-btn').addEventListener('click', () => win.minimize());
    }
})

const toggleBtn = document.querySelector('#themeCheckbox');

toggleBtn.addEventListener('change', function() {

    if(toggleBtn.checked == true) {
        document.documentElement.setAttribute('data-theme', 'dark')
        localStorage.setItem('dark-theme','true')
    }else {
        document.documentElement.removeAttribute('data-theme')
        localStorage.setItem('dark-theme','false')
    }
})

if (localStorage.getItem('dark-theme') === 'true') {
    document.querySelector('#themeCheckbox').checked = true;
}

async function setLanguage(lang) {
    try {

        const response = await fetch(`assets/langs/${lang}.json`);        
        const translations = await response.json();

        const elements = document.querySelectorAll('[data-lang]');
        
        elements.forEach(function(element) {
        const key = element.getAttribute('data-lang');
    
        if (translations[key]) {
            element.textContent = translations[key];
        }
        });

        document.documentElement.lang = lang;

        if (lang === 'ar') {
            document.documentElement.dir = 'rtl';
        } else {
            document.documentElement.dir = 'ltr';
        }

        localStorage.setItem('app-lang', lang);

    } catch (error) {
        console.error("حدث خطأ أثناء تحميل ملف اللغة:", error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const savedLang = localStorage.getItem('app-lang') || 'ar';
    setLanguage(savedLang);
});


const switchLangBtn = document.getElementById('langIcon');

switchLangBtn.addEventListener('click', function() {

        const currentLang = document.documentElement.lang || 'ar';
        
        let newLang;
        
        if (currentLang === 'ar') {
            newLang = 'en';
        } else {
            newLang = 'ar';
        }
        
        setLanguage(newLang);
});


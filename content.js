const azToAr = {'a':'ض','z':'ص','e':'ث','r':'ق','t':'ف','y':'غ','u':'ع','i':'ه','o':'خ','p':'ح','^':'ج','$':'د','q':'ش','s':'س','d':'ي','f':'ب','g':'ل','h':'ا','j':'ت','k':'ن','l':'م','m':'ك','ù':'ط','*':'ذ','w':'ئ','x':'ء','c':'ؤ','v':'ر','b':'لا','n':'ى',',':'ة',';':'و',':':'ز','!':'ظ',' ':' '};
const arToAz = Object.fromEntries(Object.entries(azToAr).map(([k, v]) => [v, k]));

function translate(text) {
    let out = "";
    for (let char of text) {
        if (/[\u0600-\u06FF]/.test(char)) out += arToAz[char] || char;
        else out += azToAr[char.toLowerCase()] || char;
    }
    return out;
}

let tooltip = document.createElement('div');
tooltip.className = 'zaim-suggestion';
tooltip.style.display = 'none';
document.body.appendChild(tooltip);

let currentTarget = null;

document.addEventListener('input', (e) => {
    const el = e.target;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable) {
        const val = el.value || el.innerText;
        if (val.length > 3) { // يظهر فقط إذا كتبت أكثر من 3 حروف
            const lastWords = val.split(' ').pop();
            if (lastWords.length > 2) {
                const translated = translate(lastWords);
                tooltip.innerText = "تحويل إلى: " + translated;
                
                const rect = el.getBoundingClientRect();
                tooltip.style.left = `${rect.left + window.scrollX}px`;
                tooltip.style.top = `${rect.top + window.scrollY - 35}px`;
                tooltip.style.display = 'block';
                
                currentTarget = { el, translated, original: lastWords };
            }
        } else {
            tooltip.style.display = 'none';
        }
    }
});

tooltip.addEventListener('mousedown', (e) => {
    e.preventDefault();
    if (currentTarget) {
        const { el, translated, original } = currentTarget;
        if (el.isContentEditable) {
            el.innerText = el.innerText.replace(original, translated);
        } else {
            el.value = el.value.replace(original, translated);
        }
        tooltip.style.display = 'none';
    }
});

// إخفاء الفقاعة إذا ضغطت في أي مكان آخر
document.addEventListener('mousedown', (e) => {
    if (e.target !== tooltip) tooltip.style.display = 'none';
});
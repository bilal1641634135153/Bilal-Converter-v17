const azToAr = {'a':'ض','z':'ص','e':'ث','r':'ق','t':'ف','y':'غ','u':'ع','i':'ه','o':'خ','p':'ح','^':'ج','$':'د','q':'ش','s':'س','d':'ي','f':'ب','g':'ل','h':'ا','j':'ت','k':'ن','l':'م','m':'ك','ù':'ط','*':'ذ','w':'ئ','x':'ء','c':'ؤ','v':'ر','b':'لا','n':'ى',',':'ة',';':'و',':':'ز','!':'ظ',' ':' '};
const arToAz = Object.fromEntries(Object.entries(azToAr).map(([k, v]) => [v, k]));

// دالة الزعيم للترجمة الثنائية الذكية
function zaimDualTranslate(text) {
    if (!text) return "";
    return text.split('').map(char => {
        let lowChar = char.toLowerCase();
        // إذا كان الحرف عربي (ضمن نطاق الحروف العربية)
        if (/[\u0600-\u06FF]/.test(char)) {
            return arToAz[char] || char;
        } 
        // إذا كان الحرف لاتيني (فرنسي/انجليزي)
        else if (/[a-z;,.!^ù$*]/.test(lowChar)) {
            return azToAr[lowChar] || char;
        }
        return char; // أي رمز آخر يبقى كما هو
    }).join('');
}

// إنشاء الفقاعة وتثبيتها
let tip = document.getElementById('zaim-ultimate-tip') || document.createElement('div');
tip.id = 'zaim-ultimate-tip';
tip.style.cssText = "position:fixed; display:none; z-index:2147483647; background:#1e1e1e; color:#00d1ff; padding:8px 15px; border-radius:10px; border:2px solid #00d1ff; cursor:pointer; font-weight:bold; box-shadow:0 8px 25px rgba(0,0,0,0.7); font-family:sans-serif; direction: ltr; text-align: left;";
if (!tip.parentElement) document.body.appendChild(tip);

let currentTarget = null;

document.addEventListener('input', (e) => {
    const el = e.target;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable) {
        let val = el.isContentEditable ? el.innerText : el.value;
        if (val && val.length > 0) {
            const result = zaimDualTranslate(val);
            tip.innerText = "تحويل (الكل): " + result;
            const rect = el.getBoundingClientRect();
            tip.style.left = `${rect.left}px`;
            tip.style.top = `${rect.top + window.scrollY - 50}px`;
            tip.style.display = 'block';
            currentTarget = { el, result };
        } else {
            tooltip.style.display = 'none';
        }
    }
}, true);

// التنفيذ الإجباري
tip.onmousedown = async (e) => {
    e.preventDefault();
    if (currentTarget) {
        const { el, result } = currentTarget;
        el.focus();

        // تحديد النص بالكامل لاستبداله
        if (el.isContentEditable) {
            const range = document.createRange();
            range.selectNodeContents(el);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else {
            el.select();
        }

        try {
            // محاكاة الكتابة اليدوية (تتخطى حماية انستقرام)
            document.execCommand('insertText', false, result);
        } catch (err) {
            if (el.isContentEditable) el.innerText = result;
            else el.value = result;
        }

        // تنبيه الموقع بأن النص تغير
        ['input', 'change', 'blur'].forEach(type => {
            el.dispatchEvent(new Event(type, { bubbles: true }));
        });

        tip.style.display = 'none';
    }
};

document.addEventListener('mousedown', (e) => {
    if (e.target !== tip) tip.style.display = 'none';
});
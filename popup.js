const azToAr = {'a':'ض','z':'ص','e':'ث','r':'ق','t':'ف','y':'غ','u':'ع','i':'ه','o':'خ','p':'ح','^':'ج','$':'د','q':'ش','s':'س','d':'ي','f':'ب','g':'ل','h':'ا','j':'ت','k':'ن','l':'م','m':'ك','ù':'ط','*':'ذ','w':'ئ','x':'ء','c':'ؤ','v':'ر','b':'لا','n':'ى',',':'ة',';':'و',':':'ز','!':'ظ',' ':' '};
const arToAz = Object.fromEntries(Object.entries(azToAr).map(([k, v]) => [v, k]));

const inputBox = document.getElementById('inputBox');
const resultDiv = document.getElementById('result');
const copyBtn = document.getElementById('copyBtn');

let lastInputTime = 0;
let lastKey = "";

// مراقبة لوحة المفاتيح فقط للحصول على "الزمن" و "المفتاح"
inputBox.addEventListener('keydown', (e) => {
    lastInputTime = performance.now();
    lastKey = e.key;
});

inputBox.addEventListener('input', function() {
    const val = this.value;
    const now = performance.now();
    const diff = now - lastInputTime;
    
    let processedText = "";
    
    for (let i = 0; i < val.length; i++) {
        let char = val[i];
        let isArabic = /[\u0600-\u06FF]/.test(char);

        if (isArabic) {
            // منطق الزعيم: إذا كنا عند آخر حرف مدخل وكان "ا" وقبله "ل"
            if (i === val.length - 1 && char === 'ا' && val[i-1] === 'ل' && lastKey === 'ا') {
                if (diff < 40) {
                    // مسح الـ g السابقة وإضافة b
                    processedText = processedText.slice(0, -1) + "b";
                } else {
                    processedText += "h";
                }
            } 
            // معالجة "لا" المدمجة (زر B)
            else if (char === 'لا' || (char.charCodeAt(0) >= 0xFEF5 && char.charCodeAt(0) <= 0xFEFC)) {
                processedText += "b";
            }
            else {
                processedText += arToAz[char] || char;
            }
        } else {
            // تحويل من فرنسي لعربي
            processedText += azToAr[char.toLowerCase()] || char;
        }
    }

    resultDiv.innerText = processedText;
});

// وظيفة النسخ
copyBtn.addEventListener('click', function() {
    const textToCopy = resultDiv.innerText;
    if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = copyBtn.innerText;
            copyBtn.innerText = "تم النسخ! ✅";
            setTimeout(() => { copyBtn.innerText = originalText; }, 1500);
        });
    }
});
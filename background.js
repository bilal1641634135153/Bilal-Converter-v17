const azToAr = {'a':'ض','z':'ص','e':'ث','r':'ق','t':'ف','y':'غ','u':'ع','i':'ه','o':'خ','p':'ح','^':'ج','$':'د','q':'ش','s':'س','d':'ي','f':'ب','g':'ل','h':'ا','j':'ت','k':'ن','l':'م','m':'ك','ù':'ط','*':'ذ','w':'ئ','x':'ء','c':'ؤ','v':'ر','b':'لا','n':'ى',',':'ة',';':'و',':':'ز','!':'ظ',' ':' '};
const arToAz = Object.fromEntries(Object.entries(azToAr).map(([k, v]) => [v, k]));

function transformText(text) {
    let output = "";
    for (let char of text) {
        if (/[\u0600-\u06FF]/.test(char)) {
            output += arToAz[char] || char;
        } else {
            output += azToAr[char.toLowerCase()] || char;
        }
    }
    return output;
}

// دالة التنفيذ في الصفحة
async function executeTransformation(tab) {
    // جلب النص المظلل عبر الـ Scripting
    const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection().toString()
    });

    const selectedText = result[0].result;
    if (!selectedText) return;

    const newText = transformText(selectedText);

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (translatedText) => {
            const el = document.activeElement;
            if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) {
                if (el.isContentEditable) {
                    document.execCommand('insertText', false, translatedText);
                } else {
                    const start = el.selectionStart;
                    const end = el.selectionEnd;
                    el.value = el.value.substring(0, start) + translatedText + el.value.substring(end);
                    el.selectionStart = el.selectionEnd = start + translatedText.length;
                }
            } else {
                document.execCommand('insertText', false, translatedText);
            }
        },
        args: [newText]
    });
}

// 1. تشغيل عبر الكليك يمين
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({ id: "translateZaim", title: "تحويل الزعيم", contexts: ["selection"] });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "translateZaim") executeTransformation(tab);
});

// 2. تشغيل عبر اختصار الكيبورد Ctrl+Shift+X
chrome.commands.onCommand.addListener((command, tab) => {
    if (command === "run-transform") executeTransformation(tab);
});
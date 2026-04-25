const azToAr = {'a':'ض','z':'ص','e':'ث','r':'ق','t':'ف','y':'غ','u':'ع','i':'ه','o':'خ','p':'ح','^':'ج','$':'د','q':'ش','s':'س','d':'ي','f':'ب','g':'ل','h':'ا','j':'ت','k':'ن','l':'م','m':'ك','ù':'ط','*':'ذ','w':'ئ','x':'ء','c':'ؤ','v':'ر','b':'لا','n':'ى',',':'ة',';':'و',':':'ز','!':'ظ',' ':' '};
const arToAz = Object.fromEntries(Object.entries(azToAr).map(([k, v]) => [v, k]));

function zaimTranslate(text) {
    if (!text) return "";
    return text.split('').map(char => {
        let lowChar = char.toLowerCase();
        if (/[\u0600-\u06FF]/.test(char)) return arToAz[char] || char;
        return azToAr[lowChar] || char;
    }).join('');
}

chrome.commands.onCommand.addListener(async (command, tab) => {
    if (command === "run-transform") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                const el = document.activeElement;
                if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) {
                    return el.isContentEditable ? el.innerText : el.value;
                }
                return null;
            }
        }, (results) => {
            const val = results[0].result;
            if (val) {
                const translated = zaimTranslate(val);
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    args: [translated],
                    func: (newText) => {
                        const el = document.activeElement;
                        if (el.isContentEditable) el.innerText = newText;
                        else el.value = newText;
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                });
            }
        });
    }
});
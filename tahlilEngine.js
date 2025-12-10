// tahlilEngine.js (FINAL ROBUST VERSİYON)

const normalizeText = (text) => {
    if (!text) return '';
    return text.toLowerCase()
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9\s]/g, ''); 
};

const evaluateCondition = (condition, value) => {
    if (condition.includes('AND')) {
        return condition.split('AND').every(subCondition => 
            evaluateCondition(subCondition.trim(), value)
        );
    }

    const operators = ['<=', '>=', '<', '>'];
    let operator = null;

    for (const op of operators) {
        if (condition.includes(op)) {
            operator = op;
            break;
        }
    }

    if (!operator) return false;

    const parts = condition.split(operator).map(p => p.trim());
    const numericThreshold = parseFloat(parts[1]);

    if (isNaN(numericThreshold)) return false;

    switch (operator) {
        case '<': return value < numericThreshold;
        case '>': return value > numericThreshold;
        case '<=': return value <= numericThreshold;
        case '>=': return value >= numericThreshold;
        default: return false;
    }
};


const generateTahlilWarning = (testName, value, rulesMap) => {
    const results = [];
    const normalizedTestName = normalizeText(testName); 
    const ruleSet = rulesMap[normalizedTestName]; 

    if (!ruleSet || isNaN(value)) {
        results.push({ type: 'info', message: `${testName} için kural veya geçerli değer bulunamadı.` });
        return results;
    }

    let isNormalRangeChecked = false;

    for (const rule of ruleSet.rules) {
        if (evaluateCondition(rule.condition, value)) {
            
            // KRİTİK DÜZELTME: rule.severity var mı kontrol et!
            let type = 'warning';
            if (rule.severity) { // Eğer severity alanı varsa, devam et
                if (rule.severity.includes('Kritik')) { 
                    type = 'danger';
                } else if (rule.severity.includes('Normal')) {
                    type = 'success';
                    isNormalRangeChecked = true; 
                }
            } else {
                type = 'info'; // Severity tanımlı değilse info olarak işaretle
            }

            results.push({
                type: type,
                message: rule.message,
                severity: rule.severity || 'Bilinmiyor', // Severity yoksa 'Bilinmiyor' olarak ekle
                recommendation: rule.recommendation || []
            });
        }
    }
    
    // ... (Fonksiyonun geri kalanı)
    if (results.length === 0 && !isNormalRangeChecked) {
        results.push({ type: 'info', message: `Değeriniz (${value}), genel normal aralığın (${ruleSet.min} - ${ruleSet.max}) dışındadır. Özel bir kural eşleşmedi.` });
    } else if (results.length === 0) {
        results.push({ type: 'success', message: `Değeriniz (${value}), tüm kurallar ışığında optimal aralıkta görünüyor.` });
    }


    return results;
};

module.exports = {
    normalizeText,
    generateTahlilWarning
};
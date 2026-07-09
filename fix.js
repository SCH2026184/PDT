const fs = require('fs');

function fixMojibake(text) {
    // Regex for double encoded UTF-8 (2-byte sequences)
    // C2 (Â) or C3 (Ã) followed by 80-BF
    return text.replace(/[\u00C2\u00C3][\u0080-\u00BF]/g, (match) => {
        try {
            // Convert the misinterpreted 1252/latin1 characters back to bytes
            let bytes = [];
            for (let i = 0; i < match.length; i++) {
                bytes.push(match.charCodeAt(i) & 0xFF);
            }
            return Buffer.from(bytes).toString('utf8');
        } catch(e) {
            return match;
        }
    });
}

const files = ['index.html', 'script.js'];
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let fixed = fixMojibake(content);
    
    // Also fix the 3-byte degree symbol double encoding Ã‚Â° -> Â° -> °
    // Actually, Ã‚Â° is C3 82 C2 B0. 
    // C3 82 -> C2 (Â), C2 B0 -> B0 (°). So two passes might be needed for some, or just specific replacement.
    fixed = fixed.replace(/Ã‚Â°/g, '°');
    fixed = fixed.replace(/Ã‚Âº/g, 'º');
    
    fs.writeFileSync(file, fixed, 'utf8');
});
console.log('Fixed');

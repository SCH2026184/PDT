const fs = require('fs');
const path = 'C:/Users/Diego Schroeder/.gemini/antigravity/brain/7f0adfc9-bc66-425a-905b-1b2662dd06b4/.system_generated/logs/transcript.jsonl';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');
for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].includes('@@ -528,1276 +528,436 @@')) {
        fs.writeFileSync('C:/Users/Diego Schroeder/Desktop/Antigravity/PDE II/diff_extract.txt', lines[i]);
        console.log('Found it!');
        break;
    }
}

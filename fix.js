const fs = require('fs');
const path = require('path');

const replacements = {
    'â€”': '—',
    'âœ¨': '✨',
    'dÃ©cor': 'décor',
    'â†’': '→',
    'â€“': '–',
    'â˜…': '★',
    'â€¢': '•',
    'â€¦': '…',
    'âœ“': '✓',
    'Â ': ' ',
    'â ¦': '→'
};

function fixFile(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    for (const [bad, good] of Object.entries(replacements)) {
        content = content.split(bad).join(good);
    }
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed', file);
    }
}

fixFile('index.html');
fixFile('collection.html');
fixFile('script.js');
fixFile('style.css');

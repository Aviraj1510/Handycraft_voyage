const fs = require('fs');

const files = ['index.html', 'collection.html', 'script.js', 'style.css'];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/^\uFEFF/, '');
  let original = content;

  // Fix all mojibake by converting specific UTF-8 sequences stored as Windows-1252
  // These are the common Windows-1252 misread as Latin1 then displayed
  const badBytes = [
    ['\u00e2\u0080\u0094', '\u2014'],  // em dash —
    ['\u00e2\u0080\u0099', '\u2019'],  // right single quote '
    ['\u00e2\u0080\u009c', '\u201c'],  // left double quote "
    ['\u00e2\u0080\u009d', '\u201d'],  // right double quote "
    ['\u00e2\u0080\u00a2', '\u2022'],  // bullet •
    ['\u00e2\u0080\u00a6', '\u2026'],  // ellipsis …
    ['\u00e2\u0086\u0092', '\u2192'],  // right arrow →
    ['\u00e2\u0098\u0085', '\u2605'],  // star ★
    ['\u00e2\u009c\u00a8', '\u2728'],  // sparkles ✨
    ['\u00e2\u009c\u0093', '\u2713'],  // check ✓
    ['\u00c2\u00b7', '\u00b7'],        // middle dot ·
    ['\u00c3\u00a9', '\u00e9'],        // e with accent é
    ['\u00e2\u0080\u0098', '\u2018'],  // left single quote '
    ['\u00c2\u00a0', '\u00a0'],        // non-breaking space
    ['\u00e2\u009d\u00a6', '\u2192'],  // another arrow variant
  ];

  for (const [bad, good] of badBytes) {
    while (content.includes(bad)) {
      content = content.split(bad).join(good);
    }
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed: ' + file);
  } else {
    console.log('Clean: ' + file);
  }
}

// Report remaining non-ASCII
console.log('\n--- Remaining non-ASCII ---');
for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const content = fs.readFileSync(file, 'utf8');
  const seen = new Set();
  const re = /[^\x00-\x7F]/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const ctx = content.substring(Math.max(0, m.index - 12), m.index + 12);
    seen.add(ctx);
  }
  if (seen.size > 0) {
    console.log('[' + file + '] - HAS ' + seen.size + ' issues:');
    for (const s of seen) console.log('  ' + JSON.stringify(s));
  } else {
    console.log('[' + file + '] - CLEAN');
  }
}

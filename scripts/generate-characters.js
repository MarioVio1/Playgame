const fs = require('fs');
const path = require('path');

const SKIN_TONES = ['#FFD5C8', '#F0C8A0', '#D4A574', '#A67B5B', '#8B5E3C'];
const HAIR_COLORS = [
  { name: 'neri', color: '#1a1a1a' },
  { name: 'castani', color: '#6B4423' },
  { name: 'biondi', color: '#E8C872' },
  { name: 'rossi', color: '#B55239' },
  { name: 'bianchi', color: '#E8E8E8' }
];

const GLASSES_STYLES = [
  { type: 'none', svg: '' },
  { type: 'rounded', svg: (c) => `<rect x="32" y="38" width="16" height="10" rx="3" fill="none" stroke="#333" stroke-width="2"/><rect x="52" y="38" width="16" height="10" rx="3" fill="none" stroke="#333" stroke-width="2"/><line x1="48" y1="43" x2="52" y2="43" stroke="#333" stroke-width="2"/>` },
  { type: 'square', svg: (c) => `<rect x="30" y="36" width="18" height="12" fill="none" stroke="#333" stroke-width="2"/><rect x="52" y="36" width="18" height="12" fill="none" stroke="#333" stroke-width="2"/><line x1="48" y1="42" x2="52" y2="42" stroke="#333" stroke-width="2"/>` },
  { type: 'sunglasses', svg: (c) => `<rect x="30" y="36" width="18" height="12" rx="2" fill="#222"/><rect x="52" y="36" width="18" height="12" rx="2" fill="#222"/><line x1="48" y1="42" x2="52" y2="42" stroke="#222" stroke-width="2"/>` }
];

function generateCharacterSVG(id, options = {}) {
  const {
    gender = 'male',
    skinTone = SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)],
    hairColor = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
    hasGlasses = Math.random() > 0.6,
    glassesStyle = GLASSES_STYLES[Math.floor(Math.random() * GLASSES_STYLES.length)],
    hasHat = Math.random() > 0.7,
    hatColor = ['#E74C3C', '#3498DB', '#2ECC71', '#9B59B6', '#F39C12'][Math.floor(Math.random() * 5)],
    hasBeard = gender === 'male' && Math.random() > 0.5,
    hasMustache = gender === 'male' && Math.random() > 0.6,
    hasEarrings = gender === 'female' && Math.random() > 0.6,
    hairStyle = Math.floor(Math.random() * 3)
  } = options;

  const hairStyleSVG = {
    0: (color) => `<ellipse cx="50" cy="28" rx="28" ry="20" fill="${color}"/><path d="M22 35 Q25 20 50 18 Q75 20 78 35" fill="${color}"/>`,
    1: (color) => `<path d="M20 45 Q20 15 50 12 Q80 15 80 45 L80 35 Q50 25 20 35 Z" fill="${color}"/>`,
    2: (color) => `<path d="M22 40 Q22 10 50 8 Q78 10 78 40" fill="${color}"/><path d="M78 25 Q85 30 82 40" fill="${color}"/><path d="M22 25 Q15 30 18 40" fill="${color}"/>`
  };

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="bg${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow${id}">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.2"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="100" height="100" fill="url(#bg${id})" rx="10"/>
  
  <!-- Face -->
  <ellipse cx="50" cy="52" rx="30" ry="32" fill="${skinTone}" filter="url(#shadow${id})"/>
  
  <!-- Hair Back -->
  ${hairStyleSVG[hairStyle](hairColor.color)}
  
  <!-- Ears -->
  <ellipse cx="20" cy="52" rx="5" ry="8" fill="${skinTone}"/>
  <ellipse cx="80" cy="52" rx="5" ry="8" fill="${skinTone}"/>
  
  <!-- Earrings -->
  ${hasEarrings ? `<circle cx="16" cy="58" r="3" fill="#FFD700"/><circle cx="84" cy="58" r="3" fill="#FFD700"/>` : ''}
  
  <!-- Eyes -->
  <ellipse cx="38" cy="48" rx="5" ry="6" fill="white"/>
  <ellipse cx="62" cy="48" rx="5" ry="6" fill="white"/>
  <circle cx="39" cy="49" r="3" fill="#2C3E50"/>
  <circle cx="63" cy="49" r="3" fill="#2C3E50"/>
  <circle cx="40" cy="48" r="1" fill="white"/>
  <circle cx="64" cy="48" r="1" fill="white"/>
  
  <!-- Glasses -->
  ${hasGlasses ? glassesStyle.svg() : ''}
  
  <!-- Eyebrows -->
  <path d="M30 38 Q38 35 44 38" stroke="${hairColor.color}" stroke-width="2" fill="none"/>
  <path d="M56 38 Q62 35 70 38" stroke="${hairColor.color}" stroke-width="2" fill="none"/>
  
  <!-- Nose -->
  <path d="M50 52 Q52 58 50 62 Q48 62 48 60" stroke="${skinTone}" stroke-width="2" fill="none" filter="brightness(0.9)"/>
  
  <!-- Mouth -->
  ${hasMustache ? `
  <path d="M38 68 Q44 65 50 68 Q56 65 62 68" stroke="${hairColor.color}" stroke-width="3" fill="none"/>
  <path d="M42 72 Q50 76 58 72" stroke="#C0392B" stroke-width="2" fill="none"/>
  ` : hasBeard ? `
  <path d="M35 68 Q50 85 65 68" fill="${hairColor.color}"/>
  <path d="M42 72 Q50 75 58 72" stroke="#C0392B" stroke-width="2" fill="none"/>
  ` : `
  <path d="M42 70 Q50 75 58 70" stroke="#C0392B" stroke-width="2" fill="none"/>
  `}
  
  <!-- Hat -->
  ${hasHat ? `
  <ellipse cx="50" cy="18" rx="35" ry="8" fill="${hatColor}"/>
  <path d="M25 18 Q25 5 50 3 Q75 5 75 18" fill="${hatColor}"/>
  ` : ''}
  
  <!-- Character Number -->
  <circle cx="85" cy="15" r="12" fill="white" opacity="0.9"/>
  <text x="85" y="20" text-anchor="middle" font-family="Arial Black" font-size="14" fill="#333">${id}</text>
</svg>`;

  return svg;
}

const characters = [];

// Generate 24 diverse characters
const combinations = [
  { gender: 'male', skinTone: SKIN_TONES[0], hairColor: HAIR_COLORS[2], hasGlasses: false, hasHat: false, hasBeard: false, hasMustache: false, hasEarrings: false },
  { gender: 'male', skinTone: SKIN_TONES[2], hairColor: HAIR_COLORS[0], hasGlasses: true, glassesStyle: GLASSES_STYLES[1], hasHat: true, hasBeard: true, hasMustache: false, hasEarrings: false },
  { gender: 'male', skinTone: SKIN_TONES[1], hairColor: HAIR_COLORS[1], hasGlasses: false, hasHat: false, hasBeard: true, hasMustache: true, hasEarrings: false },
  { gender: 'male', skinTone: SKIN_TONES[3], hairColor: HAIR_COLORS[3], hasGlasses: false, hasHat: true, hasBeard: false, hasMustache: false, hasEarrings: false },
  { gender: 'male', skinTone: SKIN_TONES[4], hairColor: HAIR_COLORS[4], hasGlasses: true, glassesStyle: GLASSES_STYLES[2], hasHat: false, hasBeard: false, hasMustache: false, hasEarrings: false },
  { gender: 'male', skinTone: SKIN_TONES[0], hairColor: HAIR_COLORS[1], hasGlasses: false, hasHat: true, hasBeard: true, hasMustache: true, hasEarrings: false },
  { gender: 'male', skinTone: SKIN_TONES[1], hairColor: HAIR_COLORS[2], hasGlasses: true, glassesStyle: GLASSES_STYLES[1], hasHat: false, hasBeard: false, hasMustache: false, hasEarrings: false },
  { gender: 'male', skinTone: SKIN_TONES[2], hairColor: HAIR_COLORS[0], hasGlasses: false, hasHat: true, hasBeard: true, hasMustache: true, hasEarrings: false },
  { gender: 'male', skinTone: SKIN_TONES[3], hairColor: HAIR_COLORS[4], hasGlasses: true, glassesStyle: GLASSES_STYLES[3], hasHat: false, hasBeard: false, hasMustache: false, hasEarrings: false },
  { gender: 'male', skinTone: SKIN_TONES[4], hairColor: HAIR_COLORS[1], hasGlasses: false, hasHat: false, hasBeard: false, hasMustache: false, hasEarrings: false },
  { gender: 'male', skinTone: SKIN_TONES[0], hairColor: HAIR_COLORS[3], hasGlasses: true, glassesStyle: GLASSES_STYLES[1], hasHat: true, hasBeard: true, hasMustache: false, hasEarrings: false },
  { gender: 'male', skinTone: SKIN_TONES[1], hairColor: HAIR_COLORS[2], hasGlasses: false, hasHat: false, hasBeard: true, hasMustache: true, hasEarrings: false },
  { gender: 'female', skinTone: SKIN_TONES[0], hairColor: HAIR_COLORS[2], hasGlasses: true, glassesStyle: GLASSES_STYLES[1], hasHat: false, hasBeard: false, hasMustache: false, hasEarrings: true },
  { gender: 'female', skinTone: SKIN_TONES[1], hairColor: HAIR_COLORS[0], hasGlasses: false, hasHat: false, hasBeard: false, hasMustache: false, hasEarrings: false },
  { gender: 'female', skinTone: SKIN_TONES[2], hairColor: HAIR_COLORS[3], hasGlasses: true, glassesStyle: GLASSES_STYLES[2], hasHat: false, hasBeard: false, hasMustache: false, hasEarrings: true },
  { gender: 'female', skinTone: SKIN_TONES[3], hairColor: HAIR_COLORS[4], hasGlasses: true, glassesStyle: GLASSES_STYLES[1], hasHat: true, hasBeard: false, hasMustache: false, hasEarrings: true },
  { gender: 'female', skinTone: SKIN_TONES[4], hairColor: HAIR_COLORS[1], hasGlasses: false, hasHat: true, hasBeard: false, hasMustache: false, hasEarrings: false },
  { gender: 'female', skinTone: SKIN_TONES[0], hairColor: HAIR_COLORS[2], hasGlasses: false, hasHat: false, hasBeard: false, hasMustache: false, hasEarrings: true },
  { gender: 'female', skinTone: SKIN_TONES[1], hairColor: HAIR_COLORS[0], hasGlasses: true, glassesStyle: GLASSES_STYLES[3], hasHat: true, hasBeard: false, hasMustache: false, hasEarrings: false },
  { gender: 'female', skinTone: SKIN_TONES[2], hairColor: HAIR_COLORS[1], hasGlasses: false, hasHat: false, hasBeard: false, hasMustache: false, hasEarrings: true },
  { gender: 'female', skinTone: SKIN_TONES[3], hairColor: HAIR_COLORS[2], hasGlasses: true, glassesStyle: GLASSES_STYLES[1], hasHat: true, hasBeard: false, hasMustache: false, hasEarrings: true },
  { gender: 'female', skinTone: SKIN_TONES[4], hairColor: HAIR_COLORS[0], hasGlasses: false, hasHat: false, hasBeard: false, hasMustache: false, hasEarrings: false },
  { gender: 'female', skinTone: SKIN_TONES[0], hairColor: HAIR_COLORS[3], hasGlasses: true, glassesStyle: GLASSES_STYLES[2], hasHat: true, hasBeard: false, hasMustache: false, hasEarrings: true },
  { gender: 'female', skinTone: SKIN_TONES[1], hairColor: HAIR_COLORS[4], hasGlasses: false, hasHat: false, hasBeard: false, hasMustache: false, hasEarrings: true },
];

const outputDir = path.join(__dirname, '../public/images/characters');

for (let i = 0; i < 24; i++) {
  const id = i + 1;
  const svg = generateCharacterSVG(id, combinations[i]);
  const filename = `character-${id}.svg`;
  fs.writeFileSync(path.join(outputDir, filename), svg);
  console.log(`Generated: ${filename}`);
  
  characters.push({
    id,
    name: `Personaggio ${id}`,
    image: `/images/characters/${filename}`,
    ...combinations[i]
  });
}

console.log(`\nGenerated ${characters.length} character SVGs!`);

fs.writeFileSync(
  path.join(outputDir, 'characters.json'),
  JSON.stringify(characters, null, 2)
);
console.log('Saved characters.json');

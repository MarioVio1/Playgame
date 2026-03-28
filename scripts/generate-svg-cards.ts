#!/usr/bin/env bun
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = './public/cards';

interface CardDesign {
  id: string;
  category: string;
  number: number;
  description: string;
  icon: string;
}

const SETUP_CARDS: CardDesign[] = [
  { id: 'setup-21', category: 'setup', number: 21, description: 'Phone in bed', icon: '📱' },
  { id: 'setup-22', category: 'setup', number: 22, description: 'Pharmacy counter', icon: '💊' },
  { id: 'setup-23', category: 'setup', number: 23, description: 'Dinner argument', icon: '🍽️' },
  { id: 'setup-24', category: 'setup', number: 24, description: 'Bike lesson', icon: '🚴' },
  { id: 'setup-25', category: 'setup', number: 25, description: 'Office meeting', icon: '📊' },
  { id: 'setup-26', category: 'setup', number: 26, description: 'Airport delay', icon: '✈️' },
  { id: 'setup-27', category: 'setup', number: 27, description: 'Restaurant shock', icon: '🍝' },
  { id: 'setup-28', category: 'setup', number: 28, description: 'DMV counter', icon: '📋' },
  { id: 'setup-29', category: 'setup', number: 29, description: 'Dating profile', icon: '💕' },
  { id: 'setup-30', category: 'setup', number: 30, description: 'Kid caught', icon: '😱' },
];

const PUNCH_CARDS: CardDesign[] = [
  { id: 'punch-21', category: 'punch', number: 21, description: 'Escape window', icon: '🪟' },
  { id: 'punch-22', category: 'punch', number: 22, description: 'Skeleton costume', icon: '💀' },
  { id: 'punch-23', category: 'punch', number: 23, description: 'Yes dear', icon: '📞' },
  { id: 'punch-24', category: 'punch', number: 24, description: 'Bad report', icon: '📉' },
  { id: 'punch-25', category: 'punch', number: 25, description: 'Upside graph', icon: '📈' },
  { id: 'punch-26', category: 'punch', number: 26, description: 'Airport run', icon: '🏃' },
  { id: 'punch-27', category: 'punch', number: 27, description: 'Bill shock', icon: '💸' },
  { id: 'punch-28', category: 'punch', number: 28, description: 'DMV wait', icon: '😴' },
  { id: 'punch-29', category: 'punch', number: 29, description: 'Profile fail', icon: '📸' },
  { id: 'punch-30', category: 'punch', number: 30, description: 'Phone shame', icon: '🤦' },
];

const ABSURD_CARDS: CardDesign[] = [
  { id: 'absurd-11', category: 'absurd', number: 11, description: 'Lava milk', icon: '🌋' },
  { id: 'absurd-12', category: 'absurd', number: 12, description: 'Mirror world', icon: '🪞' },
  { id: 'absurd-13', category: 'absurd', number: 13, description: 'Dino commute', icon: '🦖' },
  { id: 'absurd-14', category: 'absurd', number: 14, description: 'Dog worker', icon: '🐕' },
  { id: 'absurd-15', category: 'absurd', number: 15, description: 'Universe fridge', icon: '🧊' },
  { id: 'absurd-16', category: 'absurd', number: 16, description: 'Cloud charger', icon: '☁️' },
  { id: 'absurd-17', category: 'absurd', number: 17, description: 'Dino traffic', icon: '🚗' },
  { id: 'absurd-18', category: 'absurd', number: 18, description: 'Mermaid office', icon: '🧜' },
  { id: 'absurd-19', category: 'absurd', number: 19, description: 'Giant step', icon: '🦶' },
  { id: 'absurd-20', category: 'absurd', number: 20, description: 'Gravity flip', icon: '🔄' },
];

const PREMIUM_CARDS: CardDesign[] = [
  { id: 'premium-1', category: 'premium', number: 1, description: 'Colonoscopy selfie', icon: '😷' },
  { id: 'premium-2', category: 'premium', number: 2, description: 'Empty will', icon: '📜' },
  { id: 'premium-3', category: 'premium', number: 3, description: 'Baby shower', icon: '👶' },
  { id: 'premium-4', category: 'premium', number: 4, description: 'Corpse order', icon: '📞' },
  { id: 'premium-5', category: 'premium', number: 5, description: 'Pilot phone', icon: '✈️' },
  { id: 'premium-6', category: 'premium', number: 6, description: 'Surgery escape', icon: '🏥' },
  { id: 'premium-7', category: 'premium', number: 7, description: 'Kid play', icon: '🎭' },
  { id: 'premium-8', category: 'premium', number: 8, description: 'Emoji billing', icon: '💰' },
  { id: 'premium-9', category: 'premium', number: 9, description: 'AI replacement', icon: '🤖' },
  { id: 'premium-10', category: 'premium', number: 10, description: 'Boomerang kid', icon: '🏠' },
  { id: 'premium-11', category: 'premium', number: 11, description: 'Empty plate', icon: '🍽️' },
  { id: 'premium-12', category: 'premium', number: 12, description: 'More diseases', icon: '💊' },
  { id: 'premium-13', category: 'premium', number: 13, description: 'Both guilty', icon: '⚖️' },
  { id: 'premium-14', category: 'premium', number: 14, description: 'Life coach fail', icon: '🎯' },
  { id: 'premium-15', category: 'premium', number: 15, description: 'Content creator', icon: '📹' },
  { id: 'premium-16', category: 'premium', number: 16, description: 'Emoji layoff', icon: '📱' },
  { id: 'premium-17', category: 'premium', number: 17, description: 'Faint check', icon: '💳' },
  { id: 'premium-18', category: 'premium', number: 18, description: 'Grandma viral', icon: '📱' },
  { id: 'premium-19', category: 'premium', number: 19, description: 'Self checkout', icon: '🛒' },
  { id: 'premium-20', category: 'premium', number: 20, description: 'Space slave', icon: '🚀' },
];

function generateComicCardSVG(card: CardDesign, colors: string[]): string {
  const bgColor = colors[0];
  const accentColor = colors[1];
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560" width="400" height="560">
  <defs>
    <linearGradient id="cardGrad-${card.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${accentColor};stop-opacity:1" />
    </linearGradient>
    <filter id="shadow-${card.id}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.3"/>
    </filter>
    <filter id="glow-${card.id}">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Card Background -->
  <rect x="10" y="10" width="380" height="540" rx="20" fill="white" filter="url(#shadow-${card.id})"/>
  <rect x="15" y="15" width="370" height="530" rx="18" fill="url(#cardGrad-${card.id})"/>
  
  <!-- Decorative Border -->
  <rect x="25" y="25" width="350" height="510" rx="14" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-dasharray="8,4"/>
  
  <!-- Comic Panel Frame -->
  <rect x="40" y="60" width="320" height="320" rx="8" fill="white" filter="url(#shadow-${card.id})"/>
  <rect x="45" y="65" width="310" height="310" rx="6" fill="#1a1a2e"/>
  
  <!-- Scene Content -->
  <text x="200" y="180" font-family="Arial Black, sans-serif" font-size="80" text-anchor="middle" fill="white" filter="url(#glow-${card.id})">${card.icon}</text>
  <text x="200" y="280" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="rgba(255,255,255,0.8)">${card.description}</text>
  
  <!-- Corner Decorations -->
  <circle cx="60" cy="85" r="15" fill="${accentColor}" opacity="0.8"/>
  <circle cx="340" cy="85" r="15" fill="${accentColor}" opacity="0.8"/>
  <circle cx="60" cy="365" r="15" fill="${accentColor}" opacity="0.8"/>
  <circle cx="340" cy="365" r="15" fill="${accentColor}" opacity="0.8"/>
  
  <!-- Card Number Badge -->
  <circle cx="200" cy="420" r="35" fill="white" filter="url(#shadow-${card.id})"/>
  <circle cx="200" cy="420" r="30" fill="url(#cardGrad-${card.id})"/>
  <text x="200" y="428" font-family="Arial Black, sans-serif" font-size="24" text-anchor="middle" fill="white">${card.number}</text>
  
  <!-- Bottom Label -->
  <rect x="100" y="480" width="200" height="40" rx="20" fill="white" opacity="0.9"/>
  <text x="200" y="506" font-family="Arial Black, sans-serif" font-size="14" text-anchor="middle" fill="${bgColor}">JOKING HAZARD</text>
  
  <!-- Category Label -->
  <text x="200" y="540" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="rgba(255,255,255,0.6)" text-transform="uppercase">${card.category}</text>
</svg>`;
}

const COLOR_SCHEMES = [
  ['#8b5cf6', '#6d28d9'], // Purple
  ['#ec4899', '#db2777'], // Pink
  ['#f59e0b', '#d97706'], // Amber
  ['#10b981', '#059669'], // Emerald
  ['#3b82f6', '#2563eb'], // Blue
  ['#ef4444', '#dc2626'], // Red
  ['#06b6d4', '#0891b2'], // Cyan
  ['#f97316', '#ea580c'], // Orange
];

function ensureDirectories() {
  const categories = ['setup', 'punch', 'absurd', 'premium'];
  for (const cat of categories) {
    const dir = path.join(OUTPUT_DIR, cat);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

function generateAllCards() {
  ensureDirectories();
  
  console.log('🎴 SVG Card Generator - Playgame Premium Collection');
  console.log('='.repeat(50));
  
  let count = 0;
  
  // Generate Setup Cards
  console.log('\n📦 Generating Setup Cards...');
  for (let i = 0; i < SETUP_CARDS.length; i++) {
    const card = SETUP_CARDS[i];
    const colors = COLOR_SCHEMES[i % COLOR_SCHEMES.length];
    const svg = generateComicCardSVG(card, colors);
    const outputPath = path.join(OUTPUT_DIR, card.category, `${card.id}.svg`);
    fs.writeFileSync(outputPath, svg);
    console.log(`✅ Generated ${card.id}.svg`);
    count++;
  }
  
  // Generate Punch Cards
  console.log('\n📦 Generating Punch Cards...');
  for (let i = 0; i < PUNCH_CARDS.length; i++) {
    const card = PUNCH_CARDS[i];
    const colors = COLOR_SCHEMES[(i + 2) % COLOR_SCHEMES.length];
    const svg = generateComicCardSVG(card, colors);
    const outputPath = path.join(OUTPUT_DIR, card.category, `${card.id}.svg`);
    fs.writeFileSync(outputPath, svg);
    console.log(`✅ Generated ${card.id}.svg`);
    count++;
  }
  
  // Generate Absurd Cards
  console.log('\n📦 Generating Absurd Cards...');
  for (let i = 0; i < ABSURD_CARDS.length; i++) {
    const card = ABSURD_CARDS[i];
    const colors = COLOR_SCHEMES[(i + 4) % COLOR_SCHEMES.length];
    const svg = generateComicCardSVG(card, colors);
    const outputPath = path.join(OUTPUT_DIR, card.category, `${card.id}.svg`);
    fs.writeFileSync(outputPath, svg);
    console.log(`✅ Generated ${card.id}.svg`);
    count++;
  }
  
  // Generate Premium Cards
  console.log('\n📦 Generating Premium Cards...');
  for (let i = 0; i < PREMIUM_CARDS.length; i++) {
    const card = PREMIUM_CARDS[i];
    const colors = COLOR_SCHEMES[i % COLOR_SCHEMES.length];
    const svg = generateComicCardSVG(card, colors);
    const outputPath = path.join(OUTPUT_DIR, card.category, `${card.id}.svg`);
    fs.writeFileSync(outputPath, svg);
    console.log(`✅ Generated ${card.id}.svg`);
    count++;
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`🎉 Generated ${count} SVG cards!`);
  console.log(`📁 Saved to: ${OUTPUT_DIR}`);
}

generateAllCards();

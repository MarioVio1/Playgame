#!/usr/bin/env bun
import { $ } from 'bun'
import fs from 'fs'
import path from 'path'

const OUTPUT_DIR = './public/cards'
const SIZE = '1024x1024'

interface CardPrompt {
  id: string
  prompt: string
  category: string
}

const CARD_PROMPTS: CardPrompt[] = [
  // JOKING HAZARD - Setup Cards (dark humor comic panels)
  { id: 'setup-21', prompt: 'Professional comic panel, stick figure man looking at phone in bed, wife sleeping next to him, dark bedroom, funny caption space, flat cartoon style', category: 'setup' },
  { id: 'setup-22', prompt: 'Comic panel scene, stick figure at pharmacy counter looking nervous, pharmacist judging, modern setting, flat cartoon style', category: 'setup' },
  { id: 'setup-23', prompt: 'Stick figure couple arguing at dinner table, one pointing at phone, empty plates, awkward atmosphere, comic panel', category: 'setup' },
  { id: 'setup-24', prompt: 'Stick figure dad teaching son to ride bike, son fallen, dad laughing, suburban street, comic panel style', category: 'setup' },
  { id: 'setup-25', prompt: 'Office meeting room, stick figures in suits, one presenting graph going down, bored expressions, comic panel', category: 'setup' },
  { id: 'setup-26', prompt: 'Stick figure at airport gate looking at phone, flight delayed sign, frustrated expression, comic panel', category: 'setup' },
  { id: 'setup-27', prompt: 'Stick figure millennial at restaurant, looking at menu prices shocked, date opposite, comic panel style', category: 'setup' },
  { id: 'setup-28', prompt: 'Stick figure at DMV counter, huge line behind, employee unhelpful, boring office, comic panel', category: 'setup' },
  { id: 'setup-29', prompt: 'Stick figure on dating app profile, mirror reflection showing messy room, comic panel style', category: 'setup' },
  { id: 'setup-30', prompt: 'Stick figure parent finding child doing something embarrassing, shocked face, living room, comic panel', category: 'setup' },

  // JOKING HAZARD - Punchline Cards
  { id: 'punch-21', prompt: 'Comic panel punchline, stick figure escaping through window, spouse still sleeping, cartoon style', category: 'punch' },
  { id: 'punch-22', prompt: 'Stick figure holding prescription bottle, pharmacist with skeleton costume behind, funny moment, comic panel', category: 'punch' },
  { id: 'punch-23', prompt: 'Stick figure on phone saying yes dear, wife with bat behind, comic panel punchline', category: 'punch' },
  { id: 'punch-24', prompt: 'Kid proud showing bad report card, dad facepalming, mom face in hands, comic panel', category: 'punch' },
  { id: 'punch-25', prompt: 'Employee presenting upside down graph, boss nodding seriously, comic panel punchline', category: 'punch' },
  { id: 'punch-26', prompt: 'Stick figure running through airport in underwear, flight attendant pointing, comic panel', category: 'punch' },
  { id: 'punch-27', prompt: 'Millennial leaving restaurant running, waiter chasing with bill, comic panel style', category: 'punch' },
  { id: 'punch-28', prompt: 'Stick figure at DMV finally called number, fell asleep at desk, comic panel punchline', category: 'punch' },
  { id: 'punch-29', prompt: 'Dating profile pic revealed, person in background doing something embarrassing, comic panel', category: 'punch' },
  { id: 'punch-30', prompt: 'Kid showing parent something on phone, parents regret looking, shocked expressions, comic panel', category: 'punch' },

  // ABSURD Cards
  { id: 'absurd-11', prompt: 'Surreal comic panel, stick figure eating cereal, milk is lava, volcano on table, absurd cartoon', category: 'absurd' },
  { id: 'absurd-12', prompt: 'Stick figure shaking hands with themselves, mirror world, absurd scene, comic panel style', category: 'absurd' },
  { id: 'absurd-13', prompt: 'Stick figure riding dinosaur to work, city background, commuters shocked, absurd comic panel', category: 'absurd' },
  { id: 'absurd-14', prompt: 'Dog at computer working, stick figure sleeping at desk, office swap, comic panel style', category: 'absurd' },
  { id: 'absurd-15', prompt: 'Stick figure opening fridge, tiny universe inside, cosmic refrigerator, comic panel', category: 'absurd' },
  { id: 'absurd-16', prompt: 'Phone charger plugged into cloud, stick figure confused, electric sky, absurd comic panel', category: 'absurd' },
  { id: 'absurd-17', prompt: 'Stick figure time traveler stuck in traffic, dinosaurs honking, absurd comic panel', category: 'absurd' },
  { id: 'absurd-18', prompt: 'Mermaid at desk job, fish bowl aquarium office, stick figure working, comic panel', category: 'absurd' },
  { id: 'absurd-19', prompt: 'Giant stick figure stepping on tiny people having picnic, park setting, absurd comic', category: 'absurd' },
  { id: 'absurd-20', prompt: 'Stick figure in inverse gravity room, furniture on ceiling, confused expression, comic panel', category: 'absurd' },

  // PREMIUM COLLECTION - Dark Humor
  { id: 'premium-1', prompt: 'Professional comic panel, stick figure getting colonoscopy, doctor taking selfie, hospital, cartoon style', category: 'premium' },
  { id: 'premium-2', prompt: 'Stick figure at wills reading, lawyer holding empty paper, family shocked, comic panel', category: 'premium' },
  { id: 'premium-3', prompt: 'Stick figure couple at baby shower, one hiding alcohol in baby bottle, comic panel', category: 'premium' },
  { id: 'premium-4', prompt: 'Funeral director on phone taking order, stick figure in coffin, customer service mode, comic panel', category: 'premium' },
  { id: 'premium-5', prompt: 'Stick figure pilot looking at smartphone instead of instruments, plane diving, comic panel', category: 'premium' },
  { id: 'premium-6', prompt: 'Surgeon leaving during operation, nurse panicking, patient making peace sign, comic panel', category: 'premium' },
  { id: 'premium-7', prompt: 'Stick figure parents at kids play, both on phones, kid embarrassed on stage, comic panel', category: 'premium' },
  { id: 'premium-8', prompt: 'Therapist charging by emoji sent, patient confused, bill shown, comic panel style', category: 'premium' },
  { id: 'premium-9', prompt: 'AI robot replacing stick figure at job, HR robot greeting, office scene, comic panel', category: 'premium' },
  { id: 'premium-10', prompt: 'Stick figure millennial living in parents basement, moving back in again, comic panel', category: 'premium' },
]

// Additional premium cards for variety
const PREMIUM_CARDS_2: CardPrompt[] = [
  { id: 'premium-11', prompt: 'Stick figure chef presenting empty plate, restaurant full, customers starving, comic panel', category: 'premium' },
  { id: 'premium-12', prompt: 'Doctor prescribing more diseases, pharmacist filling prescription bags, comic panel', category: 'premium' },
  { id: 'premium-13', prompt: 'Judge presiding over trial, stick figures both guilty, comic panel courtroom style', category: 'premium' },
  { id: 'premium-14', prompt: 'Life coach with terrible life, messy room, bad haircut, giving advice, comic panel', category: 'premium' },
  { id: 'premium-15', prompt: 'Influencer filming tragedy for content, real responders saving people, comic panel', category: 'premium' },
  { id: 'premium-16', prompt: 'HR doing layoffs via emoji text, stick figure receiving message, office drama, comic panel', category: 'premium' },
  { id: 'premium-17', prompt: 'Waiter presenting check, stick figure fainting, fancy restaurant, comic panel style', category: 'premium' },
  { id: 'premium-18', prompt: 'Grandma on social media going viral for wrong reasons, family mortified, comic panel', category: 'premium' },
  { id: 'premium-19', prompt: 'Stick figure at self checkout, unexpected item in bagging area, tech frustrating, comic panel', category: 'premium' },
  { id: 'premium-20', prompt: 'Astronaut stuck in space station, all crew sleeping, one doing all work, comic panel', category: 'premium' },
]

// UNO Cards - Colorful professional style
const UNO_CARDS = [
  { id: 'uno-red-0', color: '#ef4444' },
  { id: 'uno-red-1', color: '#ef4444' },
  { id: 'uno-red-2', color: '#ef4444' },
  { id: 'uno-red-5', color: '#ef4444' },
  { id: 'uno-blue-0', color: '#3b82f6' },
  { id: 'uno-blue-1', color: '#3b82f6' },
  { id: 'uno-blue-2', color: '#3b82f6' },
  { id: 'uno-blue-5', color: '#3b82f6' },
  { id: 'uno-green-0', color: '#22c55e' },
  { id: 'uno-green-1', color: '#22c55e' },
  { id: 'uno-green-2', color: '#22c55e' },
  { id: 'uno-green-5', color: '#22c55e' },
  { id: 'uno-yellow-0', color: '#eab308' },
  { id: 'uno-yellow-1', color: '#eab308' },
  { id: 'uno-yellow-2', color: '#eab308' },
  { id: 'uno-yellow-5', color: '#eab308' },
  { id: 'uno-draw4', color: '#000000' },
  { id: 'uno-wild', color: '#000000' },
]

const BRISCOLA_CARDS = [
  { suit: 'coppe', name: 'Asso', value: 'A' },
  { suit: 'coppe', name: 'Due', value: '2' },
  { suit: 'coppe', name: 'Tre', value: '3' },
  { suit: 'coppe', name: 'Re', value: 'K' },
  { suit: 'denari', name: 'Asso', value: 'A' },
  { suit: 'denari', name: 'Due', value: '2' },
  { suit: 'denari', name: 'Tre', value: '3' },
  { suit: 'denari', name: 'Re', value: 'K' },
  { suit: 'bastoni', name: 'Asso', value: 'A' },
  { suit: 'bastoni', name: 'Due', value: '2' },
  { suit: 'bastoni', name: 'Tre', value: '3' },
  { suit: 'bastoni', name: 'Re', value: 'K' },
  { suit: 'spade', name: 'Asso', value: 'A' },
  { suit: 'spade', name: 'Due', value: '2' },
  { suit: 'spade', name: 'Tre', value: '3' },
  { suit: 'spade', name: 'Re', value: 'K' },
]

async function generateComicCardImage(id: string, prompt: string, category: string): Promise<boolean> {
  const outputPath = path.join(OUTPUT_DIR, category, `${id}.png`)
  
  if (fs.existsSync(outputPath)) {
    console.log(`⏭️  Skipping ${id} - already exists`)
    return true
  }
  
  try {
    console.log(`🎨 Generating ${id}...`)
    
    const fullPrompt = `${prompt}, professional comic panel style, clean line art, flat colors, high contrast, funny expressions, panel border`
    
    const result = await $`z-ai image -p "${fullPrompt}" -o "${outputPath}" -s ${SIZE}`.quiet()
    
    if (result.exitCode === 0) {
      console.log(`✅ Generated ${id}`)
      return true
    } else {
      console.error(`❌ Failed to generate ${id}`)
      return false
    }
  } catch (error) {
    console.error(`❌ Error generating ${id}:`, error)
    return false
  }
}

async function generatePremiumCard(id: string, color: string): Promise<boolean> {
  const outputPath = path.join(OUTPUT_DIR, 'premium', `${id}.png`)
  
  if (fs.existsSync(outputPath)) {
    console.log(`⏭️  Skipping ${id} - already exists`)
    return true
  }
  
  try {
    console.log(`🎨 Generating premium card ${id}...`)
    
    const result = await $`z-ai image -p "Professional playing card design, holographic foil effect, ${color} color theme, geometric pattern, luxury casino style, glowing edges, modern card art" -o "${outputPath}" -s ${SIZE}`.quiet()
    
    if (result.exitCode === 0) {
      console.log(`✅ Generated ${id}`)
      return true
    }
    return false
  } catch (error) {
    console.error(`❌ Error generating ${id}:`, error)
    return false
  }
}

async function generateItalianCard(id: string, suit: string, value: string): Promise<boolean> {
  const outputPath = path.join(OUTPUT_DIR, 'italian', `${id}.png`)
  
  if (fs.existsSync(outputPath)) {
    console.log(`⏭️  Skipping ${id} - already exists`)
    return true
  }
  
  try {
    console.log(`🎨 Generating Italian card ${id}...`)
    
    const suitEmoji = suit === 'coppe' ? '🏆' : suit === 'denari' ? '💎' : suit === 'bastoni' ? '🌿' : '⚔️'
    const suitColor = suit === 'coppe' || suit === 'denari' ? 'red' : 'black'
    const colorHex = suitColor === 'red' ? '#dc2626' : '#1f2937'
    
    const result = await $`z-ai image -p "Professional Italian playing card, ${suit} suit, number ${value}, classic Italian card design, ornate border, vintage casino style, ${colorHex} and gold colors, premium card texture" -o "${outputPath}" -s ${SIZE}`.quiet()
    
    if (result.exitCode === 0) {
      console.log(`✅ Generated ${id}`)
      return true
    }
    return false
  } catch (error) {
    console.error(`❌ Error generating ${id}:`, error)
    return false
  }
}

async function generateAllCards() {
  const categories = ['setup', 'punch', 'absurd', 'premium', 'italian']
  
  for (const cat of categories) {
    fs.mkdirSync(path.join(OUTPUT_DIR, cat), { recursive: true })
  }
  
  console.log('🎴 AI Card Generator - Playgame Premium Collection')
  console.log('='.repeat(50))
  console.log('')

  let successCount = 0
  let failCount = 0

  // Generate Joking Hazard cards
  console.log('\n📦 Generating Joking Hazard cards...')
  const allComicCards = [...CARD_PROMPTS, ...PREMIUM_CARDS_2]
  
  for (let i = 0; i < allComicCards.length; i++) {
    const card = allComicCards[i]
    const success = await generateComicCardImage(card.id, card.prompt, card.category)
    if (success) { successCount++ } else { failCount++ }
    if (i < allComicCards.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  // Generate UNO cards
  console.log('\n📦 Generating UNO cards...')
  for (const card of UNO_CARDS) {
    const success = await generatePremiumCard(card.id, card.color)
    if (success) { successCount++ } else { failCount++ }
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // Generate Italian cards
  console.log('\n📦 Generating Italian cards (Briscola/Scopa)...')
  for (const card of BRISCOLA_CARDS) {
    const id = `${card.suit}-${card.value.toLowerCase()}`
    const success = await generateItalianCard(id, card.suit, card.value)
    if (success) { successCount++ } else { failCount++ }
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log('\n' + '='.repeat(50))
  console.log(`🎉 Generation complete!`)
  console.log(`✅ Success: ${successCount}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log(`📁 Cards saved to: ${OUTPUT_DIR}`)
}

generateAllCards().catch(console.error)

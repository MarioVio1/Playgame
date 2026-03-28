#!/usr/bin/env bun
import { $ } from 'bun'
import fs from 'fs'
import path from 'path'

// Card prompts for generation - simplified stick figure cartoon style
const CARD_PROMPTS = [
  // Setup cards (20)
  { id: 'setup-1', prompt: 'Simple black and white stick figure cartoon, funeral scene with coffin, sad characters in black clothes, comic panel style, minimalist' },
  { id: 'setup-2', prompt: 'Simple cartoon doctor with clipboard, worried patient, hospital room, stick figure style, comic panel, minimalist black and white' },
  { id: 'setup-3', prompt: 'Stick figure opening door with shocked face, silhouettes in bedroom, dramatic scene, comic panel style, black and white' },
  { id: 'setup-4', prompt: 'Cartoon doctor with ultrasound, pregnant stick figure on exam table, hospital scene, comic panel, minimalist style' },
  { id: 'setup-5', prompt: 'Small stick figure child asking mother, basement door in background, dark hallway, comic panel, black and white' },
  { id: 'setup-6', prompt: 'Two stick figures, one holding missing cat poster, neighborhood background, comic panel style, minimalist' },
  { id: 'setup-7', prompt: 'Patient on therapy couch, therapist with horrified expression taking notes, office scene, comic panel, black and white' },
  { id: 'setup-8', prompt: 'Doctor with grave expression, patient in chair, calendar visible, hospital room, stick figure style, comic panel' },
  { id: 'setup-9', prompt: 'Stick figure holding paper with laugh emoji, pen in hand, dark room, comic panel, minimalist black and white' },
  { id: 'setup-10', prompt: 'Child stick figure pointing at father with stained shirt, nervous father, living room, comic panel style' },
  { id: 'setup-11', prompt: 'Woman stick figure worried, man with suspicious expression, clock in background, comic panel, black and white' },
  { id: 'setup-12', prompt: 'Church confessional booth silhouette, ominous atmosphere, comic panel style, minimalist black and white' },
  { id: 'setup-13', prompt: 'Group of stick figures in circle, hospital gowns, sad expressions, community center, comic panel' },
  { id: 'setup-14', prompt: 'Stick figure pointing at X-ray showing mass, hospital background, comic panel style, black and white' },
  { id: 'setup-15', prompt: 'Doctor with bowed head, parents collapsing, hospital corridor, dramatic scene, comic panel, minimalist' },
  { id: 'setup-16', prompt: 'Elderly stick figure in hospital bed, family gathered, speech bubble, comic panel style, black and white' },
  { id: 'setup-17', prompt: 'Stick figure with evil grin, revenge plan board with photos and red strings, comic panel, black and white' },
  { id: 'setup-18', prompt: 'Car interior, driver looking back, passenger awkward, city lights, comic panel style, minimalist' },
  { id: 'setup-19', prompt: 'Mother with laptop shocked, son panicked, living room, comic panel, black and white' },
  { id: 'setup-20', prompt: 'Two stick figures in serious talk, family photo background, awkward atmosphere, comic panel style' },
  
  // Punchline cards (20)
  { id: 'punch-1', prompt: 'Open coffin with embarrassing scene, funeral guests shocked, comic panel style, black and white stick figures' },
  { id: 'punch-2', prompt: 'Hospital room, doctor and patient inappropriate situation, comic panel, minimalist black and white' },
  { id: 'punch-3', prompt: 'Bedroom scene, lifeguard figure present, angry partner, comic panel style, stick figures' },
  { id: 'punch-4', prompt: 'Angry person demanding money back at counter, store setting, comic panel, black and white' },
  { id: 'punch-5', prompt: 'Figure watching TV inappropriately, comic panel style, minimalist black and white' },
  { id: 'punch-6', prompt: 'Person holding cat paw making purring motion, surreal scene, comic panel, black and white' },
  { id: 'punch-7', prompt: 'Therapist slumped in chair, patient still talking, comic panel style, minimalist' },
  { id: 'punch-8', prompt: 'Christmas scene, figure pointing suggestively, awkward family, comic panel, black and white' },
  { id: 'punch-9', prompt: 'Person holding funny note, audience straight faced, comic panel style, stick figures' },
  { id: 'punch-10', prompt: 'Person covered in ketchup confused, doctor shrugging, comic panel, black and white' },
  { id: 'punch-11', prompt: 'Person with ring and insurance papers smiling, graveyard background, comic panel style' },
  { id: 'punch-12', prompt: 'Figure continuing inappropriate action, other shocked, comic panel, minimalist black and white' },
  { id: 'punch-13', prompt: 'Medical scan labeled CHAD in marker, casual doctor, comic panel style, black and white' },
  { id: 'punch-14', prompt: 'List of rejected names crossed out, person shrugging, comic panel, minimalist' },
  { id: 'punch-15', prompt: 'Person pointing to basement door, shovel visible, ominous, comic panel style, black and white' },
  { id: 'punch-16', prompt: 'Grandfather shrugging in bed, family relieved, comic panel, stick figures' },
  { id: 'punch-17', prompt: 'Person with children and shovel satisfied, backyard, comic panel style, black and white' },
  { id: 'punch-18', prompt: 'Uber driver smiling, passenger shocked, car interior, comic panel, minimalist' },
  { id: 'punch-19', prompt: 'Mother grounding adult child, embarrassed adult, comic panel style, black and white' },
  { id: 'punch-20', prompt: 'Figure embracing stepsister inappropriately, family shocked, comic panel, stick figures' },
  
  // Absurd cards (10)
  { id: 'absurd-1', prompt: 'Cartoon dildo sitting on therapy couch, therapist with notepad, absurd scene, comic panel, black and white' },
  { id: 'absurd-2', prompt: 'Priest, altar boy and goat entering bar, bartender confused, absurd comic panel, black and white' },
  { id: 'absurd-3', prompt: 'Person tasting ashes from urn thoughtfully, surreal scene, comic panel, minimalist' },
  { id: 'absurd-4', prompt: 'Family dinner with talking dildo in chair, everyone normal, absurd comic, black and white' },
  { id: 'absurd-5', prompt: 'Ghost Hitler with smartphone dating app, confused reactions, absurd comic panel' },
  { id: 'absurd-6', prompt: 'Severed hand giving thumbs up in OR, surgeons reacting, absurd comic, black and white' },
  { id: 'absurd-7', prompt: 'Person holding thank you card from fetus, surreal mail, absurd comic panel, minimalist' },
  { id: 'absurd-8', prompt: 'Sad clown at kids party, parents concerned, absurd scene, comic panel, black and white' },
  { id: 'absurd-9', prompt: 'Ouija board with message, people around table, supernatural comedy, comic panel' },
  { id: 'absurd-10', prompt: 'Support group eating salad and human parts, absurd scene, comic panel, black and white' },
]

const OUTPUT_DIR = './public/cards'
const SIZE = '1024x1024'

async function generateCardImage(id: string, prompt: string): Promise<boolean> {
  const [type] = id.split('-')
  const outputPath = path.join(OUTPUT_DIR, type, `${id}.png`)
  
  // Skip if already exists
  if (fs.existsSync(outputPath)) {
    console.log(`⏭️  Skipping ${id} - already exists`)
    return true
  }
  
  try {
    console.log(`🎨 Generating ${id}...`)
    
    const result = await $`z-ai image -p "${prompt}, simple cartoon style, stick figures, comic panel, flat colors, minimal detail, funny, expressive faces" -o "${outputPath}" -s ${SIZE}`.quiet()
    
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

async function generateAllCards() {
  // Ensure directories exist
  fs.mkdirSync(path.join(OUTPUT_DIR, 'setup'), { recursive: true })
  fs.mkdirSync(path.join(OUTPUT_DIR, 'punch'), { recursive: true })
  fs.mkdirSync(path.join(OUTPUT_DIR, 'absurd'), { recursive: true })
  
  console.log(`🎴 Generating ${CARD_PROMPTS.length} card images...`)
  console.log(`📐 Size: ${SIZE}`)
  console.log(`📁 Output: ${OUTPUT_DIR}`)
  console.log('')
  
  let successCount = 0
  let failCount = 0
  
  // Generate in batches of 5 to avoid rate limiting
  const BATCH_SIZE = 5
  
  for (let i = 0; i < CARD_PROMPTS.length; i += BATCH_SIZE) {
    const batch = CARD_PROMPTS.slice(i, i + BATCH_SIZE)
    
    console.log(`\n📦 Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(CARD_PROMPTS.length / BATCH_SIZE)}`)
    
    for (const card of batch) {
      const success = await generateCardImage(card.id, card.prompt)
      if (success) {
        successCount++
      } else {
        failCount++
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    // Longer delay between batches
    if (i + BATCH_SIZE < CARD_PROMPTS.length) {
      console.log(`\n⏳ Waiting before next batch...`)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  console.log('\n' + '='.repeat(50))
  console.log(`🎉 Generation complete!`)
  console.log(`✅ Success: ${successCount}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log(`📁 Cards saved to: ${OUTPUT_DIR}`)
}

// Run the generator
generateAllCards().catch(console.error)

#!/usr/bin/env bun
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = './public/cards';

interface CardPrompt {
  id: string;
  prompt: string;
  category: string;
}

const CARD_PROMPTS: CardPrompt[] = [
  // JOKING HAZARD - Setup Cards
  { id: 'setup-21', prompt: 'Comic panel, stick figure man looking at phone in bed, wife sleeping, dark bedroom, flat cartoon style', category: 'setup' },
  { id: 'setup-22', prompt: 'Comic panel, stick figure at pharmacy counter looking nervous, pharmacist judging, flat cartoon', category: 'setup' },
  { id: 'setup-23', prompt: 'Stick figure couple arguing at dinner table, one pointing at phone, empty plates, flat cartoon', category: 'setup' },
  { id: 'setup-24', prompt: 'Stick figure dad teaching son to ride bike, son fallen, dad laughing, suburban street, comic panel', category: 'setup' },
  { id: 'setup-25', prompt: 'Office meeting room, stick figures in suits, one presenting graph going down, bored expressions, comic panel', category: 'setup' },
  { id: 'setup-26', prompt: 'Stick figure at airport gate looking at phone, flight delayed sign, frustrated expression, comic panel', category: 'setup' },
  { id: 'setup-27', prompt: 'Stick figure millennial at restaurant, looking at menu prices shocked, date opposite, comic panel style', category: 'setup' },
  { id: 'setup-28', prompt: 'Stick figure at DMV counter, huge line behind, employee unhelpful, boring office, comic panel', category: 'setup' },
  { id: 'setup-29', prompt: 'Stick figure on dating app profile, mirror reflection showing messy room, comic panel style', category: 'setup' },
  { id: 'setup-30', prompt: 'Stick figure parent finding child doing something embarrassing, shocked face, living room, comic panel', category: 'setup' },

  // JOKING HAZARD - Punchline Cards
  { id: 'punch-21', prompt: 'Comic panel punchline, stick figure escaping through window, spouse still sleeping, flat cartoon style', category: 'punch' },
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
  { id: 'premium-1', prompt: 'Comic panel, stick figure getting colonoscopy, doctor taking selfie, hospital, flat cartoon style', category: 'premium' },
  { id: 'premium-2', prompt: 'Stick figure at wills reading, lawyer holding empty paper, family shocked, comic panel', category: 'premium' },
  { id: 'premium-3', prompt: 'Stick figure couple at baby shower, one hiding alcohol in baby bottle, comic panel', category: 'premium' },
  { id: 'premium-4', prompt: 'Funeral director on phone taking order, stick figure in coffin, customer service mode, comic panel', category: 'premium' },
  { id: 'premium-5', prompt: 'Stick figure pilot looking at smartphone instead of instruments, plane diving, comic panel', category: 'premium' },
  { id: 'premium-6', prompt: 'Surgeon leaving during operation, nurse panicking, patient making peace sign, comic panel', category: 'premium' },
  { id: 'premium-7', prompt: 'Stick figure parents at kids play, both on phones, kid embarrassed on stage, comic panel', category: 'premium' },
  { id: 'premium-8', prompt: 'Therapist charging by emoji sent, patient confused, bill shown, comic panel style', category: 'premium' },
  { id: 'premium-9', prompt: 'AI robot replacing stick figure at job, HR robot greeting, office scene, comic panel', category: 'premium' },
  { id: 'premium-10', prompt: 'Stick figure millennial living in parents basement, moving back in again, comic panel', category: 'premium' },
  { id: 'premium-11', prompt: 'Stick figure chef presenting empty plate, restaurant full, customers starving, comic panel', category: 'premium' },
  { id: 'premium-12', prompt: 'Doctor prescribing more diseases, pharmacist filling prescription bags, comic panel', category: 'premium' },
  { id: 'premium-13', prompt: 'Judge presiding over trial, stick figures both guilty, comic panel courtroom style', category: 'premium' },
  { id: 'premium-14', prompt: 'Life coach with terrible life, messy room, bad haircut, giving advice, comic panel', category: 'premium' },
  { id: 'premium-15', prompt: 'Influencer filming tragedy for content, real responders saving people, comic panel', category: 'premium' },
  { id: 'premium-16', prompt: 'HR doing layoffs via emoji text, stick figure receiving message, office drama, comic panel', category: 'premium' },
  { id: 'premium-17', prompt: 'Waiter presenting check, stick figure fainting, fancy restaurant, comic panel style', category: 'premium' },
  { id: 'premium-18', prompt: 'Grandma on social media going viral for wrong reasons, family mortified, comic panel', category: 'premium' },
  { id: 'premium-19', prompt: 'Stick figure on self checkout, unexpected item in bagging area, tech frustrating, comic panel', category: 'premium' },
  { id: 'premium-20', prompt: 'Astronaut stuck in space station, all crew sleeping, one doing all work, comic panel', category: 'premium' },
];

async function generateCardImage(
  zai: Awaited<ReturnType<typeof ZAI.create>>,
  id: string,
  prompt: string,
  category: string
): Promise<boolean> {
  const outputPath = path.join(OUTPUT_DIR, category, `${id}.png`);

  if (fs.existsSync(outputPath)) {
    console.log(`⏭️  Skipping ${id} - already exists`);
    return true;
  }

  try {
    console.log(`🎨 Generating ${id}...`);

    const fullPrompt = `${prompt}, comic panel style, stick figures, flat colors, high contrast, funny expressions`;

    const result = await zai.images.generate({
      prompt: fullPrompt,
      model: 'flux',
      size: '1024x1024',
    });

    if (result.data && result.data[0]?.url) {
      const imageData = await fetch(result.data[0].url);
      const buffer = await imageData.arrayBuffer();
      fs.writeFileSync(outputPath, Buffer.from(buffer));
      console.log(`✅ Generated ${id}`);
      return true;
    } else if (result.data && result.data[0]?.b64_json) {
      fs.writeFileSync(outputPath, Buffer.from(result.data[0].b64_json, 'base64'));
      console.log(`✅ Generated ${id}`);
      return true;
    }

    console.error(`❌ Failed to generate ${id} - no image data`);
    return false;
  } catch (error) {
    console.error(`❌ Error generating ${id}:`, error);
    return false;
  }
}

async function generateAllCards() {
  const categories = ['setup', 'punch', 'absurd', 'premium'];
  for (const cat of categories) {
    fs.mkdirSync(path.join(OUTPUT_DIR, cat), { recursive: true });
  }

  console.log('🎴 AI Card Generator - Playgame Premium Collection');
  console.log('='.repeat(50));
  console.log('');

  let zai;
  try {
    zai = await ZAI.create();
  } catch (error) {
    console.error('❌ Failed to initialize Z-AI SDK. Please configure .z-ai-config file.');
    console.error('Create a .z-ai-config file with:');
    console.error('{ "baseUrl": "YOUR_API_URL", "apiKey": "YOUR_API_KEY" }');
    process.exit(1);
  }

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < CARD_PROMPTS.length; i++) {
    const card = CARD_PROMPTS[i];
    const success = await generateCardImage(zai, card.id, card.prompt, card.category);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    if (i < CARD_PROMPTS.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`🎉 Generation complete!`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📁 Cards saved to: ${OUTPUT_DIR}`);
}

generateAllCards().catch(console.error);

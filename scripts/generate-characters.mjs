import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Character definitions for Indovina Chi (Guess Who) game
const characters = [
  {
    id: 1,
    name: "Marco",
    prompt: "Realistic portrait photo of an adult Italian man named Marco, approximately 35-40 years old, with short brown hair, full beard, no glasses, no hat, warm friendly expression, neutral background, professional portrait photography style, high quality, photorealistic"
  },
  {
    id: 2,
    name: "Laura",
    prompt: "Realistic portrait photo of an adult Italian woman named Laura, approximately 30-35 years old, with shoulder-length blonde hair, wearing stylish glasses, no hat, warm friendly expression, neutral background, professional portrait photography style, high quality, photorealistic"
  },
  {
    id: 3,
    name: "Giuseppe",
    prompt: "Realistic portrait photo of an elderly Italian man named Giuseppe, approximately 65-70 years old, with white/grey hair, wearing round glasses and a classic hat (fedora or flat cap), full white beard, warm wise expression, neutral background, professional portrait photography style, high quality, photorealistic"
  },
  {
    id: 4,
    name: "Sofia",
    prompt: "Realistic portrait photo of a young Italian girl named Sofia, approximately 8-10 years old, with long black hair, no glasses, no hat, cheerful innocent expression, neutral background, professional portrait photography style, high quality, photorealistic"
  },
  {
    id: 5,
    name: "Antonio",
    prompt: "Realistic portrait photo of an adult Italian man named Antonio, approximately 35-40 years old, with short black hair, full beard, no glasses, no hat, confident friendly expression, neutral background, professional portrait photography style, high quality, photorealistic"
  },
  {
    id: 6,
    name: "Elena",
    prompt: "Realistic portrait photo of an adult Italian woman named Elena, approximately 30-35 years old, with vibrant red hair, wearing elegant glasses, no hat, intelligent friendly expression, neutral background, professional portrait photography style, high quality, photorealistic"
  },
  {
    id: 7,
    name: "Luca",
    prompt: "Realistic portrait photo of a young Italian man named Luca, approximately 20-25 years old, with brown hair, no glasses, wearing a casual baseball cap backwards or beanie, relaxed cool expression, neutral background, professional portrait photography style, high quality, photorealistic"
  },
  {
    id: 8,
    name: "Maria",
    prompt: "Realistic portrait photo of an elderly Italian woman named Maria, approximately 65-70 years old, with white/grey hair, wearing round glasses and a stylish hat (sun hat or beret), kind grandmotherly expression, neutral background, professional portrait photography style, high quality, photorealistic"
  },
  {
    id: 9,
    name: "Pietro",
    prompt: "Realistic portrait photo of an adult Italian man named Pietro, approximately 35-40 years old, with short black hair, clean-shaven no beard, no glasses, no hat, approachable friendly expression, neutral background, professional portrait photography style, high quality, photorealistic"
  },
  {
    id: 10,
    name: "Anna",
    prompt: "Realistic portrait photo of an adult Italian woman named Anna, approximately 30-35 years old, with shoulder-length brown hair, no glasses, wearing a fashionable hat (wide-brim or fascinator), elegant friendly expression, neutral background, professional portrait photography style, high quality, photorealistic"
  },
  {
    id: 11,
    name: "Roberto",
    prompt: "Realistic portrait photo of an elderly Italian man named Roberto, approximately 65-70 years old, with blonde/grey hair, wearing rectangular glasses, white beard, no hat, distinguished thoughtful expression, neutral background, professional portrait photography style, high quality, photorealistic"
  },
  {
    id: 12,
    name: "Giulia",
    prompt: "Realistic portrait photo of a young Italian girl named Giulia, approximately 8-10 years old, with blonde pigtails, no glasses, no hat, bright happy smile, neutral background, professional portrait photography style, high quality, photorealistic"
  }
];

async function generateCharacterImage(zai, character) {
  console.log(`\nGenerating image for ${character.name} (Character ${character.id})...`);
  
  try {
    const response = await zai.images.generations.create({
      prompt: character.prompt,
      size: '1024x1024'
    });

    const imageBase64 = response.data[0].base64;
    
    // Save the image
    const outputPath = path.join(__dirname, '..', 'public', 'images', 'characters', `character-${character.id}.png`);
    const buffer = Buffer.from(imageBase64, 'base64');
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`✓ Successfully generated and saved: character-${character.id}.png`);
    return { success: true, id: character.id, name: character.name };
  } catch (error) {
    console.error(`✗ Failed to generate image for ${character.name}: ${error.message}`);
    return { success: false, id: character.id, name: character.name, error: error.message };
  }
}

async function main() {
  console.log('=== Indovina Chi Character Image Generation ===\n');
  console.log(`Generating ${characters.length} character portraits...\n`);
  
  // Create output directory if it doesn't exist
  const outputDir = path.join(__dirname, '..', 'public', 'images', 'characters');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created directory: ${outputDir}\n`);
  }

  try {
    const zai = await ZAI.create();
    console.log('Z-AI SDK initialized successfully\n');
    
    const results = [];
    
    // Generate images sequentially to avoid rate limiting
    for (const character of characters) {
      const result = await generateCharacterImage(zai, character);
      results.push(result);
      
      // Small delay between requests
      if (character.id < characters.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Summary
    console.log('\n=== Generation Summary ===\n');
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`Successfully generated: ${successful.length}/${characters.length}`);
    successful.forEach(r => console.log(`  ✓ Character ${r.id}: ${r.name}`));
    
    if (failed.length > 0) {
      console.log(`\nFailed: ${failed.length}/${characters.length}`);
      failed.forEach(r => console.log(`  ✗ Character ${r.id}: ${r.name} - ${r.error}`));
    }

    console.log('\nImages saved to: /home/z/my-project/public/images/characters/');
    
  } catch (error) {
    console.error('Failed to initialize Z-AI SDK:', error.message);
    process.exit(1);
  }
}

main();

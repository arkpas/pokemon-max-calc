import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import 'dotenv/config';

const ensureDirectoryExists = dirPath => {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
    console.log(`Directory created: ${dirPath}`);
  } else {
    console.log(`Directory already exists: ${dirPath}`);
  }
};

const downloadFile = async (url, filename) => {
  const res = await fetch(url);
  const content = await res.text();
  writeFileSync(`./scripts/output/${filename}`, content);
  console.log(`Saved data to ${filename}`);
};

ensureDirectoryExists('./scripts/output');
await downloadFile(process.env.POKEMON_DATA_URL, 'pokemons.tsv');
await downloadFile(process.env.GAME_MASTER_URL, 'GAME_MASTER.json');

import { convertPokemonsV2, sortAttacks, HEADERS_MAPPING } from './utils.js';
import { readFileSync, writeFileSync } from 'node:fs';

const pokemonTsv = readFileSync('./scripts/output/pokemons.tsv', 'utf-8');
const masterData = JSON.parse(readFileSync('./scripts/output/GAME_MASTER.json', 'utf-8'));
const pokemons = convertPokemonsV2(pokemonTsv);
const pokemonMasterData = [];
const moveMasterData = [];

masterData.forEach(template => {
  const templateId = template.templateId.slice(6);

  if (templateId.startsWith('POKEMON_') && template.data.pokemonSettings) {
    const dexNr = parseInt(template.templateId.slice(1, 5));
    pokemonMasterData.push({ ...template.data.pokemonSettings, dexNr });
  }

  if (templateId.startsWith('MOVE_') && template.data.moveSettings) {
    moveMasterData.push(template.data.moveSettings);
  }
});

pokemonMasterData.forEach(pokemon => {
  pokemon.quickMoves = pokemon.quickMoves?.map(moveId => moveMasterData.find(move => move.movementId === moveId)) ?? [];
  pokemon.cinematicMoves = pokemon.cinematicMoves?.map(moveId => moveMasterData.find(move => move.movementId === moveId)) ?? [];
  pokemon.eliteQuickMoves = pokemon.eliteQuickMove?.map(moveId => moveMasterData.find(move => move.movementId === moveId)) ?? [];
  pokemon.eliteCinematicMoves = pokemon.eliteCinematicMove?.map(moveId => moveMasterData.find(move => move.movementId === moveId)) ?? [];

  if (pokemon.form) {
    pokemon.pokemonId = pokemon.form;
  }
});

const pokemonsData = extractMoves(pokemons, pokemonMasterData);
pokemonsData.sort(sortPokemons);
const pokemonsDataTsv = convertPokemonsDataToTsv(pokemonsData);

writeFileSync('./public/pokemons.tsv', pokemonsDataTsv);

function extractMoves(pokemons, apiData) {
  if (!apiData || apiData.length === 0) {
    return [];
  }

  const filteredApiData = filterApiData(pokemons, apiData);
  enhanceApiData(pokemons, filteredApiData);

  const pokemonsData = [];

  filteredApiData.forEach(pokemon => {
    const fastAttacks = [];
    const chargedAttacks = [];

    // Fast attacks - standard
    for (const quickMove of Object.values(pokemon.quickMoves)) {
      fastAttacks.push(convertAttack(quickMove, false));
    }

    // Charged attacks - standard
    for (const cinematicMove of Object.values(pokemon.cinematicMoves)) {
      chargedAttacks.push(convertAttack(cinematicMove, false));
    }

    // Fast attacks - elite
    for (const eliteQuickMove of Object.values(pokemon.eliteQuickMoves)) {
      fastAttacks.push(convertAttack(eliteQuickMove, true));
    }

    // Charged attacks - elite
    for (const eliteCinematicMove of Object.values(pokemon.eliteCinematicMoves)) {
      chargedAttacks.push(convertAttack(eliteCinematicMove, true));
    }

    fastAttacks.sort(sortAttacks);
    chargedAttacks.sort(sortAttacks);

    pokemonsData.push({
      lp: pokemon.lp,
      name: pokemon.pokemonName,
      dexNr: pokemon.dexNr,
      primaryType: extractPokemonType(pokemon.type),
      secondaryType: extractPokemonType(pokemon.type2),
      dynamax: pokemon.dynamax != undefined ? pokemon.dynamax : '',
      gigantamax: pokemon.gigantamax != undefined ? pokemon.gigantamax : '',
      dynamaxType: pokemon.dynamaxType ? pokemon.dynamaxType : '',
      gigantamaxType: pokemon.gigantamaxType ? pokemon.gigantamaxType : '',
      fastAttacks: fastAttacks,
      atk: pokemon.stats.baseAttack,
      def: pokemon.stats.baseDefense,
      hp: pokemon.stats.baseStamina,
      chargedAttacks: chargedAttacks,
    });
  });

  return pokemonsData;
}

function uppercaseFirstLetterOfWords(sentence) {
  if (!sentence) {
    return '';
  }

  // All to lower case and split each word separately
  const splitString = sentence.toLowerCase().split(' ');

  for (let i = 0; i < splitString.length; i++) {
    // Uppercase first letter of each word and assign it back in the array
    splitString[i] = splitString[i].charAt(0).toUpperCase() + splitString[i].substring(1);
  }

  // Join it back again into sentence and return
  return splitString.join(' ');
}

function filterApiData(pokemons, apiData) {
  const pokemonNames = pokemons.map(pokemon => pokemon.name.toLowerCase().replaceAll('-', ' '));

  return apiData.filter(pokemonFromApi => {
    const pokemonFromApiName = pokemonFromApi.pokemonId.toLowerCase().replaceAll('_', ' ');

    return pokemonNames.includes(pokemonFromApiName);
  });
}

function enhanceApiData(pokemons, apiData) {
  for (const pokemonApiData of apiData) {
    const pokemonFromTsv = pokemons.find(
      pokemon => pokemon.name.toLowerCase().replaceAll('-', ' ') === pokemonApiData.pokemonId.toLowerCase().replaceAll('_', ' ')
    );

    if (!pokemonFromTsv) {
      continue;
    }

    pokemonApiData.lp = pokemonFromTsv.lp;
    pokemonApiData.pokemonName = pokemonFromTsv.name;
    pokemonApiData.dynamax = pokemonFromTsv.dynamax;
    pokemonApiData.gigantamax = pokemonFromTsv.gigantamax;
    pokemonApiData.dynamaxType = pokemonFromTsv.dynamaxType;
    pokemonApiData.gigantamaxType = pokemonFromTsv.gigantamaxType;
  }
}

function convertAttack(moveApiData, isElite) {
  return {
    name: extractMoveName(moveApiData.movementId),
    type: extractPokemonType(moveApiData.pokemonType),
    power: moveApiData.power ?? 0,
    energy: Math.abs(moveApiData.energyDelta ?? 0),
    duration: moveApiData.durationMs / 1000,
    elite: isElite,
  };
}

function extractMoveName(moveName) {
  const cleanName = moveName.replace('_FAST', '').replaceAll('_', ' ').toLowerCase();

  return uppercaseFirstLetterOfWords(cleanName);
}

function extractPokemonType(pokemonType) {
  if (!pokemonType) {
    return undefined;
  }

  const cleanType = pokemonType.replace('POKEMON_TYPE_', '').toLowerCase();

  return uppercaseFirstLetterOfWords(cleanType);
}

function sortPokemons(a, b) {
  if (!a.lp && !b.lp) {
    return a.dexNr - b.dexNr;
  }

  if (!a.lp) {
    return 1;
  }

  if (!b.lp) {
    return -1;
  }

  return a.lp - b.lp;
}

function convertPokemonsDataToTsv(pokemonsData) {
  if (!pokemonsData || pokemonsData.length === 0) {
    return '';
  }

  const headers = Array.from(HEADERS_MAPPING.keys()).join('\t');
  const fields = Array.from(HEADERS_MAPPING.values());
  const rows = [];

  for (const pokemonData of pokemonsData) {
    const fastAttacks = convertMovesToString(pokemonData.fastAttacks);
    const chargedAttacks = convertMovesToString(pokemonData.chargedAttacks);

    // Create a shallow copy to override some fields
    const pokemonDataCopy = { ...pokemonData };
    pokemonDataCopy.fastAttacks = fastAttacks;
    pokemonDataCopy.chargedAttacks = chargedAttacks;
    pokemonDataCopy.isGigantamax = pokemonData.gigantamax;
    pokemonDataCopy.isDynamax = pokemonData.dynamax;
    pokemonDataCopy.attack = pokemonData.atk;
    pokemonDataCopy.defense = pokemonData.def;

    // Create one row in TSV by collecting all fields in proper order
    const row = [];
    for (const field of fields) {
      row.push(pokemonDataCopy[field]);
    }

    rows.push(row.join('\t'));
  }

  return [headers, ...rows].join('\r\n');
}

function convertMovesToString(moves) {
  return moves
    .map(attack => `${attack.name} [${attack.type} ${attack.power} ${attack.energy} ${attack.duration.toFixed(1)}${attack.elite ? ' elite' : ''}]`)
    .join(' | ');
}

// Mapping TSV headers into object fields
export const HEADERS_MAPPING = new Map([
  ['LP', 'lp'],
  ['Name', 'name'],
  ['Pokedex Nr.', 'dexNr'],
  ['Primary type', 'primaryType'],
  ['Secondary type', 'secondaryType'],
  ['Dynamax', 'isDynamax'],
  ['Gigantamax', 'isGigantamax'],
  ['Dynamax type', 'dynamaxType'],
  ['Gigantamax type', 'gigantamaxType'],
  ['Fast attacks', 'fastAttacks'],
  ['Attack', 'attack'],
  ['Defense', 'defense'],
  ['HP', 'hp'],
  ['Charged attacks', 'chargedAttacks'],
]);

/**
 * Converts pokemon data from TSV into array of objects. New version considering
 * also dates for dynamax and gigantamax
 *
 * @param {*} tsv
 * @returns
 */
export function convertPokemonsV2(tsv) {
  if (!tsv) {
    throw new Error(`Bad TSV input: ${tsv}`);
  }

  const lines = tsv.split('\r\n');
  const actualHeaders = lines[0].split('	');
  const headerMap = new Map();

  HEADERS_MAPPING.forEach((value, key) => {
    const index = actualHeaders.indexOf(key);

    if (index < 0) {
      throw new Error(`Required header [${key}] not found in TSV file!`);
    }

    headerMap.set(value, index);
  });

  const result = [];

  for (let i = 1; i < lines.length; i++) {
    let obj = {};
    let currentline = lines[i].split('	');

    headerMap.forEach((value, key) => {
      obj[key] = currentline[value].trim();
    });

    obj.dynamax = obj.isDynamax;
    obj.gigantamax = obj.isGigantamax;
    obj.isDynamax = obj.isDynamax === 'TRUE' ? true : false;
    obj.isGigantamax = obj.isGigantamax === 'TRUE' ? true : false;
    obj.fastAttacks = convertAttacks(obj.fastAttacks);
    obj.chargedAttacks = convertAttacks(obj.chargedAttacks);
    obj.attack = parseInt(obj.attack);
    obj.defense = parseInt(obj.defense);
    obj.hp = parseInt(obj.hp);
    obj.hasHalfSecondAttack = hasHalfSecondAttack(obj.fastAttacks);

    result.push(obj);
  }

  return result;
}

/**
 * Convert attack string from TSV that comes in form of:
 * "Name [Type Power Duration Special] | Name2 [Type2 Power2 Duration2 Special2]"
 *
 * @param {*} attacksString string from TSV
 * @returns object with attack data
 */
function convertAttacks(attacksString) {
  if (!attacksString) return [];

  const result = [];
  const attacksSplit = attacksString.split(' | ');

  attacksSplit.forEach(attack => {
    const openBracket = attack.indexOf('[');
    const closeBracket = attack.indexOf(']');
    const attackStats = attack.slice(openBracket + 1, closeBracket).split(' ');

    result.push({
      name: attack.slice(0, openBracket - 1),
      type: attackStats[0],
      power: parseInt(attackStats[1]),
      duration: parseFloat(attackStats[2]),
      special: attackStats.length >= 4 ? attackStats[3] : undefined,
    });
  });

  return result;
}

function hasHalfSecondAttack(attacks) {
  return attacks.findIndex(attack => attack.duration === 0.5) >= 0;
}

export function sortAttacks(a, b) {
  const duration = a.duration - b.duration;

  return duration == 0 ? a.power - b.power : duration;
}

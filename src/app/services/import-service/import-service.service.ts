import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AllyConfiguration, Attack, MyPokemon, OpponentConfiguration, Pokemon, Type } from '../../types/types';
import moment, { Moment } from 'moment';

type DefendingTypeEffectiveness = Record<string, number>;

const HEADERS_MAPPING = {
  name: 'Name',
  pokedexNumber: 'Pokedex Nr.',
  primaryType: 'Primary type',
  secondaryType: 'Secondary type',
  dynamax: 'Dynamax',
  gigantamax: 'Gigantamax',
  dynamaxType: 'Dynamax type',
  gigantamaxType: 'Gigantamax type',
  fastAttacks: 'Fast attacks',
  chargedAttacks: 'Charged attacks',
  atk: 'Attack',
  def: 'Defense',
  hp: 'HP',
};

@Injectable({
  providedIn: 'root',
})
export class ImportServiceService {
  private http = inject(HttpClient);

  public typesMap = new Map<string, DefendingTypeEffectiveness>();
  public pokemons: Pokemon[] = [];

  public async initialize(): Promise<void> {
    const typesCsv = await firstValueFrom(this.http.get('types.csv', { responseType: 'text' }));
    const pokemonsTsv = await firstValueFrom(this.http.get('pokemons.tsv', { responseType: 'text' }));

    this.typesMap = this.createTypesMap(typesCsv);
    this.pokemons = this.convertToPokemons(pokemonsTsv);

    console.log(this.typesMap);
    console.log(this.pokemons);
  }

  public async getTypes() {
    const typesCsv = await firstValueFrom(this.http.get('types.csv', { responseType: 'text' }));

    return this.createTypesMap(typesCsv);
  }

  public getPokemons(): Pokemon[] {
    return this.pokemons.map(pokemon => this.deepCopyPokemon(pokemon));
  }

  public getPokemonsWithConfig(config: AllyConfiguration): Pokemon[] {
    // Copy the pokemons and return them, so we still have "clean" version of them in service
    const pokemons = this.getPokemons();

    // Calculate final stats
    pokemons.forEach(pokemon => {
      pokemon.cpm = config.allyCpm;
      pokemon.atk = (pokemon.atk + config.allyAtkIV) * config.allyCpm;
      pokemon.def = (pokemon.def + config.allyDefIV) * config.allyCpm;
      pokemon.hp = Math.floor((pokemon.hp + config.allyHpIV) * config.allyCpm);
    });

    return pokemons;
  }

  public getPokemonsForMyPokemons(myPokemons: MyPokemon[]): Pokemon[] {
    const pokemons: Pokemon[] = [];

    // Calculate final stats
    myPokemons.forEach(myPokemon => {
      try {
        const pokemon = this.findPokemon(myPokemon.name);

        pokemon.cpm = myPokemon.allyCpm;
        pokemon.atk = (pokemon.atk + myPokemon.allyAtkIV) * myPokemon.allyCpm;
        pokemon.def = (pokemon.def + myPokemon.allyDefIV) * myPokemon.allyCpm;
        pokemon.hp = Math.floor((pokemon.hp + myPokemon.allyHpIV) * myPokemon.allyCpm);
        pokemon.isMyPokemon = true;

        pokemons.push(pokemon);
      } catch {
        console.log(`Error getting My Pokemon with name: "${myPokemon.name}"!`);
      }
    });

    return pokemons;
  }

  public getPokemonNames(): string[] {
    return this.pokemons.map(pokemon => pokemon.name);
  }

  public findPokemon(name: string): Pokemon {
    const wantedPokemon = this.pokemons.find(pokemon => pokemon.name.toLowerCase() === name.toLowerCase());

    if (!wantedPokemon) {
      throw new Error(`Pokemon with name ${name} was not found!`);
    }

    return this.deepCopyPokemon(wantedPokemon);
  }

  public getOpponent(config: OpponentConfiguration): Pokemon {
    const wantedPokemon = this.pokemons.find(pokemon => pokemon.name.toLowerCase() === config.opponentName.toLowerCase());

    if (!wantedPokemon) {
      throw new Error(`Pokemon with name ${config.opponentName} was not found!`);
    }

    const opponent = this.deepCopyPokemon(wantedPokemon);

    // Calculate final stats for the opponent
    const opponentAtkIV = 15;
    const opponentDefIV = 15;

    opponent.atk = (opponent.atk + opponentAtkIV) * config.opponentCpm * config.opponentAtkMod;
    opponent.def = (opponent.def + opponentDefIV) * config.opponentCpm * config.opponentDefMod;
    opponent.hp = config.opponentHp;

    return opponent;
  }

  /**
   *
   * @param csv csv in string form
   * @returns map with type effectiveness, where key is attacking type and values are defending types along with the effectiveness value
   */
  public createTypesMap(csv: string): Map<string, DefendingTypeEffectiveness> {
    const lines = csv.split('\n');
    const map = new Map<string, DefendingTypeEffectiveness>();
    const headers = lines[0].split(',');

    // Go through the lines skipping header
    for (let i = 1; i < lines.length; i++) {
      // Define type effectiveness object in form of: { Water: 1.6 }
      const obj: DefendingTypeEffectiveness = {};
      const currentline = lines[i].split(',');

      for (let j = 1; j < headers.length; j++) {
        // Put all type effectiveness into object
        obj[headers[j]] = parseFloat(currentline[j]);
      }

      // Create a map with type effectiveness:
      // key: attacking type
      // value: object with defending types and multipliers of damage dealt to them
      map.set(currentline[0], obj);
    }

    return map;
  }

  /**
   * Converts pokemon data from TSV into array of objects
   *
   * @param {*} tsv
   * @returns
   */
  public convertToPokemons(tsv: string) {
    if (!tsv) {
      throw new Error(`Bad TSV input: ${tsv}`);
    }

    const lines = tsv.split('\r\n');
    const actualHeaders = lines[0].split('	');
    const headerMap = new Map();

    // Validate if all needed headers are present in TSV file
    for (const [key, value] of Object.entries(HEADERS_MAPPING)) {
      const index = actualHeaders.indexOf(value);

      if (index < 0) {
        throw new Error(`Required header [${value}] not found in TSV file!`);
      }

      headerMap.set(key, index);
    }

    const result: Pokemon[] = [];

    for (let i = 1; i < lines.length; i++) {
      const obj: Record<string, any> = {};
      const currentline = lines[i].split('	');

      headerMap.forEach((value, key) => {
        obj[key] = currentline[value];
      });

      obj['dynamaxDate'] = this.convertToPremiereDate(obj['dynamax']);
      obj['gigantamaxDate'] = this.convertToPremiereDate(obj['gigantamax']);
      obj['fastAttacks'] = this.convertAttacks(obj['fastAttacks']);
      obj['chargedAttacks'] = this.convertAttacks(obj['chargedAttacks']);
      obj['atk'] = parseInt(obj['atk']);
      obj['def'] = parseInt(obj['def']);
      obj['hp'] = parseInt(obj['hp']);
      obj['hasHalfSecondAttack'] = this.hasHalfSecondAttack(obj['fastAttacks']);
      obj['primaryType'] = Type[obj['primaryType'] as keyof typeof Type];
      obj['secondaryType'] = Type[obj['secondaryType'] as keyof typeof Type];
      obj['gigantamaxType'] = Type[obj['gigantamaxType'] as keyof typeof Type];
      obj['dynamaxType'] = Type[obj['dynamaxType'] as keyof typeof Type];

      result.push(obj as Pokemon);
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
  private convertAttacks(attacksString: string): Attack[] {
    if (!attacksString) return [];

    const result: Attack[] = [];
    const attacksSplit = attacksString.split(' | ');

    attacksSplit.forEach(attack => {
      const openBracket = attack.indexOf('[');
      const closeBracket = attack.indexOf(']');
      const attackStats = attack.slice(openBracket + 1, closeBracket).split(' ');

      result.push({
        name: attack.slice(0, openBracket - 1),
        type: Type[attackStats[0] as keyof typeof Type],
        power: parseInt(attackStats[1]),
        energy: parseInt(attackStats[2]),
        duration: parseFloat(attackStats[3]),
        special: attackStats.length >= 4 ? attackStats[3] : undefined,
      });
    });

    return result;
  }

  private hasHalfSecondAttack(attacks: Attack[]) {
    return attacks.findIndex(attack => attack.duration === 0.5) >= 0;
  }

  private convertToPremiereDate(dateOrBool: string): Moment {
    if (!dateOrBool) {
      throw new Error(`Bad value, expected boolean or date, got: ${dateOrBool}`);
    }

    const date = moment(dateOrBool, 'DD.MM.YYYY');

    // If the field had actual date, we take it and return as premiere date
    if (date.isValid()) {
      return date;
    }
    // Otherwise check if value is "true", so we know that the pokemon had premiere
    // in max battles and we can set the date to some old value
    else if (dateOrBool.toLowerCase() === 'true') {
      return moment('01.01.1970', 'DD.MM.YYYY');
    }
    // If nothing above works, assume the pokemon did not have premiere in max battles yet
    // and set the date to far future
    else {
      return moment('01.01.9999', 'DD.MM.YYYY');
    }
  }

  private deepCopyPokemon(sourcePokemon: Pokemon): Pokemon {
    const copiedPokemon = JSON.parse(JSON.stringify(sourcePokemon)) as Pokemon;

    copiedPokemon.gigantamaxDate = moment(copiedPokemon.gigantamaxDate);
    copiedPokemon.dynamaxDate = moment(copiedPokemon.dynamaxDate);

    return copiedPokemon;
  }
}

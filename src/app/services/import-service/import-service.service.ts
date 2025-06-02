import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Attack, Pokemon, Type } from '../../types/types';
import moment, { Moment } from 'moment';

type DefendingTypeEffectiveness = { [k: string]: number };

const HEADERS_MAPPING = {
  name: 'Name',
  pokedexNumber: 'Pokedex Nr.',
  primaryType: 'Primary type',
  secondaryType: 'Secondary type',
  dynamax: 'Dynamax',
  gigantamax: 'Gigantamax',
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
  public typesMap: Map<String, DefendingTypeEffectiveness> = new Map();
  public pokemons: Pokemon[] = [];

  constructor(private http: HttpClient) {}

  public async initialize(): Promise<void> {
    const typesCsv = await firstValueFrom(
      this.http.get('types.csv', { responseType: 'text' })
    );
    const pokemonsTsv = await firstValueFrom(
      this.http.get('pokemons.tsv', { responseType: 'text' })
    );

    this.typesMap = this.createTypesMap(typesCsv);
    this.pokemons = this.convertToPokemons(pokemonsTsv);

    console.log(this.typesMap);
    console.log(this.pokemons);
  }

  public async getTypes() {
    const typesCsv = await firstValueFrom(
      this.http.get('types.csv', { responseType: 'text' })
    );

    return this.createTypesMap(typesCsv);
  }

  public getPokemons(): Pokemon[] {
    // Copy the pokemons and return them, so we still have "clean" version of them in service
    const pokemons = JSON.parse(JSON.stringify(this.pokemons)) as Pokemon[];
    pokemons.forEach((pokemon) => {
      pokemon.gigantamaxDate = moment(pokemon.gigantamaxDate);
      pokemon.dynamaxDate = moment(pokemon.dynamaxDate);
    });

    return pokemons;
  }

  /**
   *
   * @param csv csv in string form
   * @returns map with type effectiveness, where key is attacking type and values are defending types along with the effectiveness value
   */
  public createTypesMap(csv: string): Map<String, DefendingTypeEffectiveness> {
    const lines = csv.split('\n');
    const map = new Map<String, DefendingTypeEffectiveness>();
    const headers = lines[0].split(',');

    // Go through the lines skipping header
    for (let i = 1; i < lines.length; i++) {
      // Define type effectiveness object in form of: { Water: 1.6 }
      let obj: DefendingTypeEffectiveness = {};
      let currentline = lines[i].split(',');

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
    for (let [key, value] of Object.entries(HEADERS_MAPPING)) {
      const index = actualHeaders.indexOf(value);

      if (index < 0) {
        throw new Error(`Required header [${value}] not found in TSV file!`);
      }

      headerMap.set(key, index);
    }

    const result: Pokemon[] = [];

    for (let i = 1; i < lines.length; i++) {
      let obj: Record<string, any> = {};
      let currentline = lines[i].split('	');

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

    attacksSplit.forEach((attack) => {
      const openBracket = attack.indexOf('[');
      const closeBracket = attack.indexOf(']');
      const attackStats = attack
        .slice(openBracket + 1, closeBracket)
        .split(' ');

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
    return attacks.findIndex((attack) => attack.duration === 0.5) >= 0;
  }

  private convertToPremiereDate(dateOrBool: string): Moment {
    if (!dateOrBool) {
      throw new Error(
        `Bad value, expected boolean or date, got: ${dateOrBool}}`
      );
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
}

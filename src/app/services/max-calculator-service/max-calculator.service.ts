import { Injectable, inject } from '@angular/core';
import {
  Pokemon,
  PokemonStats,
  Type,
  ComboDamageConfiguration,
  BattleConfiguration,
  TeamOption,
  DamageDetails,
  DamageModifiers,
  Attack,
  DynamicDamageModifiers,
  StaticDamageModifiers,
  Candidate,
} from '../../types/types';
import { ImportServiceService } from '../import-service/import-service.service';
import { Moment } from 'moment';
import { MyPokemonService } from '../my-pokemon-service/my-pokemon.service';

const TURN_DURATION = 0.5;
export const GMAX = 'G-Max';
export const DMAX = 'D-Max';

@Injectable({
  providedIn: 'root',
})
export class MaxCalculatorService {
  private importService = inject(ImportServiceService);
  private teamService = inject(MyPokemonService);

  simulateBattle(config: BattleConfiguration): Candidate[] {
    // Get our opponent with stats adjusted to battle config
    const opponent = this.importService.getOpponent(config);
    const allies: Pokemon[] = [];

    if (config.teamOption === TeamOption.allPokemons || config.teamOption === TeamOption.onlyDefaultPokemons) {
      // Get all Pokemons with stats adjusted to battle config
      allies.push(...this.importService.getPokemonsWithConfig(config));
    }

    if (config.teamOption === TeamOption.allPokemons || config.teamOption === TeamOption.onlyMyPokemons) {
      // Add personal team to the mix
      const myPokemons = this.teamService.getMyPokemons();
      allies.push(...myPokemons);
    }

    // Run the simulation
    return this.calculate(allies, opponent, config.date);
  }

  public calculate(pokemons: Pokemon[], boss: Pokemon, date: Moment) {
    const candidates: Candidate[] = [];

    pokemons.forEach(pokemon => {
      // Offensive
      const maxPhaseDamageDetails = this.calculateMaxPhaseDamageDetails(pokemon, boss, date);
      const fastAttackDamageDetails = this.calculateFastAttackDamageDetails(pokemon, boss, false);
      const chargedAttackDamageDetails = this.calculateChargedAttackDamageDetails(pokemon, boss);

      // TODO: use it!
      // const onFieldDamageCombos = this.calculateOnFieldDamageCombos(pokemon, boss, date);

      // Defensive
      const damageTakenDetails = this.calculateDamageTakenDetails(boss, pokemon);
      const avgDamageTaken = damageTakenDetails.reduce((a, b) => a + b.damage, 0) / damageTakenDetails.length;
      const avgDamageTakenPercentage = (avgDamageTaken / pokemon.hp) * 100;
      const heal = pokemon.hp * 0.48;
      const totalUnhealedDamagePercentage = damageTakenDetails.reduce((a, b) => a + b.unhealedDamagePercentage, 0);

      candidates.push({
        ...pokemon,
        avgDamageTaken,
        avgDamageTakenPercentage,
        damageTakenDetails,
        fastAttackDamageDetails,
        chargedAttackDamageDetails,
        totalUnhealedDamagePercentage,
        heal,
        maxPhaseDamageDetails,
      });
    });

    return candidates;
  }

  private calculateMaxPhaseDamageDetails(ally: Pokemon, opponent: Pokemon, date: Moment): DamageDetails[] {
    const damageDetails: DamageDetails[] = [];
    const staticDamageModifiers: StaticDamageModifiers = {
      friendship: 1,
      dodged: 1,
      mega: 1,
      trainer: 1,
      charged: 1,
      party: 1,
      support: 1,
      spread: 1,
    };

    // Standard G-MAX
    if (ally.gigantamaxDate.isBefore(date)) {
      const move: Attack = {
        name: GMAX + ' ' + ally.gigantamaxType,
        type: ally.gigantamaxType,
        power: 450,
        energy: 0,
        duration: 0,
        special: GMAX,
      };

      const dynamicDamageModifiers: DynamicDamageModifiers = {
        typeEffectiveness: this.calculateTypeEffectiveness(ally.gigantamaxType, opponent),
        stab: this.calculateStab(ally.gigantamaxType, ally),
        weather: 1,
      };

      damageDetails.push(this.calculateDamage(move, ally, opponent, { ...staticDamageModifiers, ...dynamicDamageModifiers }));
    }

    // Standard D-MAX
    if (ally.dynamaxDate.isBefore(date) && !ally.dynamaxType) {
      const dmaxDamageByTypeMap = new Map<Type, DamageDetails>();

      ally.fastAttacks.forEach(fastAttack => {
        // D-Max attack of the same type deal same damage, so if we already have it, we can safely skip
        if (dmaxDamageByTypeMap.has(fastAttack.type)) {
          return;
        }

        const move: Attack = {
          name: DMAX + ' ' + fastAttack.type,
          type: fastAttack.type,
          power: 350,
          energy: 0,
          duration: 0,
          special: DMAX,
        };

        const dynamicDamageModifiers: DynamicDamageModifiers = {
          typeEffectiveness: this.calculateTypeEffectiveness(fastAttack.type, opponent),
          stab: this.calculateStab(fastAttack.type, ally),
          weather: 1,
        };

        dmaxDamageByTypeMap.set(fastAttack.type, this.calculateDamage(move, ally, opponent, { ...staticDamageModifiers, ...dynamicDamageModifiers }));
      });

      damageDetails.push(...Array.from(dmaxDamageByTypeMap.values()));
    }

    // D-MAX with fixed attack type (like Zacian or Zamazenta)
    if (ally.dynamaxDate.isBefore(date) && ally.dynamaxType) {
      const move: Attack = {
        name: DMAX + ' ' + ally.dynamaxType,
        type: ally.dynamaxType,
        power: 350,
        energy: 0,
        duration: 0,
        special: DMAX,
      };

      const dynamicDamageModifiers: DynamicDamageModifiers = {
        typeEffectiveness: this.calculateTypeEffectiveness(ally.dynamaxType, opponent),
        stab: this.calculateStab(ally.dynamaxType, ally),
        weather: 1,
      };

      damageDetails.push(this.calculateDamage(move, ally, opponent, { ...staticDamageModifiers, ...dynamicDamageModifiers }));
    }

    return damageDetails;
  }

  private calculateFastAttackDamageDetails(attacker: Pokemon, defender: Pokemon, onlyHalfSecond: boolean): DamageDetails[] {
    const fastAttackDamageDetails: DamageDetails[] = [];
    const staticDamageModifiers: StaticDamageModifiers = {
      friendship: 1,
      dodged: 1,
      mega: 1,
      trainer: 1,
      charged: 1,
      party: 1,
      support: 1,
      spread: 1,
    };

    attacker.fastAttacks.forEach(fastAttack => {
      // Check if we care only about 0.5s attacks or we calculate all
      // TODO: revisit if this flag is needed
      if (!onlyHalfSecond || fastAttack.duration <= 0.5) {
        const dynamicDamageModifiers: DynamicDamageModifiers = {
          typeEffectiveness: this.calculateTypeEffectiveness(fastAttack.type, defender),
          stab: this.calculateStab(fastAttack.type, attacker),
          weather: 1,
        };

        fastAttackDamageDetails.push(this.calculateDamage(fastAttack, attacker, defender, { ...staticDamageModifiers, ...dynamicDamageModifiers }));
      }
    });

    fastAttackDamageDetails.sort(this.sortFastAttacks);

    return fastAttackDamageDetails;
  }

  private calculateChargedAttackDamageDetails(attacker: Pokemon, defender: Pokemon): DamageDetails[] {
    const chargedAttackDamageDetails: DamageDetails[] = [];
    const staticDamageModifiers: StaticDamageModifiers = {
      friendship: 1,
      dodged: 1,
      mega: 1,
      trainer: 1,
      charged: 1,
      party: 1,
      support: 1,
      spread: 1,
    };

    attacker.chargedAttacks.forEach(chargedAttack => {
      const dynamicDamageModifiers: DynamicDamageModifiers = {
        typeEffectiveness: this.calculateTypeEffectiveness(chargedAttack.type, defender),
        stab: this.calculateStab(chargedAttack.type, attacker),
        weather: 1,
      };

      chargedAttackDamageDetails.push(
        this.calculateDamage(chargedAttack, attacker, defender, { ...staticDamageModifiers, ...dynamicDamageModifiers })
      );
    });

    chargedAttackDamageDetails.sort(this.sortChargedAttacks);

    return chargedAttackDamageDetails;
  }

  private calculateDamageTakenDetails(attacker: Pokemon, defender: Pokemon): DamageDetails[] {
    const damageTakenDetails: DamageDetails[] = [];
    const staticDamageModifiers: StaticDamageModifiers = {
      friendship: 1,
      dodged: 1,
      mega: 1,
      trainer: 1,
      charged: 1,
      party: 1,
      support: 1,
      spread: 1,
    };

    attacker.chargedAttacks.forEach(attack => {
      const dynamicDamageModifiers: DynamicDamageModifiers = {
        typeEffectiveness: this.calculateTypeEffectiveness(attack.type, defender),
        stab: this.calculateStab(attack.type, attacker),
        weather: 1,
      };

      damageTakenDetails.push(this.calculateDamage(attack, attacker, defender, { ...staticDamageModifiers, ...dynamicDamageModifiers }));
    });

    return damageTakenDetails;
  }

  private calculateOnFieldDamageCombos(attacker: Pokemon, defender: Pokemon, date: Moment): ComboDamageConfiguration[] {
    // No DMax or GMax = we can't use this pokemon yet
    if (!attacker.dynamaxDate.isBefore(date) && !attacker.gigantamaxDate.isBefore(date)) {
      return [];
    }

    const staticDamageModifiers: StaticDamageModifiers = {
      friendship: 1,
      dodged: 1,
      mega: 1,
      trainer: 1,
      charged: 1,
      party: 1,
      support: 1,
      spread: 1,
    };

    const faDamageDetailsList: DamageDetails[] = [];
    const caDamageDetailsList: DamageDetails[] = [];

    attacker.fastAttacks.forEach(fastAttack => {
      const dynamicDamageModifiers: DynamicDamageModifiers = {
        typeEffectiveness: this.calculateTypeEffectiveness(fastAttack.type, defender),
        stab: this.calculateStab(fastAttack.type, attacker),
        weather: 1,
      };

      faDamageDetailsList.push(this.calculateDamage(fastAttack, attacker, defender, { ...staticDamageModifiers, ...dynamicDamageModifiers }));
    });

    attacker.chargedAttacks.forEach(chargedAttack => {
      const dynamicDamageModifiers: DynamicDamageModifiers = {
        typeEffectiveness: this.calculateTypeEffectiveness(chargedAttack.type, defender),
        stab: this.calculateStab(chargedAttack.type, attacker),
        weather: 1,
      };

      caDamageDetailsList.push(this.calculateDamage(chargedAttack, attacker, defender, { ...staticDamageModifiers, ...dynamicDamageModifiers }));
    });

    const comboDamageConfigurations: ComboDamageConfiguration[] = [];

    faDamageDetailsList.forEach(faDamageDetails => {
      caDamageDetailsList.forEach(caDamageDetails => {
        const comboDamageConfiguration = this.calculateComboDamageConfiguration(attacker.name, faDamageDetails, caDamageDetails);

        comboDamageConfigurations.push(comboDamageConfiguration);
      });

      const faOnlyComboDamageConfiguration = this.calculateComboDamageConfiguration(attacker.name, faDamageDetails);
      comboDamageConfigurations.push(faOnlyComboDamageConfiguration);
    });

    comboDamageConfigurations.sort(this.sortComboDamageConfigurations);

    return comboDamageConfigurations;
  }

  private calculateComboDamageConfiguration(
    pokemonName: string,
    faDamageDetails: DamageDetails,
    caDamageDetails?: DamageDetails
  ): ComboDamageConfiguration {
    // Case where we have FA only configuration
    if (!caDamageDetails) {
      return {
        pokemon: pokemonName,
        faName: faDamageDetails.move.name,
        faDmg: faDamageDetails.damage,
        faMaxEnergy: faDamageDetails.maxEnergy,
        faCount: 1,
        caName: '-',
        caDmg: 0,
        caMaxEnergy: 0,
        caCount: 0,
        totalMaxEnergy: faDamageDetails.maxEnergy,
        totalDmg: faDamageDetails.damage,
        totalDuration: faDamageDetails.move.duration,
        dphs: faDamageDetails.damagePerTurn,
        mephs: faDamageDetails.maxEnergyPerTurn,
      };
    }

    // First we need to find out how many FAs and CAs we should do to finish with 0 energy (full energy cycle)
    const comboCycleEnergy = this.lcm(faDamageDetails.move.energy, caDamageDetails.move.energy);
    const faCount = comboCycleEnergy / faDamageDetails.move.energy;
    const caCount = comboCycleEnergy / caDamageDetails.move.energy;

    const totalMaxEnergy = faCount * faDamageDetails.maxEnergy + caCount * caDamageDetails.maxEnergy;
    const totalDamage = faCount * faDamageDetails.damage + caCount * caDamageDetails.damage;
    const totalDuration = faCount * faDamageDetails.move.duration + caCount * caDamageDetails.move.duration;
    const totalTurns = totalDuration / TURN_DURATION;
    const mephs = totalMaxEnergy / totalTurns;
    const dphs = totalDamage / totalTurns;

    return {
      pokemon: pokemonName,
      faName: faDamageDetails.move.name,
      faDmg: faDamageDetails.damage,
      faMaxEnergy: faDamageDetails.maxEnergy,
      faCount: faCount,
      caName: caDamageDetails.move.name,
      caDmg: caDamageDetails.damage,
      caMaxEnergy: caDamageDetails.maxEnergy,
      caCount: caCount,
      totalMaxEnergy: totalMaxEnergy,
      totalDmg: totalDamage,
      totalDuration: totalDuration,
      dphs: dphs,
      mephs: mephs,
    };
  }

  /**
   * Greatest common divisor
   */
  private gcd(a: number, b: number): number {
    if (b) {
      return this.gcd(b, a % b);
    } else {
      return Math.abs(a);
    }
  }

  /**
   * Least common multiple
   */
  private lcm(a: number, b: number): number {
    return (a * b) / this.gcd(a, b);
  }

  private sortComboDamageConfigurations(a: ComboDamageConfiguration, b: ComboDamageConfiguration) {
    const mephsCompare = b.mephs - a.mephs;
    // const mephsCompare = 0;

    if (mephsCompare == 0) {
      return b.dphs - a.dphs;
    }

    return mephsCompare;
  }

  private calculateTypeEffectiveness(type: Type, defendingPokemon: Pokemon) {
    const defendingTypeEffectiveness = this.importService.typesMap.get(type);

    if (!defendingTypeEffectiveness) {
      throw new Error(`Type ${type} not found in type effectiveness map!`);
    }

    return defendingTypeEffectiveness[defendingPokemon.primaryType] * (defendingTypeEffectiveness[defendingPokemon.secondaryType] ?? 1);
  }

  private calculateStab(type: Type, pokemon: Pokemon) {
    return type === pokemon.primaryType || type === pokemon.secondaryType ? 1.2 : 1;
  }

  private calculateDamage(move: Attack, attacker: PokemonStats, defender: PokemonStats, damageModifiers: DamageModifiers): DamageDetails {
    const damage =
      Math.floor(
        0.5 *
          move.power *
          (attacker.atk / defender.def) *
          damageModifiers.typeEffectiveness *
          damageModifiers.stab *
          damageModifiers.weather *
          damageModifiers.friendship *
          damageModifiers.dodged *
          damageModifiers.mega *
          damageModifiers.trainer *
          damageModifiers.party *
          damageModifiers.support *
          damageModifiers.spread
      ) + 1;
    const damagePercentage = (damage / defender.hp) * 100;
    const unhealedDamagePercentage = Math.max(damagePercentage - 48, 0);
    const maxEnergy = this.calculateMaxEnergy(damagePercentage);
    const damagePerTurn = damage / (move.duration / TURN_DURATION);
    const maxEnergyPerTurn = maxEnergy / (move.duration / TURN_DURATION);

    return {
      move,
      damageModifiers,
      damage,
      damagePercentage,
      unhealedDamagePercentage,
      maxEnergy,
      damagePerTurn,
      maxEnergyPerTurn,
    };
  }

  private calculateMaxEnergy(damagePercentage: number) {
    // Each 0.5% HP of boss damage you deal is 1 Max Energy
    // We multiply it by 2 to get amount of energy: 0.5%HP * 2 = 1 energy, 1%HP * 2 = 2 energy etc.
    // and we cut off the decimal place digits by using `Math.floor()`
    const maxEnergyCalculated = Math.floor(damagePercentage * 2);
    // And finally with `Math.max()` we pick whichever is higher between our energy calc or 1 energy,
    // because you can never generate less than 1 energy per attack
    return Math.max(maxEnergyCalculated, 1);
  }

  private sortFastAttacks(a: DamageDetails, b: DamageDetails): number {
    const maxEnergyPerTurnCompare = b.maxEnergyPerTurn - a.maxEnergyPerTurn;
    if (maxEnergyPerTurnCompare !== 0) {
      return maxEnergyPerTurnCompare;
    }

    const durationCompare = a.move.duration - b.move.duration;
    if (durationCompare !== 0) {
      return durationCompare;
    }

    const damageCompare = b.damage - a.damage;
    if (damageCompare !== 0) {
      return damageCompare;
    }

    const specialCompare = a.move.special.length - b.move.special.length;
    if (specialCompare !== 0) {
      return specialCompare;
    }

    const typeEffCompare = b.damageModifiers.typeEffectiveness - a.damageModifiers.typeEffectiveness;
    if (typeEffCompare !== 0) {
      return typeEffCompare;
    }

    const stabCompare = b.damageModifiers.stab - a.damageModifiers.stab;
    if (stabCompare !== 0) {
      return stabCompare;
    }

    return b.move.power - a.move.power;
  }

  private sortChargedAttacks(a: DamageDetails, b: DamageDetails): number {
    const maxEnergyPerTurnCompare = b.maxEnergyPerTurn - a.maxEnergyPerTurn;
    if (maxEnergyPerTurnCompare !== 0) {
      return maxEnergyPerTurnCompare;
    }

    const damageCompare = b.damage - a.damage;
    if (damageCompare !== 0) {
      return damageCompare;
    }

    const specialCompare = a.move.special.length - b.move.special.length;
    if (specialCompare !== 0) {
      return specialCompare;
    }

    const typeEffCompare = b.damageModifiers.typeEffectiveness - a.damageModifiers.typeEffectiveness;
    if (typeEffCompare !== 0) {
      return typeEffCompare;
    }

    const stabCompare = b.damageModifiers.stab - a.damageModifiers.stab;
    if (stabCompare !== 0) {
      return stabCompare;
    }

    return b.move.power - a.move.power;
  }
}

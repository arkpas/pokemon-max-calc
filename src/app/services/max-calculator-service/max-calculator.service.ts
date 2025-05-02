import { Injectable } from '@angular/core';
import {
  Pokemon,
  PokemonBaseStats,
  DamageConfiguration,
  Type,
  DamageDetails,
  TankCandidate,
  HealerCandidate,
  ComboDamageConfiguration,
} from '../../types/types';
import { ImportServiceService } from '../import-service/import-service.service';
import { Moment } from 'moment';

const TURN_DURATION = 0.5;

@Injectable({
  providedIn: 'root',
})
export class MaxCalculatorService {
  constructor(private importService: ImportServiceService) {}

  public calculate(pokemons: Pokemon[], boss: Pokemon, date: Moment) {
    const attackers: DamageConfiguration[] = [];
    const tanks: TankCandidate[] = [];
    const healers: HealerCandidate[] = [];
    const onFielders: ComboDamageConfiguration[] = [];

    pokemons.forEach((pokemon) => {
      // On fielders
      const onFieldDamageConfigurations =
        this.createOnFieldDamageConfigurations(pokemon, boss, date);

      onFielders.push(...onFieldDamageConfigurations);

      // Attackers
      const pokemonDamageConfigurations = this.createDamageConfigurations(
        pokemon,
        boss,
        date
      );
      attackers.push(...pokemonDamageConfigurations);

      // Tanks
      const tankCandidate = this.candidateForTank(pokemon, boss, date);
      if (tankCandidate) {
        tanks.push(tankCandidate);
      }

      // Healers
      const healerCandidate = this.candidateForHealer(pokemon, boss, date);
      if (healerCandidate) {
        healers.push(healerCandidate);
      }
    });

    attackers.sort(this.sortAttackers);
    tanks.sort(this.sortTanks);
    healers.sort(this.sortHealers);
    onFielders.sort(this.sortComboDamageConfigurations);

    const result = {
      attackers: attackers,
      tanks: tanks,
      healers: healers,
    };

    console.log(result);
    console.log('On fielders:');
    console.log(onFielders);

    return result;
  }

  private createOnFieldDamageConfigurations(
    pokemon: Pokemon,
    boss: Pokemon,
    date: Moment
  ): ComboDamageConfiguration[] {
    // No DMax or GMax = we can't use this pokemon yet
    if (
      !pokemon.dynamaxDate.isBefore(date) &&
      !pokemon.gigantamaxDate.isBefore(date)
    ) {
      return [];
    }

    const faDamageConfigurations: DamageConfiguration[] = [];
    const caDamageConfigurations: DamageConfiguration[] = [];
    const attackerBaseStats = this.getPokemonBaseStats(pokemon);
    const defenderBaseStats = this.getPokemonBaseStats(boss);

    pokemon.fastAttacks.forEach((fastAttack) => {
      const damageConfiguration = {
        attacker: attackerBaseStats,
        defender: defenderBaseStats,
        move: fastAttack,
        typeEffectiveness: this.calculateTypeEffectiveness(
          fastAttack.type,
          boss
        ),
        stab: this.calculateStab(fastAttack.type, pokemon),
      } as DamageConfiguration;

      faDamageConfigurations.push(damageConfiguration);
    });

    pokemon.chargedAttacks.forEach((chargedAttack) => {
      const damageConfiguration = {
        attacker: attackerBaseStats,
        defender: defenderBaseStats,
        move: chargedAttack,
        typeEffectiveness: this.calculateTypeEffectiveness(
          chargedAttack.type,
          boss
        ),
        stab: this.calculateStab(chargedAttack.type, pokemon),
      } as DamageConfiguration;

      caDamageConfigurations.push(damageConfiguration);
    });

    faDamageConfigurations.forEach((damageConfiguration) => {
      this.calculateDamageConfiguration(damageConfiguration);
    });

    caDamageConfigurations.forEach((damageConfiguration) => {
      this.calculateDamageConfiguration(damageConfiguration);
    });

    const comboDamageConfigurations: ComboDamageConfiguration[] = [];

    faDamageConfigurations.forEach((faDamageConfiguration) => {
      caDamageConfigurations.forEach((caDamageConfiguration) => {
        const comboDamageConfiguration = this.calculateComboDamageConfiguration(
          faDamageConfiguration,
          caDamageConfiguration
        );

        comboDamageConfigurations.push(comboDamageConfiguration);
      });

      const faOnlyComboDamageConfiguration =
        this.calculateComboDamageConfiguration(faDamageConfiguration);
      comboDamageConfigurations.push(faOnlyComboDamageConfiguration);
    });

    comboDamageConfigurations.sort(this.sortComboDamageConfigurations);

    return comboDamageConfigurations;
  }

  private calculateDamageConfiguration(
    damageConfiguration: DamageConfiguration
  ) {
    damageConfiguration.damage = this.calculateDamage(damageConfiguration);
    // Damage per half a second (dphs)
    damageConfiguration.dphs =
      damageConfiguration.damage /
      (damageConfiguration.move.duration / TURN_DURATION);

    // Energy per half a second (ephs)
    // Each 0.5% HP of boss damage you deal is 1 Max Energy
    // First we calculate how much percent of damage we do
    const damagePercentage =
      (damageConfiguration.damage / damageConfiguration.defender.hp) * 100;
    // Then we multiply it by 2 to get amount of energy: 0.5%HP * 2 = 1 energy, 1%HP * 2 = 2 energy etc.
    // and we cut off the decimal place digits by using `Math.floor()`
    const maxEnergyCalculated = Math.floor(damagePercentage * 2);
    // And finally with `Math.max()` we pick whichever is higher between our energy calc or 1 energy,
    // because you can never generate less than 1 energy per attack
    damageConfiguration.maxEnergy = Math.max(maxEnergyCalculated, 1);
    // And now divide it by duration of the move
    damageConfiguration.mephs =
      damageConfiguration.maxEnergy /
      (damageConfiguration.move.duration / TURN_DURATION);
  }

  private calculateComboDamageConfiguration(
    faDamageConfiguration: DamageConfiguration,
    caDamageConfiguration?: DamageConfiguration
  ): ComboDamageConfiguration {
    // Case where we have FA only configuration
    if (!caDamageConfiguration) {
      return {
        pokemon: faDamageConfiguration.attacker.name,
        faName: faDamageConfiguration.move.name,
        faDmg: faDamageConfiguration.damage,
        faMaxEnergy: faDamageConfiguration.maxEnergy,
        faCount: 1,
        caName: '-',
        caDmg: 0,
        caMaxEnergy: 0,
        caCount: 0,
        totalMaxEnergy: faDamageConfiguration.maxEnergy,
        totalDmg: faDamageConfiguration.damage,
        totalDuration: faDamageConfiguration.move.duration,
        dphs: faDamageConfiguration.dphs,
        mephs: faDamageConfiguration.mephs,
      };
    }

    // First we need to find out how many FAs and CAs we should do to finish with 0 energy (full energy cycle)
    const comboCycleEnergy = this.lcm(
      faDamageConfiguration.move.energy,
      caDamageConfiguration.move.energy
    );
    const faCount = comboCycleEnergy / faDamageConfiguration.move.energy;
    const caCount = comboCycleEnergy / caDamageConfiguration.move.energy;

    const totalMaxEnergy =
      faCount * faDamageConfiguration.maxEnergy +
      caCount * caDamageConfiguration.maxEnergy;
    const totalDamage =
      faCount * faDamageConfiguration.damage +
      caCount * caDamageConfiguration.damage;
    const totalDuration =
      faCount * faDamageConfiguration.move.duration +
      caCount * caDamageConfiguration.move.duration;
    const totalTurns = totalDuration / TURN_DURATION;
    const mephs = totalMaxEnergy / totalTurns;
    const dphs = totalDamage / totalTurns;

    return {
      pokemon: faDamageConfiguration.attacker.name,
      faName: faDamageConfiguration.move.name,
      faDmg: faDamageConfiguration.damage,
      faMaxEnergy: faDamageConfiguration.maxEnergy,
      faCount: faCount,
      caName: caDamageConfiguration.move.name,
      caDmg: caDamageConfiguration.damage,
      caMaxEnergy: caDamageConfiguration.maxEnergy,
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

  private sortComboDamageConfigurations(
    a: ComboDamageConfiguration,
    b: ComboDamageConfiguration
  ) {
    const mephsCompare = b.mephs - a.mephs;
    // const mephsCompare = 0;

    if (mephsCompare == 0) {
      return b.dphs - a.dphs;
    }

    return mephsCompare;
  }

  private createDamageConfigurations(
    pokemon: Pokemon,
    boss: Pokemon,
    date: Moment
  ) {
    const damageConfigurations: DamageConfiguration[] = [];
    const attackerBaseStats = this.getPokemonBaseStats(pokemon);
    const defenderBaseStats = this.getPokemonBaseStats(boss);

    if (pokemon.gigantamaxDate.isBefore(date)) {
      const gigantamaxDamageConfiguration = {
        attacker: attackerBaseStats,
        defender: defenderBaseStats,
        move: {
          name: 'G-' + pokemon.gigantamaxType,
          type: pokemon.gigantamaxType,
          power: 450,
          energy: 0,
          duration: 0,
        },
        typeEffectiveness: this.calculateTypeEffectiveness(
          pokemon.gigantamaxType,
          boss
        ),
        stab: this.calculateStab(pokemon.gigantamaxType, pokemon),
      } as DamageConfiguration;

      damageConfigurations.push(gigantamaxDamageConfiguration);
    }

    if (pokemon.dynamaxDate.isBefore(date)) {
      pokemon.fastAttacks.forEach((fastAttack) => {
        const dynamaxDamageConfiguration = {
          attacker: attackerBaseStats,
          defender: defenderBaseStats,
          move: {
            name: fastAttack.name,
            type: fastAttack.type,
            power: 350,
            energy: 0,
            duration: 0,
          },
          typeEffectiveness: this.calculateTypeEffectiveness(
            fastAttack.type,
            boss
          ),
          stab: this.calculateStab(fastAttack.type, pokemon),
        } as DamageConfiguration;

        damageConfigurations.push(dynamaxDamageConfiguration);
      });
    }

    damageConfigurations.forEach((damageConfiguration) => {
      damageConfiguration.damage = this.calculateDamage(damageConfiguration);
    });

    return damageConfigurations;
  }

  private candidateForTank(pokemon: Pokemon, boss: Pokemon, date: Moment) {
    // No DMax or GMax = we can't use this pokemon yet
    if (
      !pokemon.dynamaxDate.isBefore(date) &&
      !pokemon.gigantamaxDate.isBefore(date)
    ) {
      return;
    }

    // Do not even do calcs for tanks without 0.5s fast attacks..
    if (!pokemon.hasHalfSecondAttack) {
      return;
    }

    const tankDamageConfigurations = this.createBossDamageConfigurations(
      boss,
      pokemon
    );

    // We do not want our tank to get one-shotted, right? Reject them
    // if (isOneShotted(tankDamageConfigurations)) {
    // 	return;
    // }

    tankDamageConfigurations.sort((a, b) => a.damage - b.damage);

    const avgDamage =
      tankDamageConfigurations.reduce((a, b) => a + b.damage, 0) /
      tankDamageConfigurations.length;
    // const worstCaseAvgDamage =
    //   (tankDamageConfigurations[tankDamageConfigurations.length - 1].damage +
    //     tankDamageConfigurations[tankDamageConfigurations.length - 2].damage) /
    //   2;
    // const bestCaseAvgDamage =
    //   (tankDamageConfigurations[0].damage +
    //     tankDamageConfigurations[1].damage) /
    //   2;

    const tankCandidate = {
      name: pokemon.name,
      pokedexNumber: pokemon.pokedexNumber,
      primaryType: pokemon.primaryType,
      secondaryType: pokemon.secondaryType,
      def: pokemon.def,
      hp: pokemon.hp,
      attacker: this.getPokemonBaseStats(boss),
      avgDamage: avgDamage,
      avgDamagePercentage: (avgDamage / pokemon.hp) * 100,
      damageDetails: [
        ...tankDamageConfigurations.map((configuration) => {
          return {
            power: configuration.move.power,
            move: configuration.move.name,
            moveType: configuration.move.type,
            typeEffectiveness: configuration.typeEffectiveness,
            stab: configuration.stab,
            damage: configuration.damage,
            damagePercentage: configuration.damagePercentage,
          } as DamageDetails;
        }),
      ],
    } as TankCandidate;

    return tankCandidate;
  }

  private candidateForHealer(pokemon: Pokemon, boss: Pokemon, date: Moment) {
    // No DMax or GMax = we can't use this pokemon yet
    if (
      !pokemon.dynamaxDate.isBefore(date) &&
      !pokemon.gigantamaxDate.isBefore(date)
    ) {
      return;
    }

    // Do not even do calcs for healers without 0.5s fast attacks..
    if (!pokemon.hasHalfSecondAttack) {
      return;
    }

    const healersDamageConfigurations = this.createBossDamageConfigurations(
      boss,
      pokemon
    );
    healersDamageConfigurations.forEach((configuration) => {
      configuration.unhealedDamagePercentage = Math.max(
        configuration.damagePercentage - 48,
        0
      );
    });

    // We do not want our healer to get one-shotted, right? Reject them
    // if (isOneShotted(healersDamageConfigurations)) {
    // 	return;
    // }

    healersDamageConfigurations.sort(
      (a, b) => a.damagePercentage - b.damagePercentage
    );

    const heal = pokemon.hp * 0.48;

    return {
      name: pokemon.name,
      pokedexNumber: pokemon.pokedexNumber,
      primaryType: pokemon.primaryType,
      secondaryType: pokemon.secondaryType,
      def: pokemon.def,
      hp: pokemon.hp,
      heal: heal,
      totalUnhealedDamagePercentage: healersDamageConfigurations.reduce(
        (a, b) => a + b.unhealedDamagePercentage,
        0
      ),
      damageDetails: [
        ...healersDamageConfigurations.map((configuration) => {
          return {
            power: configuration.move.power,
            move: configuration.move.name,
            moveType: configuration.move.type,
            typeEffectiveness: configuration.typeEffectiveness,
            stab: configuration.stab,
            damage: configuration.damage,
            damagePercentage: configuration.damagePercentage,
            unhealedDamagePercentage: configuration.unhealedDamagePercentage,
          } as DamageDetails;
        }),
      ],
    } as HealerCandidate;
  }

  private createBossDamageConfigurations(boss: Pokemon, pokemon: Pokemon) {
    const damageConfigurations: DamageConfiguration[] = [];
    const attackerBaseStats = this.getPokemonBaseStats(boss);
    const defenderBaseStats = this.getPokemonBaseStats(pokemon);

    boss.chargedAttacks.forEach((attack) => {
      const damageConfiguration = {
        attacker: attackerBaseStats,
        defender: defenderBaseStats,
        move: {
          name: attack.name,
          type: attack.type,
          power: attack.power,
          energy: 0,
          duration: 0,
        },
        typeEffectiveness: this.calculateTypeEffectiveness(
          attack.type,
          pokemon
        ),
        stab: this.calculateStab(attack.type, boss),
      } as DamageConfiguration;

      damageConfigurations.push(damageConfiguration);
    });

    damageConfigurations.forEach((configuration) => {
      configuration.damage = this.calculateDamage(configuration);
      configuration.damagePercentage =
        this.calculateDamagePercentage(configuration);
    });

    return damageConfigurations;
  }

  private getPokemonBaseStats(pokemon: Pokemon): PokemonBaseStats {
    return {
      name: pokemon.name,
      atk: pokemon.atk,
      def: pokemon.def,
      hp: pokemon.hp,
    };
  }

  private calculateTypeEffectiveness(type: Type, defendingPokemon: Pokemon) {
    const defendingTypeEffectiveness = this.importService.typesMap.get(type);

    if (!defendingTypeEffectiveness) {
      throw new Error(`Type ${type} not found in type effectiveness map!`);
    }

    return (
      defendingTypeEffectiveness[defendingPokemon.primaryType] *
      (defendingTypeEffectiveness[defendingPokemon.secondaryType] ?? 1)
    );
  }

  private calculateStab(type: Type, pokemon: Pokemon) {
    return type === pokemon.primaryType || type === pokemon.secondaryType
      ? 1.2
      : 1;
  }

  private calculateDamage(damageConfiguration: DamageConfiguration) {
    const weather = 1;
    const friendship = 1;
    const dodged = 1;
    const mega = 1;
    const trainer = 1;
    const charged = 1;

    return (
      Math.floor(
        0.5 *
          damageConfiguration.move.power *
          (damageConfiguration.attacker.atk /
            damageConfiguration.defender.def) *
          damageConfiguration.typeEffectiveness *
          damageConfiguration.stab *
          weather *
          friendship *
          dodged *
          mega *
          trainer *
          charged
      ) + 1
    );
  }

  private calculateDamagePercentage(damageConfiguration: DamageConfiguration) {
    return (damageConfiguration.damage / damageConfiguration.defender.hp) * 100;
  }

  private sortAttackers(a: DamageConfiguration, b: DamageConfiguration) {
    return b.damage - a.damage;
  }

  private sortTanks(a: TankCandidate, b: TankCandidate) {
    return a.avgDamage - b.avgDamage;
  }

  private sortHealers(a: HealerCandidate, b: HealerCandidate) {
    const totalUnhealedDamagePercentageDiff =
      a.totalUnhealedDamagePercentage - b.totalUnhealedDamagePercentage;

    if (totalUnhealedDamagePercentageDiff == 0) {
      return b.heal - a.heal;
    }

    return a.totalUnhealedDamagePercentage - b.totalUnhealedDamagePercentage;
  }
}

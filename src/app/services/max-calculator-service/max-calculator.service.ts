import { Injectable } from '@angular/core';
import {
  Pokemon,
  PokemonBaseStats,
  DamageConfiguration,
  Type,
  DamageDetails,
  TankCandidate,
  HealerCandidate,
} from '../../types/types';
import { ImportServiceService } from '../import-service/import-service.service';
import { Moment } from 'moment';

@Injectable({
  providedIn: 'root',
})
export class MaxCalculatorService {
  constructor(private importService: ImportServiceService) {}

  public calculate(pokemons: Pokemon[], boss: Pokemon, date: Moment) {
    const attackers: DamageConfiguration[] = [];
    const tanks: TankCandidate[] = [];
    const healers: HealerCandidate[] = [];

    pokemons.forEach((pokemon) => {
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

    const result = {
      attackers: attackers,
      tanks: tanks,
      healers: healers,
    };

    console.log(result);

    return result;
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
        power: 450,
        move: 'G-' + pokemon.gigantamaxType,
        moveType: pokemon.gigantamaxType,
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
          power: 350,
          move: fastAttack.name,
          moveType: fastAttack.type,
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
            power: configuration.power,
            move: configuration.move,
            moveType: configuration.moveType,
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
            power: configuration.power,
            move: configuration.move,
            moveType: configuration.moveType,
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
        power: attack.power,
        move: attack.name,
        moveType: attack.type,
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
          damageConfiguration.power *
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

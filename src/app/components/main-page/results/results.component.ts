import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { DMAX, MaxCalculatorService } from '../../../services/max-calculator-service/max-calculator.service';
import { MatTabsModule } from '@angular/material/tabs';
import { BattleConfiguration, Candidate, Pokemon } from '../../../types/types';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { Observable, Subscription } from 'rxjs';
import { PokemonCardComponent, PokemonCardTypeEnum } from '../../shared/cards/pokemon-card/pokemon-card.component';
import { OpponentCardComponent } from '../../shared/cards/opponent-card/opponent-card.component';
import { sortAttackers, sortHealers, sortTanks } from '../../../util/sorting.util';
import { ImportServiceService } from '../../../services/import-service/import-service.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss',
  imports: [MatTabsModule, MatPaginatorModule, MatTableModule, PokemonCardComponent, OpponentCardComponent],
})
export class ResultsComponent implements OnInit, OnDestroy {
  private maxCalculatorService = inject(MaxCalculatorService);
  private importService = inject(ImportServiceService);
  private subscriptions = new Subscription();

  @Input() battleConfiguration!: Observable<BattleConfiguration>;

  opponent: Pokemon | undefined = undefined;
  candidates: Candidate[] = [];
  attackers: Candidate[] = [];
  tanks: Candidate[] = [];
  sponges: Candidate[] = [];
  healers: Candidate[] = [];

  readonly PokemonCardTypeEnum = PokemonCardTypeEnum;

  ngOnInit(): void {
    this.subscriptions.add(this.battleConfiguration.subscribe(battleConfiguration => this.simulateBattle(battleConfiguration)));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  simulateBattle(config: BattleConfiguration): void {
    this.candidates = this.maxCalculatorService.simulateBattle(config);
    this.attackers = this.processAttackers(this.candidates);
    this.tanks = this.processTanks([...this.candidates.filter(candidate => candidate.hasHalfSecondAttack)]);
    this.sponges = this.processTanks([...this.candidates]);
    this.healers = [...this.candidates.filter(candidate => candidate.hasHalfSecondAttack)].sort(sortHealers);

    this.opponent = this.importService.getOpponent(config);
  }

  processAttackers(candidates: Candidate[]): Candidate[] {
    const attackers: Candidate[] = this.groupAttackers(candidates).sort(sortAttackers);

    // Calculate score compared to top performing attacker
    const topAttacker = attackers[0];
    attackers.forEach(
      attacker => (attacker.performanceScore = (attacker.maxPhaseDamageDetails[0].damage / topAttacker.maxPhaseDamageDetails[0].damage) * 100)
    );

    return attackers;
  }

  groupAttackers(candidates: Candidate[]): Candidate[] {
    const attackers: Candidate[] = [];
    candidates.forEach(candidate => {
      const attackerByMaxAttackMap = new Map<string, Candidate>();

      candidate.maxPhaseDamageDetails.forEach(maxPhaseDamageDetails => {
        const attackerPerMaxAttack = { ...candidate, maxPhaseDamageDetails: [maxPhaseDamageDetails] };

        // For normal Dynamax Pokemon we list only fast attacks matching the type of max phase attack
        if (maxPhaseDamageDetails.move.special === DMAX && !candidate.dynamaxType) {
          attackerPerMaxAttack.fastAttackDamageDetails = attackerPerMaxAttack.fastAttackDamageDetails.filter(
            damageDetails => damageDetails.move.type === maxPhaseDamageDetails.move.type
          );
        }

        attackerByMaxAttackMap.set(maxPhaseDamageDetails.move.name, attackerPerMaxAttack);
      });

      attackers.push(...Array.from(attackerByMaxAttackMap.values()));
    });

    return attackers;
  }

  processTanks(candidates: Candidate[]): Candidate[] {
    const tanks: Candidate[] = [];
    candidates.sort(sortTanks);

    // Calculate score compared to top performing tank
    const topTank = candidates[0];
    candidates.forEach(tank => {
      // We gotta shallow copy the tank to not have the performance score on original candidates
      tanks.push({
        ...tank,
        performanceScore: (topTank.avgDamageTaken / tank.avgDamageTaken) * 100,
      });
    });

    return tanks;
  }
}

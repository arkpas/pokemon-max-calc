import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { DMAX, MaxCalculatorService } from '../../../services/max-calculator-service/max-calculator.service';
import { MatTabsModule } from '@angular/material/tabs';
import { BattleConfiguration, Candidate, Pokemon } from '../../../types/types';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { PokemonCardComponent, PokemonCardTypeEnum } from '../../shared/cards/pokemon-card/pokemon-card.component';
import { OpponentCardComponent } from '../../shared/cards/opponent-card/opponent-card.component';
import { sortAttackers, sortHealers, sortTanks } from '../../../util/sorting.util';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss',
  imports: [MatTabsModule, MatPaginatorModule, MatTableModule, PokemonCardComponent, CommonModule, OpponentCardComponent],
})
export class ResultsComponent implements OnInit, OnDestroy {
  private maxCalculatorService = inject(MaxCalculatorService);
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
    this.attackers = this.groupAttackers(this.candidates).sort(sortAttackers);
    this.tanks = [...this.candidates.filter(candidate => candidate.hasHalfSecondAttack)].sort(sortTanks);
    this.sponges = [...this.candidates].sort(sortTanks);
    this.healers = [...this.candidates.filter(candidate => candidate.hasHalfSecondAttack)].sort(sortHealers);

    console.log(this.attackers);
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
}

import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { MaxCalculatorService } from '../../../services/max-calculator-service/max-calculator.service';
import { MatTabsModule } from '@angular/material/tabs';
import { BattleConfiguration, DamageConfiguration, HealerCandidate, Pokemon, TankCandidate } from '../../../types/types';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { PokemonCardComponent } from '../../shared/cards/pokemon-card/pokemon-card.component';
import { OpponentCardComponent } from '../../shared/cards/opponent-card/opponent-card.component';

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
  attackers: DamageConfiguration[] = [];
  attackersColumns: string[] = ['name', 'move', 'power', 'damage'];
  tanks: TankCandidate[] = [];
  sponges: TankCandidate[] = [];
  healers: HealerCandidate[] = [];

  ngOnInit(): void {
    this.subscriptions.add(this.battleConfiguration.subscribe(battleConfiguration => this.simulateBattle(battleConfiguration)));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  simulateBattle(config: BattleConfiguration): void {
    const simulationResults = this.maxCalculatorService.simulateBattle(config);

    this.opponent = simulationResults.opponent;
    this.attackers = simulationResults.attackers;
    this.tanks = simulationResults.tanks;
    this.sponges = simulationResults.sponges;
    this.healers = simulationResults.healers;
  }
}

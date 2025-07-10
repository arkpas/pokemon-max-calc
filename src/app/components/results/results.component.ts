import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { MaxCalculatorService } from '../../services/max-calculator-service/max-calculator.service';
import { ImportServiceService } from '../../services/import-service/import-service.service';
import { MatTabsModule } from '@angular/material/tabs';
import { BattleConfiguration, DamageConfiguration, HealerCandidate, TankCandidate } from '../../types/types';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { PokemonCardComponent } from './pokemon-card/pokemon-card.component';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss',
  imports: [MatTabsModule, MatPaginatorModule, MatTableModule, PokemonCardComponent, CommonModule],
})
export class ResultsComponent implements OnInit, OnDestroy {
  private importService = inject(ImportServiceService);
  private maxCalculatorService = inject(MaxCalculatorService);
  private subscriptions = new Subscription();

  @Input() battleConfiguration!: Observable<BattleConfiguration>;

  attackers: DamageConfiguration[] = [];
  attackersColumns: string[] = ['name', 'move', 'power', 'damage'];
  tanks: TankCandidate[] = [];
  healers: HealerCandidate[] = [];

  ngOnInit(): void {
    this.subscriptions.add(this.battleConfiguration.subscribe(battleConfiguration => this.simulateBattle(battleConfiguration)));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  simulateBattle(config: BattleConfiguration): void {
    // Get all Pokemons from service and our opponent - we do it every time for each simulation,
    // because we override stats based on battle config
    const allies = this.importService.getPokemons();
    const opponent = this.importService.findPokemon(config.opponentName);

    // Calculate final stats for the opponent
    const opponentAtkIV = 15;
    const opponentDefIV = 15;

    opponent.atk = (opponent.atk + opponentAtkIV) * config.opponentCpm * config.opponentAtkMod;
    opponent.def = (opponent.def + opponentDefIV) * config.opponentCpm * config.opponentDefMod;

    // Calculate final stats for allies
    allies.forEach(ally => {
      ally.atk = (ally.atk + config.allyAtkIV) * config.allyCpm;
      ally.def = (ally.def + config.allyDefIV) * config.allyCpm;
      ally.hp = Math.floor((ally.hp + config.allyHpIV) * config.allyCpm);
    });

    // Run the simulation
    const result = this.maxCalculatorService.calculate(allies, opponent, config.date);

    this.attackers = result.attackers;
    this.tanks = result.tanks;
    this.healers = result.healers;
  }
}

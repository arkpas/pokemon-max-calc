import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Pokemon } from '../../../types/types';
import { PokemonCardComponent } from '../../shared/cards/pokemon-card/pokemon-card.component';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-results',
  imports: [PokemonCardComponent, CommonModule],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss',
})
export class ResultsComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();

  @Input() myPokemons$!: Observable<Pokemon[]>;
  myPokemons: Pokemon[] = [];

  constructor() {
    console.log(this.myPokemons$);
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.myPokemons$.subscribe(value => {
        this.myPokemons = value;
        console.log(value);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

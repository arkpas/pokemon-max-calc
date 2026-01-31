import { Component, OnInit, inject } from '@angular/core';
import { Pokemon } from '../../../types/types';

import { MyPokemonService } from '../../../services/my-pokemon-service/my-pokemon.service';
import { MyPokemonCardComponent } from '../../shared/cards/my-pokemon-card/my-pokemon-card.component';

@Component({
  selector: 'app-results',
  imports: [MyPokemonCardComponent],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss',
})
export class ResultsComponent implements OnInit {
  private myPokemonService = inject(MyPokemonService);
  myPokemons: Pokemon[] = [];

  ngOnInit(): void {
    this.refreshMyPokemons();
  }

  refreshMyPokemons() {
    this.myPokemons = this.myPokemonService.getMyPokemons();
  }
}

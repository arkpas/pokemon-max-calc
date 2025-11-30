import { Component, OnInit, inject } from '@angular/core';
import { Pokemon } from '../../../types/types';
import { PokemonCardComponent } from '../../shared/cards/pokemon-card/pokemon-card.component';
import { CommonModule } from '@angular/common';
import { MyPokemonService } from '../../../services/my-pokemon-service/my-pokemon.service';

@Component({
  selector: 'app-results',
  imports: [PokemonCardComponent, CommonModule],
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

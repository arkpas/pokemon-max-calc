import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { MyPokemon, Pokemon } from '../../../types/types';

import { MyPokemonService } from '../../../services/my-pokemon-service/my-pokemon.service';
import { MyPokemonCardComponent } from '../../shared/cards/my-pokemon-card/my-pokemon-card.component';

@Component({
  selector: 'app-results',
  imports: [MyPokemonCardComponent],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss',
})
export class ResultsComponent implements OnInit {
  @Output() myPokemonEdit = new EventEmitter<MyPokemon>();

  private myPokemonService = inject(MyPokemonService);
  myPokemons: Pokemon[] = [];

  ngOnInit(): void {
    this.refreshMyPokemons();
  }

  refreshMyPokemons() {
    this.myPokemons = this.myPokemonService.getMyPokemons();
  }

  editMyPokemon(id: string) {
    const myPokemon = this.myPokemonService.getMyPokemon(id);

    if (!myPokemon) {
      console.error(`My Pokemon with id ${id} was not found!`);
      return;
    }

    this.myPokemonEdit.emit(myPokemon);
  }
}

import { Component, ViewChild } from '@angular/core';
import { MenuComponent } from './menu/menu.component';
import { ResultsComponent } from './results/results.component';
import { MyPokemon } from '../../types/types';

@Component({
  selector: 'app-my-pokemon',
  imports: [MenuComponent, ResultsComponent],
  templateUrl: './my-pokemon.component.html',
  styleUrl: './my-pokemon.component.scss',
})
export class MyPokemonComponent {
  @ViewChild(ResultsComponent)
  resultsComponent!: ResultsComponent;

  @ViewChild(MenuComponent)
  menuComponent!: MenuComponent;

  refreshMyPokemons() {
    this.resultsComponent.refreshMyPokemons();
  }

  editMyPokemon(myPokemon: MyPokemon) {
    this.menuComponent.editMyPokemon(myPokemon);
  }
}

import { Component, ViewChild } from '@angular/core';
import { MenuComponent } from './menu/menu.component';
import { ResultsComponent } from './results/results.component';

@Component({
  selector: 'app-my-pokemon',
  imports: [MenuComponent, ResultsComponent],
  templateUrl: './my-pokemon.component.html',
  styleUrl: './my-pokemon.component.scss',
})
export class MyPokemonComponent {
  @ViewChild(ResultsComponent)
  resultsComponent!: ResultsComponent;

  refreshMyPokemons() {
    this.resultsComponent.refreshMyPokemons();
  }
}

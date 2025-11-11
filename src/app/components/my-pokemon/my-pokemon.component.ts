import { Component, inject, AfterContentChecked } from '@angular/core';
import { MenuComponent } from './menu/menu.component';
import { ResultsComponent } from './results/results.component';
import { MyPokemonService } from '../../services/my-pokemon.service';
import { Subject } from 'rxjs';
import { Pokemon } from '../../types/types';

@Component({
  selector: 'app-my-pokemon',
  imports: [MenuComponent, ResultsComponent],
  templateUrl: './my-pokemon.component.html',
  styleUrl: './my-pokemon.component.scss',
})
export class MyPokemonComponent implements AfterContentChecked {
  private myPokemonService = inject(MyPokemonService);

  private myPokemonsSubject = new Subject<Pokemon[]>();
  myPokemons$ = this.myPokemonsSubject.asObservable();

  ngAfterContentChecked() {
    this.refreshMyPokemons();
  }

  refreshMyPokemons() {
    this.myPokemonsSubject.next(this.myPokemonService.getMyPokemons());
  }
}

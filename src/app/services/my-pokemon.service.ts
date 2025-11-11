import { inject, Injectable } from '@angular/core';
import { MyPokemon, Pokemon } from '../types/types';
import { ImportServiceService } from './import-service/import-service.service';

@Injectable({
  providedIn: 'root',
})
export class MyPokemonService {
  private importService = inject(ImportServiceService);
  private myPokemonKey = 'my-pokemon';
  private myPokemon: MyPokemon[] = [];

  constructor() {
    const storedPokemons = localStorage.getItem('my-pokemon');

    if (storedPokemons) {
      this.myPokemon = JSON.parse(storedPokemons);
    }
  }

  getMyPokemons(): Pokemon[] {
    return this.importService.getPokemonsForMyPokemons(this.myPokemon);
  }

  addMyPokemon(pokemon: MyPokemon): void {
    pokemon.id = crypto.randomUUID();
    this.myPokemon.push(pokemon);
    localStorage.setItem(this.myPokemonKey, JSON.stringify(this.myPokemon));
  }
}

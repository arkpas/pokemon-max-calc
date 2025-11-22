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
    const storedPokemons = localStorage.getItem(this.myPokemonKey);

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

  removeMyPokemon(id: string): void {
    this.myPokemon = this.myPokemon.filter(pokemon => pokemon.id != id);
    localStorage.setItem(this.myPokemonKey, JSON.stringify(this.myPokemon));
  }
}

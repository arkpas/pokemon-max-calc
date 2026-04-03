import { inject, Injectable } from '@angular/core';
import { MyPokemon, Pokemon } from '../../types/types';
import { ImportServiceService } from '../import-service/import-service.service';

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

  getMyPokemon(id: string): MyPokemon | undefined {
    return this.myPokemon.find(pokemon => pokemon.id == id);
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

  editMyPokemon(myPokemon: MyPokemon): void {
    const myPokemonIndex = this.myPokemon.findIndex(pokemon => pokemon.id == myPokemon.id);
    if (myPokemonIndex < 0) {
      console.error(`My Pokemon with id ${myPokemon.id} was not found!`);
      return;
    }

    this.myPokemon.splice(myPokemonIndex, 1, myPokemon);
    localStorage.setItem(this.myPokemonKey, JSON.stringify(this.myPokemon));
  }
}

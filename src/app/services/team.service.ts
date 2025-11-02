import { inject, Injectable } from '@angular/core';
import { MyPokemon, Pokemon } from '../types/types';
import { ImportServiceService } from './import-service/import-service.service';

const sampleData: MyPokemon[] = [
  {
    name: 'Zacian Crowned Sword',
    allyCpm: 0.8078,
    allyAtkIV: 13,
    allyDefIV: 11,
    allyHpIV: 12,
  },
];

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private importService = inject(ImportServiceService);

  getMyPokemons(): Pokemon[] {
    return this.importService.getPokemonsForMyPokemons(sampleData);
  }
}

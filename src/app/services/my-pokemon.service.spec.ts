import { TestBed } from '@angular/core/testing';

import { MyPokemonService } from './my-pokemon.service';

describe('TeamService', () => {
  let service: MyPokemonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyPokemonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { ImportServiceService } from '../../services/import-service/import-service.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MyPokemonService } from '../../services/my-pokemon.service';
import { POKEMON_CPMS } from '../../constants/cpm.constants';
import { map, Observable } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';
import { pokemonLevelValidator } from '../../validators/pokemonLevel.directive';

@Component({
  selector: 'app-my-pokemon',
  imports: [MatButtonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatAutocompleteModule, CommonModule],
  templateUrl: './my-pokemon.component.html',
  styleUrl: './my-pokemon.component.scss',
})
export class MyPokemonComponent {
  private router = inject(Router);
  private importService = inject(ImportServiceService);
  private myPokemonService = inject(MyPokemonService);
  private formBuilder = inject(FormBuilder);

  myPokemonForm = this.formBuilder.group({
    pokemon: ['', Validators.required],
    level: [1, [Validators.required, pokemonLevelValidator()]],
    atkIV: [0, Validators.required],
    defIV: [0, Validators.required],
    hpIV: [0, Validators.required],
  });

  pokemonOptions: string[] = [];
  filteredPokemonOptions: Observable<string[]>;

  constructor() {
    // Pokemon names
    this.pokemonOptions = this.importService.getPokemonNames();
    this.filteredPokemonOptions = this.myPokemonForm.controls.pokemon.valueChanges.pipe(
      map(name => (name ? this.filterPokemonNames(name) : this.pokemonOptions.slice()))
    );
  }

  filterPokemonNames(name: string): string[] {
    const filterValue = name.toLowerCase();
    return this.pokemonOptions.filter(o => o.toLowerCase().includes(filterValue));
  }

  submit(): void {
    if (!this.myPokemonForm.valid) {
      return;
    }

    const cpm = POKEMON_CPMS.find(cpmObject => cpmObject.level === this.myPokemonForm.controls.level.value!);

    if (!cpm) {
      throw new Error(`Unable to find CPM for level: [${this.myPokemonForm.controls.level.value}]`);
    }

    this.myPokemonService.addMyPokemon({
      name: this.myPokemonForm.controls.pokemon.value!,
      allyCpm: cpm.value,
      allyAtkIV: this.myPokemonForm.controls.atkIV.value!,
      allyDefIV: this.myPokemonForm.controls.defIV.value!,
      allyHpIV: this.myPokemonForm.controls.hpIV.value!,
    });
  }

  navigateToMain(): void {
    this.router.navigateByUrl('/');
  }
}

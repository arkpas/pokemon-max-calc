import { Component, ElementRef, EventEmitter, inject, Output, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { ImportServiceService } from '../../../services/import-service/import-service.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MyPokemonService } from '../../../services/my-pokemon-service/my-pokemon.service';
import { POKEMON_CPMS } from '../../../constants/cpm.constants';
import { map, Observable } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';
import { pokemonLevelValidator } from '../../../validators/pokemonLevel.directive';
import { MtxSelectModule } from '@ng-matero/extensions/select';

@Component({
  selector: 'app-menu',
  imports: [
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    CommonModule,
    MtxSelectModule,
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {
  private router = inject(Router);
  private importService = inject(ImportServiceService);
  private myPokemonService = inject(MyPokemonService);
  private formBuilder = inject(FormBuilder);

  @Output() myPokemonAddedEvent = new EventEmitter<boolean>();

  myPokemonForm = this.formBuilder.group({
    pokemon: ['', Validators.required],
    level: [1, [Validators.required, pokemonLevelValidator()]],
    atkIV: [0, Validators.required],
    defIV: [0, Validators.required],
    hpIV: [0, Validators.required],
  });

  pokemonOptions: string[] = [];
  filteredPokemonOptions: Observable<string[]>;
  isCollapsed = true;

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

  collapseForm(): void {
    this.isCollapsed = true;
  }

  showForm(): void {
    this.isCollapsed = false;
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
      id: '',
      name: this.myPokemonForm.controls.pokemon.value!,
      cpm: cpm.value,
      atkIV: this.myPokemonForm.controls.atkIV.value!,
      defIV: this.myPokemonForm.controls.defIV.value!,
      hpIV: this.myPokemonForm.controls.hpIV.value!,
    });

    this.resetForm();
    this.myPokemonAddedEvent.emit(true);
  }

  resetForm() {
    this.myPokemonForm.controls.pokemon.setValue('');
    this.myPokemonForm.controls.pokemon.setErrors(null);
    this.myPokemonForm.controls.level.setValue(1);
    this.myPokemonForm.controls.atkIV.setValue(0);
    this.myPokemonForm.controls.defIV.setValue(0);
    this.myPokemonForm.controls.hpIV.setValue(0);
  }

  navigateToMain(): void {
    this.router.navigateByUrl('/');
  }
}

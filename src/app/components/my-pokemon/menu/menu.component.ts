import { Component, EventEmitter, inject, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { ImportServiceService } from '../../../services/import-service/import-service.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MyPokemonService } from '../../../services/my-pokemon-service/my-pokemon.service';
import { Cpm, POKEMON_CPMS } from '../../../constants/cpm.constants';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';
import { MtxSelectModule } from '@ng-matero/extensions/select';
import { MyPokemon } from '../../../types/types';

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

  private static DEFAULT_CPM: number = 0.7903;
  private static DEFAULT_ATK_IV: number = 10;
  private static DEFAULT_DEF_IV: number = 10;
  private static DEFAULT_HP_IV: number = 10;

  @Output() myPokemonAddedEvent = new EventEmitter<boolean>();

  myPokemonForm = this.formBuilder.group({
    id: [''],
    pokemon: ['', Validators.required],
    cpm: [MenuComponent.DEFAULT_CPM, [Validators.required]],
    atkIV: [MenuComponent.DEFAULT_ATK_IV, Validators.required],
    defIV: [MenuComponent.DEFAULT_DEF_IV, Validators.required],
    hpIV: [MenuComponent.DEFAULT_HP_IV, Validators.required],
  });

  pokemonOptions: string[] = [];
  pokemonCpms: Cpm[] = POKEMON_CPMS;
  isCollapsed = true;

  constructor() {
    // Pokemon names
    this.pokemonOptions = this.importService.getPokemonNames();
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

    this.myPokemonService.addMyPokemon({
      id: this.myPokemonForm.controls.id.value!,
      name: this.myPokemonForm.controls.pokemon.value!,
      cpm: this.myPokemonForm.controls.cpm.value!,
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
    this.myPokemonForm.controls.cpm.setValue(MenuComponent.DEFAULT_CPM);
    this.myPokemonForm.controls.atkIV.setValue(MenuComponent.DEFAULT_ATK_IV);
    this.myPokemonForm.controls.defIV.setValue(MenuComponent.DEFAULT_DEF_IV);
    this.myPokemonForm.controls.hpIV.setValue(MenuComponent.DEFAULT_HP_IV);
  }

  editMyPokemon(myPokemon: MyPokemon) {
    this.myPokemonForm.controls.pokemon.setValue(myPokemon.id);
    this.myPokemonForm.controls.pokemon.setErrors(null);
    this.myPokemonForm.controls.cpm.setValue(myPokemon.cpm);
    this.myPokemonForm.controls.atkIV.setValue(myPokemon.atkIV);
    this.myPokemonForm.controls.defIV.setValue(myPokemon.defIV);
    this.myPokemonForm.controls.hpIV.setValue(myPokemon.hpIV);
  }

  navigateToMain(): void {
    this.router.navigateByUrl('/');
  }
}

import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ImportServiceService } from '../../services/import-service/import-service.service';
import { Cpm, CPMS, POKEMON_CPMS } from '../../constants/cpm.constants';
import { first, map, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { BattleConfiguration } from '../../types/types';
import moment from 'moment';
import { CONFIGURATIONS } from '../../constants/configurations.costants';

@Component({
  selector: 'app-menu',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatAutocompleteModule, MatDatepickerModule, CommonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {
  private importService = inject(ImportServiceService);
  private formBuilder = inject(FormBuilder);

  @Output() configurationSubmitEvent = new EventEmitter<BattleConfiguration>();

  isCollapsed = false;
  isSubmittedAtLeastOnce = false;

  battleConfigurationForm = this.formBuilder.group({
    // TODO: validate if opponent with that name exists
    opponentName: ['', Validators.required],
    // TODO: validate if number
    opponentCpm: [0, Validators.required],
    opponentHp: [0, Validators.required],
    opponentAtkMod: [1, Validators.required],
    opponentDefMod: [1, Validators.required],
    date: [new Date(), Validators.required],
    // TODO: validate if number
    allyCpm: [0.7903, Validators.required],
    allyAtkIV: [15, Validators.required],
    allyDefIV: [15, Validators.required],
    allyHpIV: [15, Validators.required],
  });

  pokemonOptions: string[] = [];
  cpms: Cpm[] = CPMS;
  pokemonCpms: Cpm[] = POKEMON_CPMS;
  filteredPokemonOptions: Observable<string[]>;
  filteredCpms: Observable<Cpm[]>;
  filteredPokemonCpms: Observable<Cpm[]>;

  constructor() {
    // Pokemon names
    this.pokemonOptions = this.importService.getPokemons().map(pokemon => pokemon.name);
    this.filteredPokemonOptions = this.battleConfigurationForm.controls.opponentName.valueChanges.pipe(
      map(name => (name ? this.filterPokemonNames(name) : this.pokemonOptions.slice()))
    );
    // Opponent CPMs
    this.filteredCpms = this.battleConfigurationForm.controls.opponentCpm.valueChanges.pipe(
      map(cpm => (cpm ? this._filterCpms(cpm) : this.cpms.slice()))
    );

    // Ally CPMs
    this.filteredPokemonCpms = this.battleConfigurationForm.controls.allyCpm.valueChanges.pipe(
      map(cpm => (cpm ? this._filterPokemonCpms(cpm) : this.pokemonCpms.slice()))
    );

    this.configurationSubmitEvent.pipe(first()).subscribe(() => (this.isSubmittedAtLeastOnce = true));
  }

  filterPokemonNames(name: string): string[] {
    const filterValue = name.toLowerCase();
    return this.pokemonOptions.filter(o => o.toLowerCase().includes(filterValue));
  }

  preconfigureOpponent(event: MatAutocompleteSelectedEvent) {
    const preConfiguration = CONFIGURATIONS.find(config => config.opponentName.toLowerCase() === event.option.value.toLowerCase());

    if (preConfiguration) {
      this.battleConfigurationForm.controls.opponentCpm.setValue(preConfiguration.opponentCpm);
      this.battleConfigurationForm.controls.opponentAtkMod.setValue(preConfiguration.opponentAtkMod);
      this.battleConfigurationForm.controls.opponentDefMod.setValue(preConfiguration.opponentDefMod);
      this.battleConfigurationForm.controls.opponentHp.setValue(preConfiguration.opponentHp);
    } else {
      this.battleConfigurationForm.controls.opponentCpm.setValue(0.8);
      this.battleConfigurationForm.controls.opponentAtkMod.setValue(1);
      this.battleConfigurationForm.controls.opponentDefMod.setValue(1);
      this.battleConfigurationForm.controls.opponentHp.setValue(15000);
    }
  }

  submit(): void {
    const battleConfiguration: BattleConfiguration = this.battleConfigurationForm.value as unknown as BattleConfiguration;

    if (!this.battleConfigurationForm.valid) {
      return;
    }

    battleConfiguration.date = moment(battleConfiguration.date);

    this.configurationSubmitEvent.emit(battleConfiguration);
    this.collapseForm();
  }

  collapseForm(): void {
    this.isCollapsed = true;
  }

  showForm(): void {
    this.isCollapsed = false;
  }

  private _filterCpms(value: number): Cpm[] {
    const filterValue = value.toString().toLowerCase();

    return this.cpms.filter(cpm => cpm.value.toString().toLowerCase().includes(filterValue));
  }

  private _filterPokemonCpms(value: number): Cpm[] {
    const filterValue = value.toString().toLowerCase();

    return this.pokemonCpms.filter(cpm => cpm.value.toString().toLowerCase().includes(filterValue));
  }
}

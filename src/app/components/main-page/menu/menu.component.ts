import { Component, ElementRef, EventEmitter, inject, Output, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectChange, MatSelectModule } from '@angular/material/select';
import { ImportServiceService } from '../../../services/import-service/import-service.service';
import { POKEMON_CPMS, Cpm } from '../../../constants/cpm.constants';
import { first, map, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { BattleConfiguration, OpponentConfiguration, TeamOption } from '../../../types/types';
import moment from 'moment';
import { SPECIFIC_CONFIGS, GENERAL_CONFIGS } from '../../../constants/configurations.costants';
import { Router } from '@angular/router';
import { MatExpansionModule, MatExpansionPanel } from '@angular/material/expansion';
import { MtxSelectModule } from '@ng-matero/extensions/select';

@Component({
  selector: 'app-menu',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    CommonModule,
    MatSelectModule,
    MatExpansionModule,
    MtxSelectModule,
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {
  private importService = inject(ImportServiceService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  @Output() configurationSubmitEvent = new EventEmitter<BattleConfiguration>();
  @ViewChild('advancedPanel') advancedPanel!: MatExpansionPanel;
  @ViewChild('generalConfigSelect') generalConfigSelect!: MatSelect;

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
    teamOption: [TeamOption.allPokemons, Validators.required],
    // TODO: validate if number
    allyCpm: [0.7903, Validators.required],
    allyAtkIV: [15, Validators.required],
    allyDefIV: [15, Validators.required],
    allyHpIV: [15, Validators.required],
  });

  pokemonOptions: string[] = [];
  generalConfigs: OpponentConfiguration[] = [...GENERAL_CONFIGS];
  pokemonCpms: Cpm[] = POKEMON_CPMS;

  filteredPokemonOptions: Observable<string[]>;
  filteredPokemonCpms: Observable<Cpm[]>;

  teamOptions = [TeamOption.allPokemons, TeamOption.onlyMyPokemons, TeamOption.onlyDefaultPokemons];

  constructor() {
    // Pokemon names
    this.pokemonOptions = this.importService.getPokemonNames();
    this.filteredPokemonOptions = this.battleConfigurationForm.controls.opponentName.valueChanges.pipe(
      map(name => (name ? this.filterPokemonNames(name) : this.pokemonOptions.slice()))
    );
    // Ally CPMs
    this.filteredPokemonCpms = this.battleConfigurationForm.controls.allyCpm.valueChanges.pipe(
      map(cpm => (cpm ? this._filterPokemonCpms(cpm) : this.pokemonCpms.slice()))
    );

    // Add custom option to general configs
    this.generalConfigs.push({
      opponentAtkMod: 1,
      opponentName: 'Custom',
      opponentCpm: 0,
      opponentHp: 0,
      opponentDefMod: 1,
    });

    this.configurationSubmitEvent.pipe(first()).subscribe(() => (this.isSubmittedAtLeastOnce = true));
  }

  filterPokemonNames(name: string): string[] {
    const filterValue = name.toLowerCase();
    return this.pokemonOptions.filter(o => o.toLowerCase().includes(filterValue));
  }

  preconfigureOpponent(name: string) {
    if (!name) {
      return;
    }

    const preConfiguration = SPECIFIC_CONFIGS.find(config => config.opponentName.toLowerCase() === name.toLowerCase());

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

    this.generalConfigSelect.value = 'Custom';

    // Set default battle date
    this.battleConfigurationForm.controls.date.setValue(this.determineDefaultBattleDate(name));
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

  navigateToMyPokemon(): void {
    this.router.navigateByUrl('/my-pokemon');
  }

  selectAll(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    input.select();
  }

  changeGeneralConfig(event: MatSelectChange): void {
    const generalConfig = this.generalConfigs.find(generalConfig => generalConfig.opponentName === event.value);

    if (generalConfig) {
      this.battleConfigurationForm.controls.opponentCpm.setValue(generalConfig.opponentCpm);
      this.battleConfigurationForm.controls.opponentAtkMod.setValue(generalConfig.opponentAtkMod);
      this.battleConfigurationForm.controls.opponentDefMod.setValue(generalConfig.opponentDefMod);
      this.battleConfigurationForm.controls.opponentHp.setValue(generalConfig.opponentHp);

      if (generalConfig.opponentName === 'Custom') {
        // expand Advanced section to provide custom values
        this.advancedPanel.open();
      }
    }
  }

  private _filterPokemonCpms(level: number): Cpm[] {
    const filterValue = level.toString().toLowerCase();

    return this.pokemonCpms.filter(cpm => cpm.description.toString().toLowerCase().includes(filterValue));
  }

  private determineDefaultBattleDate(pokemonName: string): Date {
    const pokemon = this.importService.findPokemon(pokemonName);
    const now = moment();

    // Pokemon did not have premieres yet and they are not known or already had premieres
    if (
      (pokemon.dynamaxDate.year() === 9999 || pokemon.dynamaxDate.isBefore(now)) &&
      (pokemon.gigantamaxDate.year() === 9999 || pokemon.gigantamaxDate.isBefore(now))
    ) {
      return new Date();
    }

    // Next two cases are when one of the dates is in the past
    // Check if: dmax <= now <= gmax
    if (now.isBetween(pokemon.dynamaxDate, pokemon.gigantamaxDate, undefined, '[]')) {
      return pokemon.gigantamaxDate.toDate();
    }

    // Check if: gmax <= now <= dmax
    if (now.isBetween(pokemon.gigantamaxDate, pokemon.dynamaxDate, undefined, '[]')) {
      return pokemon.dynamaxDate.toDate();
    }

    // Last cases are when both dates are in the future, then we want to take closest premiere date
    // So first check if: now < dmax <= gmax
    if (pokemon.dynamaxDate.isBetween(now, pokemon.gigantamaxDate, undefined, '(]')) {
      return pokemon.dynamaxDate.toDate();
    }

    // And also: now < gmax <= dmax
    if (pokemon.gigantamaxDate.isBetween(now, pokemon.dynamaxDate, undefined, '(]')) {
      return pokemon.gigantamaxDate.toDate();
    }

    // Otherwise just return today
    return new Date();
  }
}

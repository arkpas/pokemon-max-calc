import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MaxCalculatorService } from '../../services/max-calculator-service/max-calculator.service';
import { ImportServiceService } from '../../services/import-service/import-service.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { DamageConfiguration, HealerCandidate, Pokemon, TankCandidate } from '../../types/types';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import moment from 'moment';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Cpm, CPMS, POKEMON_CPMS } from '../../constants/cpm.constants';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTabsModule,
    MatPaginatorModule,
    MatTableModule,
    PokemonCardComponent,
    CommonModule,
    MatDatepickerModule,
    MatAutocompleteModule,
  ],
  standalone: true,
})
export class FormComponent {
  private importService = inject(ImportServiceService);
  private maxCalculatorService = inject(MaxCalculatorService);
  private formBuilder = inject(FormBuilder);

  @ViewChild('raidBossNameInput')
  raidBossNameInput!: ElementRef<HTMLInputElement>;

  maxForm = this.formBuilder.group({
    name: '',
    cpm: '',
    pokemonCpm: '',
    atkMod: '',
    defMod: '',
    date: '',
  });

  attackers: DamageConfiguration[] = [];
  attackersColumns: string[] = ['name', 'move', 'power', 'damage'];
  tanks: TankCandidate[] = [];
  healers: HealerCandidate[] = [];

  pokemonOptions: string[] = [];
  filteredPokemonOptions: string[];
  cpms: Cpm[] = CPMS;
  filteredCpms: Observable<Cpm[]>;
  pokemonCpms: Cpm[] = POKEMON_CPMS;
  filteredPokemonCpms: Observable<Cpm[]>;

  constructor() {
    // Pokemon names
    this.pokemonOptions = this.importService.getPokemons().map(pokemon => pokemon.name);
    this.filteredPokemonOptions = this.pokemonOptions.slice();

    // Cpms
    this.filteredCpms = this.maxForm.controls.cpm.valueChanges.pipe(
      startWith(''),
      map(cpm => (cpm ? this._filterCpms(cpm) : this.cpms.slice()))
    );

    // Pokemon Cpms
    this.filteredPokemonCpms = this.maxForm.controls.pokemonCpm.valueChanges.pipe(
      startWith(''),
      map(cpm => (cpm ? this._filterPokemonCpms(cpm) : this.pokemonCpms.slice()))
    );
  }

  onSubmit(): void {
    if (!this.maxForm.value.name) {
      return;
    }

    const pokemons = this.importService.getPokemons();
    // Read values
    const raidBoss = JSON.parse(JSON.stringify(pokemons.find(pokemon => pokemon.name === this.maxForm.value.name))) as Pokemon;
    const bossCpm = this.maxForm.value.cpm ? parseFloat(this.maxForm.value.cpm) : 0.85;
    const bossAtkMod = this.maxForm.value.atkMod ? parseFloat(this.maxForm.value.atkMod) : 1;
    const bossDefMod = this.maxForm.value.defMod ? parseFloat(this.maxForm.value.defMod) : 1;

    const bossAttackIV = 15;
    const bossDefenseIV = 15;

    if (raidBoss) {
      raidBoss.atk = (raidBoss.atk + bossAttackIV) * bossCpm * bossAtkMod;
      raidBoss.def = (raidBoss.def + bossDefenseIV) * bossCpm * bossDefMod;

      const pokemonCpm = this.maxForm.value.pokemonCpm ? parseFloat(this.maxForm.value.pokemonCpm) : 0.7903;
      const attackIV = 15;
      const defenseIV = 15;
      const hpIV = 15;

      pokemons.forEach(pokemon => {
        pokemon.atk = (pokemon.atk + attackIV) * pokemonCpm;
        pokemon.def = (pokemon.def + defenseIV) * pokemonCpm;
        pokemon.hp = Math.floor((pokemon.hp + hpIV) * pokemonCpm);
      });

      let date = moment(this.maxForm.value.date);
      if (!date.isValid()) {
        date = moment();
      }

      const result = this.maxCalculatorService.calculate(pokemons, raidBoss, date);
      this.attackers = result.attackers;
      this.tanks = result.tanks;
      this.healers = result.healers;
    }
  }

  filterPokemonNames(): void {
    const filterValue = this.raidBossNameInput.nativeElement.value.toLowerCase();
    this.filteredPokemonOptions = this.pokemonOptions.filter(o => o.toLowerCase().includes(filterValue));
  }

  private _filterCpms(value: string): Cpm[] {
    const filterValue = value.toLowerCase();

    return this.cpms.filter(cpm => cpm.value.toString().toLowerCase().includes(filterValue));
  }

  private _filterPokemonCpms(value: string): Cpm[] {
    const filterValue = value.toLowerCase();

    return this.pokemonCpms.filter(cpm => cpm.value.toString().toLowerCase().includes(filterValue));
  }
}

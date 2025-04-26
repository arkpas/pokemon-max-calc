import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MaxCalculatorService } from '../../services/max-calculator-service/max-calculator.service';
import { ImportServiceService } from '../../services/import-service/import-service.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import {
  DamageConfiguration,
  HealerCandidate,
  Pokemon,
  TankCandidate,
} from '../../types/types';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import moment from 'moment';

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
  @ViewChild('raidBossNameInput')
  raidBossNameInput!: ElementRef<HTMLInputElement>;

  maxForm = this.formBuilder.group({
    name: '',
    cpm: '',
    atkMod: '',
    defMod: '',
    date: '',
  });

  attackers: DamageConfiguration[] = [];
  attackersColumns: string[] = ['name', 'move', 'power', 'damage'];
  tanks: TankCandidate[] = [];
  healers: HealerCandidate[] = [];

  pokemons: Pokemon[] = [];
  pokemonOptions: string[] = [];
  filteredPokemonOptions: string[];

  constructor(
    private importService: ImportServiceService,
    private maxCalculatorService: MaxCalculatorService,
    private formBuilder: FormBuilder
  ) {
    this.pokemons = this.importService.getPokemons();
    this.pokemonOptions = this.pokemons.map((pokemon) => pokemon.name);
    this.filteredPokemonOptions = this.pokemonOptions.slice();
  }

  onSubmit(): void {
    if (!this.maxForm.value.name) {
      return;
    }

    // Read values
    const raidBoss = JSON.parse(
      JSON.stringify(
        this.pokemons.find(
          (pokemon) => pokemon.name === this.maxForm.value.name
        )
      )
    ) as Pokemon;
    const bossCpm = this.maxForm.value.cpm
      ? parseFloat(this.maxForm.value.cpm)
      : 0.85;
    const bossAtkMod = this.maxForm.value.atkMod
      ? parseFloat(this.maxForm.value.atkMod)
      : 1;
    const bossDefMod = this.maxForm.value.defMod
      ? parseFloat(this.maxForm.value.defMod)
      : 1;

    const bossAttackIV = 15;
    const bossDefenseIV = 15;

    if (raidBoss) {
      raidBoss.atk = (raidBoss.atk + bossAttackIV) * bossCpm * bossAtkMod;
      raidBoss.def = (raidBoss.def + bossDefenseIV) * bossCpm * bossDefMod;

      const cpm = 0.7903;
      const attackIV = 15;
      const defenseIV = 15;
      const hpIV = 15;

      this.pokemons.forEach((pokemon) => {
        pokemon.atk = (pokemon.atk + attackIV) * cpm;
        pokemon.def = (pokemon.def + defenseIV) * cpm;
        pokemon.hp = Math.floor((pokemon.hp + hpIV) * cpm);
      });

      let date = moment(this.maxForm.value.date);
      if (!date.isValid()) {
        date = moment();
      }

      const result = this.maxCalculatorService.calculate(
        this.pokemons,
        raidBoss,
        date
      );
      this.attackers = result.attackers;
      this.tanks = result.tanks;
      this.healers = result.healers;
    }
  }

  filter(): void {
    const filterValue =
      this.raidBossNameInput.nativeElement.value.toLowerCase();
    this.filteredPokemonOptions = this.pokemonOptions.filter((o) =>
      o.toLowerCase().includes(filterValue)
    );
  }
}

import { Component } from '@angular/core';
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
  ],
  standalone: true,
})
export class FormComponent {
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

  constructor(
    private importService: ImportServiceService,
    private maxCalculatorService: MaxCalculatorService,
    private formBuilder: FormBuilder
  ) {}

  onSubmit(): void {
    const pokemons = this.importService.getPokemons();

    // Read values
    const raidBoss = JSON.parse(
      JSON.stringify(
        pokemons.find((pokemon) => pokemon.name === this.maxForm.value.name)
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

      pokemons.forEach((pokemon) => {
        pokemon.atk = (pokemon.atk + attackIV) * cpm;
        pokemon.def = (pokemon.def + defenseIV) * cpm;
        pokemon.hp = Math.floor((pokemon.hp + hpIV) * cpm);
      });

      let date = moment(this.maxForm.value.date);
      if (!date.isValid()) {
        date = moment();
      }

      const result = this.maxCalculatorService.calculate(
        pokemons,
        raidBoss,
        date
      );
      this.attackers = result.attackers;
      this.tanks = result.tanks;
      this.healers = result.healers;
    }
  }
}

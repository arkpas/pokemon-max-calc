import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getTypeColor } from '../utils';
import { CpmToLevelPipe } from '../../../../pipes/cpmToLevel.pipe';
import { IvPercentagePipe } from '../../../../pipes/ivPercentage.pipe';
import { Pokemon } from '../../../../types/types';
import { MyPokemonService } from '../../../../services/my-pokemon-service/my-pokemon.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-my-pokemon-card',
  templateUrl: './my-pokemon-card.component.html',
  styleUrls: ['./my-pokemon-card.component.scss'],
  imports: [CommonModule, CpmToLevelPipe, IvPercentagePipe, MatTooltipModule],
})
export class MyPokemonCardComponent {
  @Input() myPokemon!: Pokemon;
  @Output() myPokemonRemovedEvent = new EventEmitter<boolean>();

  private myPokemonService = inject(MyPokemonService);

  removeMyPokemon() {
    this.myPokemonService.removeMyPokemon(this.myPokemon.myPokemonId);
    this.myPokemonRemovedEvent.emit(true);
  }

  getTypeColor = getTypeColor;
}

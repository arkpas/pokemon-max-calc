import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getTypeColor, getTypeBadgeClass, getDamagePercentageColor } from '../utils';
import { CpmToLevelPipe } from '../../../../pipes/cpmToLevel.pipe';
import { IvPercentagePipe } from '../../../../pipes/ivPercentage.pipe';
import { Candidate } from '../../../../types/types';
import { MatTooltipModule } from '@angular/material/tooltip';

export enum PokemonCardTypeEnum {
  Attacker,
  Tank,
  Healer,
}

@Component({
  selector: 'app-pokemon-card',
  templateUrl: './pokemon-card.component.html',
  styleUrls: ['./pokemon-card.component.scss'],
  imports: [CommonModule, CpmToLevelPipe, IvPercentagePipe, MatTooltipModule],
})
export class PokemonCardComponent {
  @Input() candidate!: Candidate;
  @Input() pokemonCardType!: PokemonCardTypeEnum;

  showDetails = false;
  readonly PokemonCardTypeEnum = PokemonCardTypeEnum;

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }

  getTypeColor = getTypeColor;
  getTypeBadgeClass = getTypeBadgeClass;
  getDamagePercentageColor = getDamagePercentageColor;
}

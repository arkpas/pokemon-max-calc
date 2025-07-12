import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DamageDetails, Type } from '../../../../types/types';
import { getTypeColor, getTypeBadgeClass, getDamagePercentageColor } from '../utils';

@Component({
  selector: 'app-pokemon-card',
  templateUrl: './pokemon-card.component.html',
  styleUrls: ['./pokemon-card.component.scss'],
  imports: [CommonModule],
})
export class PokemonCardComponent {
  @Input() name!: string;
  @Input() hp!: number;
  @Input() atk!: number;
  @Input() def!: number;
  @Input() avgDamage!: number;
  @Input() avgDamagePercentage!: number;
  @Input() heal!: number;
  @Input() unhealedDamagePercentage!: number;
  @Input() imageUrl!: string;
  @Input() damageDetails: DamageDetails[] = [];
  @Input() fastAttacks: DamageDetails[] = [];
  @Input() primaryType!: Type;
  @Input() secondaryType!: Type;

  showDetails = false;

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }

  getTypeColor = getTypeColor;
  getTypeBadgeClass = getTypeBadgeClass;
  getDamagePercentageColor = getDamagePercentageColor;
}

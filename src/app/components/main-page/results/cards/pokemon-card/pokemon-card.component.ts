import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DamageDetails, Type } from '../../../../../types/types';
import { getTypeColor, getTypeBadgeClass, getDamagePercentageColor } from '../utils';
import { CpmToLevelPipe } from '../../../../../pipes/cpmToLevel.pipe';
import { IvPercentagePipe } from '../../../../../pipes/ivPercentage.pipe';

@Component({
  selector: 'app-pokemon-card',
  templateUrl: './pokemon-card.component.html',
  styleUrls: ['./pokemon-card.component.scss'],
  imports: [CommonModule, CpmToLevelPipe, IvPercentagePipe],
})
export class PokemonCardComponent {
  // TODO: może trzeba opakować te inputy w jakiś obiekt?
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
  @Input() cpm!: number;
  @Input() isMyPokemon!: boolean;
  @Input() atkIV!: number;
  @Input() defIV!: number;
  @Input() hpIV!: number;

  showDetails = false;

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }

  getTypeColor = getTypeColor;
  getTypeBadgeClass = getTypeBadgeClass;
  getDamagePercentageColor = getDamagePercentageColor;
}

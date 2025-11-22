import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getTypeColor, getTypeBadgeClass, getDamagePercentageColor } from '../utils';
import { CpmToLevelPipe } from '../../../../pipes/cpmToLevel.pipe';
import { IvPercentagePipe } from '../../../../pipes/ivPercentage.pipe';
import { DamageDetails, Type } from '../../../../types/types';
import { MyPokemonService } from '../../../../services/my-pokemon.service';

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
  @Input() myPokemonId!: string;
  @Input() isMyPokemonActionsEnabled!: boolean;
  @Input() atkIV!: number;
  @Input() defIV!: number;
  @Input() hpIV!: number;

  showDetails = false;

  private myPokemonService = inject(MyPokemonService);

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }

  removeMyPokemon() {
    this.myPokemonService.removeMyPokemon(this.myPokemonId);
  }

  getTypeColor = getTypeColor;
  getTypeBadgeClass = getTypeBadgeClass;
  getDamagePercentageColor = getDamagePercentageColor;
}

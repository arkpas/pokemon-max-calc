import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getTypeColor, getTypeBadgeClass, getDamagePercentageColor } from '../utils';
import { CpmToLevelPipe } from '../../../../pipes/cpmToLevel.pipe';
import { IvPercentagePipe } from '../../../../pipes/ivPercentage.pipe';
import { DamageDetails, Type } from '../../../../types/types';
import { MyPokemonService } from '../../../../services/my-pokemon.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-pokemon-card',
  templateUrl: './pokemon-card.component.html',
  styleUrls: ['./pokemon-card.component.scss'],
  imports: [CommonModule, CpmToLevelPipe, IvPercentagePipe, MatTooltipModule],
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

  @Output() myPokemonRemovedEvent = new EventEmitter<boolean>();

  showDetails = false;

  private myPokemonService = inject(MyPokemonService);

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }

  removeMyPokemon() {
    this.myPokemonService.removeMyPokemon(this.myPokemonId);
    this.myPokemonRemovedEvent.emit(true);
  }

  getTypeColor = getTypeColor;
  getTypeBadgeClass = getTypeBadgeClass;
  getDamagePercentageColor = getDamagePercentageColor;
}

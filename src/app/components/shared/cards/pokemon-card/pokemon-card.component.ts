import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getTypeColor, getTypeBadgeClass, getDamagePercentageColor } from '../utils';
import { CpmToLevelPipe } from '../../../../pipes/cpmToLevel.pipe';
import { IvPercentagePipe } from '../../../../pipes/ivPercentage.pipe';
import { Candidate } from '../../../../types/types';
import { MyPokemonService } from '../../../../services/my-pokemon-service/my-pokemon.service';
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
  // TODO: może trzeba opakować te inputy w jakiś obiekt?
  @Input() candidate!: Candidate;
  @Input() pokemonCardType!: PokemonCardTypeEnum;
  @Input() isMyPokemonActionsEnabled!: boolean;

  @Output() myPokemonRemovedEvent = new EventEmitter<boolean>();

  showDetails = false;
  readonly PokemonCardTypeEnum = PokemonCardTypeEnum;

  private myPokemonService = inject(MyPokemonService);

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }

  removeMyPokemon() {
    this.myPokemonService.removeMyPokemon(this.candidate.myPokemonId);
    this.myPokemonRemovedEvent.emit(true);
  }

  getTypeColor = getTypeColor;
  getTypeBadgeClass = getTypeBadgeClass;
  getDamagePercentageColor = getDamagePercentageColor;
}
